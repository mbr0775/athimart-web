begin;

-- This is an extension of AthiMart's existing checkout, not a replacement for
-- its pricing, inventory or delivery transactions. Abort on another app's DB.
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='user_id')
    or not exists (select 1 from information_schema.columns where table_schema='public' and table_name='order_items' and column_name='product_id')
    or not exists (select 1 from information_schema.columns where table_schema='public' and table_name='order_items' and column_name='quantity')
    or not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='vendor_id')
    or not exists (select 1 from information_schema.columns where table_schema='public' and table_name='order_items' and column_name in ('unit_price','unit_price_lkr','price','price_lkr')) then
    raise exception 'AthiMart checkout schema is required. Verify the project and order_items price columns before applying this migration.';
  end if;
end;
$$;

create schema if not exists athimart_private;
revoke all on schema athimart_private from public, anon;
grant usage on schema athimart_private to authenticated;

create table public.seller_order_fulfillments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  seller_id uuid not null references public.profiles(id),
  seller_name text not null,
  status text not null default 'new' check (status in ('new','accepted','preparing','ready')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, seller_id)
);
create index seller_order_inbox_idx on public.seller_order_fulfillments(seller_id, created_at desc, id);
create index seller_order_customer_idx on public.seller_order_fulfillments(order_id);

create table public.seller_order_lines (
  id uuid primary key default gen_random_uuid(),
  fulfillment_id uuid not null references public.seller_order_fulfillments(id) on delete cascade,
  order_item_id uuid not null unique references public.order_items(id) on delete cascade,
  product_name text not null,
  quantity integer not null check (quantity between 1 and 1000),
  unit_price numeric(14,2) not null check (unit_price >= 0),
  line_total numeric(14,2) not null check (line_total >= 0)
);
create index seller_order_lines_fulfillment_idx on public.seller_order_lines(fulfillment_id);

alter table public.seller_order_fulfillments enable row level security;
alter table public.seller_order_lines enable row level security;
revoke all on public.seller_order_fulfillments, public.seller_order_lines from public, anon, authenticated;
grant select on public.seller_order_fulfillments, public.seller_order_lines to authenticated;

create policy seller_fulfillment_participant_read on public.seller_order_fulfillments for select to authenticated using (
  (seller_id = (select auth.uid()) and exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.role::text in ('vendor','seller')
      and p.seller_approval_status = 'approved' and p.is_blocked is not true
  )) or exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid()))
);
create policy seller_lines_participant_read on public.seller_order_lines for select to authenticated using (
  exists (select 1 from public.seller_order_fulfillments f where f.id = fulfillment_id)
);

-- This definer is a narrowly scoped internal trigger, not a public API. The
-- product owner is captured at purchase time and never follows reassignment.
create function athimart_private.route_order_item_to_seller()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  product public.products%rowtype;
  item jsonb := to_jsonb(new);
  fulfillment uuid;
  current_status text;
  unit_amount numeric;
  line_amount numeric;
begin
  select * into product from public.products where id = new.product_id for share;
  if not found then raise exception 'Ordered product could not be found.'; end if;
  -- Ownerless official-store products retain the existing admin dispatch flow.
  if product.vendor_id is null then return new; end if;
  if not exists (select 1 from public.profiles p where p.id = product.vendor_id
    and p.role::text in ('vendor','seller') and p.seller_approval_status = 'approved' and p.is_blocked is not true) then
    raise exception 'The seller for this product is not available.';
  end if;
  unit_amount := coalesce(nullif(item->>'unit_price',''),nullif(item->>'unit_price_lkr',''),nullif(item->>'price',''),nullif(item->>'price_lkr',''))::numeric;
  line_amount := coalesce(nullif(item->>'line_total',''),nullif(item->>'total_price',''),nullif(item->>'total',''))::numeric;
  if unit_amount is null or unit_amount < 0 or new.quantity < 1 or new.quantity > 1000 then
    raise exception 'Invalid order item snapshot.';
  end if;
  line_amount := coalesce(line_amount, round(unit_amount * new.quantity, 2));
  insert into public.seller_order_fulfillments(order_id,seller_id,seller_name)
    values (new.order_id,product.vendor_id,coalesce(nullif(btrim(product.seller_name),''),'Marketplace seller'))
    on conflict (order_id,seller_id) do nothing returning id into fulfillment;
  if fulfillment is null then
    select id,status into fulfillment,current_status from public.seller_order_fulfillments
      where order_id=new.order_id and seller_id=product.vendor_id for update;
    if current_status <> 'new' then raise exception 'This seller order is already being prepared.'; end if;
  end if;
  insert into public.seller_order_lines(fulfillment_id,order_item_id,product_name,quantity,unit_price,line_total)
    values (fulfillment,new.id,coalesce(nullif(item->>'product_name',''),nullif(item->>'name',''),product.name,'Product'),new.quantity,unit_amount,line_amount);
  return new;
end;
$$;
revoke all on function athimart_private.route_order_item_to_seller() from public, anon, authenticated;
create trigger route_new_order_items_to_sellers after insert on public.order_items
  for each row execute function athimart_private.route_order_item_to_seller();

create function athimart_private.seller_order_inbox(p_status text, p_page integer)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  result jsonb;
begin
  if actor is null or not exists (select 1 from public.profiles p where p.id=actor and p.role::text in ('vendor','seller')
    and p.seller_approval_status='approved' and p.is_blocked is not true) then
    raise exception 'Approved seller access is required.' using errcode='42501';
  end if;
  if p_status is null or p_status not in ('all','new','accepted','preparing','ready') or p_page is null or p_page not between 1 and 10000 then
    raise exception 'Invalid order inbox filter.' using errcode='22023';
  end if;
  select jsonb_build_object(
    'total',count(*) filter (where p_status='all' or f.status=p_status),
    'summary',jsonb_build_object('new',count(*) filter(where f.status='new'),'accepted',count(*) filter(where f.status='accepted'),
      'preparing',count(*) filter(where f.status='preparing'),'ready',count(*) filter(where f.status='ready'))
  ) into result from public.seller_order_fulfillments f where f.seller_id=actor;
  return result || jsonb_build_object('orders',coalesce((
    select jsonb_agg(entry.payload order by entry.created_at desc,entry.id desc) from (
      select f.id,f.created_at,jsonb_build_object(
        'id',f.id,'order_id',f.order_id,'seller_name',f.seller_name,'status',f.status,
        'order_number',o.order_number,'order_status',o.status,'customer_name',o.shipping_name,
        'shipping_phone',o.shipping_phone,'shipping_address_line1',o.shipping_address_line1,'shipping_address_line2',o.shipping_address_line2,
        'shipping_city',o.shipping_city,'shipping_state',o.shipping_state,'shipping_postal_code',o.shipping_postal_code,'shipping_country',o.shipping_country,
        'currency_code',o.currency_code,'payment_method',o.payment_method,'created_at',f.created_at,
        'subtotal',(select coalesce(sum(l.line_total),0) from public.seller_order_lines l where l.fulfillment_id=f.id),
        'seller_order_lines',(select coalesce(jsonb_agg(jsonb_build_object('id',l.id,'product_name',l.product_name,'quantity',l.quantity,'unit_price',l.unit_price,'line_total',l.line_total) order by l.id),'[]'::jsonb) from public.seller_order_lines l where l.fulfillment_id=f.id)
      ) as payload from public.seller_order_fulfillments f join public.orders o on o.id=f.order_id
      where f.seller_id=actor and (p_status='all' or f.status=p_status)
      order by f.created_at desc,f.id desc limit 20 offset ((p_page-1)*20)
    ) entry
  ),'[]'::jsonb));
end;
$$;
revoke all on function athimart_private.seller_order_inbox(text,integer) from public, anon, authenticated;
grant execute on function athimart_private.seller_order_inbox(text,integer) to authenticated;
create function public.seller_order_inbox(p_status text default 'all',p_page integer default 1)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select athimart_private.seller_order_inbox(p_status,p_page);
$$;
revoke all on function public.seller_order_inbox(text,integer) from public, anon, authenticated;
grant execute on function public.seller_order_inbox(text,integer) to authenticated;

create function athimart_private.advance_seller_order(p_fulfillment_id uuid,p_expected_status text,p_next_status text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  selected_order uuid;
  overall_status text;
  current_status text;
begin
  if actor is null or not exists (select 1 from public.profiles p where p.id=actor and p.role::text in ('vendor','seller')
    and p.seller_approval_status='approved' and p.is_blocked is not true) then
    raise exception 'Approved seller access is required.' using errcode='42501';
  end if;
  if p_expected_status is null or p_next_status is null or not (
    (p_expected_status='new' and p_next_status='accepted') or
    (p_expected_status='accepted' and p_next_status='preparing') or
    (p_expected_status='preparing' and p_next_status='ready')
  ) then raise exception 'Invalid preparation transition.' using errcode='22023'; end if;
  select f.order_id into selected_order from public.seller_order_fulfillments f where f.id=p_fulfillment_id and f.seller_id=actor;
  if not found then raise exception 'Order is not available to this account.' using errcode='42501'; end if;
  -- Lock the parent before the seller row so multiple sellers share lock order.
  select status into overall_status from public.orders where id=selected_order for update;
  if lower(btrim(overall_status)) in ('cancelled','canceled','completed','delivered','refunded') then
    raise exception 'This order is closed.' using errcode='22023';
  end if;
  select status into current_status from public.seller_order_fulfillments where id=p_fulfillment_id and seller_id=actor for update;
  -- A retry of an already-committed transition is harmless.
  if current_status=p_next_status then return jsonb_build_object('id',p_fulfillment_id,'status',current_status); end if;
  if current_status is distinct from p_expected_status then raise exception 'The order changed. Refresh before updating.' using errcode='40001'; end if;
  update public.seller_order_fulfillments set status=p_next_status,updated_at=now() where id=p_fulfillment_id and seller_id=actor;
  return jsonb_build_object('id',p_fulfillment_id,'status',p_next_status);
end;
$$;
revoke all on function athimart_private.advance_seller_order(uuid,text,text) from public, anon, authenticated;
grant execute on function athimart_private.advance_seller_order(uuid,text,text) to authenticated;
create function public.advance_seller_order(p_fulfillment_id uuid,p_expected_status text,p_next_status text)
returns jsonb language sql security invoker set search_path = '' as $$
  select athimart_private.advance_seller_order(p_fulfillment_id,p_expected_status,p_next_status);
$$;
revoke all on function public.advance_seller_order(uuid,text,text) from public, anon, authenticated;
grant execute on function public.advance_seller_order(uuid,text,text) to authenticated;

-- Historical ownership cannot be reconstructed safely from a product that
-- might have changed hands. Existing orders keep their original admin flow;
-- routing starts atomically with the next successful checkout transaction.
notify pgrst, 'reload schema';
commit;

begin;

-- Uses the shared fulfillment records created by the existing checkout flow.
-- No products, orders, stock quantities or existing policies are rewritten.
create or replace function public.web_seller_orders(p_offset integer default 0)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare result jsonb;
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p where p.id = auth.uid()
      and p.role in ('seller', 'vendor') and p.seller_approval_status = 'approved'
      and p.is_blocked is not true
  ) then raise exception 'Approved seller access required' using errcode = '42501'; end if;

  select coalesce(jsonb_agg(entry order by created_at desc, id), '[]'::jsonb) into result
  from (
    select f.id, f.created_at, jsonb_build_object(
      'id', f.id, 'order_id', f.order_id, 'order_number', o.order_number,
      'status', f.status, 'created_at', f.created_at,
      'shipping_name', o.shipping_name, 'shipping_phone', o.shipping_phone,
      'address', concat_ws(', ', nullif(o.shipping_address_line1, ''), nullif(o.shipping_address_line2, ''),
        o.shipping_city, nullif(o.shipping_state, ''), nullif(o.shipping_postal_code, ''), o.shipping_country),
      'payment_method', o.payment_method, 'currency', o.currency_code,
      'items', coalesce((select jsonb_agg(jsonb_build_object(
        'id', i.id, 'product_name', i.product_name, 'quantity', i.quantity, 'price', i.price, 'total', i.total
      ) order by i.id) from public.order_items i
        where i.order_id = f.order_id and i.marketplace_seller_id = auth.uid()), '[]'::jsonb)
    ) as entry
    from public.marketplace_fulfillments f join public.orders o on o.id = f.order_id
    where f.seller_id = auth.uid()
    order by f.created_at desc, f.id limit 21 offset greatest(0, least(coalesce(p_offset, 0), 200000))
  ) inbox;
  return result;
end;
$$;

create or replace function public.web_progress_seller_order(
  p_fulfillment_id uuid, p_expected_status text, p_status text
) returns void
language plpgsql security definer
set search_path = ''
as $$
declare target public.marketplace_fulfillments; order_state text; target_order uuid;
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p where p.id = auth.uid()
      and p.role in ('seller', 'vendor') and p.seller_approval_status = 'approved'
      and p.is_blocked is not true
  ) then raise exception 'Approved seller access required' using errcode = '42501'; end if;

  select f.order_id into target_order from public.marketplace_fulfillments f
    where f.id = p_fulfillment_id and f.seller_id = auth.uid();
  if not found then raise exception 'Order unavailable' using errcode = '42501'; end if;
  -- Lock the order first so cancellation and fulfillment updates serialize.
  select o.status into order_state from public.orders o where o.id = target_order for update;
  if lower(order_state) in ('cancelled', 'canceled', 'rejected', 'delivered', 'completed', 'refunded') then
    raise exception 'Order is already closed' using errcode = '22023';
  end if;
  select * into target from public.marketplace_fulfillments f
    where f.id = p_fulfillment_id and f.seller_id = auth.uid() for update;
  if not found then raise exception 'Order unavailable' using errcode = '42501'; end if;
  if lower(target.status::text) = p_status then return; end if;
  if lower(target.status::text) <> p_expected_status or not (
    (p_expected_status = 'pending' and p_status = 'accepted') or
    (p_expected_status = 'accepted' and p_status = 'preparing') or
    (p_expected_status = 'preparing' and p_status = 'ready')
  ) then raise exception 'Refresh the order before updating' using errcode = '22023'; end if;
  update public.marketplace_fulfillments set status = (
    jsonb_populate_record(null::public.marketplace_fulfillments, jsonb_build_object('status', p_status))
  ).status, updated_at = now()
    where id = p_fulfillment_id and seller_id = auth.uid();
end;
$$;
revoke all on function public.web_seller_orders(integer) from public, anon;
revoke all on function public.web_progress_seller_order(uuid, text, text) from public, anon;
grant execute on function public.web_seller_orders(integer) to authenticated;
grant execute on function public.web_progress_seller_order(uuid, text, text) to authenticated;
commit;

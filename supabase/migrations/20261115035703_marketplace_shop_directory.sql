begin;

alter table public.products
  add column is_official_listing boolean not null default false,
  add constraint products_official_listing_has_no_vendor
    check (not is_official_listing or vendor_id is null);

create index if not exists products_marketplace_shop_catalog
  on public.products (vendor_id, is_official_listing, country_code, created_at desc, id)
  where is_active = true;

create or replace function public.product_public_seller_name(account_name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when lower(btrim(account_name)) in ('athimart', 'athimart official store') then 'Marketplace seller'
    else coalesce(nullif(left(btrim(account_name), 120), ''), 'Marketplace seller')
  end
$$;

revoke all on function public.product_public_seller_name(text) from public, anon, authenticated;

create or replace function public.set_product_seller_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_official_listing then
    if (tg_op = 'INSERT' or not old.is_official_listing)
       and auth.uid() is not null
       and not exists (
         select 1 from public.user_roles as r
         where r.user_id = auth.uid() and r.role = 'admin'
       ) then
      raise exception 'Only an administrator can assign the official shop'
        using errcode = '42501';
    end if;
    new.seller_name := 'AthiMart Official Store';
    new.seller_type := 'business';
  elsif new.vendor_id is null then
    new.seller_name := null;
    new.seller_type := null;
  else
    select public.product_public_seller_name(p.full_name)
      into new.seller_name
      from public.profiles as p
      where p.id = new.vendor_id;
    new.seller_name := coalesce(new.seller_name, 'Marketplace seller');
    new.seller_type := coalesce(new.seller_type, 'individual');
  end if;
  return new;
end;
$$;

revoke all on function public.set_product_seller_identity() from public, anon, authenticated;

create or replace trigger zz_set_product_seller_identity
before insert or update on public.products
for each row execute function public.set_product_seller_identity();

update public.products set seller_name = null
 where vendor_id is not null and lower(btrim(seller_name)) = 'athimart official store';

-- The old fallback marked every ownerless product as AthiMart. Keep these
-- unassigned until an administrator chooses the actual shop.
update public.products
   set seller_name = null, seller_type = null
 where vendor_id is null and not is_official_listing
   and (seller_name is not null or seller_type is not null);

create table public.shop_favourites (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  shop_id text not null check (char_length(shop_id) between 1 and 36),
  primary key (user_id, shop_id)
);

alter table public.shop_favourites enable row level security;
revoke all on public.shop_favourites from public, anon, authenticated;
grant select, insert, delete on public.shop_favourites to authenticated;

create policy shop_favourites_read_own on public.shop_favourites
  for select to authenticated using ((select auth.uid()) = user_id);
create policy shop_favourites_add_own on public.shop_favourites
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy shop_favourites_remove_own on public.shop_favourites
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Expose public shop names and IDs only. Profile contact details stay private.
create function public.find_marketplace_shops(
  search_term text default '',
  only_id text default null,
  favourites_only boolean default false,
  page_offset integer default 0,
  page_size integer default 25
)
returns table (id text, name text, is_favourite boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select shop.id, shop.name, favourite.user_id is not null
  from (
    select 'athimart-official'::text as id, 'AthiMart Official Store'::text as name
    union all
    select p.id::text, public.product_public_seller_name(p.full_name)
    from public.profiles as p
    where p.role in ('vendor', 'seller')
      and p.seller_approval_status = 'approved'
      and p.is_blocked is not true
  ) as shop
  left join public.shop_favourites as favourite
    on favourite.user_id = (select auth.uid()) and favourite.shop_id = shop.id
  where (only_id is null or only_id = shop.id)
    and (not favourites_only or favourite.user_id is not null)
    and strpos(lower(shop.name), lower(left(btrim(coalesce(search_term, '')), 80))) > 0
  order by lower(shop.name), shop.id
  offset greatest(page_offset, 0)
  limit least(greatest(page_size, 1), 100)
$$;

revoke all on function public.find_marketplace_shops(text, text, boolean, integer, integer)
  from public, anon, authenticated;
grant execute on function public.find_marketplace_shops(text, text, boolean, integer, integer)
  to anon, authenticated;

commit;

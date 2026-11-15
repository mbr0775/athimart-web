begin;

create or replace function public.product_public_seller_name(account_name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when lower(btrim(account_name)) = 'athimart' then 'Marketplace seller'
    else coalesce(nullif(left(btrim(account_name), 120), ''), 'Marketplace seller')
  end
$$;

revoke all on function public.product_public_seller_name(text) from public, anon, authenticated;

-- Derive the published attribution for every writer, including the mobile app.
create or replace function public.set_product_seller_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.vendor_id is null then
    new.seller_name := 'AthiMart';
    new.seller_type := 'business';
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

drop trigger if exists zz_set_product_seller_identity on public.products;
create trigger zz_set_product_seller_identity
before insert or update on public.products
for each row execute function public.set_product_seller_identity();

create or replace function public.refresh_product_seller_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.products
     set seller_name = public.product_public_seller_name(new.full_name)
   where vendor_id = new.id
     and seller_name is distinct from public.product_public_seller_name(new.full_name);
  return new;
end;
$$;

revoke all on function public.refresh_product_seller_identity() from public, anon, authenticated;

drop trigger if exists refresh_product_seller_identity on public.profiles;
create trigger refresh_product_seller_identity
after update of full_name on public.profiles
for each row
when (old.full_name is distinct from new.full_name)
execute function public.refresh_product_seller_identity();

update public.products as product
   set seller_name = product.seller_name
 where product.seller_name is distinct from case
   when product.vendor_id is null then 'AthiMart'
   else coalesce((
     select public.product_public_seller_name(profile.full_name)
       from public.profiles as profile where profile.id = product.vendor_id
   ), 'Marketplace seller')
 end
    or (product.vendor_id is null and product.seller_type is distinct from 'business');

commit;

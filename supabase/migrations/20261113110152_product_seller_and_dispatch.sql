alter table public.products
  add column if not exists seller_name text,
  add column if not exists seller_type text,
  add column if not exists shipped_by text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.products'::regclass
      and conname = 'products_seller_and_dispatch_check'
  ) then
    alter table public.products
      add constraint products_seller_and_dispatch_check check (
    ((seller_name is null and seller_type is null) or
     (seller_name is not null and char_length(btrim(seller_name)) between 1 and 120
      and seller_type is not null and seller_type in ('business', 'individual')))
    and (shipped_by is null or char_length(btrim(shipped_by)) between 1 and 120)
      );
  end if;
end;
$$;

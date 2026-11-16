-- Existing nonempty SKUs must be unique before this migration can be applied.
-- Duplicate historical SKUs cause the migration to fail without rewriting any product.
create unique index if not exists products_sku_normalized_unique
  on public.products (upper(btrim(sku)))
  where nullif(btrim(sku), '') is not null;

import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { productVariantSku } from "./product-listing-identifiers";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  MAX_PRODUCT_VARIANTS, hasSharedVariantImages, parseVariantRows, productVariantFields, readVariant, variantAttributes,
  variantKey, variantSummary, VARIANT_GROUP_KEY, type VariantValues,
} from "./product-variants";

export function getListingToken(form: FormData) {
  const token = form.get("listingToken");
  return typeof token === "string" && /^[a-f0-9]{16}$/.test(token)
    ? token
    : randomUUID().replaceAll("-", "").slice(0, 16);
}

export async function checkCustomProductSku(client: SupabaseClient, sku: string) {
  if (!sku) return null;
  if (!/^[a-z0-9-]{1,100}$/i.test(sku)) return "Use up to 100 letters, numbers or hyphens for the SKU.";
  const { data, error } = await client.from("products").select("id").ilike("sku", sku).limit(1);
  if (error) return "The SKU could not be checked. Try again.";
  return data?.length ? "This SKU is already in use. Choose another or leave it blank." : null;
}

export function isProductSkuConflict(error: { code: string; message: string }) {
  return error.code === "23505" && /sku/i.test(error.message);
}

type ValidSubmission = Extract<ReturnType<typeof parseVariantRows>, { valid: true }>;
type ProductWrite = { name: string; slug: string; sku: string | null; attributes: Record<string, unknown> };

function nameWithoutOptions(name: string, values: VariantValues) {
  let base = name;
  const patterns = Object.values(values).map((value) => {
    const compact = value.replace(/\s/g, "");
    const escaped = Array.from(compact, (character) =>
      "\\^$.*+?()[]{}|".includes(character) ? "\\" + character : character);
    return new RegExp("[\\s(/-]+" + escaped.join("\\s*") + "\\)?$", "i");
  });
  for (;;) {
    const matched = patterns.findIndex((pattern) => pattern.test(base));
    if (matched < 0) return base || name;
    const [pattern] = patterns.splice(matched, 1);
    base = base.replace(pattern, "").trimEnd();
  }
}

export function buildVariantRows<T extends ProductWrite>(
  product: T,
  variants: ValidSubmission,
  previous?: Record<string, unknown>,
): T[] {
  const original = readVariant(previous ?? {});
  const group = original.group || (variants.rows.length > 1 ? randomUUID() : "");
  const sharedImages = variants.rows.length > 1 || hasSharedVariantImages(previous);
  if (!variants.rows.length) return [{ ...product, attributes: { ...product.attributes, ...variantAttributes("", {}, sharedImages) } }];

  const first = variants.rows[0].values;
  const baseName = nameWithoutOptions(nameWithoutOptions(product.name, original.values), first);
  return variants.rows.map((row, index) => {
    const label = productVariantFields.flatMap(({ key }) => row.values[key] ? [row.values[key]] : []).join(" ");
    const attributes = { ...product.attributes, ...variantAttributes(group, row.values, sharedImages) };
    if (index === 0) {
      const name = variantKey(original.values) === variantKey(first) && product.name !== baseName
        ? product.name : `${baseName} ${label}`;
      return { ...product, name, attributes };
    }
    const key = variantKey(row.values);
    const hash = createHash("sha256").update(key).digest("hex").slice(0, 10);
    const suffix = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64);
    return {
      ...product,
      slug: `${product.slug}-${suffix ? `${suffix}-` : ""}${hash}`,
      sku: product.sku ? productVariantSku(product.sku, label, key) : null,
      name: `${baseName} ${label}`,
      attributes,
      price: row.price,
      price_lkr: row.price,
      original_price: row.originalPrice,
      original_price_lkr: row.originalPrice,
      stock: row.stock,
      discount_percent: row.originalPrice > row.price
        ? Math.round(((row.originalPrice - row.price) / row.originalPrice) * 100)
        : 0,
      ...("is_featured" in product ? { is_featured: false } : {}),
      ...("featured_drop" in product ? { featured_drop: false } : {}),
    };
  });
}

export async function checkVariantGroup(
  client: SupabaseClient,
  vendorId: string | null,
  official: boolean,
  country: string,
  productId: string,
  rows: ProductWrite[],
) {
  const { group } = readVariant(rows[0].attributes);
  if (!group) return null;

  const query = client.from("products").select("id, attributes").eq("country_code", country)
    .eq("is_official_listing", official).eq(`attributes->>${VARIANT_GROUP_KEY}`, group);
  if (vendorId) query.eq("vendor_id", vendorId);
  else query.is("vendor_id", null);
  const { data, error } = await query;
  if (error) return "Existing variants could not be checked. Try again.";
  const otherRows = (data ?? []).filter((row) => row.id !== productId);
  if (otherRows.length + rows.length > MAX_PRODUCT_VARIANTS) return "Save up to 100 variants per product.";
  const keys = new Set(otherRows.map((row) => variantKey(readVariant(row.attributes ?? {}).values)));
  const conflict = rows.map((row) => readVariant(row.attributes).values).find((values) => keys.has(variantKey(values)));
  return conflict ? `The ${variantSummary(conflict)} variant already exists. Open its listing to edit it.` : null;
}

"use server";

import { publicSupabase } from "@/lib/supabase/public-client";
import { isShopId, OFFICIAL_SHOP_ID } from "@/lib/shops/shop-identity";
import { PRODUCT_COLUMNS } from "@/lib/products/product-columns";
import { mapProduct } from "@/lib/products/product-mapper";
import { readPack } from "@/lib/products/product-packs";
import { findProductPacks, type PackOption } from "@/lib/products/product-pack-service";

export async function loadCartPacks(ids: string[]): Promise<Record<string, PackOption[]>> {
  if (!Array.isArray(ids) || !ids.length || ids.length > 100) return {};
  const validIds = [...new Set(ids.filter((id) => typeof id === "string" && isShopId(id) && id !== OFFICIAL_SHOP_ID))];
  if (!validIds.length) return {};
  const { data, error } = await publicSupabase.from("products").select(PRODUCT_COLUMNS)
    .eq("is_active", true).eq("country_code", "LK").in("id", validIds);
  if (error || !data) return {};

  const groups = new Map<string, Promise<PackOption[]>>();
  const entries = await Promise.all(data.map(async (row) => {
    const product = mapProduct(row as Record<string, unknown>);
    const pack = readPack(product.attributes);
    if (!pack || !product.shopId) return [product.id, []] as const;
    const key = `${product.shopId}/${pack.group}`;
    let options = groups.get(key);
    if (!options) {
      options = findProductPacks(product);
      groups.set(key, options);
    }
    const variants = await options;
    return [product.id, variants.some((variant) => variant.product.productId === product.id) ? variants : []] as const;
  }));
  return Object.fromEntries(entries);
}

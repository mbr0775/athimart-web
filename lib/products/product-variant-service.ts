import "server-only";

import { publicSupabase } from "@/lib/supabase/public-client";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";
import { OFFICIAL_SHOP_ID, isShopId } from "@/lib/shops/shop-identity";
import { PRODUCT_COLUMNS } from "./product-columns";
import { mapProduct } from "./product-mapper";
import { VARIANT_GROUP_KEY, readVariant, variantSummary, type VariantValues } from "./product-variants";

export interface VariantOption {
  label: string;
  values: VariantValues;
  product: Omit<CartItem, "quantity">;
}

export async function findProductVariants(product: Product): Promise<VariantOption[]> {
  const { group, values } = readVariant(product.attributes);
  const shopId = product.shopId;
  if (!group || !variantSummary(values) || !shopId || !isShopId(shopId) || product.countryCode !== "LK") return [];

  const query = publicSupabase.from("products").select(PRODUCT_COLUMNS)
    .eq("is_active", true).eq("country_code", product.countryCode)
    .eq(`attributes->>${VARIANT_GROUP_KEY}`, group);
  if (shopId === OFFICIAL_SHOP_ID) {
    query.eq("is_official_listing", true).is("vendor_id", null);
  } else {
    query.eq("vendor_id", shopId).eq("is_official_listing", false);
  }
  const { data, error } = await query.order("id").limit(100);
  if (error) return [];

  return (data ?? []).flatMap((row) => {
    const item = mapProduct(row as Record<string, unknown>);
    const variant = readVariant(item.attributes);
    const label = variantSummary(variant.values);
    if (!label || variant.group !== group) return [];
    return [{
      label,
      values: variant.values,
      product: {
        productId: item.id,
        slug: item.slug,
        name: item.name,
        companyName: item.companyName,
        category: item.category,
        subCategory: item.subCategory,
        imageUrl: item.imageUrls[0] ?? null,
        emoji: item.emoji,
        unitPrice: item.prices.LKR,
        stock: item.stock,
        currencyCode: "LKR" as const,
      },
    }];
  }).sort((a, b) => a.product.unitPrice - b.product.unitPrice || a.label.localeCompare(b.label));
}

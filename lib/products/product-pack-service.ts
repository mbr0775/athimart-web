import "server-only";

import { publicSupabase } from "@/lib/supabase/public-client";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";
import { OFFICIAL_SHOP_ID, isShopId } from "@/lib/shops/shop-identity";
import { PRODUCT_COLUMNS } from "./product-columns";
import { mapProduct } from "./product-mapper";
import { PACK_GROUP_KEY, readPack } from "./product-packs";

export interface PackOption {
  size: string;
  product: Omit<CartItem, "quantity">;
}

export async function findProductPacks(product: Product): Promise<PackOption[]> {
  const pack = readPack(product.attributes);
  const shopId = product.shopId;
  if (!pack || !shopId || !isShopId(shopId) || product.countryCode !== "LK") return [];

  const query = publicSupabase.from("products").select(PRODUCT_COLUMNS)
    .eq("is_active", true).eq("country_code", product.countryCode)
    .eq(`attributes->>${PACK_GROUP_KEY}`, pack.group);
  if (shopId === OFFICIAL_SHOP_ID) {
    query.eq("is_official_listing", true).is("vendor_id", null);
  } else {
    query.eq("vendor_id", shopId).eq("is_official_listing", false);
  }
  const { data, error } = await query.order("id").limit(24);
  if (error) return [];

  return (data ?? []).flatMap((row) => {
    const item = mapProduct(row as Record<string, unknown>);
    const variant = readPack(item.attributes);
    if (!variant || variant.group !== pack.group) return [];
    return [{
      size: variant.size,
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
  }).sort((a, b) => a.product.unitPrice - b.product.unitPrice || a.size.localeCompare(b.size));
}

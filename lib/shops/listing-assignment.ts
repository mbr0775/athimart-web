import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { OFFICIAL_SHOP_ID } from "./shop-identity";
import { findShop, findShops } from "./shop-service";

export async function getListingAssignment(client: SupabaseClient, shopId: string, currentId?: string) {
  if (currentId !== undefined && shopId === currentId) return { listing: {}, sellerName: undefined };
  const shop = await findShop(shopId, client);
  if (!shop) return null;
  return {
    sellerName: shop.name,
    listing: {
      vendor_id: shopId === OFFICIAL_SHOP_ID ? null : shopId,
      is_official_listing: shopId === OFFICIAL_SHOP_ID,
      seller_type: shopId === OFFICIAL_SHOP_ID ? "business" : "individual",
    },
  };
}

export async function getListingShopOptions() {
  const options: { id: string; name: string }[] = [];
  for (let offset = 0; ; offset += 100) {
    const shops = await findShops({ offset, limit: 100 });
    options.push(...shops.map(({ id, name }) => ({ id, name })));
    if (shops.length < 100) return options;
  }
}

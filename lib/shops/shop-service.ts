import { groupCatalogProducts } from "@/lib/products/group-catalog-products";
import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { PRODUCT_COLUMNS } from "@/lib/products/product-columns";
import { mapProduct } from "@/lib/products/product-mapper";
import { publicSupabase } from "@/lib/supabase/public";
import { OFFICIAL_SHOP_ID, isShopId } from "./shop-identity";
import { shopPhotoUrl, type ShopPhotoRow } from "./shop-photo";

export type MarketplaceShop = { id: string; name: string; is_favourite: boolean };

export async function findShops({
  query = "", id, favourites = false, offset = 0, limit = 24,
}: {
  query?: string;
  id?: string;
  favourites?: boolean;
  offset?: number;
  limit?: number;
} = {}, client: SupabaseClient = publicSupabase): Promise<MarketplaceShop[]> {
  const { data, error } = await client.rpc("find_marketplace_shops", {
    search_term: query,
    ...(id && { only_id: id }),
    favourites_only: favourites,
    page_offset: offset,
    page_size: limit,
  });
  if (error) throw new Error(`Unable to load marketplace shops: ${error.message}`);
  return data ?? [];
}

export type HomeShop = MarketplaceShop & { avatarUrl: string | null };

export async function findHomeShops(client: SupabaseClient = publicSupabase): Promise<HomeShop[]> {
  const shops = await findShops({ limit: 9 }, client);
  const ids = shops.filter(({ id }) => id !== OFFICIAL_SHOP_ID && isShopId(id)).map(({ id }) => id);
  const avatars = new Map<string, string>();

  if (ids.length) {
    const projection = await client.rpc("find_marketplace_shop_photos", { shop_ids: ids });
    let photos: ShopPhotoRow[] = projection.data ?? [];
    if (projection.error) {
      // Keep uploaded avatars available while the new public projection is
      // being deployed, without weakening private profile-table permissions.
      const legacy = await client.rpc("find_marketplace_shop_avatar_paths", { shop_ids: ids });
      photos = legacy.data ?? [];
      console.warn("Public seller photo lookup is unavailable; check the seller-photo migration.", { code: projection.error.code });
    }
    for (const row of photos) {
      if (!ids.includes(row.id)) continue;
      const url = shopPhotoUrl(row, process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
      if (url) avatars.set(row.id, url);
    }
  }

  return shops.map((shop) => ({ ...shop, avatarUrl: avatars.get(shop.id) ?? null }));
}

export async function findShop(id: string, client?: SupabaseClient) {
  return isShopId(id) ? (await findShops({ id, limit: 1 }, client))[0] : undefined;
}

export async function getShopProducts(id: string, offset: number, limit: number) {
  const batchSize = 100;
  const products = [];
  for (let start = 0; ; start += batchSize) {
    const query = publicSupabase.from("products").select(PRODUCT_COLUMNS)
      .eq("country_code", "LK").eq("is_active", true);
    if (id === OFFICIAL_SHOP_ID) query.is("vendor_id", null).eq("is_official_listing", true);
    else query.eq("vendor_id", id).eq("is_official_listing", false);
    const { data, error } = await query.order("created_at", { ascending: false }).order("id")
      .range(start, start + batchSize - 1);
    if (error) throw new Error(`Unable to load shop products: ${error.message}`);
    products.push(...(data ?? []).map((row) => mapProduct(row as Record<string, unknown>)));
    const grouped = groupCatalogProducts(products);
    if (!data || data.length < batchSize || grouped.length >= offset + limit) return grouped.slice(offset, offset + limit);
  }
}

import "server-only";

import { AVATAR_BUCKET, ownedAvatarPath } from "@/lib/account/profile-identity";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PRODUCT_COLUMNS } from "@/lib/products/product-columns";
import { mapProduct } from "@/lib/products/product-mapper";
import { publicSupabase } from "@/lib/supabase/public-client";
import { OFFICIAL_SHOP_ID, isShopId } from "./shop-identity";

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

export async function findHomeShops(): Promise<HomeShop[]> {
  const shops = await findShops({ limit: 9 });
  const ids = shops.filter(({ id }) => id !== OFFICIAL_SHOP_ID && isShopId(id)).map(({ id }) => id);
  const avatars = new Map<string, string>();

  if (ids.length) {
    const { data, error } = await publicSupabase.rpc("find_marketplace_shop_avatar_paths", { shop_ids: ids });
    if (!error) {
      const origin = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      for (const row of data ?? []) {
        const { data: { publicUrl } } = publicSupabase.storage.from(AVATAR_BUCKET).getPublicUrl(row.object_path);
        if (ownedAvatarPath(publicUrl, origin, row.id) === row.object_path) avatars.set(row.id, publicUrl);
      }
    }
  }

  return shops.map((shop) => ({ ...shop, avatarUrl: avatars.get(shop.id) ?? null }));
}

export async function findShop(id: string, client?: SupabaseClient) {
  return isShopId(id) ? (await findShops({ id, limit: 1 }, client))[0] : undefined;
}

export async function getShopProducts(id: string, offset: number, limit: number) {
  const query = publicSupabase.from("products").select(PRODUCT_COLUMNS)
    .eq("country_code", "LK").eq("is_active", true);

  if (id === OFFICIAL_SHOP_ID) query.is("vendor_id", null).eq("is_official_listing", true);
  else query.eq("vendor_id", id).eq("is_official_listing", false);

  const { data, error } = await query
    .order("created_at", { ascending: false }).order("id")
    .range(offset, offset + limit - 1);
  if (error) throw new Error(`Unable to load shop products: ${error.message}`);
  return (data ?? []).map((row) => mapProduct(row as Record<string, unknown>));
}

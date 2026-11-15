"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findShop } from "@/lib/shops/shop-service";
import { getShopPath, isShopId } from "@/lib/shops/shop-identity";

export async function setShopFavourite(shopId: string, save: boolean) {
  if (!isShopId(shopId) || typeof save !== "boolean") throw new Error("Invalid shop.");

  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect(`/auth/login?next=${encodeURIComponent(getShopPath(shopId))}`);

  const favourites = client.from("shop_favourites");
  if (save && !await findShop(shopId, client)) throw new Error("This shop is unavailable.");
  const { error } = save
    ? await favourites.upsert({ user_id: user.id, shop_id: shopId }, { ignoreDuplicates: true })
    : await favourites.delete().eq("user_id", user.id).eq("shop_id", shopId);

  if (error) throw new Error("Could not update your shop favourites.");
  revalidatePath("/shops");
  revalidatePath(getShopPath(shopId));
}

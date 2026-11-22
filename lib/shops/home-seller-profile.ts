import type { ProfileIdentity } from "@/lib/account/profile-identity";
import type { HomeShop } from "./shop-service";
import { isReservedShopName, OFFICIAL_SHOP_ID } from "./shop-identity";

// The public directory still determines which shops are eligible to appear.
// Only overlay the signed-in seller's own card with their saved session profile;
// another seller, a matching display name or an unsaved photo is never a match.
export function homeSellerProfile(shop: HomeShop, identity: ProfileIdentity | null): HomeShop {
  if (shop.id === OFFICIAL_SHOP_ID || !identity?.userId || identity.userId !== shop.id) return shop;
  const name = identity.name.trim().slice(0, 120);
  return {
    ...shop,
    name: name && !isReservedShopName(name) ? name : "Marketplace seller",
    avatarUrl: identity.avatarUrl,
  };
}

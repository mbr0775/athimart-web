import Link from "next/link";
import { ArrowUpRight, Heart, Store } from "lucide-react";
import { setShopFavourite } from "@/app/(store)/shops/actions";
import { getShopPath, OFFICIAL_SHOP_ID } from "@/lib/shops/shop-identity";
import type { MarketplaceShop } from "@/lib/shops/shop-service";
import styles from "./shops.module.css";

export function FavouriteShopButton({ shop, signedIn }: { shop: MarketplaceShop; signedIn: boolean }) {
  const label = shop.is_favourite ? "Remove from favourites" : "Save to favourites";
  if (!signedIn) {
    return <Link className={styles.favourite} href={`/auth/login?next=${encodeURIComponent(getShopPath(shop.id))}`} aria-label={`Sign in to save ${shop.name}`}><Heart size={19} aria-hidden="true" /></Link>;
  }
  return (
    <form action={setShopFavourite.bind(null, shop.id, !shop.is_favourite)}>
      <button type="submit" className={styles.favourite} aria-pressed={shop.is_favourite} aria-label={`${label}: ${shop.name}`} title={label}>
        <Heart size={19} fill={shop.is_favourite ? "currentColor" : "none"} aria-hidden="true" />
      </button>
    </form>
  );
}

export function ShopCard({ shop, signedIn }: { shop: MarketplaceShop; signedIn?: boolean }) {
  return (
    <article className={styles.card}>
      <Link className={styles.cardLink} href={getShopPath(shop.id)}>
        <span className={styles.icon}><Store size={23} strokeWidth={1.5} aria-hidden="true" /></span>
        <span className={styles.cardText}><small>{shop.id === OFFICIAL_SHOP_ID ? "Official shop" : "Marketplace shop"}</small><strong>{shop.name}</strong></span>
        <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
      {signedIn !== undefined && <FavouriteShopButton shop={shop} signedIn={signedIn} />}
    </article>
  );
}

export function ShopPreview({ shops, query }: { shops: MarketplaceShop[]; query?: string }) {
  const link = query ? `/shops?q=${encodeURIComponent(query)}` : "/shops";
  return (
    <section aria-label={query ? "Matching shops" : "Marketplace shops"} className={styles.preview}>
      <div className={styles.previewHeader}>
        <h2>{query ? "Matching shops" : "Shop by seller"}</h2>
        <Link className={styles.textLink} href={link}> {query ? "Search shops" : "Browse all shops"} <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
      {shops.length > 0 && <div className={styles.grid}>{shops.map((shop) => <ShopCard key={shop.id} shop={shop} />)}</div>}
    </section>
  );
}

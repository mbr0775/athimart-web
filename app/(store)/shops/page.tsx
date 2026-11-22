import type { Metadata } from "next";
import Link from "@/components/navigation/navigation-link";
import { Heart } from "lucide-react";
import { ShopSearchForm } from "@/components/shops/shop-search-form";
import { ShopCard } from "@/components/shops/shop-card";
import { getShopPage, SHOP_PAGE_SIZE, ShopPagination } from "@/components/shops/shop-pagination";
import styles from "@/components/shops/shops.module.css";
import { createClient } from "@/lib/supabase/server";
import { findShops } from "@/lib/shops/shop-service";

export const metadata: Metadata = {
  title: "Shops",
  description: "Browse independent sellers and shops across the AthiMart marketplace.",
};

export default async function ShopsPage({ searchParams }: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[]; saved?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim().slice(0, 80) ?? "";
  const saved = params.saved === "1";
  const page = getShopPage(params.page);
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  const shops = saved && !user ? [] : await findShops({
    query, favourites: saved, offset: (page - 1) * SHOP_PAGE_SIZE, limit: SHOP_PAGE_SIZE + 1,
  }, client);
  const pageHref = (nextPage: number) => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (saved) search.set("saved", "1");
    search.set("page", String(nextPage));
    return `/shops?${search}`;
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h1>Shop the marketplace</h1>
        <p>Find independent sellers, local shops, and businesses on AthiMart.</p>
        <ShopSearchForm query={query} saved={saved} />
      </header>
      <nav className={styles.tabs} aria-label="Shop directory">
        <Link href="/shops" aria-current={!saved ? "page" : undefined}>All shops</Link>
        <Link href="/shops?saved=1" aria-current={saved ? "page" : undefined}><Heart size={16} aria-hidden="true" /> Favourites</Link>
      </nav>
      {saved && !user ? (
        <p className={styles.empty}> <Link href="/auth/login?next=%2Fshops%3Fsaved%3D1">Sign in</Link> to see your favourite shops.</p>
      ) : shops.length === 0 ? (
        <p className={styles.empty}>{query ? "No shops match that name." : saved ? "You haven’t saved any shops yet." : "There are no shops to show."}</p>
      ) : (
        <div className={styles.grid}>{shops.slice(0, SHOP_PAGE_SIZE).map((shop) => <ShopCard key={shop.id} shop={shop} signedIn={Boolean(user)} />)}</div>
      )}
      <ShopPagination page={page} hasNext={shops.length > SHOP_PAGE_SIZE} href={pageHref} />
    </div>
  );
}

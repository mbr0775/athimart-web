import Link from "@/components/navigation/navigation-link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/products/product-card";
import ProfileAvatar from "@/components/account/profile-avatar";
import { FavouriteShopButton } from "@/components/shops/shop-card";
import { getShopPage, SHOP_PAGE_SIZE, ShopPagination } from "@/components/shops/shop-pagination";
import styles from "@/components/shops/shops.module.css";
import { createClient } from "@/lib/supabase/server";
import { getShopPath, OFFICIAL_SHOP_ID } from "@/lib/shops/shop-identity";
import { findShopProfile, getShopProducts } from "@/lib/shops/shop-service";

export default async function ShopPage({ params, searchParams }: {
  params: Promise<{ shopId: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { shopId } = await params;
  const page = getShopPage((await searchParams).page);
  const client = await createClient();
  const [{ data: { user } }, shop] = await Promise.all([client.auth.getUser(), findShopProfile(shopId, client)]);
  if (!shop) notFound();

  const products = await getShopProducts(shopId, (page - 1) * SHOP_PAGE_SIZE, SHOP_PAGE_SIZE + 1);
  return (
    <div className={styles.page}>
      <Link href="/shops" className={styles.textLink}>← All shops</Link>
      <header className={`${styles.hero} ${styles.shopHero}`}>
        <div className={styles.profileIdentity}>
          <div className={styles.profilePortrait}>
            {shop.id === OFFICIAL_SHOP_ID
              ? <span className={styles.profileWordmark} aria-hidden="true">AthiMart</span>
              : <ProfileAvatar name={shop.name} avatarUrl={shop.avatarUrl} size={96} />}
          </div>
          <div className={styles.profileText}>
            <p className={styles.profileLabel}>{shop.id === OFFICIAL_SHOP_ID ? "Official store" : "Seller profile"}</p>
            <h1>{shop.name}</h1>
            <p>Explore products from {shop.name}.</p>
          </div>
        </div>
        <FavouriteShopButton shop={shop} signedIn={Boolean(user)} />
      </header>
      <section aria-labelledby="shop-products-heading">
        <h2 className={styles.sectionTitle} id="shop-products-heading">Products</h2>
        {products.length ? (
          <div className={styles.products}>{products.slice(0, SHOP_PAGE_SIZE).map((product) => <ProductCard key={product.id} product={product} />)}</div>
        ) : <p className={styles.empty}>This shop has no products on this page.</p>}
        <ShopPagination page={page} hasNext={products.length > SHOP_PAGE_SIZE} href={(next) => `${getShopPath(shopId)}?page=${next}`} />
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowUpRight, Heart } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { ShopCard } from "@/components/shops/shop-card";
import { ShopSearchForm } from "@/components/shops/shop-search-form";
import styles from "@/components/shops/shops.module.css";
import { siteConfig } from "@/config/site";
import { getActiveProducts } from "@/lib/products/product-service";
import { findShops } from "@/lib/shops/shop-service";

const title = "Shop Local Sellers on AthiMart";
const description = "Find shops and independent sellers on AthiMart. Browse groceries, technology, fashion and everyday essentials.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: siteConfig.name, title, description, images: [siteConfig.socialImage] },
  twitter: { card: "summary_large_image", title, description, images: [siteConfig.socialImage] },
};

export default async function StoreHomePage() {
  await connection();
  const [shopsResult, productsResult] = await Promise.allSettled([
    findShops({ limit: 9 }),
    getActiveProducts({ countryCode: "LK", limit: 4 }),
  ]);
  const shops = shopsResult.status === "fulfilled" ? shopsResult.value : [];
  const products = productsResult.status === "fulfilled" ? productsResult.value : [];

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "OnlineStore",
            name: siteConfig.name,
            url: siteConfig.url,
            description,
          }),
        }}
      />

      <section aria-labelledby="home-sellers-heading">
        <header className={styles.hero}>
          <h1 id="home-sellers-heading">Shop by seller</h1>
          <ShopSearchForm />
          <nav className={styles.homeLinks} aria-label="Find sellers">
            <Link className={styles.textLink} href="/shops">All shops <ArrowUpRight size={16} aria-hidden="true" /></Link>
            <Link className={styles.textLink} href="/shops?saved=1"><Heart size={16} aria-hidden="true" /> Favourites</Link>
          </nav>
        </header>
        {shops.length > 0 ? (
          <div className={styles.homeShops}>{shops.map((shop) => <ShopCard key={shop.id} shop={shop} />)}</div>
        ) : (
          <p className={styles.empty}>{shopsResult.status === "rejected" ? "Shops are temporarily unavailable." : "No shops are listed yet."}</p>
        )}
      </section>

      {products.length > 0 && (
        <section className={styles.homeProducts} aria-labelledby="home-products-heading">
          <div className={styles.previewHeader}>
            <h2 className={styles.sectionTitle} id="home-products-heading">New products</h2>
            <Link className={styles.textLink} href="/shop">All products <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className={styles.products}>{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </section>
      )}
    </div>
  );
}

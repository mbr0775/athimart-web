import type { Metadata } from "next";
import { connection } from "next/server";
import { FeaturedProductsCarousel } from "@/components/home/featured-products-carousel";
import GalleryCoverflow from "@/components/home/gallery-coverflow";
import HeroCollectionSection from "@/components/home/hero-collection-section";
import HomeScrollReveal from "@/components/home/home-scroll-reveal";
import LatestProductsSection from "@/components/home/latest-products-section";
import MarketsSection from "@/components/home/markets-section";
import ProductDiscoverySection from "@/components/home/product-discovery-section";
import ShopCategorySection from "@/components/home/shop-category-section";
import StorefrontDeliverySection from "@/components/home/storefront-delivery-section";
import WhyAthiMartSection from "@/components/home/why-athimart-section";
import SellerShowcase from "@/components/home/seller-showcase";
import { siteConfig } from "@/config/site";
import { getHomeCategoryPreviews } from "@/lib/products/product-category-service";
import { getFeaturedDrops } from "@/lib/products/product-home-service";
import { getActiveProducts } from "@/lib/products/product-service";
import { findHomeShops } from "@/lib/shops/shop-service";

const title = "AthiMart Online Marketplace";
const description = "Explore local sellers, groceries, technology, fashion and everyday essentials on AthiMart.";

export const metadata: Metadata = {
  title: "Online Marketplace for Local Shops and Everyday Essentials",
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: siteConfig.name, title, description, images: [siteConfig.socialImage] },
  twitter: { card: "summary_large_image", title, description, images: [siteConfig.socialImage] },
};

export default async function StoreHomePage() {
  await connection();
  const [shops, latest, featured, previews] = await Promise.allSettled([
    findHomeShops(),
    getActiveProducts({ countryCode: "LK", limit: 10 }),
    getFeaturedDrops({ countryCode: "LK", limit: 8 }),
    getHomeCategoryPreviews("LK"),
  ]);
  const latestProducts = latest.status === "fulfilled" ? latest.value : [];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "OnlineStore",
          name: siteConfig.name,
          url: siteConfig.url,
          description,
        }),
      }} />
      <HomeScrollReveal>
        <HeroCollectionSection />
        <SellerShowcase shops={shops.status === "fulfilled" ? shops.value : []} />
        <LatestProductsSection products={latestProducts} />
        <FeaturedProductsCarousel products={featured.status === "fulfilled" ? featured.value : []} />
        <ShopCategorySection previews={previews.status === "fulfilled" ? previews.value : {}} />
        <GalleryCoverflow />
        <ProductDiscoverySection products={latestProducts} />
        <StorefrontDeliverySection />
        <MarketsSection />
        <WhyAthiMartSection />
      </HomeScrollReveal>
    </>
  );
}

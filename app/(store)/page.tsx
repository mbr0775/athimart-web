import type { Metadata } from "next";

import HeroSection from "@/components/home/hero-section";
import ShopCategorySection from "@/components/home/shop-category-section";
import LatestProductsSection from "@/components/home/latest-products-section";
import MarketsSection from "@/components/home/markets-section";
import WhyAthiMartSection from "@/components/home/why-athimart-section";

import { siteConfig } from "@/config/site";
import { getActiveProducts } from "@/lib/products/product-service";
import type { Product } from "@/types/product";


export const metadata: Metadata = {
  title: "Online Marketplace for Technology and Lifestyle",

  description:
    "Shop technology, AI gadgets, fitness products, fashion, natural essences, digital services and more through the AthiMart marketplace.",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.name,
    title: "AthiMart Online Marketplace",
    description:
      "Discover technology, lifestyle, fashion, fitness and digital products through AthiMart.",
    images: [
      {
        url: siteConfig.socialImage,
        alt: "AthiMart online marketplace",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "AthiMart Online Marketplace",
    description:
      "Discover technology, lifestyle, fashion, fitness and digital products through AthiMart.",
    images: [siteConfig.socialImage],
  },
};


const onlineStoreJsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",

  name: siteConfig.name,

  url: siteConfig.url,

  description: siteConfig.description,
};


export default async function HomePage() {

  let latestProducts: Product[] = [];

  try {

    latestProducts = await getActiveProducts({
      countryCode: "LK",
      limit: 6,
    });

  } catch {

    latestProducts = [];

  }


  return (
    <>

      {/* SEO Structured Data */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            onlineStoreJsonLd
          ),
        }}
      />


      {/* Hero */}

      <HeroSection />


      {/* Marketplace Departments */}

      <ShopCategorySection />


      {/* Latest Products */}

      <LatestProductsSection
        products={latestProducts}
      />


      {/* Markets */}

      <MarketsSection />


      {/* Why AthiMart */}

      <WhyAthiMartSection />


    </>
  );
}
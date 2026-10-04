import type { Metadata } from "next";
import { connection } from "next/server";
import { getHomeCategoryPreviews } from "@/lib/products/product-category-service";
import HomeScrollReveal from "@/components/home/home-scroll-reveal";
import ProductDiscoverySection from "@/components/home/product-discovery-section";


import HeroCollectionSection from "@/components/home/hero-collection-section";

import GalleryCoverflow from "@/components/home/gallery-coverflow";

import ShopCategorySection from "@/components/home/shop-category-section";

import StorefrontDeliverySection from "@/components/home/storefront-delivery-section";

import LatestProductsSection from "@/components/home/latest-products-section";

import MarketsSection from "@/components/home/markets-section";

import WhyAthiMartSection from "@/components/home/why-athimart-section";


import {
  FeaturedProductsCarousel,
} from "@/components/home/featured-products-carousel";


import { siteConfig } from "@/config/site";


import {
  getActiveProducts,
} from "@/lib/products/product-service";


import {
  getFeaturedDrops,
} from "@/lib/products/product-home-service";


import type {
  Product,
} from "@/types/product";





export const metadata: Metadata = {


  title:
    "Online Marketplace for Technology and Lifestyle",



  description:
    "Shop technology, AI gadgets, fitness products, fashion, natural essences, digital services and more through the AthiMart marketplace.",



  alternates: {

    canonical: "/",

  },



  openGraph: {

    type: "website",

    url: "/",


    siteName:
      siteConfig.name,


    title:
      "AthiMart Online Marketplace",


    description:
      "Discover technology, lifestyle, fashion, fitness and digital products through AthiMart.",


    images: [

      {

        url:
          siteConfig.socialImage,


        alt:
          "AthiMart online marketplace",

      },

    ],

  },



  twitter: {

    card:
      "summary_large_image",


    title:
      "AthiMart Online Marketplace",


    description:
      "Discover technology, lifestyle, fashion, fitness and digital products through AthiMart.",


    images: [

      siteConfig.socialImage,

    ],

  },


};









const onlineStoreJsonLd = {


  "@context":
    "https://schema.org",


  "@type":
    "OnlineStore",


  name:
    siteConfig.name,


  url:
    siteConfig.url,


  description:
    siteConfig.description,


};









export default async function StoreHomePage() {



  // Load current catalog content on each request, including newly added admin products.
  await connection();
  const [latestResult, dropsResult, categoryResult] = await Promise.allSettled([
    getActiveProducts({ countryCode: "LK", limit: 10 }),
    getFeaturedDrops({ countryCode: "LK", limit: 8 }),
    getHomeCategoryPreviews("LK"),
  ]);
  const latestProducts: Product[] = latestResult.status === "fulfilled" ? latestResult.value : [];
  const featuredDrops: Product[] = dropsResult.status === "fulfilled" ? dropsResult.value : [];
  const categoryPreviews = categoryResult.status === "fulfilled" ? categoryResult.value : {};

  return (

    <>


      <script

        type="application/ld+json"

        dangerouslySetInnerHTML={{

          __html:

            JSON.stringify(
              onlineStoreJsonLd
            ),

        }}

      />







      <HomeScrollReveal>
      {/* HERO */}

      <HeroCollectionSection />








      {/* 3D COVER FLOW GALLERY */}

      <GalleryCoverflow />

      <ProductDiscoverySection products={latestProducts} />








      {/* CATEGORY */}

      <ShopCategorySection previews={categoryPreviews} />








      {/* ATHIMART DROPS */}

      <FeaturedProductsCarousel


        products={

          featuredDrops

        }


      />








      <StorefrontDeliverySection />

      {/* PRODUCTS */}

      <LatestProductsSection


        products={

          latestProducts

        }


      />








      {/* MARKETS */}

      <MarketsSection />








      {/* WHY ATHIMART */}

      <WhyAthiMartSection />





      </HomeScrollReveal>
    </>

  );


}

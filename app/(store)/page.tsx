import type { Metadata } from "next";


import HeroCollectionSection from "@/components/home/hero-collection-section";

import GalleryCoverflow from "@/components/home/gallery-coverflow";

import ShopCategorySection from "@/components/home/shop-category-section";

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



  let latestProducts: Product[] = [];

  let featuredDrops: Product[] = [];





  try {



    latestProducts =

      await getActiveProducts({

        countryCode:
          "LK",

        limit:
          10,

      });






    featuredDrops =

      await getFeaturedDrops({

        countryCode:
          "LK",

        limit:
          8,

      });





  } catch {


    latestProducts = [];

    featuredDrops = [];

  }







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







      {/* HERO */}

      <HeroCollectionSection


        featuredProducts={

          latestProducts

        }


      />








      {/* 3D COVER FLOW GALLERY */}

      <GalleryCoverflow />








      {/* CATEGORY */}

      <ShopCategorySection />








      {/* ATHIMART DROPS */}

      <FeaturedProductsCarousel


        products={

          featuredDrops

        }


      />








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





    </>

  );


}
// app/sitemap.ts

import type { MetadataRoute } from "next";

import {
  getCategoryPath,
  getSubcategoryPath,
  productCategories,
} from "@/config/categories";

import {
  allowSearchIndexing,
  siteConfig,
} from "@/config/site";

import {
  getActiveProductRoutes,
} from "@/lib/products/product-service";

import {
  getProductPath,
} from "@/lib/products/product-url";


export const dynamic = "force-dynamic";


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  console.log(
    "AthiMart sitemap indexing:",
    allowSearchIndexing
  );


  if (!allowSearchIndexing) {

    console.log(
      "Sitemap blocked because indexing is disabled"
    );

    return [];

  }


  const baseUrl =
    siteConfig.url.replace(
      /\/+$/,
      ""
    );


  console.log(
    "AthiMart sitemap base URL:",
    baseUrl
  );


  /**
   * Public pages only.
   */
  const mainPages: MetadataRoute.Sitemap = [

    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },

    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/returns`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },

  ];



  /**
   * Category pages.
   */
  const categoryPages: MetadataRoute.Sitemap =
    productCategories.map(
      (category) => ({

        url:
          `${baseUrl}${getCategoryPath(
            category.slug
          )}`,

        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,

      })
    );



  /**
   * Subcategory pages.
   */
  const subcategoryPages: MetadataRoute.Sitemap =
    productCategories.flatMap(
      (category) =>

        category.subcategories.map(
          (subcategory) => ({

            url:
              `${baseUrl}${getSubcategoryPath(
                category.slug,
                subcategory.slug
              )}`,

            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,

          })
        )
    );



  /**
   * Active products from Supabase.
   */
  let productPages: MetadataRoute.Sitemap = [];


  try {

    const products =
      await getActiveProductRoutes();


    console.log(
      "Products found:",
      products.length
    );


    productPages =
      products.map(
        (product) => ({

          url:
            `${baseUrl}${getProductPath(
              product
            )}`,

          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 0.6,

        })
      );


  } catch (error) {


    console.error(
      "AthiMart sitemap product loading failed:",
      error
    );


  }



  const sitemap: MetadataRoute.Sitemap = [

    ...mainPages,

    ...categoryPages,

    ...subcategoryPages,

    ...productPages,

  ];



  console.log(
    "Total sitemap URLs:",
    sitemap.length
  );



  return sitemap;

}
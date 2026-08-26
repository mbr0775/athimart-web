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
    "Sitemap base URL:",
    baseUrl
  );


  const mainPages: MetadataRoute.Sitemap =
    [

      {
        url: baseUrl,
      },

      {
        url: `${baseUrl}/shop`,
      },

      {
        url: `${baseUrl}/returns`,
      },

    ];



  const categoryPages: MetadataRoute.Sitemap =
    productCategories.map(
      (category) => ({

        url:
          `${baseUrl}${getCategoryPath(
            category.slug
          )}`,

      })
    );



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

          })

        )

    );



  let productPages: MetadataRoute.Sitemap =
    [];


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

        })

      );


  } catch (error) {


    console.error(
      "AthiMart sitemap product loading failed:",
      error
    );


  }



  const sitemap =
    [

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
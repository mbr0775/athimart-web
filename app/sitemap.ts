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

/**
 * The sitemap reads the current active product
 * catalogue from Supabase.
 *
 * Keep it request-time generated so product
 * discovery does not become a dependency of
 * the Vercel production build.
 */
export const dynamic =
  "force-dynamic";

/**
 * Generate AthiMart's canonical public sitemap.
 *
 * While search indexing is disabled during
 * marketplace development, return an empty
 * sitemap rather than advertising unfinished
 * URLs to search engines.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!allowSearchIndexing) {
    return [];
  }

  const baseUrl =
    siteConfig.url.replace(
      /\/+$/,
      ""
    );

  /**
   * Public top-level pages.
   *
   * Do NOT include private or transactional
   * routes such as:
   *
   * /account
   * /orders
   * /cart
   * /checkout
   * /search
   * /admin
   * /seller
   * /delivery-partner
   * /auth/*
   */
  const mainPages: MetadataRoute.Sitemap =
    [
      {
        url: baseUrl,
      },

      {
        url: `${baseUrl}/shop`,
      },
    ];

  /**
   * Canonical category pages.
   */
  const categoryPages: MetadataRoute.Sitemap =
    productCategories.map(
      (category) => ({
        url:
          `${baseUrl}${getCategoryPath(
            category.slug
          )}`,
      })
    );

  /**
   * Canonical subcategory pages.
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
          })
        )
    );

  /**
   * Active marketplace products.
   *
   * Only products marked active in Supabase
   * are included.
   */
  let productPages: MetadataRoute.Sitemap =
    [];

  try {
    const products =
      await getActiveProductRoutes();

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
    /**
     * A temporary product query failure should
     * not break the whole sitemap endpoint.
     *
     * Static public pages can still be returned.
     */
    console.error(
      "AthiMart sitemap product loading failed:",
      error
    );
  }

  return [
    ...mainPages,
    ...categoryPages,
    ...subcategoryPages,
    ...productPages,
  ];
}
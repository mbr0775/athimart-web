// lib/products/product-url.ts

import {
  getCategoryByName,
  getSubcategoryByName,
} from "@/config/categories";

interface ProductUrlSource {
  slug: string;
  category: string;
  subCategory: string;
}

export interface ProductRouteParams {
  categorySlug: string;
  subcategorySlug: string;
  productSlug: string;
}

/**
 * Fallback slug generator for database values that have not
 * yet been added to config/categories.ts.
 */
function slugifyPathSegment(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "general";
}

/**
 * Convert product category names into permanent URL parameters.
 */
export function getProductRouteParams(
  product: ProductUrlSource
): ProductRouteParams {
  const configuredCategory =
    getCategoryByName(product.category);

  const categorySlug =
    configuredCategory?.slug ??
    slugifyPathSegment(product.category);

  const configuredSubcategory =
    getSubcategoryByName(
      product.category,
      product.subCategory
    );

  const subcategorySlug =
    configuredSubcategory?.slug ??
    slugifyPathSegment(product.subCategory);

  return {
    categorySlug,
    subcategorySlug,
    productSlug: product.slug,
  };
}

/**
 * Create the canonical hierarchical product URL.
 */
export function getProductPath(
  product: ProductUrlSource
): string {
  const {
    categorySlug,
    subcategorySlug,
    productSlug,
  } = getProductRouteParams(product);

  return [
    "/category",
    categorySlug,
    subcategorySlug,
    productSlug,
  ].join("/");
}
// lib/products/product-service.ts

import "server-only";

import { publicSupabase } from "@/lib/supabase/public";

import type {
  ProductFilterOptions,
  ProductFilters,
} from "@/types/product-filter";
import type {
  Product,
  ProductPrices,
  ProductRouteRecord,
} from "@/types/product";

type ProductRow = Record<string, unknown>;

interface GetActiveProductsOptions {
  countryCode?: string;
  limit?: number;
}

interface GetProductsByCategoryOptions {
  categoryName: string;
  countryCode?: string;
  limit?: number;
}

interface GetProductsBySubcategoryOptions {
  categoryName: string;
  subcategoryName: string;
  countryCode?: string;
  limit?: number;
}

interface SearchProductsOptions {
  query: string;
  countryCode?: string;
  limit?: number;
}

interface GetProductFilterOptionsOptions {
  countryCode?: string;
}

/**
 * Public product columns required throughout
 * the AthiMart storefront.
 */
const PRODUCT_COLUMNS = `
  id,
  slug,
  name,
  company_name,
  brand,
  model,
  sku,
  category,
  sub_category,
  description,
  seo_title,
  seo_description,
  emoji,
  price,
  price_lkr,
  price_mvr,
  price_usd,
  original_price,
  original_price_lkr,
  original_price_mvr,
  original_price_usd,
  stock,
  discount_percent,
  is_active,
  is_featured,
  image_urls,
  attributes,
  country_code,
  created_at,
  updated_at
`;

/**
 * Convert an unknown database value into a string.
 */
function toStringValue(
  value: unknown,
  fallback = ""
): string {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
}

/**
 * Convert an empty or missing string into null.
 */
function toNullableString(
  value: unknown
): string | null {
  const result = toStringValue(value).trim();

  return result.length > 0
    ? result
    : null;
}

/**
 * Parse a database number or price.
 *
 * Returns null when the value is empty or invalid.
 */
function parseOptionalNumber(
  value: unknown
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : null;
  }

  const normalizedValue = String(value)
    .replaceAll(",", "")
    .replaceAll("Rs.", "")
    .replaceAll("Rs", "")
    .replaceAll("LKR", "")
    .replaceAll("MVR", "")
    .replaceAll("USD", "")
    .replaceAll("$", "")
    .trim();

  if (normalizedValue.length === 0) {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : null;
}

/**
 * Prefer the currency-specific value when available.
 *
 * Otherwise, use the general price column.
 */
function resolvePrice(
  currencySpecificValue: unknown,
  generalValue: unknown,
  finalFallback = 0
): number {
  const currencySpecificNumber =
    parseOptionalNumber(currencySpecificValue);

  const generalNumber =
    parseOptionalNumber(generalValue);

  if (
    currencySpecificNumber !== null &&
    currencySpecificNumber > 0
  ) {
    return currencySpecificNumber;
  }

  if (
    generalNumber !== null &&
    generalNumber > 0
  ) {
    return generalNumber;
  }

  if (currencySpecificNumber !== null) {
    return currencySpecificNumber;
  }

  if (generalNumber !== null) {
    return generalNumber;
  }

  return finalFallback;
}

/**
 * Convert a value into a number with a fallback.
 */
function toNumberValue(
  value: unknown,
  fallback = 0
): number {
  return parseOptionalNumber(value) ?? fallback;
}

/**
 * Convert database values into booleans safely.
 */
function toBooleanValue(
  value: unknown,
  fallback = false
): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (
    value === "true" ||
    value === "1" ||
    value === 1
  ) {
    return true;
  }

  if (
    value === "false" ||
    value === "0" ||
    value === 0
  ) {
    return false;
  }

  return fallback;
}

/**
 * Convert an unknown database value into
 * a clean string array.
 */
function toStringArray(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) =>
      toStringValue(item).trim()
    )
    .filter(Boolean);
}

/**
 * Convert JSON product attributes into an object.
 */
function toAttributes(
  value: unknown
): Record<string, unknown> {
  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return {};
}

/**
 * Restrict database query limits to a safe range.
 */
function getSafeLimit(
  limit: number,
  defaultLimit: number
): number {
  if (!Number.isFinite(limit)) {
    return defaultLimit;
  }

  return Math.max(
    1,
    Math.min(Math.floor(limit), 100)
  );
}

/**
 * Build all supported current prices.
 */
function buildPrices(
  row: ProductRow
): ProductPrices {
  return {
    LKR: resolvePrice(
      row.price_lkr,
      row.price
    ),

    MVR: resolvePrice(
      row.price_mvr,
      row.price
    ),

    USD: resolvePrice(
      row.price_usd,
      row.price
    ),
  };
}

/**
 * Build original prices used for discount displays.
 */
function buildOriginalPrices(
  row: ProductRow,
  prices: ProductPrices
): ProductPrices {
  return {
    LKR: resolvePrice(
      row.original_price_lkr,
      row.original_price,
      prices.LKR
    ),

    MVR: resolvePrice(
      row.original_price_mvr,
      row.original_price,
      prices.MVR
    ),

    USD: resolvePrice(
      row.original_price_usd,
      row.original_price,
      prices.USD
    ),
  };
}

/**
 * Convert one Supabase product row into
 * the Product interface used by the website.
 */
function mapProduct(
  row: ProductRow
): Product {
  const prices = buildPrices(row);

  return {
    id: toStringValue(row.id),

    slug: toStringValue(row.slug),

    name: toStringValue(
      row.name,
      "Unnamed product"
    ),

    companyName: toStringValue(
      row.company_name,
      "AthiMart"
    ),

    brand: toNullableString(
      row.brand
    ),

    model: toNullableString(
      row.model
    ),

    sku: toNullableString(
      row.sku
    ),

    category: toStringValue(
      row.category,
      "General"
    ),

    subCategory: toStringValue(
      row.sub_category,
      "General"
    ),

    description: toStringValue(
      row.description
    ),

    seoTitle: toNullableString(
      row.seo_title
    ),

    seoDescription: toNullableString(
      row.seo_description
    ),

    emoji: toStringValue(
      row.emoji,
      "📦"
    ),

    prices,

    originalPrices: buildOriginalPrices(
      row,
      prices
    ),

    stock: toNumberValue(
      row.stock
    ),

    discountPercent: toNumberValue(
      row.discount_percent
    ),

    isActive: toBooleanValue(
      row.is_active,
      true
    ),

    isFeatured: toBooleanValue(
      row.is_featured,
      false
    ),

    imageUrls: toStringArray(
      row.image_urls
    ),

    attributes: toAttributes(
      row.attributes
    ),

    countryCode: toStringValue(
      row.country_code,
      "LK"
    ),

    createdAt: toStringValue(
      row.created_at
    ),

    updatedAt: toNullableString(
      row.updated_at
    ),
  };
}

/**
 * Load active products for the Shop page
 * and homepage product sections.
 */
export async function getActiveProducts({
  countryCode = "LK",
  limit = 24,
}: GetActiveProductsOptions = {}): Promise<
  Product[]
> {
  const cleanCountryCode =
    countryCode.trim().toUpperCase();

  const safeLimit = getSafeLimit(
    limit,
    24
  );

  const { data, error } =
    await publicSupabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq(
        "country_code",
        cleanCountryCode
      )
      .eq("is_active", true)
      .order("is_featured", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      })
      .limit(safeLimit);

  if (error) {
    throw new Error(
      `Unable to load products: ${error.message}`
    );
  }

  return (data ?? []).map((row) =>
    mapProduct(row as ProductRow)
  );
}

/**
 * Load one active product using its SEO slug.
 */
export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  const cleanSlug = slug
    .trim()
    .toLowerCase();

  if (!cleanSlug) {
    return null;
  }

  const { data, error } =
    await publicSupabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("slug", cleanSlug)
      .eq("is_active", true)
      .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load product: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return mapProduct(
    data as ProductRow
  );
}

/**
 * Load product route data for
 * generateStaticParams().
 */
export async function getActiveProductRoutes(): Promise<
  ProductRouteRecord[]
> {
  const { data, error } =
    await publicSupabase
      .from("products")
      .select(
        "slug, category, sub_category"
      )
      .eq("is_active", true)
      .not("slug", "is", null);

  if (error) {
    throw new Error(
      `Unable to load product routes: ${error.message}`
    );
  }

  return (data ?? [])
    .map((row) => ({
      slug: toStringValue(
        row.slug
      ).trim(),

      category: toStringValue(
        row.category
      ).trim(),

      subCategory: toStringValue(
        row.sub_category
      ).trim(),
    }))
    .filter(
      (product) =>
        product.slug.length > 0
    );
}

/**
 * Load all active products belonging
 * to one category.
 */
export async function getProductsByCategory({
  categoryName,
  countryCode = "LK",
  limit = 48,
}: GetProductsByCategoryOptions): Promise<
  Product[]
> {
  const cleanCategoryName =
    categoryName.trim();

  const cleanCountryCode =
    countryCode.trim().toUpperCase();

  const safeLimit = getSafeLimit(
    limit,
    48
  );

  if (!cleanCategoryName) {
    return [];
  }

  const { data, error } =
    await publicSupabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq(
        "country_code",
        cleanCountryCode
      )
      .eq("is_active", true)
      .eq(
        "category",
        cleanCategoryName
      )
      .order("is_featured", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      })
      .limit(safeLimit);

  if (error) {
    throw new Error(
      `Unable to load category products: ${error.message}`
    );
  }

  return (data ?? []).map((row) =>
    mapProduct(row as ProductRow)
  );
}

/**
 * Load all active products belonging to one
 * category and one subcategory.
 */
export async function getProductsBySubcategory({
  categoryName,
  subcategoryName,
  countryCode = "LK",
  limit = 48,
}: GetProductsBySubcategoryOptions): Promise<
  Product[]
> {
  const cleanCategoryName =
    categoryName.trim();

  const cleanSubcategoryName =
    subcategoryName.trim();

  const cleanCountryCode =
    countryCode.trim().toUpperCase();

  const safeLimit = getSafeLimit(
    limit,
    48
  );

  if (
    !cleanCategoryName ||
    !cleanSubcategoryName
  ) {
    return [];
  }

  const { data, error } =
    await publicSupabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq(
        "country_code",
        cleanCountryCode
      )
      .eq("is_active", true)
      .eq(
        "category",
        cleanCategoryName
      )
      .eq(
        "sub_category",
        cleanSubcategoryName
      )
      .order("is_featured", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      })
      .limit(safeLimit);

  if (error) {
    throw new Error(
      `Unable to load subcategory products: ${error.message}`
    );
  }

  return (data ?? []).map((row) =>
    mapProduct(row as ProductRow)
  );
}

/**
 * Search active products across:
 *
 * - product name
 * - company name
 * - brand
 * - model
 * - category
 * - subcategory
 */
export async function searchProducts({
  query,
  countryCode = "LK",
  limit = 48,
}: SearchProductsOptions): Promise<
  Product[]
> {
  const cleanCountryCode =
    countryCode.trim().toUpperCase();

  const safeLimit = getSafeLimit(
    limit,
    48
  );

  /*
   * Remove PostgREST control characters while
   * preserving Unicode letters and numbers.
   */
  const cleanQuery = query
    .trim()
    .slice(0, 80)
    .replace(
      /[^\p{L}\p{N}\s-]/gu,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();

  if (cleanQuery.length < 2) {
    return [];
  }

  const searchPattern =
    `%${cleanQuery}%`;

  const searchFilter = [
    `name.ilike.${searchPattern}`,
    `company_name.ilike.${searchPattern}`,
    `brand.ilike.${searchPattern}`,
    `model.ilike.${searchPattern}`,
    `category.ilike.${searchPattern}`,
    `sub_category.ilike.${searchPattern}`,
  ].join(",");

  const { data, error } =
    await publicSupabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq(
        "country_code",
        cleanCountryCode
      )
      .eq("is_active", true)
      .or(searchFilter)
      .order("is_featured", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      })
      .limit(safeLimit);

  if (error) {
    throw new Error(
      `Unable to search products: ${error.message}`
    );
  }

  return (data ?? []).map((row) =>
    mapProduct(row as ProductRow)
  );
}

/**
 * Load products using URL-based Shop filters.
 *
 * Supported filters:
 * - category
 * - subcategory
 * - brand
 * - stock availability
 * - minimum price
 * - maximum price
 * - sorting
 */
export async function getFilteredProducts({
  category,
  subcategory,
  brand,
  stock = "all",
  sort = "newest",
  minPrice,
  maxPrice,
  countryCode = "LK",
  limit = 48,
}: Partial<ProductFilters> = {}): Promise<
  Product[]
> {
  const cleanCountryCode =
    countryCode.trim().toUpperCase();

  const safeLimit = getSafeLimit(
    limit,
    48
  );

  const cleanCategory =
    category?.trim();

  const cleanSubcategory =
    subcategory?.trim();

  const cleanBrand =
    brand?.trim();

  let productQuery =
    publicSupabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq(
        "country_code",
        cleanCountryCode
      )
      .eq("is_active", true);

  if (cleanCategory) {
    productQuery = productQuery.eq(
      "category",
      cleanCategory
    );
  }

  if (cleanSubcategory) {
    productQuery = productQuery.eq(
      "sub_category",
      cleanSubcategory
    );
  }

  /*
   * Product cards fall back from brand to
   * company_name, so the filter supports both.
   */
  if (cleanBrand) {
    productQuery = productQuery.or(
      `brand.eq.${cleanBrand},and(brand.is.null,company_name.eq.${cleanBrand})`
    );
  }

  if (stock === "in-stock") {
    productQuery = productQuery.gt(
      "stock",
      0
    );
  }

  if (stock === "out-of-stock") {
    productQuery = productQuery.lte(
      "stock",
      0
    );
  }

  /*
   * The Flutter application currently stores the
   * primary Sri Lankan amount in the general price
   * column, so that column is used for filtering.
   */
  if (
    typeof minPrice === "number" &&
    Number.isFinite(minPrice) &&
    minPrice >= 0
  ) {
    productQuery = productQuery.gte(
      "price",
      minPrice
    );
  }

  if (
    typeof maxPrice === "number" &&
    Number.isFinite(maxPrice) &&
    maxPrice >= 0
  ) {
    productQuery = productQuery.lte(
      "price",
      maxPrice
    );
  }

  switch (sort) {
    case "oldest":
      productQuery = productQuery.order(
        "created_at",
        {
          ascending: true,
        }
      );
      break;

    case "price-low":
      productQuery = productQuery.order(
        "price",
        {
          ascending: true,
          nullsFirst: false,
        }
      );
      break;

    case "price-high":
      productQuery = productQuery.order(
        "price",
        {
          ascending: false,
          nullsFirst: false,
        }
      );
      break;

    case "name-az":
      productQuery = productQuery.order(
        "name",
        {
          ascending: true,
        }
      );
      break;

    case "name-za":
      productQuery = productQuery.order(
        "name",
        {
          ascending: false,
        }
      );
      break;

    case "newest":
    default:
      productQuery = productQuery
        .order("is_featured", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });
      break;
  }

  const { data, error } =
    await productQuery.limit(
      safeLimit
    );

  if (error) {
    throw new Error(
      `Unable to filter products: ${error.message}`
    );
  }

  return (data ?? []).map((row) =>
    mapProduct(row as ProductRow)
  );
}

/**
 * Load categories, subcategories and brands
 * needed by the Shop filter interface.
 */
export async function getProductFilterOptions({
  countryCode = "LK",
}: GetProductFilterOptionsOptions = {}): Promise<
  ProductFilterOptions
> {
  const cleanCountryCode =
    countryCode.trim().toUpperCase();

  const { data, error } =
    await publicSupabase
      .from("products")
      .select(
        "category, sub_category, brand, company_name"
      )
      .eq(
        "country_code",
        cleanCountryCode
      )
      .eq("is_active", true);

  if (error) {
    throw new Error(
      `Unable to load product filter options: ${error.message}`
    );
  }

  const categories = new Set<string>();
  const subcategories = new Set<string>();
  const brands = new Set<string>();

  for (const row of data ?? []) {
    const category =
      toStringValue(
        row.category
      ).trim();

    const subcategory =
      toStringValue(
        row.sub_category
      ).trim();

    const brand =
      toStringValue(
        row.brand,
        toStringValue(
          row.company_name
        )
      ).trim();

    if (category) {
      categories.add(category);
    }

    if (subcategory) {
      subcategories.add(
        subcategory
      );
    }

    if (brand) {
      brands.add(brand);
    }
  }

  return {
    categories: Array.from(
      categories
    ).sort((first, second) =>
      first.localeCompare(second)
    ),

    subcategories: Array.from(
      subcategories
    ).sort((first, second) =>
      first.localeCompare(second)
    ),

    brands: Array.from(
      brands
    ).sort((first, second) =>
      first.localeCompare(second)
    ),
  };
}
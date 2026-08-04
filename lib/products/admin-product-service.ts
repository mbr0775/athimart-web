// lib/products/admin-product-service.ts

import { createClient } from "@/lib/supabase/server";

export type AdminProductStatus =
  | "all"
  | "active"
  | "inactive"
  | "out-of-stock";

export type AdminProductSort =
  | "newest"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "price-low"
  | "price-high"
  | "stock-low"
  | "stock-high";

export interface AdminProductListItem {
  id: string;
  slug: string;
  name: string;
  companyName: string;
  brand: string | null;
  model: string | null;
  sku: string | null;
  category: string;
  subCategory: string;
  priceLkr: number;
  originalPriceLkr: number;
  stock: number;
  discountPercent: number;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductStatistics {
  total: number;
  active: number;
  inactive: number;
  outOfStock: number;
}

export interface GetAdminProductsOptions {
  query?: string;
  status?: AdminProductStatus;
  sort?: AdminProductSort;
  limit?: number;
}

export interface GetPaginatedAdminProductsOptions {
  query?: string;
  status?: AdminProductStatus;
  sort?: AdminProductSort;
  page?: number;
  pageSize?: number;
}

export interface AdminProductPaginationResult {
  products: AdminProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  from: number;
  to: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  sort: AdminProductSort;
}

interface AdminProductRow {
  id: unknown;
  slug: unknown;
  name: unknown;
  company_name: unknown;
  brand: unknown;
  model: unknown;
  sku: unknown;
  category: unknown;
  sub_category: unknown;
  price: unknown;
  price_lkr: unknown;
  original_price: unknown;
  original_price_lkr: unknown;
  stock: unknown;
  discount_percent: unknown;
  is_active: unknown;
  is_featured: unknown;
  image_urls: unknown;
  created_at: unknown;
  updated_at: unknown;
}

const PRODUCT_SELECT_COLUMNS = `
  id,
  slug,
  name,
  company_name,
  brand,
  model,
  sku,
  category,
  sub_category,
  price,
  price_lkr,
  original_price,
  original_price_lkr,
  stock,
  discount_percent,
  is_active,
  is_featured,
  image_urls,
  created_at,
  updated_at
`;

const DEFAULT_PAGE_SIZE = 20;
const MAXIMUM_PAGE_SIZE = 100;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const VALID_SORTS =
  new Set<AdminProductSort>([
    "newest",
    "oldest",
    "name-asc",
    "name-desc",
    "price-low",
    "price-high",
    "stock-low",
    "stock-high",
  ]);

/**
 * Return a safe trimmed string.
 */
function toStringValue(
  value: unknown,
  fallback = ""
): string {
  return typeof value === "string"
    ? value.trim()
    : fallback;
}

/**
 * Convert an AthiMart database number
 * or numeric string into a finite number.
 */
function toFiniteNumber(
  value: unknown
): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim()
  ) {
    const parsedValue = Number(
      value.replaceAll(",", "")
    );

    return Number.isFinite(
      parsedValue
    )
      ? parsedValue
      : null;
  }

  return null;
}

/**
 * Return the first valid numeric value.
 */
function getFirstNumber(
  values: unknown[],
  fallback = 0
): number {
  for (const value of values) {
    const parsedValue =
      toFiniteNumber(value);

    if (parsedValue !== null) {
      return parsedValue;
    }
  }

  return fallback;
}

/**
 * Convert an AthiMart database value
 * into a boolean.
 */
function toBoolean(
  value: unknown,
  fallback = false
): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return fallback;
}

/**
 * Normalize the requested page number.
 */
function normalizePage(
  page: number | undefined
): number {
  if (
    typeof page !== "number" ||
    !Number.isFinite(page)
  ) {
    return 1;
  }

  return Math.max(
    1,
    Math.floor(page)
  );
}

/**
 * Normalize the number of products
 * displayed on one page.
 */
function normalizePageSize(
  pageSize: number | undefined
): number {
  if (
    typeof pageSize !== "number" ||
    !Number.isFinite(pageSize)
  ) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(
    MAXIMUM_PAGE_SIZE,
    Math.max(
      1,
      Math.floor(pageSize)
    )
  );
}

/**
 * Normalize a product sort option.
 */
function normalizeSort(
  sort: AdminProductSort | undefined
): AdminProductSort {
  if (
    sort &&
    VALID_SORTS.has(sort)
  ) {
    return sort;
  }

  return "newest";
}

/**
 * Remove characters that can interfere
 * with the database OR-filter syntax.
 */
function normalizeSearchTerm(
  query: string | undefined
): string {
  return (
    query
      ?.trim()
      .replace(
        /[,%()]/g,
        " "
      )
      .replace(/\s+/g, " ")
      .slice(0, 80) ?? ""
  );
}

/**
 * Create a search expression covering
 * the product fields used by the admin.
 */
function createSearchFilter(
  query: string
): string {
  if (!query) {
    return "";
  }

  const searchPattern =
    `%${query}%`;

  return [
    `name.ilike.${searchPattern}`,
    `company_name.ilike.${searchPattern}`,
    `brand.ilike.${searchPattern}`,
    `model.ilike.${searchPattern}`,
    `sku.ilike.${searchPattern}`,
    `category.ilike.${searchPattern}`,
    `sub_category.ilike.${searchPattern}`,
    `slug.ilike.${searchPattern}`,
  ].join(",");
}

/**
 * Return the first valid product image.
 */
function getPrimaryImageUrl(
  imageUrls: unknown
): string | null {
  if (!Array.isArray(imageUrls)) {
    return null;
  }

  const firstImageUrl =
    imageUrls.find(
      (imageUrl) =>
        typeof imageUrl ===
          "string" &&
        imageUrl.trim().length > 0
    );

  return typeof firstImageUrl ===
    "string"
    ? firstImageUrl.trim()
    : null;
}

/**
 * Calculate the discount when an older
 * record does not contain discount_percent.
 */
function calculateDiscountPercent(
  sellingPrice: number,
  originalPrice: number
): number {
  if (
    originalPrice <= 0 ||
    originalPrice <= sellingPrice
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((originalPrice -
          sellingPrice) /
          originalPrice) *
          100
      )
    )
  );
}

/**
 * Convert one AthiMart database row into
 * the admin product-list format.
 */
function mapAdminProductRow(
  row: AdminProductRow
): AdminProductListItem {
  const priceLkr =
    getFirstNumber(
      [
        row.price_lkr,
        row.price,
      ],
      0
    );

  const originalPriceLkr =
    getFirstNumber(
      [
        row.original_price_lkr,
        row.original_price,
      ],
      priceLkr
    );

  const storedDiscount =
    toFiniteNumber(
      row.discount_percent
    );

  const discountPercent =
    storedDiscount !== null
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              storedDiscount
            )
          )
        )
      : calculateDiscountPercent(
          priceLkr,
          originalPriceLkr
        );

  const stock =
    Math.max(
      0,
      Math.trunc(
        getFirstNumber(
          [row.stock],
          0
        )
      )
    );

  return {
    id: toStringValue(
      row.id
    ),

    slug: toStringValue(
      row.slug
    ),

    name: toStringValue(
      row.name,
      "Unnamed product"
    ),

    companyName:
      toStringValue(
        row.company_name,
        "AthiMart Seller"
      ),

    brand:
      toStringValue(
        row.brand
      ) || null,

    model:
      toStringValue(
        row.model
      ) || null,

    sku:
      toStringValue(
        row.sku
      ) || null,

    category:
      toStringValue(
        row.category,
        "Other"
      ),

    subCategory:
      toStringValue(
        row.sub_category,
        "Other"
      ),

    priceLkr,

    originalPriceLkr:
      Math.max(
        originalPriceLkr,
        priceLkr
      ),

    stock,
    discountPercent,

    isActive:
      toBoolean(
        row.is_active,
        true
      ),

    isFeatured:
      toBoolean(
        row.is_featured,
        false
      ),

    imageUrl:
      getPrimaryImageUrl(
        row.image_urls
      ),

    createdAt:
      toStringValue(
        row.created_at
      ),

    updatedAt:
      toStringValue(
        row.updated_at
      ),
  };
}

/**
 * Load one sorted and paginated product
 * result from the AthiMart database.
 */
export async function getPaginatedAdminProducts({
  query = "",
  status = "all",
  sort = "newest",
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: GetPaginatedAdminProductsOptions = {}): Promise<AdminProductPaginationResult> {
  const athimartClient =
    await createClient();

  const normalizedQuery =
    normalizeSearchTerm(query);

  const searchFilter =
    createSearchFilter(
      normalizedQuery
    );

  const normalizedSort =
    normalizeSort(sort);

  const normalizedPage =
    normalizePage(page);

  const normalizedPageSize =
    normalizePageSize(
      pageSize
    );

  /*
   * Count all records matching the
   * current search and status filters.
   */
  let countQuery =
    athimartClient
      .from("products")
      .select("id", {
        count: "exact",
        head: true,
      });

  if (searchFilter) {
    countQuery =
      countQuery.or(
        searchFilter
      );
  }

  if (status === "active") {
    countQuery =
      countQuery.eq(
        "is_active",
        true
      );
  }

  if (status === "inactive") {
    countQuery =
      countQuery.eq(
        "is_active",
        false
      );
  }

  if (
    status ===
    "out-of-stock"
  ) {
    countQuery =
      countQuery.lte(
        "stock",
        0
      );
  }

  const {
    count,
    error: countError,
  } = await countQuery;

  if (countError) {
    throw new Error(
      `Unable to count AthiMart products: ${countError.message}`
    );
  }

  const total = count ?? 0;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        total /
          normalizedPageSize
      )
    );

  const safePage =
    Math.min(
      normalizedPage,
      totalPages
    );

  const rangeFrom =
    (safePage - 1) *
    normalizedPageSize;

  const rangeTo =
    rangeFrom +
    normalizedPageSize -
    1;

  /*
   * Prepare the filtered product query.
   */
  let productsQuery =
    athimartClient
      .from("products")
      .select(
        PRODUCT_SELECT_COLUMNS
      );

  if (searchFilter) {
    productsQuery =
      productsQuery.or(
        searchFilter
      );
  }

  if (status === "active") {
    productsQuery =
      productsQuery.eq(
        "is_active",
        true
      );
  }

  if (status === "inactive") {
    productsQuery =
      productsQuery.eq(
        "is_active",
        false
      );
  }

  if (
    status ===
    "out-of-stock"
  ) {
    productsQuery =
      productsQuery.lte(
        "stock",
        0
      );
  }

  /*
   * Apply sorting before pagination.
   *
   * A secondary ID order keeps records
   * stable when the main values are equal.
   */
  switch (normalizedSort) {
    case "oldest":
      productsQuery =
        productsQuery
          .order(
            "created_at",
            {
              ascending: true,
              nullsFirst: false,
            }
          )
          .order("id", {
            ascending: true,
          });

      break;

    case "name-asc":
      productsQuery =
        productsQuery
          .order("name", {
            ascending: true,
            nullsFirst: false,
          })
          .order("id", {
            ascending: true,
          });

      break;

    case "name-desc":
      productsQuery =
        productsQuery
          .order("name", {
            ascending: false,
            nullsFirst: false,
          })
          .order("id", {
            ascending: false,
          });

      break;

    case "price-low":
      productsQuery =
        productsQuery
          .order(
            "price_lkr",
            {
              ascending: true,
              nullsFirst: false,
            }
          )
          .order("id", {
            ascending: true,
          });

      break;

    case "price-high":
      productsQuery =
        productsQuery
          .order(
            "price_lkr",
            {
              ascending: false,
              nullsFirst: false,
            }
          )
          .order("id", {
            ascending: false,
          });

      break;

    case "stock-low":
      productsQuery =
        productsQuery
          .order("stock", {
            ascending: true,
            nullsFirst: false,
          })
          .order("id", {
            ascending: true,
          });

      break;

    case "stock-high":
      productsQuery =
        productsQuery
          .order("stock", {
            ascending: false,
            nullsFirst: false,
          })
          .order("id", {
            ascending: false,
          });

      break;

    case "newest":
    default:
      productsQuery =
        productsQuery
          .order(
            "created_at",
            {
              ascending: false,
              nullsFirst: false,
            }
          )
          .order("id", {
            ascending: false,
          });

      break;
  }

  /*
   * Retrieve only the requested page
   * after filtering and sorting.
   */
  const {
    data,
    error: productsError,
  } = await productsQuery.range(
    rangeFrom,
    rangeTo
  );

  if (productsError) {
    throw new Error(
      `Unable to load AthiMart products: ${productsError.message}`
    );
  }

  const rows =
    (data ??
      []) as AdminProductRow[];

  const products =
    rows.map(
      mapAdminProductRow
    );

  return {
    products,
    total,
    page: safePage,

    pageSize:
      normalizedPageSize,

    totalPages,

    from:
      total === 0
        ? 0
        : rangeFrom + 1,

    to:
      total === 0
        ? 0
        : Math.min(
            rangeFrom +
              products.length,
            total
          ),

    hasPreviousPage:
      safePage > 1,

    hasNextPage:
      safePage <
      totalPages,

    sort: normalizedSort,
  };
}

/**
 * Backward-compatible product loader.
 */
export async function getAdminProducts({
  query = "",
  status = "all",
  sort = "newest",
  limit = MAXIMUM_PAGE_SIZE,
}: GetAdminProductsOptions = {}): Promise<
  AdminProductListItem[]
> {
  const result =
    await getPaginatedAdminProducts(
      {
        query,
        status,
        sort,
        page: 1,
        pageSize: limit,
      }
    );

  return result.products;
}

/**
 * Count the main product groups displayed
 * in the admin statistics cards.
 */
export async function getAdminProductStatistics(): Promise<AdminProductStatistics> {
  const athimartClient =
    await createClient();

  const [
    totalResult,
    activeResult,
    inactiveResult,
    outOfStockResult,
  ] = await Promise.all([
    athimartClient
      .from("products")
      .select("id", {
        count: "exact",
        head: true,
      }),

    athimartClient
      .from("products")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "is_active",
        true
      ),

    athimartClient
      .from("products")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "is_active",
        false
      ),

    athimartClient
      .from("products")
      .select("id", {
        count: "exact",
        head: true,
      })
      .lte(
        "stock",
        0
      ),
  ]);

  const statisticsError =
    totalResult.error ??
    activeResult.error ??
    inactiveResult.error ??
    outOfStockResult.error;

  if (statisticsError) {
    throw new Error(
      `Unable to load AthiMart product statistics: ${statisticsError.message}`
    );
  }

  return {
    total:
      totalResult.count ?? 0,

    active:
      activeResult.count ?? 0,

    inactive:
      inactiveResult.count ??
      0,

    outOfStock:
      outOfStockResult.count ??
      0,
  };
}

/**
 * Load one product for an admin operation.
 */
export async function getAdminProductById(
  productId: string
): Promise<AdminProductListItem | null> {
  const cleanProductId =
    productId.trim();

  if (
    !UUID_PATTERN.test(
      cleanProductId
    )
  ) {
    return null;
  }

  const athimartClient =
    await createClient();

  const {
    data,
    error,
  } = await athimartClient
    .from("products")
    .select(
      PRODUCT_SELECT_COLUMNS
    )
    .eq(
      "id",
      cleanProductId
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load the AthiMart product: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return mapAdminProductRow(
    data as AdminProductRow
  );
}
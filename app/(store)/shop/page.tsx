// app/(store)/shop/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  PackageSearch,
  Sparkles,
} from "lucide-react";

import { ProductCard } from "@/components/products/product-card";
import { ProductFilterPanel } from "@/components/products/product-filter-panel";
import {
  getFilteredProducts,
  getProductFilterOptions,
} from "@/lib/products/product-service";
import type {
  ProductFilterOptions,
  ProductFilters,
  ProductSortOption,
  ProductStockFilter,
} from "@/types/product-filter";
import type { Product } from "@/types/product";

type ShopSearchParams = {
  category?: string | string[];
  subcategory?: string | string[];
  brand?: string | string[];
  stock?: string | string[];
  sort?: string | string[];
  minPrice?: string | string[];
  maxPrice?: string | string[];
};

interface ShopPageProps {
  searchParams: Promise<ShopSearchParams>;
}

const validStockFilters =
  new Set<ProductStockFilter>([
    "all",
    "in-stock",
    "out-of-stock",
  ]);

const validSortOptions =
  new Set<ProductSortOption>([
    "newest",
    "oldest",
    "price-low",
    "price-high",
    "name-az",
    "name-za",
  ]);

function getFirstValue(
  value: string | string[] | undefined
): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function getOptionalPrice(
  value: string | string[] | undefined
): number | undefined {
  const rawValue = getFirstValue(value);

  if (!rawValue) {
    return undefined;
  }

  const parsedValue = Number(rawValue);

  if (
    !Number.isFinite(parsedValue) ||
    parsedValue < 0
  ) {
    return undefined;
  }

  return parsedValue;
}

function parseFilters(
  params: ShopSearchParams
): ProductFilters {
  const stockValue =
    getFirstValue(params.stock);

  const sortValue =
    getFirstValue(params.sort);

  const stock =
    validStockFilters.has(
      stockValue as ProductStockFilter
    )
      ? (stockValue as ProductStockFilter)
      : "all";

  const sort =
    validSortOptions.has(
      sortValue as ProductSortOption
    )
      ? (sortValue as ProductSortOption)
      : "newest";

  return {
    category:
      getFirstValue(params.category) ||
      undefined,

    subcategory:
      getFirstValue(
        params.subcategory
      ) || undefined,

    brand:
      getFirstValue(params.brand) ||
      undefined,

    stock,
    sort,

    minPrice: getOptionalPrice(
      params.minPrice
    ),

    maxPrice: getOptionalPrice(
      params.maxPrice
    ),

    countryCode: "LK",
    limit: 48,
  };
}

function hasActiveFilters(
  filters: ProductFilters
): boolean {
  return Boolean(
    filters.category ||
      filters.subcategory ||
      filters.brand ||
      filters.stock !== "all" ||
      filters.sort !== "newest" ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined
  );
}

export async function generateMetadata({
  searchParams,
}: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const filters = parseFilters(params);
  const filtered =
    hasActiveFilters(filters);

  return {
    title: "Shop Products",

    description:
      "Browse technology, lifestyle, fashion, fitness and natural essence products available through the AthiMart marketplace.",

    alternates: {
      canonical: "/shop",
    },

    robots: filtered
      ? {
          index: false,
          follow: true,
        }
      : undefined,
  };
}

export default async function ShopPage({
  searchParams,
}: ShopPageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);

  let products: Product[] = [];

  let filterOptions: ProductFilterOptions = {
    categories: [],
    subcategories: [],
    brands: [],
  };

  let errorMessage = "";

  try {
    [
      products,
      filterOptions,
    ] = await Promise.all([
      getFilteredProducts(filters),

      getProductFilterOptions({
        countryCode: "LK",
      }),
    ]);
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to load products.";
  }

  const activeFilters =
    hasActiveFilters(filters);

  return (
    <div className="athimart-container py-8 sm:py-10 lg:py-12">
      <header className="border-b border-[var(--border-strong)] pb-7 sm:pb-9">
        <p className="athimart-label text-[var(--brand-orange-dark)]">
          AthiMart Sri Lanka
        </p>

        <h1 className="athimart-display-large mt-4 text-[var(--brand-blue-dark)]">
          Shop
          <br />
          <span className="text-[var(--brand-orange)]">
            Products
          </span>
        </h1>

        <p className="athimart-body-large mt-5 max-w-3xl">
          Browse technology, fashion, lifestyle, fitness and other products
          available through the connected AthiMart mobile and web marketplace.
        </p>
      </header>

      <div className="mt-8 md:grid md:grid-cols-[280px_minmax(0,1fr)] md:items-start md:gap-7 lg:grid-cols-[310px_minmax(0,1fr)] lg:gap-9">
        <ProductFilterPanel
          options={filterOptions}
          currentFilters={{
            category: filters.category,
            subcategory:
              filters.subcategory,
            brand: filters.brand,
            stock: filters.stock,
            sort: filters.sort,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
          }}
        />

        <section
          aria-labelledby="available-products-heading"
          className="mt-8 min-w-0 md:mt-0"
        >
          <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Marketplace collection
              </p>

              <h2
                id="available-products-heading"
                className="athimart-title-large mt-2 text-[var(--brand-blue-dark)]"
              >
                Available Products
              </h2>
            </div>

            {!errorMessage && (
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Sparkles
                  aria-hidden="true"
                  className="h-4 w-4 text-[var(--brand-orange)]"
                  strokeWidth={1.8}
                />

                <span className="athimart-label whitespace-nowrap">
                  {products.length}{" "}
                  {products.length === 1
                    ? "item"
                    : "items"}
                </span>
              </div>
            )}
          </div>

          {activeFilters &&
            !errorMessage && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {filters.category && (
                  <span className="border border-[var(--brand-blue)] bg-[var(--brand-blue-soft)] px-3 py-2 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.13em] text-[var(--brand-blue)]">
                    {filters.category}
                  </span>
                )}

                {filters.subcategory && (
                  <span className="border border-[var(--brand-blue)] bg-[var(--brand-blue-soft)] px-3 py-2 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.13em] text-[var(--brand-blue)]">
                    {filters.subcategory}
                  </span>
                )}

                {filters.brand && (
                  <span className="border border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] px-3 py-2 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.13em] text-[var(--brand-orange-dark)]">
                    {filters.brand}
                  </span>
                )}

                <Link
                  href="/shop"
                  className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--sale)] underline underline-offset-4"
                >
                  Clear filters
                </Link>
              </div>
            )}

          {errorMessage ? (
            <div className="mt-8 border border-[var(--sale)] bg-white p-7">
              <PackageSearch
                aria-hidden="true"
                className="h-10 w-10 text-[var(--sale)]"
                strokeWidth={1.6}
              />

              <h3 className="athimart-title mt-5">
                Products could not be loaded
              </h3>

              <p className="athimart-body mt-3">
                {errorMessage}
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="mt-8 border border-[var(--border)] bg-white p-9 text-center sm:p-12">
              <PackageSearch
                aria-hidden="true"
                className="mx-auto h-12 w-12 text-[var(--brand-blue)]"
                strokeWidth={1.5}
              />

              <h3 className="athimart-title-large mt-6 text-[var(--brand-blue-dark)]">
                No matching products
              </h3>

              <p className="athimart-body mx-auto mt-4 max-w-xl">
                Change the selected category, brand, price range or stock
                option to view more products.
              </p>

              <Link
                href="/shop"
                className="athimart-brand-outline-button mt-7"
              >
                Reset all filters
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 items-stretch gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-6">
              {products.map(
                (product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={index < 3}
                  />
                )
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
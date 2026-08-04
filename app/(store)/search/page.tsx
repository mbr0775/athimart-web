// app/(store)/search/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  PackageSearch,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { ProductCard } from "@/components/products/product-card";
import {
  getCategoryPath,
  productCategories,
} from "@/config/categories";
import { searchProducts } from "@/lib/products/product-service";
import type { Product } from "@/types/product";

export const metadata: Metadata = {
  title: "Search Products",

  description:
    "Search AthiMart products by product name, brand, model, category or product type.",

  alternates: {
    canonical: "/search",
  },

  /*
   * Search-result combinations should not become
   * separate indexed pages.
   */
  robots: {
    index: false,
    follow: true,
  },
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string | string[];
  }>;
}

/**
 * Read a single search query from the URL.
 *
 * Examples:
 * /search?q=honor
 * /search?q=chargers
 */
function getQueryValue(
  value: string | string[] | undefined
): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const resolvedSearchParams = await searchParams;

  const query = getQueryValue(
    resolvedSearchParams.q
  );

  const hasSearchQuery = query.length >= 2;

  let products: Product[] = [];
  let errorMessage = "";

  if (hasSearchQuery) {
    try {
      products = await searchProducts({
        query,
        countryCode: "LK",
        limit: 48,
      });
    } catch (error) {
      errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to search products.";
    }
  }

  return (
    <div className="athimart-container py-8 sm:py-10 lg:py-14">
      {/* =====================================================
          Page heading
      ====================================================== */}
      <header className="border-b border-[var(--border-strong)] pb-8 sm:pb-10">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center bg-[var(--brand-orange-soft)] text-[var(--brand-orange-dark)]">
            <Search
              aria-hidden="true"
              className="h-5 w-5"
              strokeWidth={1.8}
            />
          </span>

          <p className="athimart-label text-[var(--brand-blue)]">
            AthiMart product discovery
          </p>
        </div>

        <h1 className="athimart-display-large mt-5 text-[var(--brand-blue-dark)]">
          Search
          <br />
          Products
        </h1>

        <p className="athimart-body-large mt-5 max-w-3xl">
          Search by product name, company, brand, model, category or product
          type.
        </p>
      </header>

      {/* =====================================================
          Search form
      ====================================================== */}
      <section
        aria-labelledby="product-search-heading"
        className="mt-9 sm:mt-12"
      >
        <h2
          id="product-search-heading"
          className="sr-only"
        >
          Search AthiMart products
        </h2>

        <form
          action="/search"
          method="get"
          role="search"
          className="border border-[var(--border-strong)] bg-white p-4 shadow-[0_16px_45px_rgba(18,63,158,0.07)] sm:p-6"
        >
          <div className="flex flex-col gap-4 md:flex-row">
            <label className="relative flex min-h-16 flex-1 items-center border-b-2 border-[var(--brand-blue)] transition-colors duration-200 focus-within:border-[var(--brand-blue-dark)]">
              <Search
                aria-hidden="true"
                className="mr-4 h-6 w-6 shrink-0 text-[var(--brand-blue)]"
                strokeWidth={1.7}
              />

              <span className="sr-only">
                Search products
              </span>

              <input
                type="search"
                name="q"
                defaultValue={query}
                minLength={2}
                maxLength={80}
                autoComplete="off"
                enterKeyHint="search"
                placeholder="Search products, brands..."
                className="min-w-0 flex-1 border-0 bg-transparent py-3 font-[var(--font-display)] text-2xl font-light text-[var(--text)] !outline-none placeholder:text-[var(--placeholder)] focus:!outline-none focus-visible:!outline-none sm:text-3xl"
                style={{
                  outline: "none",
                  boxShadow: "none",
                }}
              />

              {query && (
                <Link
                  href="/search"
                  aria-label="Clear product search"
                  className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center text-[var(--text-muted)] transition-colors duration-200 hover:bg-[var(--brand-orange-soft)] hover:text-[var(--brand-orange-dark)]"
                >
                  <X
                    aria-hidden="true"
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />
                </Link>
              )}
            </label>

            <button
              type="submit"
              className="athimart-brand-button min-w-48"
            >
              <Search
                aria-hidden="true"
                className="h-5 w-5"
                strokeWidth={1.8}
              />

              Search store
            </button>
          </div>

          <p className="mt-4 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
            Enter at least two characters. Examples: Honor, chargers, fashion
            or mobile.
          </p>
        </form>
      </section>

      {/* =====================================================
          Search error
      ====================================================== */}
      {errorMessage && (
        <section
          aria-labelledby="search-error-heading"
          className="mt-10 border border-[var(--sale)] bg-white p-7"
        >
          <PackageSearch
            aria-hidden="true"
            className="h-10 w-10 text-[var(--sale)]"
            strokeWidth={1.6}
          />

          <h2
            id="search-error-heading"
            className="athimart-title mt-5"
          >
            Search could not be completed
          </h2>

          <p className="athimart-body mt-3">
            {errorMessage}
          </p>
        </section>
      )}

      {/* =====================================================
          Initial screen before searching
      ====================================================== */}
      {!hasSearchQuery && !errorMessage && (
        <section
          aria-labelledby="search-departments-heading"
          className="mt-12"
        >
          <div className="flex items-end justify-between gap-5 border-b border-[var(--border)] pb-5">
            <div>
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Browse without searching
              </p>

              <h2
                id="search-departments-heading"
                className="athimart-title-large mt-2 text-[var(--brand-blue-dark)]"
              >
                Popular Departments
              </h2>
            </div>

            <Sparkles
              aria-hidden="true"
              className="h-5 w-5 text-[var(--brand-orange)]"
              strokeWidth={1.7}
            />
          </div>

          <div className="mt-7 grid border-l border-t border-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
            {productCategories.map((category) => (
              <Link
                key={category.slug}
                href={getCategoryPath(category.slug)}
                className="group flex min-h-44 flex-col justify-between border-b border-r border-[var(--border)] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand-blue)] hover:bg-[var(--brand-blue-soft)] sm:p-6"
              >
                <div>
                  <h3 className="font-[var(--font-display)] text-2xl font-light uppercase leading-tight text-[var(--brand-blue-dark)] sm:text-3xl">
                    {category.name}
                  </h3>

                  <p className="mt-3 font-[var(--font-body)] text-sm leading-6 text-[var(--text-muted)]">
                    {category.shortDescription}
                  </p>
                </div>

                <span className="mt-5 inline-flex items-center gap-2 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-orange-dark)]">
                  Browse category

                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    strokeWidth={1.8}
                  />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          Search results
      ====================================================== */}
      {hasSearchQuery && !errorMessage && (
        <section
          aria-labelledby="search-results-heading"
          className="mt-12"
        >
          <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Search results
              </p>

              <h2
                id="search-results-heading"
                className="athimart-title-large mt-2 text-[var(--brand-blue-dark)]"
              >
                Results for “{query}”
              </h2>
            </div>

            <p
              className="athimart-label text-[var(--text-muted)]"
              aria-live="polite"
            >
              {products.length}{" "}
              {products.length === 1
                ? "product"
                : "products"}
            </p>
          </div>

          {products.length === 0 ? (
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
                Try a shorter product name, another brand, or a broader
                category such as mobiles, fashion or chargers.
              </p>

              <Link
                href="/shop"
                className="athimart-brand-outline-button mt-7"
              >
                Browse all products

                <ArrowRight
                  aria-hidden="true"
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 items-stretch gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 md:gap-x-7 lg:grid-cols-4 lg:gap-x-6">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 4}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
// app/(store)/shop/page.tsx

import type { Metadata } from "next";
import Link from "@/components/navigation/navigation-link";
import Image from "next/image";
import {
  PackageSearch,
  ArrowDown,
  ArrowUpRight,
  ChevronRight,
  Search,
} from "lucide-react";

import { ProductCard } from "@/components/products/product-card";
import { ProductFilterPanel } from "@/components/products/product-filter-panel";
import { siteConfig } from "@/config/site";
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
import { editorialFont } from "@/lib/fonts";
import { categoryCoverPhotos } from "@/config/category-images";
import styles from "./shop.module.css";

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

const validStockFilters = new Set<ProductStockFilter>([
  "all",
  "in-stock",
  "out-of-stock",
]);

const validSortOptions = new Set<ProductSortOption>([
  "newest",
  "oldest",
  "price-low",
  "price-high",
  "name-az",
  "name-za",
]);

function getFirstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function getOptionalPrice(
  value: string | string[] | undefined,
): number | undefined {
  const rawValue = getFirstValue(value);

  if (!rawValue) {
    return undefined;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return undefined;
  }

  return parsedValue;
}

function parseFilters(params: ShopSearchParams): ProductFilters {
  const stockValue = getFirstValue(params.stock);

  const sortValue = getFirstValue(params.sort);

  const stock = validStockFilters.has(stockValue as ProductStockFilter)
    ? (stockValue as ProductStockFilter)
    : "all";

  const sort = validSortOptions.has(sortValue as ProductSortOption)
    ? (sortValue as ProductSortOption)
    : "newest";

  return {
    category: getFirstValue(params.category) || undefined,

    subcategory: getFirstValue(params.subcategory) || undefined,

    brand: getFirstValue(params.brand) || undefined,

    stock,
    sort,

    minPrice: getOptionalPrice(params.minPrice),

    maxPrice: getOptionalPrice(params.maxPrice),

    countryCode: "LK",
    limit: 48,
  };
}

function hasActiveFilters(filters: ProductFilters): boolean {
  return Boolean(
    filters.category ||
    filters.subcategory ||
    filters.brand ||
    filters.stock !== "all" ||
    filters.sort !== "newest" ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined,
  );
}

/**
 * Generate SEO and social-sharing metadata
 * for the AthiMart shop.
 *
 * Filtered parameter combinations remain
 * canonicalized to /shop and are marked
 * noindex to avoid creating duplicate
 * indexable result pages.
 */
export async function generateMetadata({
  searchParams,
}: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const filters = parseFilters(params);
  const filtered = hasActiveFilters(filters);

  const title = "Shop Products";

  const description =
    "Browse technology, lifestyle, fashion, fitness and natural essence products available through the AthiMart marketplace.";

  return {
    title,

    description,

    alternates: {
      canonical: "/shop",
    },

    openGraph: {
      type: "website",
      locale: "en_LK",
      url: "/shop",
      siteName: siteConfig.name,
      title: `${title} | ${siteConfig.name}`,
      description,

      images: [
        {
          url: siteConfig.socialImage,
          width: 1200,
          height: 1200,
          alt: "Shop products on AthiMart",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [siteConfig.socialImage],
    },

    robots: filtered
      ? {
          index: false,
          follow: true,
        }
      : undefined,
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
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
    [products, filterOptions] = await Promise.all([
      getFilteredProducts(filters),

      getProductFilterOptions({
        countryCode: "LK",
      }),
    ]);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Unable to load products.";
  }

  const activeFilters = hasActiveFilters(filters);

  return (
    <div className={`${styles.page} ${editorialFont.variable}`}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span aria-current="page">Shop</span>
        </nav>

        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span aria-hidden="true" />
              The AthiMart everyday edit
            </p>
            <h1>
              Good finds.
              <br />
              <em>Great possibilities.</em>
            </h1>
            <p className={styles.intro}>
              For the things you need. And the things you love.
              <br className={styles.desktopBreak} /> Explore technology, style,
              and everyday essentials in one place.
            </p>
            <a href="#shop-products" className={styles.exploreLink}>
              Find something you love
              <ArrowDown size={15} aria-hidden="true" />
            </a>
          </div>
          <div
            className={styles.heroVisual}
            aria-label="Explore featured collections"
          >
            <Link
              href="/shop?category=Digital%20Products#shop-products"
              className={styles.collection}
            >
              <Image
                src={`https://images.unsplash.com/${categoryCoverPhotos["digital-products"]}?auto=format&fit=crop&w=600&q=80`}
                alt=""
                fill
                loading="eager"
                sizes="(max-width: 767px) 1px, 21vw"
                className={styles.collectionImage}
              />
              <div className={styles.collectionCopy}>
                <span>Work. Play. Create.</span>
                <h2>
                  Everyday
                  <br />
                  technology.
                </h2>
                <ArrowUpRight size={19} aria-hidden="true" />
              </div>
            </Link>
            <Link
              href="/shop?category=Fashion#shop-products"
              className={styles.collection}
            >
              <Image
                src={`https://images.unsplash.com/${categoryCoverPhotos.fashion}?auto=format&fit=crop&w=500&q=80`}
                alt=""
                fill
                loading="eager"
                sizes="(max-width: 767px) 1px, 18vw"
                className={styles.collectionImage}
              />
              <div className={styles.collectionCopy}>
                <span>A little more you</span>
                <h2>
                  Find your
                  <br />
                  everyday style.
                </h2>
                <ArrowUpRight size={19} aria-hidden="true" />
              </div>
            </Link>
            <span className={styles.visualCaption} aria-hidden="true">
              Objects. Ideas. Possibilities.
            </span>
          </div>
        </header>

        <section
          id="shop-products"
          aria-labelledby="shop-products-heading"
          className={styles.results}
        >
          <h2 id="shop-products-heading" className="sr-only">
            Shop products
          </h2>
          <ProductFilterPanel
            options={filterOptions}
            resultCount={errorMessage ? undefined : products.length}
            currentFilters={{
              category: filters.category,
              subcategory: filters.subcategory,
              brand: filters.brand,
              stock: filters.stock,
              sort: filters.sort,
              minPrice: filters.minPrice,
              maxPrice: filters.maxPrice,
            }}
          />

          {errorMessage ? (
            <div className={styles.emptyState} role="status">
              <span className={styles.emptyIcon}>
                <PackageSearch size={30} strokeWidth={1.4} aria-hidden="true" />
              </span>
              <p className={styles.eyebrow}>A little pause in your discovery</p>
              <h3>Let&apos;s try that again.</h3>
              <p>
                We couldn&apos;t load the collection. Please try again in a
                moment.
              </p>
              <form action="/shop" method="get">
                <button type="submit" className={styles.primaryLink}>
                  Try again
                  <ArrowUpRight size={17} aria-hidden="true" />
                </button>
              </form>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState} role="status">
              <span className={styles.emptyIcon}>
                <PackageSearch size={30} strokeWidth={1.4} aria-hidden="true" />
              </span>
              <p className={styles.eyebrow}>There&apos;s more to discover</p>
              <h3>No finds just yet.</h3>
              <p>
                {activeFilters
                  ? "Try a different category, brand, or price range. Your next favourite is out there."
                  : "New finds will appear here as they become available. Explore our collections in the meantime."}
              </p>
              <Link
                href={activeFilters ? "/shop#shop-products" : "/search"}
                className={styles.primaryLink}
              >
                {activeFilters ? "Reset all filters" : "Explore collections"}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 2}
                  variant="editorial"
                />
              ))}
            </div>
          )}

          {!errorMessage && products.length > 0 && (
            <div className={styles.collectionEnd}>
              <span aria-hidden="true" />
              <p>
                {products.length === 48
                  ? "Showing the first 48 finds. Refine your filters to discover more."
                  : "A little discovery goes a long way."}
              </p>
              <span aria-hidden="true" />
            </div>
          )}
        </section>

        <aside
          className={styles.discovery}
          aria-label="Find a particular product"
        >
          <div>
            <p className={styles.eyebrow}>Have something in mind?</p>
            <h2>Make it your next find.</h2>
          </div>
          <Link href="/search">
            <Search size={17} strokeWidth={1.5} aria-hidden="true" />
            Search the marketplace
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </div>
  );
}

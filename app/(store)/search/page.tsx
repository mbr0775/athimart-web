import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronRight, PackageSearch, Search, X } from "lucide-react";

import { ProductCard } from "@/components/products/product-card";
import SearchCategoryGrid from "@/components/search/search-category-grid";
import { getCategoryPath, productCategories } from "@/config/categories";
import { categoryCoverPhotos } from "@/config/category-images";
import { editorialFont } from "@/lib/fonts";
import { searchProducts } from "@/lib/products/product-service";
import type { Product } from "@/types/product";
import styles from "./search.module.css";

export const metadata: Metadata = {
  title: "Search Products",
  description: "Search AthiMart products by product name, brand, model, category or product type.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

const suggestions = ["Mobiles", "Laptops", "Smart watches", "Fashion"];

// Reuse the collection photography already featured on the home page.
const collections = [
  { name: "Everyday technology", label: "Work. Play. Create.", href: "/category/digital-products", image: "photo-1496181133206-80ce9b88a853" },
  { name: "A little more you", label: "Find your everyday style", href: "/category/fashion", image: "photo-1445205170230-053b83016050" },
];

function getQueryValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = getQueryValue((await searchParams).q);
  const hasSearchQuery = query.length >= 2;
  let products: Product[] = [];
  let searchFailed = false;

  if (hasSearchQuery) {
    try {
      products = await searchProducts({ query, countryCode: "LK", limit: 48 });
    } catch {
      searchFailed = true;
    }
  }

  return (
    <div className={`${styles.page} ${editorialFont.variable}`}>
      <div className={styles.container}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span aria-current="page">Search</span>
        </nav>

        <section aria-labelledby="search-heading" className={styles.hero} data-results={hasSearchQuery}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span className={styles.statusDot} aria-hidden="true" />
              A world of everyday discoveries
            </p>
            <h1 id="search-heading" className={styles.heading}>
              Find your next<br /> <em>favourite.</em>
            </h1>
            <p className={styles.description}>
              A little inspiration. Something you need. Discover technology,
              style, and more, all in one place.
            </p>

            <form action="/search" method="get" role="search" aria-label="Product search" className={styles.searchForm}>
              <div className={styles.searchBar}>
                <Search size={21} strokeWidth={1.6} className={styles.searchIcon} aria-hidden="true" />
                <label htmlFor="product-search" className="sr-only">Search products</label>
                <input
                  key={query}
                  id="product-search"
                  name="q"
                  type="search"
                  defaultValue={query}
                  minLength={2}
                  maxLength={80}
                  required
                  autoComplete="off"
                  enterKeyHint="search"
                  placeholder="Search products, brands, and more"
                  aria-describedby="search-hint"
                  className={styles.searchInput}
                />
                {query && (
                  <Link href="/search" aria-label="Clear product search" className={styles.clearButton}>
                    <X size={17} aria-hidden="true" />
                  </Link>
                )}
                <button type="submit" className={styles.searchButton}>
                  <span>Search</span><ArrowRight size={19} aria-hidden="true" />
                </button>
              </div>
              <p id="search-hint" className={styles.hint}>
                {query.length === 1
                  ? "Keep going. Enter at least 2 characters to search."
                  : "Search by name, brand, model, or category. At least 2 characters."}
              </p>
            </form>

            <div className={styles.suggestions} aria-label="Suggested searches">
              <span>Try searching</span>
              {suggestions.map((suggestion) => (
                <Link key={suggestion} href={`/search?q=${encodeURIComponent(suggestion)}`}>
                  {suggestion}<ArrowUpRight size={12} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>

          {!hasSearchQuery && (
            <aside className={styles.collections} aria-label="Explore our collections">
              {collections.map((collection, index) => (
                <Link key={collection.href} href={collection.href} className={styles.collectionCard}>
                  <Image
                    src={`https://images.unsplash.com/${collection.image}?auto=format&fit=crop&w=700&q=85`}
                    alt=""
                    fill
                    priority={index === 0}
                    sizes="(max-width: 767px) 45vw, (max-width: 1023px) 24vw, 20vw"
                    className={styles.collectionImage}
                  />
                  <div className={styles.collectionCopy}>
                    <span>{collection.label}</span><h2>{collection.name}</h2>
                  </div>
                  <span className={styles.collectionArrow} aria-hidden="true"><ArrowUpRight size={18} /></span>
                </Link>
              ))}
              <p className={styles.collectionNote}>Thoughtful finds. Endless possibilities.</p>
            </aside>
          )}
        </section>

        {searchFailed ? (
          <section aria-labelledby="search-error-heading" className={styles.emptyState} role="status">
            <span className={styles.emptyIcon}><PackageSearch size={29} strokeWidth={1.4} aria-hidden="true" /></span>
            <p className={styles.eyebrow}>Let&apos;s try that again</p>
            <h2 id="search-error-heading">We couldn&apos;t complete your search.</h2>
            <p>Something went wrong while finding your products. Please try again in a moment.</p>
            <form action="/search" method="get">
              <input type="hidden" name="q" value={query} />
              <button type="submit" className={styles.primaryLink}>
                Try again <ArrowRight size={17} aria-hidden="true" />
              </button>
            </form>
          </section>
        ) : hasSearchQuery ? (
          <section aria-labelledby="search-results-heading" className={styles.results}>
            <div className={styles.sectionHeader}>
              <div className={styles.resultHeading}>
                <p className={styles.eyebrow}>Your discoveries</p>
                <h2 id="search-results-heading" className={styles.sectionTitle}>Results for <em>&ldquo;{query}&rdquo;</em></h2>
              </div>
              <p className={styles.resultCount} role="status">
                {products.length === 48 ? "Showing 48" : products.length} {products.length === 1 ? "product" : "products"}
              </p>
            </div>
            {products.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}><PackageSearch size={29} strokeWidth={1.4} aria-hidden="true" /></span>
                <h3>No finds just yet.</h3>
                <p>Try another name, check your spelling, or explore a broader category. Your next favourite is out there.</p>
                <Link href="/shop" className={styles.primaryLink}>Explore all products <ArrowUpRight size={17} aria-hidden="true" /></Link>
              </div>
            ) : (
              <div className={styles.productGrid}>
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={index < 4} variant="editorial" />
                ))}
              </div>
            )}
          </section>
        ) : null}

        <section aria-labelledby="search-departments-heading" className={styles.departments}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>A little inspiration</p>
              <h2 id="search-departments-heading" className={styles.sectionTitle}>
                {hasSearchQuery ? "Keep exploring." : "Where will you wander?"}
              </h2>
            </div>
            <Link href="/shop" className={styles.browseLink}>Explore all products <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
          <SearchCategoryGrid categories={productCategories.map((category) => ({
            name: category.name,
            slug: category.slug,
            href: getCategoryPath(category.slug),
            description: category.shortDescription,
            typeCount: category.subcategories.length,
            image: `https://images.unsplash.com/${categoryCoverPhotos[category.slug]}?auto=format&fit=crop&w=900&q=85`,
          }))} />
        </section>
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "@/components/navigation/navigation-link";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  ChevronRight,
  PackageSearch,
} from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/types/product";
import styles from "./collection-view.module.css";

interface CollectionViewProps {
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  canonicalPath: string;
  breadcrumbs: { label: string; href?: string }[];
  collections: { label: string; href: string }[];
  products: Product[];
  hasError: boolean;
}

export function CollectionView({
  title,
  eyebrow,
  description,
  image,
  canonicalPath,
  breadcrumbs,
  collections,
  products,
  hasError,
}: Readonly<CollectionViewProps>) {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <ol>
            {breadcrumbs.map((item, index) => (
              <li key={item.label}>
                {index > 0 && <ChevronRight size={11} aria-hidden="true" />}
                {item.href ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  <span aria-current="page">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1>
              {title}
              <span aria-hidden="true">.</span>
            </h1>
            <p className={styles.description}>{description}</p>
            <a href="#collection-products" className={styles.explore}>
              Explore the collection
              <ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
          <div className={styles.visual}>
            <Image
              src={image}
              alt=""
              fill
              loading="eager"
              sizes="(max-width: 767px) 90vw, 40vw"
              className={styles.image}
            />
            <span className={styles.imageLabel}>
              A new perspective on the everyday
            </span>
          </div>
        </header>
        <nav className={styles.collections} aria-label="Browse product types">
          {collections.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.href === canonicalPath ? "page" : undefined}
            >
              {item.label}
              {item.href === canonicalPath && (
                <Check size={13} aria-hidden="true" />
              )}
            </Link>
          ))}
        </nav>
        <section
          id="collection-products"
          aria-labelledby="collection-products-heading"
          className={styles.results}
        >
          <header className={styles.resultHeader}>
            <div>
              <p className={styles.eyebrow}>
                Thoughtful finds. Everyday possibilities.
              </p>
              <h2 id="collection-products-heading">The collection.</h2>
            </div>
            {!hasError && (
              <p role="status">
                {products.length === 48
                  ? "Showing 48"
                  : String(products.length).padStart(2, "0")}{" "}
                {products.length === 1 ? "product" : "products"}
              </p>
            )}
          </header>
          {hasError ? (
            <div className={styles.empty} role="status">
              <PackageSearch size={35} strokeWidth={1.3} aria-hidden="true" />
              <h3>A little pause in your discovery.</h3>
              <p>
                We couldn&apos;t load this collection. Please try again in a
                moment.
              </p>
              <form action={canonicalPath} method="get">
                <button className="athimart-brand-button" type="submit">
                  Try again
                  <ArrowUpRight size={16} aria-hidden="true" />
                </button>
              </form>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.empty} role="status">
              <PackageSearch size={35} strokeWidth={1.3} aria-hidden="true" />
              <h3>More good finds are on their way.</h3>
              <p>
                Products will appear here as they become available. There&apos;s
                more to explore across the marketplace.
              </p>
              <Link href="/shop" className="athimart-brand-button">
                Explore all products
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className={styles.grid}>
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
        </section>
        <div className={styles.more}>
          <span>Keep a little curiosity.</span>
          <Link href="/shop">
            Discover the marketplace
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}

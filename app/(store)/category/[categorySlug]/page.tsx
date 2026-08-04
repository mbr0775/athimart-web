// app/(store)/category/[categorySlug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Grid3X3,
  PackageSearch,
} from "lucide-react";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/products/product-card";
import {
  getCategoryBySlug,
  getCategoryPath,
  getCategoryStaticParams,
  getSubcategoryPath,
} from "@/config/categories";
import { siteConfig } from "@/config/site";
import { getProductsByCategory } from "@/lib/products/product-service";
import type { Product } from "@/types/product";

export const revalidate = 300;

interface CategoryPageProps {
  params: Promise<{
    categorySlug: string;
  }>;
}

/**
 * Generate all known category routes.
 */
export function generateStaticParams() {
  return getCategoryStaticParams();
}

/**
 * Generate unique category metadata.
 */
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;

  const category =
    getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const canonicalPath =
    getCategoryPath(category.slug);

  return {
    title: category.seoTitle,
    description: category.metaDescription,

    alternates: {
      canonical: canonicalPath,
    },

    openGraph: {
      type: "website",
      url: canonicalPath,
      siteName: siteConfig.name,
      title: category.seoTitle,
      description:
        category.metaDescription,
      images: [
        {
          url: siteConfig.socialImage,
          alt: `${category.name} on AthiMart`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: category.seoTitle,
      description:
        category.metaDescription,
      images: [siteConfig.socialImage],
    },
  };
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { categorySlug } = await params;

  const category =
    getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  let products: Product[] = [];
  let errorMessage = "";

  try {
    products =
      await getProductsByCategory({
        categoryName: category.name,
        countryCode: "LK",
        limit: 48,
      });
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to load category products.";
  }

  const canonicalPath =
    getCategoryPath(category.slug);

  const absoluteCategoryUrl = new URL(
    canonicalPath,
    siteConfig.url
  ).toString();

  const absoluteHomeUrl = new URL(
    "/",
    siteConfig.url
  ).toString();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",

    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteHomeUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: absoluteCategoryUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd
          ).replace(/</g, "\\u003c"),
        }}
      />

      <div className="athimart-container py-7 sm:py-10 lg:py-14">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="overflow-x-auto"
        >
          <ol className="flex min-w-max items-center gap-2 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)] sm:text-[10px]">
            <li>
              <Link
                href="/"
                className="transition hover:text-[var(--text)]"
              >
                Home
              </Link>
            </li>

            <li aria-hidden="true">
              <ChevronRight
                className="h-3.5 w-3.5"
                strokeWidth={1.8}
              />
            </li>

            <li
              aria-current="page"
              className="text-[var(--text)]"
            >
              {category.name}
            </li>
          </ol>
        </nav>

        {/* Category introduction */}
        <header className="mt-8 border-b border-[var(--black)] pb-8 sm:pb-10">
          <p className="athimart-label text-[var(--text-muted)]">
            AthiMart product category
          </p>

          <h1 className="athimart-display-large mt-4">
            {category.name}
          </h1>

          <p className="athimart-body-large mt-5 max-w-4xl">
            {category.description}
          </p>
        </header>

        {/* Subcategory navigation */}
        <nav
          aria-labelledby="subcategory-navigation-heading"
          className="mt-11 sm:mt-14"
        >
          <div className="flex items-center gap-3">
            <Grid3X3
              aria-hidden="true"
              className="h-5 w-5"
              strokeWidth={1.7}
            />

            <div>
              <p className="athimart-label text-[var(--text-muted)]">
                Refine your shopping
              </p>

              <h2
                id="subcategory-navigation-heading"
                className="athimart-title-large mt-2"
              >
                Shop by Subcategory
              </h2>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {category.subcategories.map(
              (subcategory) => (
                <Link
                  key={subcategory.slug}
                  href={getSubcategoryPath(
                    category.slug,
                    subcategory.slug
                  )}
                  className="group flex min-h-36 flex-col justify-between border border-[var(--border)] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--black)] hover:shadow-[0_14px_35px_rgba(23,23,23,0.08)] sm:p-6"
                >
                  <div>
                    <h3 className="font-[var(--font-display)] text-2xl font-normal leading-tight tracking-[0.02em] sm:text-3xl">
                      {subcategory.name}
                    </h3>

                    <p className="mt-3 font-[var(--font-body)] text-sm leading-6 text-[var(--text-muted)]">
                      {
                        subcategory.shortDescription
                      }
                    </p>
                  </div>

                  <span className="mt-5 inline-flex items-center gap-2 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.16em]">
                    Browse products

                    <ChevronRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              )
            )}
          </div>
        </nav>

        {/* Category products */}
        <section
          aria-labelledby="category-products-heading"
          className="mt-14 border-t border-[var(--black)] pt-9 lg:mt-20 lg:pt-12"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="athimart-label text-[var(--text-muted)]">
                Available in Sri Lanka
              </p>

              <h2
                id="category-products-heading"
                className="athimart-title-large mt-2"
              >
                {category.name} Products
              </h2>
            </div>

            {!errorMessage && (
              <p className="athimart-label text-[var(--text-muted)]">
                {products.length}{" "}
                {products.length === 1
                  ? "item"
                  : "items"}
              </p>
            )}
          </div>

          {errorMessage ? (
            <div className="mt-8 border border-[var(--sale)] bg-white p-7">
              <PackageSearch
                aria-hidden="true"
                className="h-9 w-9 text-[var(--sale)]"
                strokeWidth={1.6}
              />

              <h3 className="athimart-title mt-4">
                Products could not be loaded
              </h3>

              <p className="athimart-body mt-3">
                {errorMessage}
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="mt-8 border border-[var(--border)] bg-white p-9 text-center">
              <PackageSearch
                aria-hidden="true"
                className="mx-auto h-11 w-11 text-[var(--text-muted)]"
                strokeWidth={1.5}
              />

              <h3 className="athimart-title mt-5">
                No products currently available
              </h3>

              <p className="athimart-body mx-auto mt-3 max-w-xl">
                Products added to this category
                will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 items-stretch gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 md:gap-x-7 lg:grid-cols-4 lg:gap-x-6">
              {products.map(
                (product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={index < 4}
                  />
                )
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
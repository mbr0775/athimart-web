// app/(store)/category/[categorySlug]/[subcategorySlug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  PackageSearch,
} from "lucide-react";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/products/product-card";
import {
  getCategoryBySlug,
  getCategoryPath,
  getSubcategoryBySlug,
  getSubcategoryPath,
  getSubcategoryStaticParams,
} from "@/config/categories";
import { siteConfig } from "@/config/site";
import { getProductsBySubcategory } from "@/lib/products/product-service";
import type { Product } from "@/types/product";

export const revalidate = 300;

interface SubcategoryPageProps {
  params: Promise<{
    categorySlug: string;
    subcategorySlug: string;
  }>;
}

/**
 * Generate all configured subcategory routes.
 */
export function generateStaticParams() {
  return getSubcategoryStaticParams();
}

/**
 * Generate unique subcategory metadata.
 */
export async function generateMetadata({
  params,
}: SubcategoryPageProps): Promise<Metadata> {
  const {
    categorySlug,
    subcategorySlug,
  } = await params;

  const category =
    getCategoryBySlug(categorySlug);

  const subcategory =
    getSubcategoryBySlug(
      categorySlug,
      subcategorySlug
    );

  if (!category || !subcategory) {
    notFound();
  }

  const canonicalPath =
    getSubcategoryPath(
      category.slug,
      subcategory.slug
    );

  return {
    title: subcategory.seoTitle,
    description:
      subcategory.metaDescription,

    alternates: {
      canonical: canonicalPath,
    },

    openGraph: {
      type: "website",
      url: canonicalPath,
      siteName: siteConfig.name,
      title: subcategory.seoTitle,
      description:
        subcategory.metaDescription,
      images: [
        {
          url: siteConfig.socialImage,
          alt: `${subcategory.name} on AthiMart`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: subcategory.seoTitle,
      description:
        subcategory.metaDescription,
      images: [siteConfig.socialImage],
    },
  };
}

export default async function SubcategoryPage({
  params,
}: SubcategoryPageProps) {
  const {
    categorySlug,
    subcategorySlug,
  } = await params;

  const category =
    getCategoryBySlug(categorySlug);

  const subcategory =
    getSubcategoryBySlug(
      categorySlug,
      subcategorySlug
    );

  if (!category || !subcategory) {
    notFound();
  }

  let products: Product[] = [];
  let errorMessage = "";

  try {
    products =
      await getProductsBySubcategory({
        categoryName: category.name,
        subcategoryName:
          subcategory.name,
        countryCode: "LK",
        limit: 48,
      });
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to load subcategory products.";
  }

  const canonicalPath =
    getSubcategoryPath(
      category.slug,
      subcategory.slug
    );

  const absoluteHomeUrl =
    new URL("/", siteConfig.url).toString();

  const absoluteCategoryUrl =
    new URL(
      getCategoryPath(category.slug),
      siteConfig.url
    ).toString();

  const absoluteSubcategoryUrl =
    new URL(
      canonicalPath,
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
      {
        "@type": "ListItem",
        position: 3,
        name: subcategory.name,
        item: absoluteSubcategoryUrl,
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

            <li>
              <Link
                href={getCategoryPath(
                  category.slug
                )}
                className="transition hover:text-[var(--text)]"
              >
                {category.name}
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
              {subcategory.name}
            </li>
          </ol>
        </nav>

        {/* Subcategory introduction */}
        <header className="mt-8 border-b border-[var(--black)] pb-8 sm:pb-10">
          <p className="athimart-label text-[var(--text-muted)]">
            {category.name}
          </p>

          <h1 className="athimart-display-large mt-4">
            {subcategory.name}
          </h1>

          <p className="athimart-body-large mt-5 max-w-4xl">
            {subcategory.description}
          </p>
        </header>

        {/* Products */}
        <section
          aria-labelledby="subcategory-products-heading"
          className="mt-11 sm:mt-14"
        >
          <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="athimart-label text-[var(--text-muted)]">
                AthiMart Sri Lanka
              </p>

              <h2
                id="subcategory-products-heading"
                className="athimart-title-large mt-2"
              >
                Available Products
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
                New products added to{" "}
                {subcategory.name} will appear
                here automatically.
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

        {/* Related subcategories */}
        <nav
          aria-labelledby="related-subcategories-heading"
          className="mt-14 border-t border-[var(--black)] pt-9 lg:mt-20"
        >
          <p className="athimart-label text-[var(--text-muted)]">
            Continue exploring
          </p>

          <h2
            id="related-subcategories-heading"
            className="athimart-title-large mt-2"
          >
            Related Subcategories
          </h2>

          <div className="mt-6 flex flex-wrap gap-3">
            {category.subcategories
              .filter(
                (item) =>
                  item.slug !==
                  subcategory.slug
              )
              .map((item) => (
                <Link
                  key={item.slug}
                  href={getSubcategoryPath(
                    category.slug,
                    item.slug
                  )}
                  className="athimart-filter-button"
                >
                  {item.name}
                </Link>
              ))}
          </div>
        </nav>
      </div>
    </>
  );
}
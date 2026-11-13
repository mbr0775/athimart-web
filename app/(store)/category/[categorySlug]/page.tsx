// app/(store)/category/[categorySlug]/page.tsx

import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { CollectionView } from "@/components/products/collection-view";
import { categoryCoverPhotos } from "@/config/category-images";
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

      <CollectionView title={category.name} eyebrow={"The AthiMart collection"} description={category.description} image={`https://images.unsplash.com/${categoryCoverPhotos[category.slug]}?auto=format&fit=crop&w=1000&q=85`} canonicalPath={canonicalPath} breadcrumbs={[{label:"Home",href:"/"},{label:category.name}]} collections={[{label:"All "+category.name,href:getCategoryPath(category.slug)},...category.subcategories.map(item=>({label:item.name,href:getSubcategoryPath(category.slug,item.slug)}))]} products={products} hasError={Boolean(errorMessage)} />
    </>
  );
}

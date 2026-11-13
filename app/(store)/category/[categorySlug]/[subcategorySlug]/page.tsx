// app/(store)/category/[categorySlug]/[subcategorySlug]/page.tsx

import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { CollectionView } from "@/components/products/collection-view";
import { categoryCoverPhotos } from "@/config/category-images";
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

      <CollectionView title={subcategory.name} eyebrow={category.name} description={subcategory.description} image={`https://images.unsplash.com/${categoryCoverPhotos[category.slug]}?auto=format&fit=crop&w=1000&q=85`} canonicalPath={canonicalPath} breadcrumbs={[{label:"Home",href:"/"},{label:category.name,href:getCategoryPath(category.slug)},{label:subcategory.name}]} collections={[{label:"All "+category.name,href:getCategoryPath(category.slug)},...category.subcategories.map(item=>({label:item.name,href:getSubcategoryPath(category.slug,item.slug)}))]} products={products} hasError={Boolean(errorMessage)} />
    </>
  );
}

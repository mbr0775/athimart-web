// app/(store)/category/[categorySlug]/[subcategorySlug]/[productSlug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  CircleX,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  notFound,
  permanentRedirect,
} from "next/navigation";
import { cache } from "react";

import AddToCartButton from "@/components/cart/add-to-cart-button";
import { ProductGallery } from "@/components/products/product-gallery";
import { siteConfig } from "@/config/site";
import {
  getProductBySlug,
} from "@/lib/products/product-service";
import {
  getProductPath,
} from "@/lib/products/product-url";
import type { Product } from "@/types/product";

/**
 * Product pages use request-time rendering.
 *
 * The shared AthiMart storefront header reads the
 * current Supabase authentication session from cookies,
 * so this route must not be statically rendered.
 */
export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{
    categorySlug: string;
    subcategorySlug: string;
    productSlug: string;
  }>;
}

/**
 * Reuse the product query between generateMetadata()
 * and the product page during the same render.
 */
const getProduct = cache(
  getProductBySlug
);

/**
 * Format Sri Lankan prices.
 *
 * Example:
 * 2000 -> Rs 2,000
 */
function formatLkr(
  value: number
): string {
  const formattedAmount =
    new Intl.NumberFormat(
      "en-LK",
      {
        maximumFractionDigits: 0,
      }
    ).format(value);

  return `Rs ${formattedAmount}`;
}

/**
 * Create fallback product copy when the database
 * does not yet contain a full description.
 */
function createFallbackDescription(
  product: Product
): string {
  const brandName =
    product.brand ??
    product.companyName;

  return `Explore ${product.name} by ${brandName}. View its current AthiMart price, availability, product images, specifications and marketplace information.`;
}

/**
 * Content displayed visibly on the product page.
 */
function getVisibleDescription(
  product: Product
): string {
  return (
    product.description.trim() ||
    createFallbackDescription(
      product
    )
  );
}

/**
 * Metadata descriptions should be useful
 * but not excessively long.
 */
function getMetadataDescription(
  product: Product
): string {
  const description =
    product.seoDescription?.trim() ||
    product.description.trim() ||
    createFallbackDescription(
      product
    );

  if (
    description.length <= 160
  ) {
    return description;
  }

  return `${description
    .slice(0, 157)
    .trimEnd()}...`;
}

/**
 * Convert product attribute values
 * into readable text.
 */
function formatAttributeValue(
  value: unknown
): string {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (
    Array.isArray(value)
  ) {
    return value
      .map((item) =>
        String(item)
      )
      .join(", ");
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    return Object.entries(
      value
    )
      .map(
        ([key, item]) => {
          const readableKey =
            key
              .replaceAll(
                "_",
                " "
              )
              .replace(
                /\b\w/g,
                (character) =>
                  character.toUpperCase()
              );

          return `${readableKey}: ${String(
            item
          )}`;
        }
      )
      .join(", ");
  }

  return "Not specified";
}

/**
 * Convert attribute field names
 * into readable labels.
 */
function formatAttributeLabel(
  label: string
): string {
  return label
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

/**
 * Generate unique SEO metadata
 * for each product.
 */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const {
    productSlug,
  } = await params;

  const product =
    await getProduct(
      productSlug
    );

  if (!product) {
    notFound();
  }

  const canonicalPath =
    getProductPath(product);

  const description =
    getMetadataDescription(
      product
    );

  const brandName =
    product.brand ??
    product.companyName;

  const title =
    product.seoTitle?.trim() ||
    `${product.name} by ${brandName}`;

  const socialImage =
    product.imageUrls[0] ||
    siteConfig.socialImage;

  return {
    title,
    description,

    alternates: {
      canonical:
        canonicalPath,
    },

    openGraph: {
      type: "website",
      url: canonicalPath,
      siteName:
        siteConfig.name,
      title,
      description,
      images: [
        {
          url: socialImage,
          alt: `${product.name} by ${brandName}`,
        },
      ],
    },

    twitter: {
      card:
        "summary_large_image",
      title,
      description,
      images: [
        socialImage,
      ],
    },
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const {
    categorySlug,
    subcategorySlug,
    productSlug,
  } = await params;

  const product =
    await getProduct(
      productSlug
    );

  if (!product) {
    notFound();
  }

  const canonicalPath =
    getProductPath(product);

  const requestedPath = [
    "/category",
    categorySlug,
    subcategorySlug,
    productSlug,
  ].join("/");

  /**
   * Redirect incorrect or outdated category
   * paths to the permanent canonical URL.
   */
  if (
    requestedPath !==
    canonicalPath
  ) {
    permanentRedirect(
      canonicalPath
    );
  }

  const currentPrice =
    product.prices.LKR;

  const originalPrice =
    product.originalPrices.LKR;

  const hasPrice =
    currentPrice > 0;

  const hasDiscount =
    product.discountPercent >
      0 &&
    originalPrice >
      currentPrice;

  const isOutOfStock =
    product.stock <= 0;

  const visibleDescription =
    getVisibleDescription(
      product
    );

  const brandName =
    product.brand ??
    product.companyName;

  const attributeEntries =
    Object.entries(
      product.attributes
    ).filter(
      ([, value]) => {
        if (
          value === null ||
          value === undefined
        ) {
          return false;
        }

        if (
          typeof value ===
            "string" &&
          value.trim() === ""
        ) {
          return false;
        }

        return true;
      }
    );

  const absoluteProductUrl =
    new URL(
      canonicalPath,
      siteConfig.url
    ).toString();

  const absoluteHomeUrl =
    new URL(
      "/",
      siteConfig.url
    ).toString();

  const absoluteCategoryUrl =
    new URL(
      `/category/${categorySlug}`,
      siteConfig.url
    ).toString();

  const absoluteSubcategoryUrl =
    new URL(
      `/category/${categorySlug}/${subcategorySlug}`,
      siteConfig.url
    ).toString();

  const fallbackImage =
    new URL(
      siteConfig.socialImage,
      siteConfig.url
    ).toString();

  const productImages =
    product.imageUrls.length >
    0
      ? product.imageUrls
      : [fallbackImage];

  /**
   * Only include Offer structured data
   * when a valid price exists.
   *
   * The shippingDetails block references
   * AthiMart's global ShippingService
   * declared on the homepage OnlineStore
   * structured data.
   */
  const offerJsonLd =
    hasPrice
      ? {
          "@type":
            "Offer",

          url:
            absoluteProductUrl,

          priceCurrency:
            "LKR",

          price:
            currentPrice.toFixed(
              2
            ),

          availability:
            isOutOfStock
              ? "https://schema.org/OutOfStock"
              : "https://schema.org/InStock",

          itemCondition:
            "https://schema.org/NewCondition",

          shippingDetails: {
            "@type":
              "OfferShippingDetails",

            hasShippingService: {
              "@id":
                `${siteConfig.url}/#standard-shipping`,
            },
          },

          hasMerchantReturnPolicy: {
            "@id":
              `${siteConfig.url}/#return-policy`,
          },
        }
      : undefined;

  const productJsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "Product",

    name:
      product.name,

    description:
      visibleDescription,

    image:
      productImages,

    sku:
      product.sku ??
      product.id,

    brand: {
      "@type":
        "Brand",

      name:
        brandName,
    },

    category:
      `${product.category} > ${product.subCategory}`,

    ...(offerJsonLd
      ? {
          offers:
            offerJsonLd,
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "BreadcrumbList",

    itemListElement: [
      {
        "@type":
          "ListItem",

        position: 1,

        name:
          "Home",

        item:
          absoluteHomeUrl,
      },
      {
        "@type":
          "ListItem",

        position: 2,

        name:
          product.category,

        item:
          absoluteCategoryUrl,
      },
      {
        "@type":
          "ListItem",

        position: 3,

        name:
          product.subCategory,

        item:
          absoluteSubcategoryUrl,
      },
      {
        "@type":
          "ListItem",

        position: 4,

        name:
          product.name,

        item:
          absoluteProductUrl,
      },
    ],
  };

  return (
    <>
      {/* Product structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              productJsonLd
            ).replace(
              /</g,
              "\\u003c"
            ),
        }}
      />

      {/* Breadcrumb structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              breadcrumbJsonLd
            ).replace(
              /</g,
              "\\u003c"
            ),
        }}
      />

      <article className="athimart-container py-7 sm:py-10 lg:py-14">
        {/* Visible breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="overflow-x-auto pb-1"
        >
          <ol className="flex min-w-max items-center gap-2 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] sm:text-[10px]">
            <li>
              <Link
                href="/"
                className="transition-colors duration-200 hover:text-[var(--text)]"
              >
                Home
              </Link>
            </li>

            <li aria-hidden="true">
              <ChevronRight
                className="h-3.5 w-3.5"
                strokeWidth={
                  1.8
                }
              />
            </li>

            <li>
              <Link
                href={`/category/${categorySlug}`}
                className="transition-colors duration-200 hover:text-[var(--text)]"
              >
                {
                  product.category
                }
              </Link>
            </li>

            <li aria-hidden="true">
              <ChevronRight
                className="h-3.5 w-3.5"
                strokeWidth={
                  1.8
                }
              />
            </li>

            <li>
              <Link
                href={`/category/${categorySlug}/${subcategorySlug}`}
                className="transition-colors duration-200 hover:text-[var(--text)]"
              >
                {
                  product.subCategory
                }
              </Link>
            </li>

            <li aria-hidden="true">
              <ChevronRight
                className="h-3.5 w-3.5"
                strokeWidth={
                  1.8
                }
              />
            </li>

            <li
              aria-current="page"
              className="max-w-52 truncate text-[var(--text)] sm:max-w-none"
            >
              {
                product.name
              }
            </li>
          </ol>
        </nav>

        {/* Main product area */}
        <div className="mt-7 grid items-start gap-9 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
          {/* Interactive image gallery */}
          <ProductGallery
            images={
              product.imageUrls
            }
            productName={
              product.name
            }
            companyName={
              product.companyName
            }
            fallbackEmoji={
              product.emoji
            }
            discountPercent={
              product.discountPercent
            }
          />

          {/* Product details */}
          <section
            aria-labelledby="product-title"
            className="lg:sticky lg:top-32"
          >
            <p className="athimart-label text-[var(--text-muted)]">
              {brandName}
            </p>

            <h1
              id="product-title"
              className="athimart-display-medium mt-3 sm:mt-4"
            >
              {
                product.name
              }
            </h1>

            {(product.model ||
              product.sku) && (
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {product.model && (
                  <p className="font-[var(--font-body)] text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                    Model:{" "}
                    {
                      product.model
                    }
                  </p>
                )}

                {product.sku && (
                  <p className="font-[var(--font-body)] text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                    SKU:{" "}
                    {
                      product.sku
                    }
                  </p>
                )}
              </div>
            )}

            {/* Price and availability */}
            <div className="mt-7 border-y border-[var(--border)] py-6">
              {hasPrice ? (
                <div className="flex flex-wrap items-baseline gap-3">
                  <p className="font-[var(--font-body)] text-2xl font-bold text-[var(--text)] sm:text-3xl">
                    {formatLkr(
                      currentPrice
                    )}
                  </p>

                  {hasDiscount && (
                    <p className="font-[var(--font-body)] text-sm text-[var(--text-muted)] line-through sm:text-base">
                      {formatLkr(
                        originalPrice
                      )}
                    </p>
                  )}

                  {hasDiscount && (
                    <span className="bg-[var(--sale)] px-2.5 py-1 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
                      Save{" "}
                      {formatLkr(
                        originalPrice -
                          currentPrice
                      )}
                    </span>
                  )}
                </div>
              ) : (
                <p className="font-[var(--font-body)] text-sm font-semibold uppercase tracking-[0.14em] text-[var(--warning)]">
                  Price unavailable
                </p>
              )}

              <div
                className={`mt-4 inline-flex items-center gap-2 border px-3 py-2 ${
                  isOutOfStock
                    ? "border-[var(--sale)] text-[var(--sale)]"
                    : "border-[var(--success)] text-[var(--success)]"
                }`}
              >
                {isOutOfStock ? (
                  <CircleX
                    className="h-4 w-4"
                    strokeWidth={
                      2
                    }
                    aria-hidden="true"
                  />
                ) : (
                  <CheckCircle2
                    className="h-4 w-4"
                    strokeWidth={
                      2
                    }
                    aria-hidden="true"
                  />
                )}

                <span className="font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.15em]">
                  {isOutOfStock
                    ? "Currently unavailable"
                    : `${product.stock} in stock`}
                </span>
              </div>
            </div>

            {/* Category */}
            <div className="mt-7">
              <p className="athimart-label text-[var(--text-muted)]">
                Product category
              </p>

              <p className="mt-2 font-[var(--font-body)] text-sm leading-6 text-[var(--text)]">
                {
                  product.category
                }

                <span
                  aria-hidden="true"
                  className="mx-2 text-[var(--text-muted)]"
                >
                  /
                </span>

                {
                  product.subCategory
                }
              </p>
            </div>

            {/* Information cards */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="border border-[var(--border)] bg-white p-4 transition-colors duration-200 hover:border-[var(--black)]">
                <Truck
                  className="h-5 w-5"
                  strokeWidth={
                    1.7
                  }
                  aria-hidden="true"
                />

                <p className="mt-3 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em]">
                  Delivery
                </p>

                <p className="mt-1 font-[var(--font-body)] text-xs leading-5 text-[var(--text-muted)]">
                  Market-specific delivery
                </p>
              </div>

              <div className="border border-[var(--border)] bg-white p-4 transition-colors duration-200 hover:border-[var(--black)]">
                <ShieldCheck
                  className="h-5 w-5"
                  strokeWidth={
                    1.7
                  }
                  aria-hidden="true"
                />

                <p className="mt-3 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em]">
                  Secure
                </p>

                <p className="mt-1 font-[var(--font-body)] text-xs leading-5 text-[var(--text-muted)]">
                  Connected AthiMart account
                </p>
              </div>

              <div className="border border-[var(--border)] bg-white p-4 transition-colors duration-200 hover:border-[var(--black)]">
                <PackageCheck
                  className="h-5 w-5"
                  strokeWidth={
                    1.7
                  }
                  aria-hidden="true"
                />

                <p className="mt-3 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em]">
                  Availability
                </p>

                <p className="mt-1 font-[var(--font-body)] text-xs leading-5 text-[var(--text-muted)]">
                  Live marketplace stock
                </p>
              </div>
            </div>

            {/* Working Add to Cart button */}
            <div className="mt-8">
              <AddToCartButton
                product={{
                  productId:
                    product.id,

                  slug:
                    product.slug,

                  name:
                    product.name,

                  companyName:
                    product.companyName ||
                    "AthiMart",

                  category:
                    product.category,

                  subCategory:
                    product.subCategory,

                  imageUrl:
                    product
                      .imageUrls[0] ??
                    null,

                  emoji:
                    product.emoji ||
                    "📦",

                  unitPrice:
                    currentPrice,

                  stock:
                    product.stock,

                  currencyCode:
                    "LKR",
                }}
              />
            </div>
          </section>
        </div>

        {/* Product description */}
        <section
          aria-labelledby="product-description-heading"
          className="mt-14 border-t border-[var(--black)] pt-9 lg:mt-20 lg:pt-12"
        >
          <p className="athimart-label text-[var(--text-muted)]">
            About this product
          </p>

          <h2
            id="product-description-heading"
            className="athimart-title-large mt-3"
          >
            Product Description
          </h2>

          <p className="athimart-body-large mt-5 max-w-4xl whitespace-pre-line">
            {
              visibleDescription
            }
          </p>
        </section>

        {/* Product specifications */}
        {attributeEntries.length >
          0 && (
          <section
            aria-labelledby="product-specifications-heading"
            className="mt-12 border-t border-[var(--border)] pt-9 lg:mt-16"
          >
            <p className="athimart-label text-[var(--text-muted)]">
              Product information
            </p>

            <h2
              id="product-specifications-heading"
              className="athimart-title-large mt-3"
            >
              Specifications
            </h2>

            <dl className="mt-7 grid border-l border-t border-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
              {attributeEntries.map(
                ([
                  label,
                  value,
                ]) => (
                  <div
                    key={
                      label
                    }
                    className="border-b border-r border-[var(--border)] bg-white p-5 transition-colors duration-200 hover:bg-[var(--surface-soft)]"
                  >
                    <dt className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      {formatAttributeLabel(
                        label
                      )}
                    </dt>

                    <dd className="mt-2 font-[var(--font-body)] text-sm leading-6 text-[var(--text)]">
                      {formatAttributeValue(
                        value
                      )}
                    </dd>
                  </div>
                )
              )}
            </dl>
          </section>
        )}
      </article>
    </>
  );
}
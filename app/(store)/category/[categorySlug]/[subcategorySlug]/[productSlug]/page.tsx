// app/(store)/category/[categorySlug]/[subcategorySlug]/[productSlug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getShopPath } from "@/lib/shops/shop-identity";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  CircleX,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
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
import { editorialFont } from "@/lib/fonts";
import styles from "@/components/products/product-detail.module.css";

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
    hasPrice && product.discountPercent >
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

      <article className={`${styles.page} ${editorialFont.variable}`}>
        <div className={styles.container}>
          <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
            <ol>
              <li><Link href="/">Home</Link></li>
              <li aria-hidden="true"><ChevronRight size={11} /></li>
              <li><Link href={`/category/${categorySlug}`}>{product.category}</Link></li>
              <li aria-hidden="true"><ChevronRight size={11} /></li>
              <li><Link href={`/category/${categorySlug}/${subcategorySlug}`}>{product.subCategory}</Link></li>
              <li aria-hidden="true"><ChevronRight size={11} /></li>
              <li aria-current="page">{product.name}</li>
            </ol>
          </nav>

          <div className={styles.main}>
            <ProductGallery
              key={product.id}
              images={product.imageUrls}
              productName={product.name}
              companyName={brandName || "AthiMart"}
              fallbackEmoji={product.emoji}
              discountPercent={hasDiscount ? product.discountPercent : 0}
            />

            <section aria-labelledby="product-title" className={styles.details}>
              <div className={styles.headingTop}><p className={styles.eyebrow}>{brandName || "The AthiMart collection"}</p><span>{product.subCategory}</span></div>
              <h1 id="product-title" className={styles.title}>{product.name}<span aria-hidden="true">.</span></h1>
              {(product.model || product.sku) && <div className={styles.identifiers}>{product.model && <span>Model {product.model}</span>}{product.sku && <span>SKU {product.sku}</span>}</div>}
              <p className={styles.intro}>{visibleDescription.length > 200 ? `${visibleDescription.slice(0, 200).trimEnd()}…` : visibleDescription}</p>
              <a href="#product-description-heading" className={styles.readMore}>Discover the details <ArrowUpRight size={14} aria-hidden="true" /></a>

              {attributeEntries.length > 0 && <dl className={styles.quickFacts}>{attributeEntries.slice(0, 3).map(([label, value]) => <div key={label}><dt>{formatAttributeLabel(label)}</dt><dd>{formatAttributeValue(value)}</dd></div>)}</dl>}

              <div className={styles.purchase}>
                <div className={styles.priceRow}>
                  <div>
                    <p className={styles.priceLabel}>Your price</p>
                    {hasPrice ? <div className={styles.prices}><p className={styles.price}>{formatLkr(currentPrice)}</p>{hasDiscount && <del>{formatLkr(originalPrice)}</del>}</div> : <p className={styles.priceUnavailable}>Price unavailable</p>}
                  </div>
                  <span className={styles.stock} data-unavailable={isOutOfStock}>{isOutOfStock ? <CircleX size={14} aria-hidden="true" /> : <CheckCircle2 size={14} aria-hidden="true" />}{isOutOfStock ? "Out of stock" : `${product.stock} in stock`}</span>
                </div>
                {hasDiscount && <p className={styles.savings}>A little more to love. <span>Save {formatLkr(originalPrice - currentPrice)}</span></p>}
                <div className={styles.actions}>
                  <AddToCartButton product={{
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    companyName: product.companyName || "AthiMart",
                    category: product.category,
                    subCategory: product.subCategory,
                    imageUrl: product.imageUrls[0] ?? null,
                    emoji: product.emoji || "📦",
                    unitPrice: currentPrice,
                    stock: product.stock,
                    currencyCode: "LKR",
                  }} />
                  <Link href="/cart" className={styles.bagLink} aria-label="View your shopping bag"><ShoppingBag size={20} strokeWidth={1.5} aria-hidden="true" /></Link>
                </div>
                <p className={styles.purchaseNote}><ShieldCheck size={13} aria-hidden="true" />Price and availability verified at checkout.</p>
              </div>

              <ul className={styles.serviceList} aria-label="Shopping information">
                <li><Truck size={20} strokeWidth={1.4} aria-hidden="true" /><div><span>Made for your market</span><p>Delivery options are confirmed at checkout.</p></div></li>
                <li><PackageCheck size={20} strokeWidth={1.4} aria-hidden="true" /><div><span>From the marketplace</span>
                  <p>{product.sellerName ? (<>Sold by {product.shopId ? <Link className="underline underline-offset-2" href={getShopPath(product.shopId)}>{product.sellerName}</Link> : product.sellerName}</>) : "Seller not listed"}</p>
                  {product.shippedBy && <p>Shipped by {product.shippedBy}</p>}
                  </div></li>
              </ul>
              <div className={styles.collectionLink}><span>Part of the collection</span><Link href={`/category/${categorySlug}/${subcategorySlug}`}>{product.subCategory}<ArrowUpRight size={15} aria-hidden="true" /></Link></div>
            </section>
          </div>

          <div className={styles.information}>
            <section aria-labelledby="product-description-heading" className={styles.description}>
              <p className={styles.eyebrow}>Considered in every detail</p>
              <h2 id="product-description-heading" className={styles.sectionTitle}>Meet your next<br />everyday favourite.</h2>
              <p className={styles.descriptionText}>{visibleDescription}</p>
              <Link href={`/category/${categorySlug}/${subcategorySlug}`} className={styles.backLink}><ArrowLeft size={15} aria-hidden="true" />Explore more {product.subCategory}</Link>
            </section>
            {attributeEntries.length > 0 && <section aria-labelledby="product-specifications-heading" className={styles.specifications}>
              <p className={styles.eyebrow}>The finer points</p>
              <h2 id="product-specifications-heading" className={styles.sectionTitle}>At a glance.</h2>
              <dl>{attributeEntries.map(([label, value]) => <div key={label}><dt>{formatAttributeLabel(label)}</dt><dd>{formatAttributeValue(value)}</dd></div>)}</dl>
            </section>}
          </div>
        </div>
      </article>
    </>
  );
}

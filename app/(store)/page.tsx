// app/(store)/page.tsx

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Boxes,
  Cpu,
  Dumbbell,
  Globe2,
  HomeIcon,
  Laptop,
  Leaf,
  MapPin,
  PackageCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";

import { ProductCard } from "@/components/products/product-card";
import {
  getCategoryPath,
  productCategories,
} from "@/config/categories";
import { siteConfig } from "@/config/site";
import { getActiveProducts } from "@/lib/products/product-service";
import type { Product } from "@/types/product";

export const metadata: Metadata = {
  title: "Online Marketplace for Technology and Lifestyle",

  description:
    "Shop technology, AI gadgets, fitness products, fashion, natural essences, digital services and more through the AthiMart marketplace.",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.name,
    title: "AthiMart Online Marketplace",
    description:
      "Discover technology, lifestyle, fashion, fitness and digital products through AthiMart.",
    images: [
      {
        url: siteConfig.socialImage,
        alt: "AthiMart online marketplace",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "AthiMart Online Marketplace",
    description:
      "Discover technology, lifestyle, fashion, fitness and digital products through AthiMart.",
    images: [siteConfig.socialImage],
  },
};

interface CategoryVisual {
  icon: LucideIcon;
  number: string;
}

const categoryVisuals: Record<string, CategoryVisual> = {
  "digital-products": {
    icon: Laptop,
    number: "01",
  },

  "it-solutions": {
    icon: Cpu,
    number: "02",
  },

  "ai-gadgets": {
    icon: Bot,
    number: "03",
  },

  "fitness-tech": {
    icon: Dumbbell,
    number: "04",
  },

  "natural-essences": {
    icon: Leaf,
    number: "05",
  },

  fashion: {
    icon: Shirt,
    number: "06",
  },

  vehicles: {
    icon: Boxes,
    number: "07",
  },

  "real-estate": {
    icon: HomeIcon,
    number: "08",
  },
};

/**
 * Organization-level structured data for AthiMart.
 *
 * Standard shipping rules are defined here because
 * they apply across the Sri Lankan marketplace.
 *
 * Product-specific return policies will be handled
 * separately because return periods and refund
 * methods may vary between products.
 */
const onlineStoreJsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "@id": `${siteConfig.url}/#organization`,

  name: siteConfig.name,

  url: siteConfig.url,

  description: siteConfig.description,

  logo: new URL(
    siteConfig.logo,
    siteConfig.url
  ).toString(),

  /**
   * AthiMart global return-policy reference.
   *
   * Exact eligibility, return windows and
   * resolutions may vary by product, so the
   * public returns page contains the general
   * marketplace policy.
   */
  hasMerchantReturnPolicy: {
    "@type": "MerchantReturnPolicy",

    "@id":
      `${siteConfig.url}/#return-policy`,

    merchantReturnLink: new URL(
      "/returns",
      siteConfig.url
    ).toString(),
  },

  /**
   * Standard AthiMart Sri Lanka shipping service.
   *
   * Orders below LKR 2,500:
   * shipping may cost up to LKR 350.
   *
   * Orders LKR 2,500 and above:
   * free shipping.
   *
   * Estimated delivery:
   * 0 to 30 days.
   */
  hasShippingService: {
    "@type": "ShippingService",

    "@id":
      `${siteConfig.url}/#standard-shipping`,

    name:
      "AthiMart Standard Shipping",

    description:
      "Sri Lanka delivery with shipping costs up to LKR 350 for orders below LKR 2,500. Orders of LKR 2,500 or more qualify for free shipping. Delivery may take 0 to 30 days.",

    fulfillmentType:
      "FulfillmentTypeDelivery",

    shippingConditions: [
      {
        "@type":
          "ShippingConditions",

        shippingDestination: {
          "@type":
            "DefinedRegion",

          addressCountry:
            "LK",
        },

        orderValue: {
          "@type":
            "MonetaryAmount",

          minValue:
            0,

          maxValue:
            2499.99,

          currency:
            "LKR",
        },

        shippingRate: {
          "@type":
            "MonetaryAmount",

          maxValue:
            350,

          currency:
            "LKR",
        },

        transitTime: {
          "@type":
            "ServicePeriod",

          duration: {
            "@type":
              "QuantitativeValue",

            minValue:
              0,

            maxValue:
              30,

            unitCode:
              "DAY",
          },
        },
      },

      {
        "@type":
          "ShippingConditions",

        shippingDestination: {
          "@type":
            "DefinedRegion",

          addressCountry:
            "LK",
        },

        orderValue: {
          "@type":
            "MonetaryAmount",

          minValue:
            2500,

          currency:
            "LKR",
        },

        shippingRate: {
          "@type":
            "MonetaryAmount",

          value:
            0,

          currency:
            "LKR",
        },

        transitTime: {
          "@type":
            "ServicePeriod",

          duration: {
            "@type":
              "QuantitativeValue",

            minValue:
              0,

            maxValue:
              30,

            unitCode:
              "DAY",
          },
        },
      },
    ],
  },
};

export default async function HomePage() {
  let latestProducts: Product[] = [];

  try {
    latestProducts = await getActiveProducts({
      countryCode: "LK",
      limit: 6,
    });
  } catch {
    /*
     * The rest of the homepage remains available
     * if the product query temporarily fails.
     */
    latestProducts = [];
  }

  return (
    <>
      {/* =====================================================
          AthiMart OnlineStore structured data
      ====================================================== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            onlineStoreJsonLd
          ).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      {/* =====================================================
          Hero
      ====================================================== */}
      <section className="relative overflow-hidden border-b border-[var(--border-strong)]">
        {/* Decorative background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[var(--brand-blue)]/5 blur-3xl" />

          <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-[var(--brand-orange)]/8 blur-3xl" />
        </div>

        <div className="athimart-container relative grid min-h-[650px] items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16 lg:py-24">
          {/* Hero copy */}
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center bg-[var(--brand-orange-soft)] text-[var(--brand-orange-dark)]">
                <Sparkles
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              </span>

              <p className="athimart-label text-[var(--brand-blue)]">
                Sri Lanka marketplace
              </p>
            </div>

            <h1 className="athimart-display-xl mt-6 max-w-4xl text-[var(--brand-blue-dark)]">
              Shop
              <br />
              Beyond
              <br />

              <span className="text-[var(--brand-orange)]">
                Ordinary
              </span>
            </h1>

            <p className="athimart-body-large mt-7 max-w-2xl">
              AthiMart brings technology, AI gadgets, fitness products,
              fashion, natural essences and professional digital services
              together in one connected mobile and web marketplace.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="athimart-brand-button"
              >
                <ShoppingBag
                  aria-hidden="true"
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />

                Shop products
              </Link>

              <Link
                href="#categories"
                className="athimart-brand-outline-button"
              >
                Explore categories

                <ArrowRight
                  aria-hidden="true"
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />
              </Link>
            </div>

            {/* Marketplace statistics */}
            <dl className="mt-12 grid grid-cols-3 border-l border-t border-[var(--border)]">
              <div className="border-b border-r border-[var(--border)] bg-white/85 p-4 backdrop-blur sm:p-5">
                <dt className="athimart-label text-[var(--text-muted)]">
                  Markets
                </dt>

                <dd className="mt-2 font-[var(--font-display)] text-2xl font-normal text-[var(--brand-blue)] sm:text-3xl">
                  02
                </dd>
              </div>

              <div className="border-b border-r border-[var(--border)] bg-white/85 p-4 backdrop-blur sm:p-5">
                <dt className="athimart-label text-[var(--text-muted)]">
                  Categories
                </dt>

                <dd className="mt-2 font-[var(--font-display)] text-2xl font-normal text-[var(--brand-orange)] sm:text-3xl">
                  {productCategories.length
                    .toString()
                    .padStart(2, "0")}
                </dd>
              </div>

              <div className="border-b border-r border-[var(--border)] bg-white/85 p-4 backdrop-blur sm:p-5">
                <dt className="athimart-label text-[var(--text-muted)]">
                  Platforms
                </dt>

                <dd className="mt-2 font-[var(--font-display)] text-2xl font-normal text-[var(--brand-blue)] sm:text-3xl">
                  02
                </dd>
              </div>
            </dl>
          </div>

          {/* Branded hero panel */}
          <aside
            aria-label="AthiMart connected marketplace"
            className="relative min-h-[500px] overflow-hidden bg-gradient-to-br from-[var(--brand-blue-dark)] via-[var(--brand-blue)] to-[var(--brand-blue-light)] text-white shadow-[0_28px_70px_rgba(18,63,158,0.18)] lg:min-h-[580px]"
          >
            {/* Decorative circles */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/15" />

              <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full border border-[var(--brand-orange)]/35" />

              <div className="absolute right-10 top-1/3 h-24 w-24 rounded-full bg-[var(--brand-orange)]/10 blur-xl" />
            </div>

            <div className="relative flex min-h-[500px] flex-col justify-between p-7 sm:p-10 lg:min-h-[580px]">
              <div className="flex items-center justify-between gap-6">
                <p className="font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
                  Connected marketplace
                </p>

                <span className="flex h-12 w-12 items-center justify-center border border-white/25 bg-white/10">
                  <Store
                    aria-hidden="true"
                    className="h-6 w-6"
                    strokeWidth={1.6}
                  />
                </span>
              </div>

              {/* Logo */}
              <div className="py-10 text-center">
                <div className="mx-auto flex max-w-md justify-center bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.18)] sm:p-8">
                  <Image
                    src="/brand/athimart-logo.png"
                    alt="AthiMart shopping marketplace logo"
                    width={420}
                    height={420}
                    priority
                    className="h-auto w-full max-w-[330px] object-contain"
                  />
                </div>

                <p className="mt-7 font-[var(--font-display)] text-4xl font-light uppercase tracking-[0.08em] sm:text-5xl">
                  <span className="text-white">
                    Athi
                  </span>

                  <span className="text-[var(--brand-orange-light)]">
                    Mart
                  </span>
                </p>

                <p className="mx-auto mt-4 max-w-md font-[var(--font-body)] text-sm leading-7 text-white/72">
                  One marketplace experience shared across the AthiMart
                  responsive website and mobile application.
                </p>
              </div>

              <div className="grid grid-cols-2 border-l border-t border-white/20">
                <div className="border-b border-r border-white/20 p-4">
                  <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55">
                    Experience
                  </p>

                  <p className="mt-2 font-[var(--font-display)] text-2xl font-light uppercase">
                    Responsive
                  </p>
                </div>

                <div className="border-b border-r border-white/20 p-4">
                  <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55">
                    Product data
                  </p>

                  <p className="mt-2 font-[var(--font-display)] text-2xl font-light uppercase text-[var(--brand-orange-light)]">
                    Connected
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* =====================================================
          Categories
      ====================================================== */}
      <section
        id="categories"
        aria-labelledby="categories-heading"
        className="athimart-section"
      >
        <div className="athimart-container">
          <div className="flex flex-col gap-5 border-b border-[var(--border-strong)] pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Marketplace departments
              </p>

              <h2
                id="categories-heading"
                className="athimart-display-medium mt-3 text-[var(--brand-blue-dark)]"
              >
                Shop by
                <br />
                Category
              </h2>
            </div>

            <p className="athimart-body max-w-lg">
              Move from a broad product category to a specific subcategory and
              then to the individual product that meets your needs.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 border-l border-t border-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
            {productCategories.map((category) => {
              const visual =
                categoryVisuals[category.slug] ?? {
                  icon: Boxes,
                  number: "00",
                };

              const Icon = visual.icon;

              return (
                <article
                  key={category.slug}
                  className="group relative min-h-[310px] overflow-hidden border-b border-r border-[var(--border)] bg-white"
                >
                  <Link
                    href={getCategoryPath(category.slug)}
                    aria-label={`Browse ${category.name}`}
                    className="relative flex h-full min-h-[310px] flex-col justify-between overflow-hidden p-6 sm:p-7"
                  >
                    {/* Branded top accent */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 z-20 h-1 origin-left scale-x-0 bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-orange)] transition-transform duration-500 group-hover:scale-x-100"
                    />

                    {/* Blue hover background */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 z-0 bg-gradient-to-br from-[var(--brand-blue-dark)] via-[var(--brand-blue)] to-[var(--brand-blue-light)] opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                    />

                    {/* Decorative orange circle */}
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-24 -right-24 z-0 h-56 w-56 scale-75 rounded-full border border-[var(--brand-orange)]/40 opacity-0 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
                    />

                    {/* Card header */}
                    <div className="relative z-10 flex items-start justify-between gap-5">
                      <span className="font-[var(--font-body)] text-[10px] font-bold tracking-[0.2em] text-[var(--brand-orange-dark)] transition-colors duration-300 group-hover:text-[var(--brand-orange-light)]">
                        {visual.number}
                      </span>

                      <span className="flex h-12 w-12 items-center justify-center border border-[var(--brand-blue)]/15 bg-[var(--brand-blue-soft)] text-[var(--brand-blue)] transition-all duration-300 group-hover:rotate-3 group-hover:scale-110 group-hover:border-[var(--brand-orange)] group-hover:bg-[var(--brand-orange)] group-hover:text-white">
                        <Icon
                          aria-hidden="true"
                          className="h-6 w-6"
                          strokeWidth={1.7}
                        />
                      </span>
                    </div>

                    {/* Card copy */}
                    <div className="relative z-10 mt-14">
                      <h3 className="font-[var(--font-display)] text-3xl font-light uppercase leading-[1.05] tracking-[0.025em] text-[var(--brand-blue-dark)] transition-colors duration-300 group-hover:text-white sm:text-4xl">
                        {category.name}
                      </h3>

                      <p className="mt-4 font-[var(--font-body)] text-sm leading-6 text-[var(--text-muted)] transition-colors duration-300 group-hover:text-white/75">
                        {category.shortDescription}
                      </p>

                      <span className="mt-6 inline-flex items-center gap-2 font-[var(--font-body)] text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--brand-blue)] transition-colors duration-300 group-hover:text-[var(--brand-orange-light)]">
                        Explore category

                        <ArrowUpRight
                          aria-hidden="true"
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                          strokeWidth={2}
                        />
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          Latest products
      ====================================================== */}
      {latestProducts.length > 0 && (
        <section
          aria-labelledby="latest-products-heading"
          className="border-y border-[var(--border-strong)] bg-[var(--surface-soft)] py-14 sm:py-16 lg:py-20"
        >
          <div className="athimart-container">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="athimart-label text-[var(--brand-orange-dark)]">
                  Recently added
                </p>

                <h2
                  id="latest-products-heading"
                  className="athimart-title-large mt-3 text-[var(--brand-blue-dark)]"
                >
                  Latest Products
                </h2>
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue)] transition-colors hover:text-[var(--brand-orange-dark)]"
              >
                View all products

                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 items-stretch gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 md:gap-x-7">
              {latestProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 3}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          Markets
      ====================================================== */}
      <section
        id="markets"
        aria-labelledby="markets-heading"
        className="athimart-section"
      >
        <div className="athimart-container">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div>
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Market-specific shopping
              </p>

              <h2
                id="markets-heading"
                className="athimart-display-medium mt-4 text-[var(--brand-blue-dark)]"
              >
                Shopping
                <br />
                Markets
              </h2>

              <p className="athimart-body-large mt-6">
                AthiMart is being prepared with product availability,
                currencies, delivery rules and category requirements suitable
                for each supported market.
              </p>
            </div>

            <div className="grid border-l border-t border-[var(--border)] md:grid-cols-2">
              <article className="group relative min-h-[330px] overflow-hidden border-b border-r border-[var(--border)] bg-white p-7">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-[var(--brand-blue)]"
                />

                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
                    <MapPin
                      aria-hidden="true"
                      className="h-6 w-6"
                      strokeWidth={1.7}
                    />
                  </span>

                  <span className="font-[var(--font-body)] text-[10px] font-semibold tracking-[0.18em] text-[var(--brand-blue)]">
                    LK
                  </span>
                </div>

                <div className="mt-16">
                  <h3 className="font-[var(--font-display)] text-4xl font-light uppercase text-[var(--brand-blue-dark)]">
                    Sri Lanka
                  </h3>

                  <p className="mt-4 font-[var(--font-body)] text-sm leading-7 text-[var(--text-muted)]">
                    Browse locally available products with Sri Lankan prices,
                    stock information and delivery details.
                  </p>
                </div>
              </article>

              <article className="group relative min-h-[330px] overflow-hidden border-b border-r border-[var(--border)] bg-white p-7">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-[var(--brand-orange)]"
                />

                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center bg-[var(--brand-orange-soft)] text-[var(--brand-orange-dark)]">
                    <Globe2
                      aria-hidden="true"
                      className="h-6 w-6"
                      strokeWidth={1.7}
                    />
                  </span>

                  <span className="font-[var(--font-body)] text-[10px] font-semibold tracking-[0.18em] text-[var(--brand-orange-dark)]">
                    MV
                  </span>
                </div>

                <div className="mt-16">
                  <h3 className="font-[var(--font-display)] text-4xl font-light uppercase text-[var(--brand-blue-dark)]">
                    Maldives
                  </h3>

                  <p className="mt-4 font-[var(--font-body)] text-sm leading-7 text-[var(--text-muted)]">
                    Explore selected products and digital services using
                    market-specific currency and delivery requirements.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          Why AthiMart
      ====================================================== */}
      <section
        id="why-athimart"
        aria-labelledby="why-athimart-heading"
        className="border-t border-[var(--border-strong)] bg-white py-14 sm:py-16 lg:py-20"
      >
        <div className="athimart-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Connected commerce
            </p>

            <h2
              id="why-athimart-heading"
              className="athimart-display-medium mt-4 text-[var(--brand-blue-dark)]"
            >
              Why
              <br />
              Athi

              <span className="text-[var(--brand-orange)]">
                Mart
              </span>
            </h2>
          </div>

          <div>
            <p className="athimart-body-large max-w-3xl">
              AthiMart is being developed as a shared marketplace for
              customers, sellers and administrators. Products, customer
              accounts, orders, seller activity and marketplace management
              remain connected across the mobile application and website.
            </p>

            <div className="mt-9 grid border-l border-t border-[var(--border)] sm:grid-cols-3">
              <article className="border-b border-r border-[var(--border)] bg-[var(--brand-blue-soft)] p-6">
                <p className="font-[var(--font-display)] text-4xl font-light text-[var(--brand-blue)]">
                  01
                </p>

                <h3 className="mt-8 font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-blue-dark)]">
                  Easy discovery
                </h3>

                <p className="mt-3 font-[var(--font-body)] text-sm leading-6 text-[var(--text-muted)]">
                  Browse organised categories, subcategories and detailed
                  product pages.
                </p>
              </article>

              <article className="border-b border-r border-[var(--border)] bg-white p-6">
                <p className="font-[var(--font-display)] text-4xl font-light text-[var(--brand-orange)]">
                  02
                </p>

                <h3 className="mt-8 font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-blue-dark)]">
                  Shared platform
                </h3>

                <p className="mt-3 font-[var(--font-body)] text-sm leading-6 text-[var(--text-muted)]">
                  Access connected marketplace information through mobile and
                  web.
                </p>
              </article>

              <article className="border-b border-r border-[var(--border)] bg-[var(--brand-orange-soft)] p-6">
                <p className="font-[var(--font-display)] text-4xl font-light text-[var(--brand-blue)]">
                  03
                </p>

                <h3 className="mt-8 font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-blue-dark)]">
                  Live information
                </h3>

                <p className="mt-3 font-[var(--font-body)] text-sm leading-6 text-[var(--text-muted)]">
                  View current prices, product images and marketplace stock
                  availability.
                </p>
              </article>
            </div>

            <Link
              href="/shop"
              className="athimart-brand-button mt-9"
            >
              Start shopping

              <ArrowRight
                aria-hidden="true"
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
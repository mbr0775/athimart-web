// app/(store)/returns/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
  WalletCards,
} from "lucide-react";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Returns Policy",

  description:
    "Read the AthiMart returns policy for eligible products sold through the Sri Lankan marketplace, including return periods, return methods and available refund resolutions.",

  alternates: {
    canonical: "/returns",
  },

  openGraph: {
    type: "website",
    url: "/returns",
    siteName: siteConfig.name,
    title: "Returns Policy | AthiMart",
    description:
      "Learn how eligible AthiMart product returns are handled in Sri Lanka, including return periods, methods and refund options.",
    images: [
      {
        url: siteConfig.socialImage,
        alt: "AthiMart returns policy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Returns Policy | AthiMart",
    description:
      "Learn how eligible AthiMart product returns are handled in Sri Lanka.",
    images: [
      siteConfig.socialImage,
    ],
  },
};

const policyHighlights = [
  {
    icon: RotateCcw,
    label: "Returns",
    value: "Eligible products",
    description:
      "Products that meet the applicable return conditions may be returned.",
  },
  {
    icon: Clock3,
    label: "Return window",
    value: "3–20 days",
    description:
      "The exact permitted return period depends on the individual product.",
  },
  {
    icon: Truck,
    label: "Return methods",
    value: "Courier + drop-off",
    description:
      "Courier or mail returns and store drop-off may be available depending on the order.",
  },
  {
    icon: WalletCards,
    label: "Resolution",
    value: "Product-specific",
    description:
      "Eligible resolutions may include a refund, exchange or store credit.",
  },
] as const;

export default function ReturnsPage() {
  return (
    <article>
      {/* =====================================================
          Hero
      ====================================================== */}
      <section className="border-b border-[var(--border-strong)]">
        <div className="athimart-container py-12 sm:py-16 lg:py-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-blue)] transition-colors hover:text-[var(--brand-orange-dark)]"
          >
            <ArrowLeft
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={1.8}
            />

            Back to AthiMart
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Customer policy
              </p>

              <h1 className="athimart-display-large mt-4 text-[var(--brand-blue-dark)]">
                Returns
                <br />

                <span className="text-[var(--brand-orange)]">
                  Policy
                </span>
              </h1>
            </div>

            <div className="flex flex-col justify-end">
              <p className="athimart-body-large max-w-3xl">
                AthiMart allows returns for eligible products sold through
                the Sri Lankan marketplace. Return eligibility, the permitted
                return period and the available resolution can vary depending
                on the individual product and order.
              </p>

              <div className="mt-7 flex items-start gap-3 border border-[var(--brand-blue)]/15 bg-[var(--brand-blue-soft)] p-5">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-blue)]"
                  strokeWidth={1.8}
                />

                <p className="font-[var(--font-body)] text-sm leading-6 text-[var(--text-muted)]">
                  When a product has specific return conditions, those
                  conditions apply to that product and should be reviewed
                  before completing the purchase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          Policy highlights
      ====================================================== */}
      <section className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
        <div className="athimart-container py-10 sm:py-12">
          <div className="grid border-l border-t border-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
            {policyHighlights.map(
              ({
                icon: Icon,
                label,
                value,
                description,
              }) => (
                <section
                  key={label}
                  className="border-b border-r border-[var(--border)] bg-white p-6"
                >
                  <span className="flex h-11 w-11 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
                    <Icon
                      aria-hidden="true"
                      className="h-5 w-5"
                      strokeWidth={1.7}
                    />
                  </span>

                  <p className="athimart-label mt-6 text-[var(--text-muted)]">
                    {label}
                  </p>

                  <p className="mt-2 font-[var(--font-display)] text-2xl font-light uppercase tracking-[0.03em] text-[var(--brand-blue-dark)]">
                    {value}
                  </p>

                  <p className="mt-3 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                    {description}
                  </p>
                </section>
              )
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          Detailed policy
      ====================================================== */}
      <section className="athimart-section">
        <div className="athimart-container">
          <div className="grid gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
            <aside>
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Policy details
              </p>

              <h2 className="athimart-display-medium mt-4 text-[var(--brand-blue-dark)]">
                How
                <br />
                Returns
                <br />

                <span className="text-[var(--brand-orange)]">
                  Work
                </span>
              </h2>

              <p className="athimart-body mt-6">
                The following rules describe AthiMart&apos;s general return
                framework for Sri Lanka. Individual products may have more
                specific conditions.
              </p>
            </aside>

            <div className="border-t border-[var(--border-strong)]">
              {/* Eligibility */}
              <section className="grid gap-5 border-b border-[var(--border)] py-8 sm:grid-cols-[60px_1fr] sm:py-10">
                <span className="flex h-12 w-12 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
                  <PackageCheck
                    aria-hidden="true"
                    className="h-6 w-6"
                    strokeWidth={1.7}
                  />
                </span>

                <div>
                  <p className="athimart-label text-[var(--text-muted)]">
                    01 / Eligibility
                  </p>

                  <h3 className="athimart-title mt-3">
                    Eligible products may be returned
                  </h3>

                  <p className="athimart-body mt-4 max-w-3xl">
                    A product may be eligible for return when it meets the
                    return conditions attached to that product and order.
                    Eligibility can depend on the nature of the product, its
                    condition and the reason for the requested return.
                  </p>
                </div>
              </section>

              {/* Return window */}
              <section className="grid gap-5 border-b border-[var(--border)] py-8 sm:grid-cols-[60px_1fr] sm:py-10">
                <span className="flex h-12 w-12 items-center justify-center bg-[var(--brand-orange-soft)] text-[var(--brand-orange-dark)]">
                  <Clock3
                    aria-hidden="true"
                    className="h-6 w-6"
                    strokeWidth={1.7}
                  />
                </span>

                <div>
                  <p className="athimart-label text-[var(--text-muted)]">
                    02 / Return period
                  </p>

                  <h3 className="athimart-title mt-3">
                    Return periods vary by product
                  </h3>

                  <p className="athimart-body mt-4 max-w-3xl">
                    Eligible AthiMart products generally have a return period
                    between 3 and 20 days. The exact number of days depends on
                    the product and its applicable return conditions.
                  </p>

                  <div className="mt-5 border-l-2 border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] px-5 py-4">
                    <p className="font-[var(--font-body)] text-sm leading-6 text-[var(--text)]">
                      Customers should check the specific return conditions
                      provided for the product or order rather than assuming
                      every product has the maximum 20-day period.
                    </p>
                  </div>
                </div>
              </section>

              {/* Methods */}
              <section className="grid gap-5 border-b border-[var(--border)] py-8 sm:grid-cols-[60px_1fr] sm:py-10">
                <span className="flex h-12 w-12 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
                  <Truck
                    aria-hidden="true"
                    className="h-6 w-6"
                    strokeWidth={1.7}
                  />
                </span>

                <div>
                  <p className="athimart-label text-[var(--text-muted)]">
                    03 / Return methods
                  </p>

                  <h3 className="athimart-title mt-3">
                    Courier, mail or drop-off
                  </h3>

                  <p className="athimart-body mt-4 max-w-3xl">
                    Depending on the product, seller and order, an approved
                    return may be completed using courier or mail services,
                    store drop-off, or another return method communicated for
                    that order.
                  </p>
                </div>
              </section>

              {/* Refund options */}
              <section className="grid gap-5 border-b border-[var(--border)] py-8 sm:grid-cols-[60px_1fr] sm:py-10">
                <span className="flex h-12 w-12 items-center justify-center bg-[var(--brand-orange-soft)] text-[var(--brand-orange-dark)]">
                  <WalletCards
                    aria-hidden="true"
                    className="h-6 w-6"
                    strokeWidth={1.7}
                  />
                </span>

                <div>
                  <p className="athimart-label text-[var(--text-muted)]">
                    04 / Resolution
                  </p>

                  <h3 className="athimart-title mt-3">
                    Refund, exchange or store credit
                  </h3>

                  <p className="athimart-body mt-4 max-w-3xl">
                    The available resolution depends on the product and the
                    circumstances of the approved return. An eligible return
                    may result in a full refund, an exchange, store credit, or
                    another resolution stated for that product.
                  </p>
                </div>
              </section>

              {/* Return costs */}
              <section className="grid gap-5 border-b border-[var(--border)] py-8 sm:grid-cols-[60px_1fr] sm:py-10">
                <span className="flex h-12 w-12 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
                  <ShieldCheck
                    aria-hidden="true"
                    className="h-6 w-6"
                    strokeWidth={1.7}
                  />
                </span>

                <div>
                  <p className="athimart-label text-[var(--text-muted)]">
                    05 / Return delivery costs
                  </p>

                  <h3 className="athimart-title mt-3">
                    Confirmed with the applicable return
                  </h3>

                  <p className="athimart-body mt-4 max-w-3xl">
                    Any responsibility for courier, mail or other return
                    delivery costs depends on the applicable product and order
                    conditions. The relevant return instructions should be
                    confirmed before sending a product back.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          Return checklist
      ====================================================== */}
      <section className="border-y border-[var(--border-strong)] bg-white">
        <div className="athimart-container py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Before returning
              </p>

              <h2 className="athimart-title-large mt-3 text-[var(--brand-blue-dark)]">
                Check the product&apos;s
                return conditions
              </h2>
            </div>

            <div className="grid gap-3">
              {[
                "Confirm that the product is eligible for return.",
                "Check the exact return period that applies to the product.",
                "Follow the return method provided for the order.",
                "Keep the product and included items in the condition required by the applicable return terms.",
                "Confirm the available refund, exchange or store-credit resolution.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-4 border border-[var(--border)] bg-[var(--surface-soft)] p-4"
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]"
                    strokeWidth={1.8}
                  />

                  <p className="font-[var(--font-body)] text-sm leading-6 text-[var(--text)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          Important note
      ====================================================== */}
      <section className="athimart-section">
        <div className="athimart-container">
          <div className="overflow-hidden bg-gradient-to-br from-[var(--brand-blue-dark)] via-[var(--brand-blue)] to-[var(--brand-blue-light)] p-7 text-white sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-orange-light)]">
                  Important
                </p>

                <h2 className="mt-4 font-[var(--font-display)] text-4xl font-light uppercase leading-[1.05] tracking-[0.025em] sm:text-5xl">
                  Product-specific
                  conditions matter
                </h2>
              </div>

              <div>
                <p className="font-[var(--font-body)] text-sm leading-7 text-white/75 sm:text-base">
                  Because AthiMart supports different kinds of products,
                  return eligibility, return windows, return methods and
                  resolutions can differ. Where a specific product or order
                  provides more detailed return conditions, those conditions
                  should be followed for that purchase.
                </p>

                <Link
                  href="/shop"
                  className="mt-7 inline-flex min-h-12 items-center justify-center border border-white/30 bg-white px-6 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-blue-dark)] transition-colors hover:bg-[var(--brand-orange-light)]"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
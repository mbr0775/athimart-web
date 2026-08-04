// app/(seller)/seller/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  Boxes,
  CirclePlus,
  Clock3,
  Eye,
  PackageCheck,
  PackageX,
  Store,
} from "lucide-react";

import { getCurrentSeller } from "@/lib/auth/seller";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Seller Dashboard",

  description:
    "Manage your AthiMart seller products and marketplace activity.",

  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic =
  "force-dynamic";

interface SellerProductRow {
  id: string;
  name: string | null;
  slug: string | null;
  stock: number | string | null;
  is_active: boolean | null;
  price: number | string | null;
  price_lkr: number | string | null;
  created_at: string | null;
}

function toNumber(
  value: unknown
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  const parsedValue =
    Number(value);

  return Number.isFinite(
    parsedValue
  )
    ? parsedValue
    : 0;
}

function formatPrice(
  priceLkr: unknown,
  fallbackPrice: unknown
): string {
  const preferredPrice =
    toNumber(priceLkr);

  const price =
    preferredPrice > 0
      ? preferredPrice
      : toNumber(fallbackPrice);

  return new Intl.NumberFormat(
    "en-LK",
    {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }
  ).format(price);
}

function formatDate(
  value: string | null
): string {
  if (!value) {
    return "Date unavailable";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-LK",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(date);
}

export default async function SellerDashboardPage() {
  const {
    user,
    profile,
  } = await getCurrentSeller();

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      stock,
      is_active,
      price,
      price_lkr,
      created_at
    `)
    .eq(
      "vendor_id",
      user.id
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      `Unable to load seller products: ${error.message}`
    );
  }

  const products =
    (data ?? []) as SellerProductRow[];

  const totalProducts =
    products.length;

  const activeProducts =
    products.filter(
      (product) =>
        product.is_active === true
    ).length;

  const inactiveProducts =
    products.filter(
      (product) =>
        product.is_active !== true
    ).length;

  const outOfStockProducts =
    products.filter(
      (product) =>
        toNumber(
          product.stock
        ) <= 0
    ).length;

  const recentProducts =
    products.slice(0, 5);

  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      {/* Page heading */}
      <header className="border-b border-[var(--border-strong)] pb-8">
        <p className="athimart-label text-[var(--brand-orange-dark)]">
          Approved seller account
        </p>

        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="athimart-display-large text-[var(--brand-blue-dark)]">
              Seller
              <br />

              <span className="text-[var(--brand-orange)]">
                Dashboard
              </span>
            </h1>

            <p className="athimart-body-large mt-5 max-w-2xl">
              Welcome,{" "}
              <strong className="text-[var(--text)]">
                {profile.fullName}
              </strong>
              . Manage your products and monitor their current marketplace status.
            </p>
          </div>

          <Link
            href="/seller/products/new"
            className="athimart-brand-button shrink-0 text-white!"
          >
            <CirclePlus
              aria-hidden="true"
              className="h-5 w-5 text-white!"
              strokeWidth={1.8}
            />

            <span className="text-white!">
              Add new product
            </span>
          </Link>
        </div>
      </header>

      {/* Summary cards */}
      <section
        aria-label="Seller product summary"
        className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        <article className="border border-[var(--border)] bg-white p-6">
          <span className="flex h-12 w-12 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
            <Boxes
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.8}
            />
          </span>

          <p className="athimart-label mt-6 text-[var(--text-muted)]">
            Total products
          </p>

          <p className="mt-3 font-[var(--font-display)] text-5xl font-light text-[var(--brand-blue-dark)]">
            {totalProducts}
          </p>
        </article>

        <article className="border border-[var(--border)] bg-white p-6">
          <span className="flex h-12 w-12 items-center justify-center bg-green-50 text-[var(--success)]">
            <PackageCheck
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.8}
            />
          </span>

          <p className="athimart-label mt-6 text-[var(--text-muted)]">
            Active products
          </p>

          <p className="mt-3 font-[var(--font-display)] text-5xl font-light text-[var(--brand-blue-dark)]">
            {activeProducts}
          </p>
        </article>

        <article className="border border-[var(--border)] bg-white p-6">
          <span className="flex h-12 w-12 items-center justify-center bg-[var(--brand-orange-soft)] text-[var(--brand-orange-dark)]">
            <Clock3
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.8}
            />
          </span>

          <p className="athimart-label mt-6 text-[var(--text-muted)]">
            Inactive products
          </p>

          <p className="mt-3 font-[var(--font-display)] text-5xl font-light text-[var(--brand-blue-dark)]">
            {inactiveProducts}
          </p>
        </article>

        <article className="border border-[var(--border)] bg-white p-6">
          <span className="flex h-12 w-12 items-center justify-center bg-red-50 text-[var(--sale)]">
            <PackageX
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.8}
            />
          </span>

          <p className="athimart-label mt-6 text-[var(--text-muted)]">
            Out of stock
          </p>

          <p className="mt-3 font-[var(--font-display)] text-5xl font-light text-[var(--brand-blue-dark)]">
            {outOfStockProducts}
          </p>
        </article>
      </section>

      {/* Recent products */}
      <section className="mt-9">
        <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Seller inventory
            </p>

            <h2 className="mt-2 font-[var(--font-display)] text-3xl font-light uppercase text-[var(--brand-blue-dark)]">
              Recent Products
            </h2>
          </div>

          <Link
            href="/seller/products"
            className="inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--brand-blue)] bg-white px-4 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-blue)] transition-colors hover:bg-[var(--brand-blue)] hover:text-white"
          >
            <Boxes
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={1.8}
            />

            View all products
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="mt-6 border border-[var(--border)] bg-white px-6 py-16 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
              <Store
                aria-hidden="true"
                className="h-8 w-8"
                strokeWidth={1.7}
              />
            </span>

            <h3 className="mt-6 font-[var(--font-display)] text-3xl font-light uppercase text-[var(--brand-blue-dark)]">
              No Products Yet
            </h3>

            <p className="athimart-body mx-auto mt-3 max-w-lg">
              Add your first seller product to begin building your AthiMart inventory.
            </p>

            <Link
              href="/seller/products/new"
              className="athimart-brand-button mt-7 text-white!"
            >
              <CirclePlus
                aria-hidden="true"
                className="h-5 w-5 text-white!"
                strokeWidth={1.8}
              />

              <span className="text-white!">
                Add first product
              </span>
            </Link>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden border border-[var(--border)] bg-white">
            <div className="divide-y divide-[var(--border)]">
              {recentProducts.map(
                (product) => {
                  const stock =
                    Math.max(
                      0,
                      Math.floor(
                        toNumber(
                          product.stock
                        )
                      )
                    );

                  const productName =
                    product.name?.trim() ||
                    "Unnamed product";

                  return (
                    <article
                      key={product.id}
                      className="grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="truncate font-[var(--font-display)] text-2xl font-light text-[var(--brand-blue-dark)]">
                            {productName}
                          </h3>

                          <span
                            className={
                              product.is_active
                                ? "bg-green-50 px-3 py-1 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--success)]"
                                : "bg-[var(--linen)] px-3 py-1 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]"
                            }
                          >
                            {product.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 font-[var(--font-body)] text-xs text-[var(--text-muted)]">
                          <span>
                            {formatPrice(
                              product.price_lkr,
                              product.price
                            )}
                          </span>

                          <span>
                            Stock:{" "}
                            <strong className="text-[var(--text)]">
                              {stock}
                            </strong>
                          </span>

                          <span>
                            Added:{" "}
                            {formatDate(
                              product.created_at
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {product.slug &&
                          product.is_active && (
                            <Link
                              href={`/product/${product.slug}`}
                              aria-label={`View ${productName} in the store`}
                              title="View product"
                              className="flex h-11 w-11 items-center justify-center border border-[var(--border)] bg-white text-[var(--brand-blue)] transition-colors hover:border-[var(--brand-blue)] hover:bg-[var(--brand-blue-soft)]"
                            >
                              <Eye
                                aria-hidden="true"
                                className="h-5 w-5"
                                strokeWidth={1.8}
                              />
                            </Link>
                          )}
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
// app/(seller)/seller/products/page.tsx

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Boxes,
  CircleOff,
  CirclePlus,
  Clock3,
  PackageCheck,
  PackageX,
  Store,
} from "lucide-react";

import { ProductRowActions } from "@/components/seller/product-row-actions";
import { getCurrentSeller } from "@/lib/auth/seller";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Seller Products",

  description:
    "Manage products published through your AthiMart seller account.",

  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic =
  "force-dynamic";

interface SellerProductRow {
  id: string;
  slug: string | null;
  name: string | null;
  company_name: string | null;
  category: string | null;
  sub_category: string | null;

  price:
    | number
    | string
    | null;

  price_lkr:
    | number
    | string
    | null;

  stock:
    | number
    | string
    | null;

  is_active: boolean | null;

  image_urls:
    | unknown
    | null;

  created_at: string | null;
  updated_at: string | null;
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

  if (
    typeof value === "string" &&
    value.trim()
  ) {
    const parsedValue =
      Number(
        value
          .replaceAll(",", "")
          .trim()
      );

    return Number.isFinite(
      parsedValue
    )
      ? parsedValue
      : 0;
  }

  return 0;
}

function getPrice(
  product: SellerProductRow
): number {
  const lkrPrice =
    toNumber(
      product.price_lkr
    );

  if (lkrPrice > 0) {
    return lkrPrice;
  }

  return toNumber(
    product.price
  );
}

function formatLkr(
  value: number
): string {
  const amount =
    new Intl.NumberFormat(
      "en-LK",
      {
        maximumFractionDigits: 0,
      }
    ).format(value);

  return `Rs ${amount}`;
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

function getPrimaryImageUrl(
  value: unknown
): string | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const imageUrl =
    value.find(
      (
        item
      ): item is string =>
        typeof item ===
          "string" &&
        item.trim().length > 0
    );

  return imageUrl?.trim() ?? null;
}

export default async function SellerProductsPage() {
  const {
    user,
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
      slug,
      name,
      company_name,
      category,
      sub_category,
      price,
      price_lkr,
      stock,
      is_active,
      image_urls,
      created_at,
      updated_at
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
      `Unable to load your seller products: ${error.message}`
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

  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      {/* Page heading */}
      <header className="border-b border-[var(--border-strong)] pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Seller inventory
            </p>

            <h1 className="athimart-display-large mt-4 text-[var(--brand-blue-dark)]">
              My
              <br />

              <span className="text-[var(--brand-orange)]">
                Products
              </span>
            </h1>

            <p className="athimart-body-large mt-5 max-w-3xl">
              Review the price, stock and
              marketplace status of products
              created through your approved
              seller account.
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

      {/* Product statistics */}
      <section
        aria-label="Seller product statistics"
        className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        <article className="border border-[var(--border)] bg-white p-5">
          <Boxes
            aria-hidden="true"
            className="h-6 w-6 text-[var(--brand-blue)]"
            strokeWidth={1.8}
          />

          <p className="athimart-label mt-5 text-[var(--text-muted)]">
            Total products
          </p>

          <p className="mt-2 font-[var(--font-display)] text-4xl font-light text-[var(--brand-blue-dark)]">
            {totalProducts}
          </p>
        </article>

        <article className="border border-[var(--border)] bg-white p-5">
          <PackageCheck
            aria-hidden="true"
            className="h-6 w-6 text-[var(--success)]"
            strokeWidth={1.8}
          />

          <p className="athimart-label mt-5 text-[var(--text-muted)]">
            Active
          </p>

          <p className="mt-2 font-[var(--font-display)] text-4xl font-light text-[var(--brand-blue-dark)]">
            {activeProducts}
          </p>
        </article>

        <article className="border border-[var(--border)] bg-white p-5">
          <CircleOff
            aria-hidden="true"
            className="h-6 w-6 text-[var(--brand-orange-dark)]"
            strokeWidth={1.8}
          />

          <p className="athimart-label mt-5 text-[var(--text-muted)]">
            Inactive
          </p>

          <p className="mt-2 font-[var(--font-display)] text-4xl font-light text-[var(--brand-blue-dark)]">
            {inactiveProducts}
          </p>
        </article>

        <article className="border border-[var(--border)] bg-white p-5">
          <PackageX
            aria-hidden="true"
            className="h-6 w-6 text-[var(--sale)]"
            strokeWidth={1.8}
          />

          <p className="athimart-label mt-5 text-[var(--text-muted)]">
            Out of stock
          </p>

          <p className="mt-2 font-[var(--font-display)] text-4xl font-light text-[var(--brand-blue-dark)]">
            {outOfStockProducts}
          </p>
        </article>
      </section>

      {/* Empty product state */}
      {products.length === 0 ? (
        <section className="mt-8 border border-[var(--border)] bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
            <Store
              aria-hidden="true"
              className="h-8 w-8"
              strokeWidth={1.7}
            />
          </span>

          <h2 className="mt-6 font-[var(--font-display)] text-3xl font-light uppercase text-[var(--brand-blue-dark)]">
            No Seller Products
          </h2>

          <p className="athimart-body mx-auto mt-3 max-w-lg">
            Add your first product to begin
            building your AthiMart seller
            inventory.
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
        </section>
      ) : (
        <section
          aria-labelledby="seller-products-heading"
          className="mt-8"
        >
          <div className="mb-5 flex items-end justify-between gap-5 border-b border-[var(--border)] pb-5">
            <div>
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Product records
              </p>

              <h2
                id="seller-products-heading"
                className="mt-2 font-[var(--font-display)] text-3xl font-light uppercase text-[var(--brand-blue-dark)]"
              >
                Seller Inventory
              </h2>
            </div>

            <span className="font-[var(--font-body)] text-xs text-[var(--text-muted)]">
              {totalProducts}{" "}
              {totalProducts === 1
                ? "product"
                : "products"}
            </span>
          </div>

          <div className="space-y-5">
            {products.map(
              (product) => {
                const productName =
                  product.name?.trim() ||
                  "Unnamed product";

                const companyName =
                  product.company_name?.trim() ||
                  "AthiMart Seller";

                const category =
                  product.category?.trim() ||
                  "General";

                const subCategory =
                  product.sub_category?.trim() ||
                  "General";

                const stock =
                  Math.max(
                    0,
                    Math.floor(
                      toNumber(
                        product.stock
                      )
                    )
                  );

                const imageUrl =
                  getPrimaryImageUrl(
                    product.image_urls
                  );

                const isActive =
                  product.is_active === true;

                return (
                  <article
                    key={product.id}
                    className="border border-[var(--border)] bg-white"
                  >
                    <div className="grid gap-5 p-5 sm:grid-cols-[130px_minmax(0,1fr)] lg:grid-cols-[150px_minmax(0,1fr)_auto] lg:items-center lg:p-6">
                      {/* Product image */}
                      <div className="relative aspect-4/5 overflow-hidden bg-[var(--linen-light)]">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={productName}
                            fill
                            sizes="150px"
                            className="object-contain"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Boxes
                              aria-hidden="true"
                              className="h-9 w-9 text-[var(--placeholder)]"
                              strokeWidth={1.5}
                            />
                          </div>
                        )}
                      </div>

                      {/* Product details */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="break-words font-[var(--font-display)] text-2xl font-light text-[var(--brand-blue-dark)]">
                            {productName}
                          </h3>

                          <span
                            className={
                              isActive
                                ? "bg-green-50 px-3 py-1 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--success)]"
                                : "bg-[var(--linen)] px-3 py-1 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]"
                            }
                          >
                            {isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>

                        <p className="mt-2 font-[var(--font-body)] text-xs text-[var(--text-muted)]">
                          {companyName}
                        </p>

                        <p className="mt-4 font-[var(--font-display)] text-2xl font-light text-[var(--brand-orange-dark)]">
                          {formatLkr(
                            getPrice(product)
                          )}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-[var(--font-body)] text-xs text-[var(--text-muted)]">
                          <span>
                            {category} /{" "}
                            {subCategory}
                          </span>

                          <span>
                            Stock:{" "}

                            <strong className="text-[var(--text)]">
                              {stock}
                            </strong>
                          </span>

                          <span className="inline-flex items-center gap-2">
                            <Clock3
                              aria-hidden="true"
                              className="h-4 w-4"
                              strokeWidth={1.8}
                            />

                            Added{" "}

                            {formatDate(
                              product.created_at
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Product actions */}
                      <div className="sm:col-span-2 lg:col-span-1">
                        <ProductRowActions
                          productId={
                            product.id
                          }
                          productName={
                            productName
                          }
                          productSlug={
                            product.slug
                          }
                          isActive={
                            isActive
                          }
                        />
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        </section>
      )}
    </div>
  );
}
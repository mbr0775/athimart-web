// app/(admin)/admin/sellers/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Ban,
  Boxes,
  Mail,
  Phone,
  RotateCcw,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";

import {
  blockSeller,
  unblockSeller,
} from "./actions";

import { getCurrentAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Manage Sellers",

  description:
    "Review, block and restore approved AthiMart seller accounts.",

  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic =
  "force-dynamic";

interface SellersPageProps {
  searchParams: Promise<{
    status?: string | string[];
    error?: string | string[];
    sellerId?: string | string[];
  }>;
}

interface SellerProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  seller_approval_status: string | null;
  seller_reviewed_at: string | null;
  is_blocked: boolean | null;
  blocked_reason: string | null;
  created_at: string | null;
}

interface ProductVendorRow {
  vendor_id: string | null;
}

function getFirstValue(
  value:
    | string
    | string[]
    | undefined
): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getText(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function formatDate(
  value: string | null
): string {
  if (!value) {
    return "Not available";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not available";
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

function getErrorMessage(
  errorCode: string
): string {
  switch (errorCode) {
    case "block-reason-required":
      return "Enter a clear reason containing at least five characters before blocking the seller.";

    case "seller-not-found":
      return "The selected seller account could not be found.";

    case "not-approved-seller":
      return "The selected account is not an approved AthiMart seller.";

    default:
      return "";
  }
}

function getStatusMessage(
  status: string
): string {
  switch (status) {
    case "blocked":
      return "The seller account has been blocked successfully.";

    case "unblocked":
      return "The seller account has been restored successfully.";

    default:
      return "";
  }
}

export default async function AdminSellersPage({
  searchParams,
}: SellersPageProps) {
  await getCurrentAdmin();

  const params =
    await searchParams;

  const status =
    getFirstValue(
      params.status
    );

  const errorCode =
    getFirstValue(
      params.error
    );

  const selectedSellerId =
    getFirstValue(
      params.sellerId
    );

  const statusMessage =
    getStatusMessage(
      status
    );

  const errorMessage =
    getErrorMessage(
      errorCode
    );

  const supabase =
    await createClient();

  const {
    data: sellerData,
    error: sellersError,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      full_name,
      phone,
      role,
      seller_approval_status,
      seller_reviewed_at,
      is_blocked,
      blocked_reason,
      created_at
    `)
    .eq(
      "seller_approval_status",
      "approved"
    )
    .order(
      "seller_reviewed_at",
      {
        ascending: false,
      }
    );

  if (sellersError) {
    throw new Error(
      `Unable to load approved sellers: ${sellersError.message}`
    );
  }

  const {
    data: productData,
    error: productsError,
  } = await supabase
    .from("products")
    .select("vendor_id")
    .not(
      "vendor_id",
      "is",
      null
    );

  if (productsError) {
    throw new Error(
      `Unable to load seller product totals: ${productsError.message}`
    );
  }

  const sellers =
    (
      sellerData ?? []
    )
      .filter(
        (seller) => {
          const role =
            getText(
              seller.role
            ).toLowerCase();

          return (
            role === "vendor" ||
            role === "seller"
          );
        }
      ) as SellerProfileRow[];

  const products =
    (
      productData ?? []
    ) as ProductVendorRow[];

  const productCountBySeller =
    new Map<string, number>();

  for (const product of products) {
    if (!product.vendor_id) {
      continue;
    }

    const currentCount =
      productCountBySeller.get(
        product.vendor_id
      ) ?? 0;

    productCountBySeller.set(
      product.vendor_id,
      currentCount + 1
    );
  }

  const totalSellers =
    sellers.length;

  const activeSellers =
    sellers.filter(
      (seller) =>
        seller.is_blocked !== true
    ).length;

  const blockedSellers =
    sellers.filter(
      (seller) =>
        seller.is_blocked === true
    ).length;

  const sellerProducts =
    sellers.reduce(
      (
        total,
        seller
      ) =>
        total +
        (
          productCountBySeller.get(
            seller.id
          ) ?? 0
        ),
      0
    );

  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      {/* Page heading */}
      <header className="border-b border-[var(--border-strong)] pb-8">
        <p className="athimart-label text-[var(--brand-orange-dark)]">
          Marketplace administration
        </p>

        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="athimart-display-large text-[var(--brand-blue-dark)]">
              Manage
              <br />

              <span className="text-[var(--brand-orange)]">
                Sellers
              </span>
            </h1>

            <p className="athimart-body-large mt-5 max-w-3xl">
              Review approved AthiMart
              sellers, monitor their
              product totals and
              temporarily restrict or
              restore seller access.
            </p>
          </div>

          <Link
            href="/admin/seller-requests"
            className="athimart-brand-outline-button shrink-0"
          >
            <UserRound
              aria-hidden="true"
              className="h-5 w-5"
              strokeWidth={1.8}
            />

            Pending requests
          </Link>
        </div>
      </header>

      {/* Feedback */}
      {statusMessage && (
        <div
          role="status"
          className="mt-7 border-l-4 border-[var(--success)] bg-green-50 px-5 py-4"
        >
          <p className="font-[var(--font-body)] text-sm leading-6 text-[var(--success)]">
            {statusMessage}
          </p>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mt-7 border-l-4 border-[var(--sale)] bg-red-50 px-5 py-4"
        >
          <p className="font-[var(--font-body)] text-sm leading-6 text-[var(--sale)]">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Summary */}
      <section
        aria-label="Seller summary"
        className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        <article className="border border-[var(--border)] bg-white p-5">
          <Store
            aria-hidden="true"
            className="h-6 w-6 text-[var(--brand-blue)]"
            strokeWidth={1.8}
          />

          <p className="athimart-label mt-5 text-[var(--text-muted)]">
            Approved sellers
          </p>

          <p className="mt-2 font-[var(--font-display)] text-4xl font-light text-[var(--brand-blue-dark)]">
            {totalSellers}
          </p>
        </article>

        <article className="border border-[var(--border)] bg-white p-5">
          <BadgeCheck
            aria-hidden="true"
            className="h-6 w-6 text-[var(--success)]"
            strokeWidth={1.8}
          />

          <p className="athimart-label mt-5 text-[var(--text-muted)]">
            Active sellers
          </p>

          <p className="mt-2 font-[var(--font-display)] text-4xl font-light text-[var(--brand-blue-dark)]">
            {activeSellers}
          </p>
        </article>

        <article className="border border-[var(--border)] bg-white p-5">
          <Ban
            aria-hidden="true"
            className="h-6 w-6 text-[var(--sale)]"
            strokeWidth={1.8}
          />

          <p className="athimart-label mt-5 text-[var(--text-muted)]">
            Blocked sellers
          </p>

          <p className="mt-2 font-[var(--font-display)] text-4xl font-light text-[var(--brand-blue-dark)]">
            {blockedSellers}
          </p>
        </article>

        <article className="border border-[var(--border)] bg-white p-5">
          <Boxes
            aria-hidden="true"
            className="h-6 w-6 text-[var(--brand-orange-dark)]"
            strokeWidth={1.8}
          />

          <p className="athimart-label mt-5 text-[var(--text-muted)]">
            Seller products
          </p>

          <p className="mt-2 font-[var(--font-display)] text-4xl font-light text-[var(--brand-blue-dark)]">
            {sellerProducts}
          </p>
        </article>
      </section>

      {/* Seller records */}
      {sellers.length === 0 ? (
        <section className="mt-8 border border-[var(--border)] bg-white px-6 py-16 text-center">
          <Store
            aria-hidden="true"
            className="mx-auto h-10 w-10 text-[var(--brand-blue)]"
            strokeWidth={1.6}
          />

          <h2 className="mt-6 font-[var(--font-display)] text-3xl font-light uppercase text-[var(--brand-blue-dark)]">
            No Approved Sellers
          </h2>

          <p className="athimart-body mx-auto mt-3 max-w-xl">
            Approved seller accounts
            will appear here after an
            administrator accepts their
            application.
          </p>
        </section>
      ) : (
        <section className="mt-8 space-y-5">
          {sellers.map(
            (seller) => {
              const sellerName =
                getText(
                  seller.full_name
                ) ||
                "Unnamed seller";

              const sellerEmail =
                getText(
                  seller.email
                ) ||
                "Email unavailable";

              const sellerPhone =
                getText(
                  seller.phone
                ) ||
                "Not provided";

              const isBlocked =
                seller.is_blocked ===
                true;

              const productCount =
                productCountBySeller.get(
                  seller.id
                ) ?? 0;

              const blockSellerWithId =
                blockSeller.bind(
                  null,
                  seller.id
                );

              const unblockSellerWithId =
                unblockSeller.bind(
                  null,
                  seller.id
                );

              const showReasonError =
                errorCode ===
                  "block-reason-required" &&
                selectedSellerId ===
                  seller.id;

              return (
                <article
                  key={seller.id}
                  className="border border-[var(--border)] bg-white"
                >
                  <div className="grid gap-6 p-5 sm:p-7 xl:grid-cols-[minmax(0,1fr)_360px]">
                    {/* Seller information */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
                          <Store
                            aria-hidden="true"
                            className="h-6 w-6"
                            strokeWidth={1.7}
                          />
                        </span>

                        <div className="min-w-0">
                          <h2 className="break-words font-[var(--font-display)] text-3xl font-light text-[var(--brand-blue-dark)]">
                            {sellerName}
                          </h2>

                          <span
                            className={
                              isBlocked
                                ? "mt-2 inline-flex bg-red-50 px-3 py-1 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--sale)]"
                                : "mt-2 inline-flex bg-green-50 px-3 py-1 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--success)]"
                            }
                          >
                            {isBlocked
                              ? "Blocked"
                              : "Active seller"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="flex items-start gap-3 border border-[var(--border)] bg-[var(--linen-light)] p-4">
                          <Mail
                            aria-hidden="true"
                            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-blue)]"
                            strokeWidth={1.8}
                          />

                          <div className="min-w-0">
                            <p className="athimart-label text-[var(--text-muted)]">
                              Email
                            </p>

                            <p className="mt-2 break-all font-[var(--font-body)] text-xs text-[var(--text)]">
                              {sellerEmail}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 border border-[var(--border)] bg-[var(--linen-light)] p-4">
                          <Phone
                            aria-hidden="true"
                            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-blue)]"
                            strokeWidth={1.8}
                          />

                          <div>
                            <p className="athimart-label text-[var(--text-muted)]">
                              Phone
                            </p>

                            <p className="mt-2 font-[var(--font-body)] text-xs text-[var(--text)]">
                              {sellerPhone}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 border border-[var(--border)] bg-[var(--linen-light)] p-4">
                          <Boxes
                            aria-hidden="true"
                            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-orange-dark)]"
                            strokeWidth={1.8}
                          />

                          <div>
                            <p className="athimart-label text-[var(--text-muted)]">
                              Products
                            </p>

                            <p className="mt-2 font-[var(--font-body)] text-xs font-semibold text-[var(--text)]">
                              {productCount}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 border border-[var(--border)] bg-[var(--linen-light)] p-4">
                          <ShieldCheck
                            aria-hidden="true"
                            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]"
                            strokeWidth={1.8}
                          />

                          <div>
                            <p className="athimart-label text-[var(--text-muted)]">
                              Approved
                            </p>

                            <p className="mt-2 font-[var(--font-body)] text-xs text-[var(--text)]">
                              {formatDate(
                                seller.seller_reviewed_at
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {isBlocked &&
                        seller.blocked_reason && (
                          <div className="mt-5 border-l-4 border-[var(--sale)] bg-red-50 px-5 py-4">
                            <p className="athimart-label text-[var(--sale)]">
                              Block reason
                            </p>

                            <p className="mt-2 font-[var(--font-body)] text-sm leading-6 text-[var(--text-soft)]">
                              {
                                seller.blocked_reason
                              }
                            </p>
                          </div>
                        )}
                    </div>

                    {/* Administrative action */}
                    <div className="border border-[var(--border)] bg-[var(--linen-light)] p-5">
                      {isBlocked ? (
                        <>
                          <p className="athimart-label text-[var(--success)]">
                            Restore access
                          </p>

                          <h3 className="mt-2 font-[var(--font-display)] text-2xl font-light text-[var(--brand-blue-dark)]">
                            Unblock Seller
                          </h3>

                          <p className="mt-3 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                            Restoring this
                            account allows the
                            seller to sign in
                            and manage products
                            again.
                          </p>

                          <form
                            action={
                              unblockSellerWithId
                            }
                            className="mt-6"
                          >
                            <button
                              type="submit"
                              className="inline-flex min-h-13 w-full items-center justify-center gap-3 border border-[var(--success)] bg-[var(--success)] px-5 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-90"
                            >
                              <RotateCcw
                                aria-hidden="true"
                                className="h-5 w-5"
                                strokeWidth={1.8}
                              />

                              Unblock seller
                            </button>
                          </form>
                        </>
                      ) : (
                        <>
                          <p className="athimart-label text-[var(--sale)]">
                            Restrict access
                          </p>

                          <h3 className="mt-2 font-[var(--font-display)] text-2xl font-light text-[var(--brand-blue-dark)]">
                            Block Seller
                          </h3>

                          <p className="mt-3 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                            The seller will
                            lose account and
                            product-management
                            access until an
                            administrator
                            restores it.
                          </p>

                          <form
                            action={
                              blockSellerWithId
                            }
                            className="mt-6"
                          >
                            <label>
                              <span className="athimart-label text-[var(--text-muted)]">
                                Blocking reason
                              </span>

                              <textarea
                                name="reason"
                                required
                                minLength={5}
                                rows={4}
                                placeholder="Explain why this seller account is being restricted."
                                className={`mt-2 w-full border bg-white px-4 py-3 font-[var(--font-body)] text-sm leading-6 text-[var(--text)] outline-none transition-colors focus:border-[var(--brand-blue)] ${
                                  showReasonError
                                    ? "border-[var(--sale)]"
                                    : "border-[var(--border)]"
                                }`}
                              />
                            </label>

                            <button
                              type="submit"
                              className="mt-4 inline-flex min-h-13 w-full items-center justify-center gap-3 border border-[var(--sale)] bg-[var(--sale)] px-5 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-90"
                            >
                              <Ban
                                aria-hidden="true"
                                className="h-5 w-5"
                                strokeWidth={1.8}
                              />

                              Block seller
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </section>
      )}
    </div>
  );
}
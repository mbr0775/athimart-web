// app/(store)/orders/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Orders",

  description:
    "View your AthiMart orders, totals, payment methods and current order status.",

  robots: {
    index: false,
    follow: true,
    noarchive: true,
  },
};

/**
 * This page depends on the current authenticated
 * Supabase user and must render per request.
 */
export const dynamic =
  "force-dynamic";

interface OrderRow {
  id: string;

  user_id: string;

  order_number: string;

  status: string;

  items_count: number;

  subtotal:
    | number
    | string;

  delivery_fee:
    | number
    | string;

  total:
    | number
    | string;

  payment_method: string;

  shipping_name: string;

  shipping_phone: string;

  shipping_address_line1: string;

  shipping_address_line2:
    | string
    | null;

  shipping_city: string;

  shipping_state:
    | string
    | null;

  shipping_postal_code:
    | string
    | null;

  shipping_country: string;

  country_code: string;

  currency_code: string;

  created_at: string;

  updated_at: string;
}

/**
 * Convert database numeric values safely.
 */
function toNumber(
  value:
    | number
    | string
): number {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

/**
 * Format marketplace money.
 */
function formatMoney(
  value:
    | number
    | string,
  currencyCode: string
): string {
  const amount =
    toNumber(value);

  const currency =
    currencyCode
      ?.trim()
      .toUpperCase() ||
    "LKR";

  if (currency === "LKR") {
    return `Rs ${new Intl.NumberFormat(
      "en-LK",
      {
        maximumFractionDigits: 2,
      }
    ).format(amount)}`;
  }

  try {
    return new Intl.NumberFormat(
      "en",
      {
        style: "currency",
        currency,
      }
    ).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(
      2
    )}`;
  }
}

/**
 * Format order creation date.
 */
function formatDate(
  value: string
): string {
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
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}

/**
 * Convert database status strings
 * into customer-friendly text.
 */
function formatStatus(
  value: string
): string {
  return value
    .trim()
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

/**
 * Give each order status a readable
 * visual treatment.
 */
function getStatusClasses(
  status: string
): string {
  switch (
    status
      .trim()
      .toLowerCase()
  ) {
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "confirmed":
    case "processing":
      return "border-blue-200 bg-blue-50 text-blue-800";

    case "shipped":
    case "in_transit":
      return "border-cyan-200 bg-cyan-50 text-cyan-800";

    case "delivered":
    case "completed":
      return "border-green-200 bg-green-50 text-green-800";

    case "cancelled":
    case "failed":
      return "border-red-200 bg-red-50 text-red-800";

    default:
      return "border-neutral-200 bg-neutral-50 text-neutral-700";
  }
}

export default async function OrdersPage() {
  const supabase =
    await createClient();

  /**
   * Validate the authenticated customer.
   */
  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    redirect("/auth/login");
  }

  /**
   * Keep blocked AthiMart accounts away
   * from authenticated marketplace pages.
   */
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("is_blocked")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(
      `Unable to verify AthiMart account status: ${profileError.message}`
    );
  }

  if (
    profile?.is_blocked ===
    true
  ) {
    redirect(
      "/account-blocked"
    );
  }

  /**
   * RLS already restricts customers to their
   * own rows.
   *
   * The explicit user_id filter is also included
   * for clarity and query performance.
   */
  const {
    data,
    error,
  } = await supabase
    .from("orders")
    .select(`
      id,
      user_id,
      order_number,
      status,
      items_count,
      subtotal,
      delivery_fee,
      total,
      payment_method,
      shipping_name,
      shipping_phone,
      shipping_address_line1,
      shipping_address_line2,
      shipping_city,
      shipping_state,
      shipping_postal_code,
      shipping_country,
      country_code,
      currency_code,
      created_at,
      updated_at
    `)
    .eq(
      "user_id",
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
      `Unable to load your AthiMart orders: ${error.message}`
    );
  }

  const orders =
    (data ??
      []) as OrderRow[];

  return (
    <div className="athimart-container py-8 sm:py-10 lg:py-14">
      {/* Heading */}
      <header className="border-b border-[var(--border-strong)] pb-8">
        <p className="athimart-label text-[var(--brand-orange-dark)]">
          Customer purchases
        </p>

        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="athimart-display-large text-[var(--brand-blue-dark)]">
              My
              <br />

              <span className="text-[var(--brand-orange)]">
                Orders
              </span>
            </h1>

            <p className="athimart-body-large mt-5 max-w-2xl">
              Review your AthiMart
              purchases, payment
              information and current
              order status.
            </p>
          </div>

          <div className="flex items-center gap-3 border border-[var(--border)] bg-white px-5 py-4">
            <ReceiptText
              aria-hidden="true"
              className="h-5 w-5 text-[var(--brand-blue)]"
              strokeWidth={1.8}
            />

            <div>
              <p className="athimart-label text-[var(--text-muted)]">
                Total orders
              </p>

              <p className="mt-1 font-[var(--font-display)] text-2xl font-light text-[var(--brand-blue-dark)]">
                {orders.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Empty state */}
      {orders.length ===
      0 ? (
        <section className="mt-10 border border-[var(--border)] bg-white px-6 py-14 text-center sm:px-10 sm:py-18">
          <ShoppingBag
            aria-hidden="true"
            className="mx-auto h-12 w-12 text-[var(--brand-blue)]"
            strokeWidth={1.5}
          />

          <h2 className="mt-6 font-[var(--font-display)] text-4xl font-light uppercase text-[var(--brand-blue-dark)]">
            No Orders Yet
          </h2>

          <p className="mx-auto mt-4 max-w-xl font-[var(--font-body)] text-sm leading-7 text-[var(--text-muted)]">
            When you complete an
            AthiMart checkout, your
            orders will appear here.
          </p>

          <Link
            href="/shop"
            className="athimart-brand-button mt-7"
          >
            Start Shopping

            <ArrowRight
              aria-hidden="true"
              className="h-5 w-5"
              strokeWidth={1.8}
            />
          </Link>
        </section>
      ) : (
        <section className="mt-10 grid gap-5">
          {orders.map(
            (order) => (
              <article
                key={order.id}
                className="border border-[var(--border)] bg-white shadow-[0_14px_40px_rgba(17,42,91,0.05)]"
              >
                {/* Order header */}
                <div className="flex flex-col gap-5 border-b border-[var(--border)] p-5 sm:flex-row sm:items-start sm:justify-between sm:p-7">
                  <div>
                    <p className="athimart-label text-[var(--text-muted)]">
                      Order number
                    </p>

                    <h2 className="mt-2 break-all font-[var(--font-display)] text-2xl font-light text-[var(--brand-blue-dark)] sm:text-3xl">
                      {
                        order.order_number
                      }
                    </h2>

                    <p className="mt-3 flex items-center gap-2 font-[var(--font-body)] text-xs text-[var(--text-muted)]">
                      <CalendarDays
                        aria-hidden="true"
                        className="h-4 w-4"
                        strokeWidth={
                          1.8
                        }
                      />

                      {formatDate(
                        order.created_at
                      )}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit items-center border px-3 py-2 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] ${getStatusClasses(
                      order.status
                    )}`}
                  >
                    {formatStatus(
                      order.status
                    )}
                  </span>
                </div>

                {/* Order information */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4">
                  <div className="border-b border-[var(--border)] p-5 sm:border-r lg:border-b-0">
                    <PackageCheck
                      aria-hidden="true"
                      className="h-5 w-5 text-[var(--brand-blue)]"
                      strokeWidth={
                        1.8
                      }
                    />

                    <p className="athimart-label mt-4 text-[var(--text-muted)]">
                      Items
                    </p>

                    <p className="mt-2 font-[var(--font-body)] text-sm font-semibold">
                      {
                        order.items_count
                      }{" "}
                      item
                      {order.items_count ===
                      1
                        ? ""
                        : "s"}
                    </p>
                  </div>

                  <div className="border-b border-[var(--border)] p-5 lg:border-b-0 lg:border-r">
                    <Banknote
                      aria-hidden="true"
                      className="h-5 w-5 text-[var(--brand-blue)]"
                      strokeWidth={
                        1.8
                      }
                    />

                    <p className="athimart-label mt-4 text-[var(--text-muted)]">
                      Payment
                    </p>

                    <p className="mt-2 font-[var(--font-body)] text-sm font-semibold">
                      {
                        order.payment_method
                      }
                    </p>
                  </div>

                  <div className="border-b border-[var(--border)] p-5 sm:border-r lg:border-b-0">
                    <Truck
                      aria-hidden="true"
                      className="h-5 w-5 text-[var(--brand-blue)]"
                      strokeWidth={
                        1.8
                      }
                    />

                    <p className="athimart-label mt-4 text-[var(--text-muted)]">
                      Delivery
                    </p>

                    <p className="mt-2 font-[var(--font-body)] text-sm font-semibold">
                      {
                        order.shipping_city
                      }
                    </p>

                    <p className="mt-1 font-[var(--font-body)] text-xs text-[var(--text-muted)]">
                      {
                        order.shipping_country
                      }
                    </p>
                  </div>

                  <div className="p-5">
                    <ReceiptText
                      aria-hidden="true"
                      className="h-5 w-5 text-[var(--brand-orange)]"
                      strokeWidth={
                        1.8
                      }
                    />

                    <p className="athimart-label mt-4 text-[var(--text-muted)]">
                      Total
                    </p>

                    <p className="mt-2 font-[var(--font-display)] text-2xl font-light text-[var(--brand-blue-dark)]">
                      {formatMoney(
                        order.total,
                        order.currency_code
                      )}
                    </p>
                  </div>
                </div>

                {/* Price summary */}
                <div className="grid gap-3 border-t border-[var(--border)] bg-[var(--surface-soft)] p-5 sm:grid-cols-3 sm:p-6">
                  <div>
                    <p className="athimart-label text-[var(--text-muted)]">
                      Subtotal
                    </p>

                    <p className="mt-2 font-[var(--font-body)] text-sm font-semibold">
                      {formatMoney(
                        order.subtotal,
                        order.currency_code
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="athimart-label text-[var(--text-muted)]">
                      Delivery fee
                    </p>

                    <p className="mt-2 font-[var(--font-body)] text-sm font-semibold">
                      {formatMoney(
                        order.delivery_fee,
                        order.currency_code
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="athimart-label text-[var(--text-muted)]">
                      Order total
                    </p>

                    <p className="mt-2 font-[var(--font-body)] text-sm font-bold text-[var(--brand-blue-dark)]">
                      {formatMoney(
                        order.total,
                        order.currency_code
                      )}
                    </p>
                  </div>
                </div>
              </article>
            )
          )}
        </section>
      )}
    </div>
  );
}
// app/(admin)/admin/delivery-shipments/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Boxes,
  CheckCircle2,
  Clock3,
  MapPin,
  PackageCheck,
  PackagePlus,
  ReceiptText,
  Truck,
  UserRound,
} from "lucide-react";

import { getCurrentAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import {
  generateDeliveryShipments,
} from "./actions";

export const metadata: Metadata = {
  title: "Delivery Shipments",

  description:
    "Generate and manage AthiMart order delivery shipments.",

  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export const dynamic =
  "force-dynamic";

interface DeliveryShipmentsPageProps {
  searchParams: Promise<{
    generated?: string | string[];
    order?: string | string[];
    shipments?: string | string[];
    items?: string | string[];
    error?: string | string[];
  }>;
}

interface OrderRow {
  id: string;
  order_number: string;
  status: string;

  items_count:
    | number
    | string;

  total:
    | number
    | string;

  payment_method: string;
  shipping_name: string;
  shipping_city: string;

  created_at: string;
}

interface DeliveryShipmentRow {
  id: string;
  shipment_number: string;
  order_id: string;

  vendor_id:
    | string
    | null;

  status: string;

  assigned_driver_user_id:
    | string
    | null;

  cod_amount:
    | number
    | string;

  delivery_fee:
    | number
    | string;

  dropoff_name:
    | string
    | null;

  dropoff_city:
    | string
    | null;

  created_at: string;
}

interface DeliveryShipmentItemRow {
  shipment_id: string;

  quantity:
    | number
    | string;
}

interface ProfileRow {
  id: string;

  full_name:
    | string
    | null;

  email:
    | string
    | null;
}

interface ShipmentItemSummary {
  itemRows: number;
  totalQuantity: number;
}

function getFirstValue(
  value:
    | string
    | string[]
    | undefined
): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function normalizeText(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function formatStatus(
  value: unknown
): string {
  const status =
    normalizeText(value)
      .replace(
        /[_-]+/g,
        " "
      );

  if (!status) {
    return "Not Available";
  }

  return status.replace(
    /\b\w/g,
    (character) =>
      character.toUpperCase()
  );
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
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function formatLkr(
  value:
    | number
    | string
    | null
    | undefined
): string {
  const amount =
    Number(value);

  if (
    !Number.isFinite(amount)
  ) {
    return "Rs 0";
  }

  const formattedAmount =
    new Intl.NumberFormat(
      "en-LK",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    ).format(amount);

  return `Rs ${formattedAmount}`;
}

function getProfileDisplayName(
  profile:
    | ProfileRow
    | undefined
): string {
  const fullName =
    normalizeText(
      profile?.full_name
    );

  if (fullName) {
    return fullName;
  }

  const email =
    normalizeText(
      profile?.email
    );

  if (email) {
    return email;
  }

  return "Unknown account";
}

function isClosedOrderStatus(
  status: string
): boolean {
  const normalizedStatus =
    normalizeText(status)
      .toLowerCase();

  return (
    normalizedStatus ===
      "delivered" ||
    normalizedStatus ===
      "cancelled" ||
    normalizedStatus ===
      "canceled"
  );
}

function isClosedShipmentStatus(
  status: string
): boolean {
  const normalizedStatus =
    normalizeText(status)
      .toLowerCase();

  return (
    normalizedStatus ===
      "delivered" ||
    normalizedStatus ===
      "cancelled"
  );
}

function getOrderStatusClasses(
  status: string
): string {
  const normalizedStatus =
    normalizeText(status)
      .toLowerCase();

  switch (normalizedStatus) {
    case "delivered":
      return "border-green-200 bg-green-50 text-green-800";

    case "cancelled":
    case "canceled":
      return "border-red-200 bg-red-50 text-red-800";

    case "processing":
      return "border-blue-200 bg-blue-50 text-blue-800";

    case "shipped":
      return "border-violet-200 bg-violet-50 text-violet-800";

    case "pending":
    default:
      return "border-amber-200 bg-amber-50 text-amber-800";
  }
}

function getShipmentStatusClasses(
  status: string
): string {
  const normalizedStatus =
    normalizeText(status)
      .toLowerCase();

  switch (normalizedStatus) {
    case "awaiting_fulfillment":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "ready_for_pickup":
      return "border-blue-200 bg-blue-50 text-blue-800";

    case "offered":
      return "border-orange-200 bg-orange-50 text-orange-800";

    case "assigned":
      return "border-indigo-200 bg-indigo-50 text-indigo-800";

    case "picked_up":
      return "border-violet-200 bg-violet-50 text-violet-800";

    case "in_transit":
      return "border-cyan-200 bg-cyan-50 text-cyan-800";

    case "delivered":
      return "border-green-200 bg-green-50 text-green-800";

    case "cancelled":
      return "border-red-200 bg-red-50 text-red-800";

    default:
      return "border-neutral-200 bg-neutral-50 text-neutral-700";
  }
}

function getErrorMessage(
  errorCode: string
): string {
  switch (errorCode) {
    case "invalid-order":
      return "The selected order identifier is invalid.";

    case "order-not-found":
      return "The selected order could not be found.";

    case "order-closed":
      return "Delivery shipments cannot be generated for a delivered or cancelled order.";

    case "order-empty":
      return "The selected order does not contain any order items.";

    case "shipments-exist":
      return "Delivery shipments have already been generated for this order.";

    case "admin-required":
      return "Only an AthiMart administrator can generate delivery shipments.";

    case "invalid-response":
      return "The shipment-generation process returned an invalid response.";

    case "generation-failed":
    default:
      return "The delivery shipments could not be generated. Please try again.";
  }
}

export default async function DeliveryShipmentsPage({
  searchParams,
}: Readonly<DeliveryShipmentsPageProps>) {
  await getCurrentAdmin();

  const resolvedSearchParams =
    await searchParams;

  const generated =
    getFirstValue(
      resolvedSearchParams.generated
    );

  const generatedOrder =
    getFirstValue(
      resolvedSearchParams.order
    );

  const generatedShipmentCount =
    getFirstValue(
      resolvedSearchParams.shipments
    );

  const generatedItemCount =
    getFirstValue(
      resolvedSearchParams.items
    );

  const errorCode =
    getFirstValue(
      resolvedSearchParams.error
    );

  const supabase =
    await createClient();

  const [
    ordersResult,
    shipmentsResult,
    shipmentItemsResult,
  ] =
    await Promise.all([
      supabase
        .from("orders")
        .select(`
          id,
          order_number,
          status,
          items_count,
          total,
          payment_method,
          shipping_name,
          shipping_city,
          created_at
        `)
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(200),

      supabase
        .from(
          "delivery_shipments"
        )
        .select(`
          id,
          shipment_number,
          order_id,
          vendor_id,
          status,
          assigned_driver_user_id,
          cod_amount,
          delivery_fee,
          dropoff_name,
          dropoff_city,
          created_at
        `)
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(300),

      supabase
        .from(
          "delivery_shipment_items"
        )
        .select(`
          shipment_id,
          quantity
        `),
    ]);

  if (ordersResult.error) {
    throw new Error(
      `Unable to load AthiMart orders: ${ordersResult.error.message}`
    );
  }

  if (shipmentsResult.error) {
    throw new Error(
      `Unable to load AthiMart delivery shipments: ${shipmentsResult.error.message}`
    );
  }

  if (
    shipmentItemsResult.error
  ) {
    throw new Error(
      `Unable to load delivery shipment items: ${shipmentItemsResult.error.message}`
    );
  }

  const orders =
    (
      ordersResult.data ??
      []
    ) as OrderRow[];

  const shipments =
    (
      shipmentsResult.data ??
      []
    ) as DeliveryShipmentRow[];

  const shipmentItems =
    (
      shipmentItemsResult.data ??
      []
    ) as DeliveryShipmentItemRow[];

  const relatedProfileIds =
    Array.from(
      new Set(
        shipments.flatMap(
          (shipment) => {
            const ids: string[] =
              [];

            if (
              shipment.vendor_id
            ) {
              ids.push(
                shipment.vendor_id
              );
            }

            if (
              shipment
                .assigned_driver_user_id
            ) {
              ids.push(
                shipment
                  .assigned_driver_user_id
              );
            }

            return ids;
          }
        )
      )
    );

  let profiles:
    ProfileRow[] = [];

  if (
    relatedProfileIds.length >
    0
  ) {
    const profilesResult =
      await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email
        `)
        .in(
          "id",
          relatedProfileIds
        );

    if (
      profilesResult.error
    ) {
      throw new Error(
        `Unable to load shipment account information: ${profilesResult.error.message}`
      );
    }

    profiles =
      (
        profilesResult.data ??
        []
      ) as ProfileRow[];
  }

  const profileById =
    new Map(
      profiles.map(
        (profile) => [
          profile.id,
          profile,
        ]
      )
    );

  const orderById =
    new Map(
      orders.map(
        (order) => [
          order.id,
          order,
        ]
      )
    );

  const shipmentOrderIds =
    new Set(
      shipments.map(
        (shipment) =>
          shipment.order_id
      )
    );

  const shipmentItemSummaryById =
    new Map<
      string,
      ShipmentItemSummary
    >();

  shipmentItems.forEach(
    (shipmentItem) => {
      const currentSummary =
        shipmentItemSummaryById.get(
          shipmentItem.shipment_id
        ) ?? {
          itemRows: 0,
          totalQuantity: 0,
        };

      const quantity =
        Number(
          shipmentItem.quantity
        );

      currentSummary.itemRows +=
        1;

      currentSummary.totalQuantity +=
        Number.isFinite(quantity)
          ? quantity
          : 0;

      shipmentItemSummaryById.set(
        shipmentItem.shipment_id,
        currentSummary
      );
    }
  );

  const ordersAwaitingGeneration =
    orders.filter(
      (order) =>
        !shipmentOrderIds.has(
          order.id
        ) &&
        !isClosedOrderStatus(
          order.status
        )
    );

  const activeShipmentCount =
    shipments.filter(
      (shipment) =>
        !isClosedShipmentStatus(
          shipment.status
        )
    ).length;

  const deliveredShipmentCount =
    shipments.filter(
      (shipment) =>
        normalizeText(
          shipment.status
        ).toLowerCase() ===
        "delivered"
    ).length;

  const unassignedShipmentCount =
    shipments.filter(
      (shipment) =>
        !shipment
          .assigned_driver_user_id &&
        !isClosedShipmentStatus(
          shipment.status
        )
    ).length;

  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      {/* Page heading */}
      <header className="border-b border-[var(--border-strong)] pb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-blue)] transition-colors hover:text-[var(--brand-orange-dark)]"
        >
          <ArrowLeft
            aria-hidden="true"
            className="h-4 w-4"
            strokeWidth={1.8}
          />

          Admin Dashboard
        </Link>

        <div className="mt-6 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Order fulfilment
            </p>

            <h1 className="mt-3 font-[var(--font-display)] text-5xl font-light uppercase tracking-[0.03em] text-[var(--brand-blue-dark)] sm:text-6xl">
              Delivery
              <br />

              <span className="text-[var(--brand-orange)]">
                Shipments
              </span>
            </h1>

            <p className="mt-5 max-w-3xl font-[var(--font-body)] text-sm leading-7 text-[var(--text-muted)]">
              Generate seller-based
              shipments from customer
              orders and review the
              current delivery fulfilment
              status.
            </p>
          </div>

          <div className="flex items-center gap-3 border border-[var(--border)] bg-white px-5 py-4">
            <Truck
              aria-hidden="true"
              className="h-6 w-6 text-[var(--brand-blue)]"
              strokeWidth={1.8}
            />

            <div>
              <p className="athimart-label text-[var(--text-muted)]">
                Shipment records
              </p>

              <p className="mt-1 font-[var(--font-display)] text-3xl font-light text-[var(--brand-blue-dark)]">
                {shipments.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Success message */}
      {generated === "1" &&
        generatedOrder && (
          <div
            role="status"
            className="mt-7 flex items-start gap-3 border-l-4 border-green-600 bg-green-50 p-5 text-green-900"
          >
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-green-700"
              strokeWidth={1.8}
            />

            <div>
              <p className="font-[var(--font-body)] text-sm font-semibold">
                Delivery shipments
                generated successfully.
              </p>

              <p className="mt-1 font-[var(--font-body)] text-xs leading-6">
                Order{" "}
                <strong>
                  {generatedOrder}
                </strong>{" "}
                created{" "}
                {generatedShipmentCount ||
                  "the required"}{" "}
                shipment record(s)
                covering{" "}
                {generatedItemCount ||
                  "the connected"}{" "}
                order-item row(s).
              </p>
            </div>
          </div>
        )}

      {/* Error message */}
      {errorCode && (
        <div
          role="alert"
          className="mt-7 flex items-start gap-3 border-l-4 border-red-600 bg-red-50 p-5 text-red-900"
        >
          <AlertCircle
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-red-700"
            strokeWidth={1.8}
          />

          <div>
            <p className="font-[var(--font-body)] text-sm font-semibold">
              Shipment generation
              failed.
            </p>

            <p className="mt-1 font-[var(--font-body)] text-xs leading-6">
              {getErrorMessage(
                errorCode
              )}
            </p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="border border-[var(--border)] bg-white p-6 shadow-[0_14px_40px_rgba(17,42,91,0.05)]">
          <span className="flex h-12 w-12 items-center justify-center bg-amber-50 text-amber-700">
            <PackagePlus
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.8}
            />
          </span>

          <p className="athimart-label mt-5 text-[var(--text-muted)]">
            Awaiting generation
          </p>

          <p className="mt-2 font-[var(--font-display)] text-4xl font-light text-[var(--brand-blue-dark)]">
            {
              ordersAwaitingGeneration.length
            }
          </p>
        </article>

        <article className="border border-[var(--border)] bg-white p-6 shadow-[0_14px_40px_rgba(17,42,91,0.05)]">
          <span className="flex h-12 w-12 items-center justify-center bg-blue-50 text-blue-700">
            <Clock3
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.8}
            />
          </span>

          <p className="athimart-label mt-5 text-[var(--text-muted)]">
            Active shipments
          </p>

          <p className="mt-2 font-[var(--font-display)] text-4xl font-light text-[var(--brand-blue-dark)]">
            {activeShipmentCount}
          </p>
        </article>

        <article className="border border-[var(--border)] bg-white p-6 shadow-[0_14px_40px_rgba(17,42,91,0.05)]">
          <span className="flex h-12 w-12 items-center justify-center bg-orange-50 text-orange-700">
            <UserRound
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.8}
            />
          </span>

          <p className="athimart-label mt-5 text-[var(--text-muted)]">
            Unassigned
          </p>

          <p className="mt-2 font-[var(--font-display)] text-4xl font-light text-[var(--brand-blue-dark)]">
            {unassignedShipmentCount}
          </p>
        </article>

        <article className="border border-[var(--border)] bg-white p-6 shadow-[0_14px_40px_rgba(17,42,91,0.05)]">
          <span className="flex h-12 w-12 items-center justify-center bg-green-50 text-green-700">
            <BadgeCheck
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.8}
            />
          </span>

          <p className="athimart-label mt-5 text-[var(--text-muted)]">
            Delivered
          </p>

          <p className="mt-2 font-[var(--font-display)] text-4xl font-light text-[var(--brand-blue-dark)]">
            {deliveredShipmentCount}
          </p>
        </article>
      </section>

      {/* Orders awaiting generation */}
      <section className="mt-10 border border-[var(--border)] bg-white shadow-[0_20px_55px_rgba(17,42,91,0.06)]">
        <header className="flex flex-col gap-4 border-b border-[var(--border)] p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--brand-orange-soft)] text-[var(--brand-orange-dark)]">
              <Boxes
                aria-hidden="true"
                className="h-6 w-6"
                strokeWidth={1.8}
              />
            </span>

            <div>
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                New fulfilment
              </p>

              <h2 className="mt-2 font-[var(--font-display)] text-3xl font-light text-[var(--brand-blue-dark)]">
                Orders Awaiting
                Shipment Generation
              </h2>

              <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                One shipment will be
                created for each seller
                represented in an order.
              </p>
            </div>
          </div>

          <span className="inline-flex min-h-10 items-center justify-center bg-[var(--brand-blue-soft)] px-4 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-blue)]">
            {
              ordersAwaitingGeneration.length
            }{" "}
            Order(s)
          </span>
        </header>

        {ordersAwaitingGeneration.length ===
        0 ? (
          <div className="p-8 text-center sm:p-12">
            <PackageCheck
              aria-hidden="true"
              className="mx-auto h-12 w-12 text-green-600"
              strokeWidth={1.5}
            />

            <h3 className="mt-5 font-[var(--font-display)] text-3xl font-light text-[var(--brand-blue-dark)]">
              No Orders Waiting
            </h3>

            <p className="mx-auto mt-3 max-w-xl font-[var(--font-body)] text-sm leading-7 text-[var(--text-muted)]">
              Every eligible recent order
              already has delivery shipments,
              or there are currently no
              customer orders.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 p-5 sm:p-7 xl:grid-cols-2">
            {ordersAwaitingGeneration.map(
              (order) => (
                <article
                  key={order.id}
                  className="border border-[var(--border)] bg-[var(--linen-light)] p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="athimart-label text-[var(--text-muted)]">
                        Order number
                      </p>

                      <h3 className="mt-2 break-all font-[var(--font-display)] text-2xl font-light text-[var(--brand-blue-dark)]">
                        {
                          order.order_number
                        }
                      </h3>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center border px-3 py-2 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] ${getOrderStatusClasses(
                        order.status
                      )}`}
                    >
                      {formatStatus(
                        order.status
                      )}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="border border-[var(--border)] bg-white p-4">
                      <p className="athimart-label text-[var(--text-muted)]">
                        Customer
                      </p>

                      <p className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                        {
                          order.shipping_name
                        }
                      </p>

                      <p className="mt-1 flex items-center gap-2 font-[var(--font-body)] text-xs text-[var(--text-muted)]">
                        <MapPin
                          aria-hidden="true"
                          className="h-4 w-4"
                          strokeWidth={1.8}
                        />

                        {
                          order.shipping_city
                        }
                      </p>
                    </div>

                    <div className="border border-[var(--border)] bg-white p-4">
                      <p className="athimart-label text-[var(--text-muted)]">
                        Order value
                      </p>

                      <p className="mt-2 font-[var(--font-display)] text-2xl font-light text-[var(--brand-blue-dark)]">
                        {formatLkr(
                          order.total
                        )}
                      </p>

                      <p className="mt-1 font-[var(--font-body)] text-xs text-[var(--text-muted)]">
                        {
                          order.payment_method
                        }
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-[var(--font-body)] text-xs text-[var(--text-muted)]">
                    <span>
                      Items:{" "}
                      <strong className="text-[var(--text)]">
                        {
                          order.items_count
                        }
                      </strong>
                    </span>

                    <span>
                      Created:{" "}
                      <strong className="text-[var(--text)]">
                        {formatDate(
                          order.created_at
                        )}
                      </strong>
                    </span>
                  </div>

                  <form
                    action={
                      generateDeliveryShipments
                    }
                    className="mt-6"
                  >
                    <input
                      type="hidden"
                      name="orderId"
                      value={order.id}
                    />

                    <button
                      type="submit"
                      className="inline-flex min-h-12 w-full items-center justify-center gap-3 bg-[var(--brand-orange)] px-5 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] !text-white transition-colors hover:bg-[var(--brand-orange-dark)] hover:!text-white [&_svg]:!text-white"
                    >
                      <PackagePlus
                        aria-hidden="true"
                        className="h-5 w-5"
                        strokeWidth={1.8}
                      />

                      Generate Delivery
                      Shipments
                    </button>
                  </form>
                </article>
              )
            )}
          </div>
        )}
      </section>

      {/* Existing shipments */}
      <section className="mt-10 border border-[var(--border)] bg-white shadow-[0_20px_55px_rgba(17,42,91,0.06)]">
        <header className="flex flex-col gap-4 border-b border-[var(--border)] p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
              <Truck
                aria-hidden="true"
                className="h-6 w-6"
                strokeWidth={1.8}
              />
            </span>

            <div>
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Delivery records
              </p>

              <h2 className="mt-2 font-[var(--font-display)] text-3xl font-light text-[var(--brand-blue-dark)]">
                Existing Shipments
              </h2>

              <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                Review generated shipment
                groups, payment values and
                assigned drivers.
              </p>
            </div>
          </div>

          <span className="inline-flex min-h-10 items-center justify-center bg-[var(--brand-blue-soft)] px-4 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-blue)]">
            {shipments.length}{" "}
            Shipment(s)
          </span>
        </header>

        {shipments.length ===
        0 ? (
          <div className="p-8 text-center sm:p-12">
            <ReceiptText
              aria-hidden="true"
              className="mx-auto h-12 w-12 text-[var(--text-muted)]"
              strokeWidth={1.5}
            />

            <h3 className="mt-5 font-[var(--font-display)] text-3xl font-light text-[var(--brand-blue-dark)]">
              No Shipments Yet
            </h3>

            <p className="mx-auto mt-3 max-w-xl font-[var(--font-body)] text-sm leading-7 text-[var(--text-muted)]">
              Generate delivery shipments
              from an eligible customer
              order to see them here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 p-5 sm:p-7 xl:grid-cols-2">
            {shipments.map(
              (shipment) => {
                const order =
                  orderById.get(
                    shipment.order_id
                  );

                const vendor =
                  shipment.vendor_id
                    ? profileById.get(
                        shipment.vendor_id
                      )
                    : undefined;

                const driver =
                  shipment
                    .assigned_driver_user_id
                    ? profileById.get(
                        shipment
                          .assigned_driver_user_id
                      )
                    : undefined;

                const itemSummary =
                  shipmentItemSummaryById.get(
                    shipment.id
                  ) ?? {
                    itemRows: 0,
                    totalQuantity: 0,
                  };

                return (
                  <article
                    key={shipment.id}
                    className="border border-[var(--border)] bg-[var(--linen-light)] p-5 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="athimart-label text-[var(--text-muted)]">
                          Shipment number
                        </p>

                        <h3 className="mt-2 break-all font-[var(--font-display)] text-2xl font-light text-[var(--brand-blue-dark)]">
                          {
                            shipment.shipment_number
                          }
                        </h3>

                        <p className="mt-2 font-[var(--font-body)] text-xs text-[var(--text-muted)]">
                          Order:{" "}
                          <strong className="text-[var(--text)]">
                            {order
                              ?.order_number ??
                              shipment.order_id}
                          </strong>
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit items-center border px-3 py-2 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] ${getShipmentStatusClasses(
                          shipment.status
                        )}`}
                      >
                        {formatStatus(
                          shipment.status
                        )}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="border border-[var(--border)] bg-white p-4">
                        <p className="athimart-label text-[var(--text-muted)]">
                          Fulfilment source
                        </p>

                        <p className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                          {shipment.vendor_id
                            ? getProfileDisplayName(
                                vendor
                              )
                            : "AthiMart Fulfilment"}
                        </p>

                        <p className="mt-1 font-[var(--font-body)] text-xs text-[var(--text-muted)]">
                          {shipment.vendor_id
                            ? "Seller shipment"
                            : "Admin-owned products"}
                        </p>
                      </div>

                      <div className="border border-[var(--border)] bg-white p-4">
                        <p className="athimart-label text-[var(--text-muted)]">
                          Assigned driver
                        </p>

                        <p className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                          {shipment
                            .assigned_driver_user_id
                            ? getProfileDisplayName(
                                driver
                              )
                            : "Not assigned"}
                        </p>

                        <p className="mt-1 font-[var(--font-body)] text-xs text-[var(--text-muted)]">
                          {shipment
                            .assigned_driver_user_id
                            ? "Delivery partner"
                            : "Awaiting assignment"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="border border-[var(--border)] bg-white p-4">
                        <p className="athimart-label text-[var(--text-muted)]">
                          COD amount
                        </p>

                        <p className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                          {formatLkr(
                            shipment.cod_amount
                          )}
                        </p>
                      </div>

                      <div className="border border-[var(--border)] bg-white p-4">
                        <p className="athimart-label text-[var(--text-muted)]">
                          Item rows
                        </p>

                        <p className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                          {
                            itemSummary.itemRows
                          }
                        </p>
                      </div>

                      <div className="border border-[var(--border)] bg-white p-4">
                        <p className="athimart-label text-[var(--text-muted)]">
                          Quantity
                        </p>

                        <p className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                          {
                            itemSummary.totalQuantity
                          }
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-[var(--font-body)] text-xs text-[var(--text-muted)]">
                      <span className="inline-flex items-center gap-2">
                        <MapPin
                          aria-hidden="true"
                          className="h-4 w-4"
                          strokeWidth={1.8}
                        />

                        {shipment.dropoff_city ||
                          order?.shipping_city ||
                          "City unavailable"}
                      </span>

                      <span>
                        Created:{" "}
                        <strong className="text-[var(--text)]">
                          {formatDate(
                            shipment.created_at
                          )}
                        </strong>
                      </span>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
}
// app/(store)/delivery-partner/dashboard/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Bike,
  Box,
  Clock3,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
  UserRound,
  UtensilsCrossed,
  WalletCards,
} from "lucide-react";

import { getCurrentDeliveryPartner } from "@/lib/auth/delivery-partner";
import { createClient } from "@/lib/supabase/server";

import DeliveryAvailabilityControl from "./delivery-availability-control";

export const dynamic =
  "force-dynamic";

export const metadata: Metadata = {
  title:
    "Delivery Partner Dashboard",

  description:
    "Manage AthiMart delivery availability, approved service areas, registered vehicles and delivery activity.",

  robots: {
    index: false,
    follow: false,
  },
};

interface DeliveryPartnerVehicleRow {
  id: string;

  vehicle_type: string;
  vehicle_status: string;

  is_primary: boolean;
  is_currently_available: boolean;

  registration_number:
    | string
    | null;

  manufacturer:
    | string
    | null;

  model:
    | string
    | null;

  colour:
    | string
    | null;

  maximum_payload_kg:
    | number
    | string
    | null;

  maximum_parcel_count:
    | number
    | null;

  supports_food_delivery:
    boolean;

  supports_fragile_parcels:
    boolean;

  supports_cash_on_delivery:
    boolean;
}

function normalizeText(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeNumber(
  value: unknown,
  fallback = 0
): number {
  const parsedValue =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(
    parsedValue
  )
    ? parsedValue
    : fallback;
}

function formatVehicleType(
  value: string
): string {
  const normalizedValue =
    value
      .trim()
      .replace(
        /[_-]+/g,
        " "
      );

  if (!normalizedValue) {
    return "Registered vehicle";
  }

  return normalizedValue.replace(
    /\b\w/g,
    (character) =>
      character.toUpperCase()
  );
}

function getVehicleDisplayName(
  vehicle: DeliveryPartnerVehicleRow
): string {
  const manufacturer =
    normalizeText(
      vehicle.manufacturer
    );

  const model =
    normalizeText(
      vehicle.model
    );

  const combinedName = [
    manufacturer,
    model,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    combinedName ||
    formatVehicleType(
      vehicle.vehicle_type
    )
  );
}

async function getPrimaryApprovedVehicle(
  driverUserId: string
): Promise<DeliveryPartnerVehicleRow | null> {
  const supabase =
    await createClient();

  /*
   * Existing RLS allows the authenticated
   * delivery partner to read only vehicles
   * belonging to their own account.
   */
  const {
    data,
    error,
  } = await supabase
    .from(
      "delivery_partner_vehicles"
    )
    .select(
      `
        id,
        vehicle_type,
        vehicle_status,
        is_primary,
        is_currently_available,
        registration_number,
        manufacturer,
        model,
        colour,
        maximum_payload_kg,
        maximum_parcel_count,
        supports_food_delivery,
        supports_fragile_parcels,
        supports_cash_on_delivery
      `
    )
    .eq(
      "driver_user_id",
      driverUserId
    )
    .eq(
      "vehicle_status",
      "approved"
    )
    .order(
      "is_primary",
      {
        ascending: false,
      }
    )
    .order(
      "created_at",
      {
        ascending: true,
      }
    )
    .limit(1)
    .maybeSingle<DeliveryPartnerVehicleRow>();

  if (error) {
    throw new Error(
      `Unable to load the approved delivery vehicle: ${error.message}`
    );
  }

  return data;
}

export default async function DeliveryPartnerDashboardPage() {
  /*
   * Only an approved and unblocked
   * delivery partner can access this page.
   */
  const {
    profile,
  } =
    await getCurrentDeliveryPartner();

  const vehicle =
    await getPrimaryApprovedVehicle(
      profile.userId
    );

  const serviceAreas =
    profile.approvedServiceAreas;

  const capabilities = [
    {
      label:
        "Cash on delivery",

      description:
        "Collect and handle approved cash payments.",

      enabled:
        profile.canHandleCashOnDelivery,

      icon:
        WalletCards,
    },
    {
      label:
        "Food delivery",

      description:
        "Complete approved food-delivery assignments.",

      enabled:
        profile.canHandleFoodDelivery,

      icon:
        UtensilsCrossed,
    },
    {
      label:
        "Fragile parcels",

      description:
        "Transport approved fragile packages.",

      enabled:
        profile.canHandleFragileParcels,

      icon:
        Box,
    },
  ];

  return (
    <main className="athimart-container py-10 sm:py-14 lg:py-20">
      {/* Dashboard heading */}
      <header className="border-b border-[var(--border-strong)] pb-8">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Delivery partner portal
              </p>

              <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-green-700">
                <BadgeCheck
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />

                Approved partner
              </span>
            </div>

            <h1 className="athimart-display-large mt-4 text-[var(--brand-blue-dark)]">
              Driver
              <br />

              <span className="text-[var(--brand-orange)]">
                Dashboard
              </span>
            </h1>

            <p className="athimart-body-large mt-5 max-w-3xl">
              Welcome back,{" "}
              <strong>
                {profile.fullName}
              </strong>
              . Manage your delivery
              availability, approved vehicle
              and service capabilities.
            </p>
          </div>

          <Link
            href="/account"
            className="athimart-brand-outline-button shrink-0"
          >
            <UserRound
              aria-hidden="true"
              className="h-5 w-5"
              strokeWidth={1.8}
            />

            My account
          </Link>
        </div>
      </header>

      {/* Main dashboard cards */}
      <section
        aria-label="Delivery partner overview"
        className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
      >
        {/* Interactive availability control */}
        <DeliveryAvailabilityControl
          initialAvailabilityStatus={
            profile.availabilityStatus
          }
        />

        {/* Service areas */}
        <article className="border border-[var(--border)] bg-white p-6 shadow-[0_16px_45px_rgba(17,42,91,0.06)]">
          <span className="flex h-12 w-12 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
            <MapPin
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.8}
            />
          </span>

          <p className="mt-6 athimart-label text-[var(--text-muted)]">
            Approved service area
          </p>

          <h2 className="mt-2 font-[var(--font-display)] text-2xl font-light text-[var(--brand-blue-dark)]">
            {serviceAreas.length > 0
              ? `${serviceAreas.length} area${
                  serviceAreas.length === 1
                    ? ""
                    : "s"
                }`
              : "Not assigned"}
          </h2>

          <p className="mt-3 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
            Approved operating radius:{" "}
            <strong>
              {
                profile
                  .approvedServiceRadiusKm
              }{" "}
              km
            </strong>
          </p>
        </article>

        {/* Current assignments */}
        <article className="border border-[var(--border)] bg-white p-6 shadow-[0_16px_45px_rgba(17,42,91,0.06)]">
          <span className="flex h-12 w-12 items-center justify-center bg-[var(--brand-orange-soft)] text-[var(--brand-orange-dark)]">
            <PackageCheck
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.8}
            />
          </span>

          <p className="mt-6 athimart-label text-[var(--text-muted)]">
            Active deliveries
          </p>

          <h2 className="mt-2 font-[var(--font-display)] text-3xl font-light text-[var(--brand-blue-dark)]">
            0
          </h2>

          <p className="mt-3 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
            Delivery assignments have not
            been connected yet.
          </p>
        </article>

        {/* Delivery history */}
        <article className="border border-[var(--border)] bg-white p-6 shadow-[0_16px_45px_rgba(17,42,91,0.06)]">
          <span className="flex h-12 w-12 items-center justify-center bg-neutral-100 text-neutral-600">
            <Clock3
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.8}
            />
          </span>

          <p className="mt-6 athimart-label text-[var(--text-muted)]">
            Completed deliveries
          </p>

          <h2 className="mt-2 font-[var(--font-display)] text-3xl font-light text-[var(--brand-blue-dark)]">
            0
          </h2>

          <p className="mt-3 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
            Completed-delivery history will
            appear here after assignments
            are implemented.
          </p>
        </article>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Approved vehicle */}
        <section className="border border-[var(--border)] bg-white p-6 shadow-[0_18px_50px_rgba(17,42,91,0.06)] sm:p-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Registered vehicle
              </p>

              <h2 className="mt-3 font-[var(--font-display)] text-3xl font-light text-[var(--brand-blue-dark)]">
                Approved delivery vehicle
              </h2>
            </div>

            <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
              {vehicle?.vehicle_type
                .toLowerCase()
                .includes(
                  "motor"
                ) ? (
                <Bike
                  aria-hidden="true"
                  className="h-7 w-7"
                  strokeWidth={1.8}
                />
              ) : (
                <Truck
                  aria-hidden="true"
                  className="h-7 w-7"
                  strokeWidth={1.8}
                />
              )}
            </span>
          </div>

          {vehicle ? (
            <div className="mt-7">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-[var(--font-display)] text-2xl font-light text-[var(--text)]">
                  {getVehicleDisplayName(
                    vehicle
                  )}
                </h3>

                {vehicle.is_primary && (
                  <span className="rounded-full bg-green-50 px-3 py-1.5 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] text-green-700">
                    Primary
                  </span>
                )}

                {vehicle.is_currently_available && (
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] text-blue-700">
                    Operational
                  </span>
                )}
              </div>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="border border-[var(--border)] bg-[var(--linen-light)] p-4">
                  <dt className="athimart-label text-[var(--text-muted)]">
                    Vehicle type
                  </dt>

                  <dd className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                    {formatVehicleType(
                      vehicle.vehicle_type
                    )}
                  </dd>
                </div>

                <div className="border border-[var(--border)] bg-[var(--linen-light)] p-4">
                  <dt className="athimart-label text-[var(--text-muted)]">
                    Registration
                  </dt>

                  <dd className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                    {normalizeText(
                      vehicle.registration_number
                    ) ||
                      "Not recorded"}
                  </dd>
                </div>

                <div className="border border-[var(--border)] bg-[var(--linen-light)] p-4">
                  <dt className="athimart-label text-[var(--text-muted)]">
                    Maximum payload
                  </dt>

                  <dd className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                    {normalizeNumber(
                      vehicle.maximum_payload_kg
                    )}{" "}
                    kg
                  </dd>
                </div>

                <div className="border border-[var(--border)] bg-[var(--linen-light)] p-4">
                  <dt className="athimart-label text-[var(--text-muted)]">
                    Parcel capacity
                  </dt>

                  <dd className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                    {vehicle.maximum_parcel_count ??
                      1}{" "}
                    parcel(s)
                  </dd>
                </div>

                <div className="border border-[var(--border)] bg-[var(--linen-light)] p-4">
                  <dt className="athimart-label text-[var(--text-muted)]">
                    Colour
                  </dt>

                  <dd className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                    {normalizeText(
                      vehicle.colour
                    ) ||
                      "Not recorded"}
                  </dd>
                </div>

                <div className="border border-[var(--border)] bg-[var(--linen-light)] p-4">
                  <dt className="athimart-label text-[var(--text-muted)]">
                    Approval status
                  </dt>

                  <dd className="mt-2 font-[var(--font-body)] text-sm font-semibold text-green-700">
                    Approved
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="mt-7 border-l-4 border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] p-5">
              <p className="font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                No approved vehicle was found.
              </p>

              <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                An approved primary vehicle
                is required before delivery
                operations can begin.
              </p>
            </div>
          )}
        </section>

        {/* Capabilities */}
        <section className="border border-[var(--border)] bg-white p-6 shadow-[0_18px_50px_rgba(17,42,91,0.06)] sm:p-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Driver permissions
              </p>

              <h2 className="mt-3 font-[var(--font-display)] text-3xl font-light text-[var(--brand-blue-dark)]">
                Approved capabilities
              </h2>
            </div>

            <ShieldCheck
              aria-hidden="true"
              className="h-8 w-8 shrink-0 text-[var(--brand-blue)]"
              strokeWidth={1.8}
            />
          </div>

          <div className="mt-7 space-y-3">
            {capabilities.map(
              (capability) => {
                const Icon =
                  capability.icon;

                return (
                  <article
                    key={
                      capability.label
                    }
                    className="flex items-start gap-4 border border-[var(--border)] p-4"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center ${
                        capability.enabled
                          ? "bg-green-50 text-green-700"
                          : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      <Icon
                        aria-hidden="true"
                        className="h-5 w-5"
                        strokeWidth={1.8}
                      />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                          {
                            capability.label
                          }
                        </h3>

                        <span
                          className={`font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] ${
                            capability.enabled
                              ? "text-green-700"
                              : "text-neutral-500"
                          }`}
                        >
                          {capability.enabled
                            ? "Approved"
                            : "Not approved"}
                        </span>
                      </div>

                      <p className="mt-1 font-[var(--font-body)] text-xs leading-5 text-[var(--text-muted)]">
                        {
                          capability.description
                        }
                      </p>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        </section>
      </div>

      {/* Service areas */}
      <section className="mt-8 border border-[var(--border)] bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Operating coverage
            </p>

            <h2 className="mt-3 font-[var(--font-display)] text-3xl font-light text-[var(--brand-blue-dark)]">
              Approved service areas
            </h2>
          </div>

          <Link
            href="/delivery-partner"
            className="inline-flex min-h-11 items-center gap-2 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-blue)]"
          >
            Application status

            <ArrowUpRight
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          </Link>
        </div>

        {serviceAreas.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {serviceAreas.map(
              (serviceArea) => (
                <span
                  key={serviceArea}
                  className="inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--linen-light)] px-4 py-3 font-[var(--font-body)] text-xs font-semibold text-[var(--text)]"
                >
                  <MapPin
                    aria-hidden="true"
                    className="h-4 w-4 text-[var(--brand-orange)]"
                    strokeWidth={1.8}
                  />

                  {serviceArea}
                </span>
              )
            )}
          </div>
        ) : (
          <div className="mt-6 border-l-4 border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] p-5">
            <p className="font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              No service area has been
              approved for this
              delivery-partner account.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
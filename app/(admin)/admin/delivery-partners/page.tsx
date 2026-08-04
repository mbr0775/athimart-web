// app/(admin)/admin/delivery-partners/page.tsx

import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  MapPin,
  ShieldCheck,
  Truck,
  UserRoundCheck,
} from "lucide-react";

import { getCurrentAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Delivery Partner Applications",

  description:
    "Review submitted AthiMart Individual Delivery Partner applications.",

  robots: {
    index: false,
    follow: false,
    noarchive: true,

    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      noimageindex: true,
    },
  },
};

interface DeliveryPartnerApplicationRow {
  user_id: string;

  application_status: string;
  availability_status: string;

  requested_service_areas: string[] | null;

  application_submitted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface ApplicantProfileRow {
  id: string;

  email: string | null;
  full_name: string | null;
  phone: string | null;

  is_blocked: boolean;
}

interface DeliveryPartnerVehicleRow {
  id: string;
  driver_user_id: string;

  vehicle_type: string;
  vehicle_status: string;

  registration_number: string | null;
  manufacturer: string | null;
  model: string | null;

  is_primary: boolean;
  created_at: string | null;
}

interface DeliveryPartnerQueueItem {
  application: DeliveryPartnerApplicationRow;
  applicant: ApplicantProfileRow | null;
  vehicle: DeliveryPartnerVehicleRow | null;
}

interface SummaryCardProps {
  label: string;
  value: number;
  helper: string;

  icon: LucideIcon;

  iconClassName: string;
  iconBackgroundClassName: string;
}

const REVIEWABLE_STATUSES = [
  "pending",
  "under_review",
];

function formatStatus(
  value: string
): string {
  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function formatDate(
  value: string | null
): string {
  if (!value) {
    return "Not recorded";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat(
    "en-LK",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

function getApplicantName(
  applicant: ApplicantProfileRow | null
): string {
  const fullName =
    applicant?.full_name?.trim();

  if (fullName) {
    return fullName;
  }

  const email =
    applicant?.email?.trim();

  if (email) {
    return email;
  }

  return "Unnamed Applicant";
}

function getApplicantInitials(
  applicant: ApplicantProfileRow | null
): string {
  const applicantName =
    getApplicantName(
      applicant
    );

  const words =
    applicantName
      .split(/\s+/)
      .filter(Boolean);

  if (
    words.length === 0
  ) {
    return "DP";
  }

  const firstWord =
    words[0] ?? "D";

  if (
    words.length === 1
  ) {
    return firstWord
      .slice(0, 2)
      .toUpperCase();
  }

  const lastWord =
    words.at(-1) ??
    firstWord;

  return `${firstWord.charAt(
    0
  )}${lastWord.charAt(
    0
  )}`.toUpperCase();
}

function getVehicleTitle(
  vehicle: DeliveryPartnerVehicleRow | null
): string {
  if (!vehicle) {
    return "Vehicle not found";
  }

  const manufacturer =
    vehicle.manufacturer?.trim() ??
    "";

  const model =
    vehicle.model?.trim() ??
    "";

  const combinedName =
    [
      manufacturer,
      model,
    ]
      .filter(Boolean)
      .join(" ");

  return (
    combinedName ||
    formatStatus(
      vehicle.vehicle_type
    )
  );
}

function getStatusStyles(
  status: string
): {
  badge: string;
  dot: string;
  label: string;
} {
  if (
    status ===
    "under_review"
  ) {
    return {
      badge:
        "border-amber-200 bg-amber-50 text-amber-700",

      dot:
        "bg-amber-500",

      label:
        "Under Review",
    };
  }

  return {
    badge:
      "border-blue-200 bg-blue-50 text-[var(--brand-blue)]",

    dot:
      "bg-[var(--brand-blue)]",

    label:
      "Pending",
  };
}

function SummaryCard({
  label,
  value,
  helper,
  icon: Icon,
  iconClassName,
  iconBackgroundClassName,
}: Readonly<SummaryCardProps>) {
  return (
    <article className="group relative min-h-[180px] overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-7 shadow-[0_10px_32px_rgba(15,23,42,0.05)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_20px_48px_rgba(15,23,42,0.10)] motion-reduce:hover:translate-y-0">
      <div
        aria-hidden="true"
        className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-slate-100/75 transition-transform duration-500 group-hover:scale-125"
      />

      <div className="relative flex h-full items-start justify-between gap-6">
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>

          <p className="mt-4 font-[var(--font-display)] text-5xl font-light leading-none text-slate-900">
            {value}
          </p>

          <p className="mt-auto pt-5 font-[var(--font-body)] text-[11px] leading-5 text-slate-500">
            {helper}
          </p>
        </div>

        <span
          className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-[18px] transition-all duration-300 group-hover:rotate-3 group-hover:scale-110 ${iconBackgroundClassName}`}
        >
          <Icon
            aria-hidden="true"
            className={`h-5 w-5 ${iconClassName}`}
            strokeWidth={1.8}
          />
        </span>
      </div>
    </article>
  );
}

export default async function DeliveryPartnerApplicationsPage() {
  await getCurrentAdmin();

  const supabase =
    await createClient();

  const {
    data: applicationData,
    error: applicationError,
  } = await supabase
    .from(
      "delivery_partner_profiles"
    )
    .select(
      `
        user_id,
        application_status,
        availability_status,
        requested_service_areas,
        application_submitted_at,
        created_at,
        updated_at
      `
    )
    .in(
      "application_status",
      REVIEWABLE_STATUSES
    )
    .order(
      "application_submitted_at",
      {
        ascending: true,
        nullsFirst: false,
      }
    )
    .order(
      "created_at",
      {
        ascending: true,
      }
    );

  if (
    applicationError
  ) {
    console.error(
      "Loading delivery-partner applications failed:",
      {
        code:
          applicationError.code,

        message:
          applicationError.message,

        details:
          applicationError.details,

        hint:
          applicationError.hint,
      }
    );
  }

  const applications =
    (
      applicationData ??
      []
    ) as DeliveryPartnerApplicationRow[];

  const applicantUserIds =
    applications.map(
      (application) =>
        application.user_id
    );

  let applicants:
    ApplicantProfileRow[] =
      [];

  let vehicles:
    DeliveryPartnerVehicleRow[] =
      [];

  if (
    applicantUserIds.length >
    0
  ) {
    const [
      applicantResult,
      vehicleResult,
    ] = await Promise.all([
      supabase
        .from(
          "profiles"
        )
        .select(
          `
            id,
            email,
            full_name,
            phone,
            is_blocked
          `
        )
        .in(
          "id",
          applicantUserIds
        ),

      supabase
        .from(
          "delivery_partner_vehicles"
        )
        .select(
          `
            id,
            driver_user_id,
            vehicle_type,
            vehicle_status,
            registration_number,
            manufacturer,
            model,
            is_primary,
            created_at
          `
        )
        .in(
          "driver_user_id",
          applicantUserIds
        )
        .in(
          "vehicle_status",
          [
            "pending",
            "under_review",
          ]
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
        ),
    ]);

    if (
      applicantResult.error
    ) {
      console.error(
        "Loading delivery-partner applicant profiles failed:",
        {
          code:
            applicantResult.error
              .code,

          message:
            applicantResult.error
              .message,

          details:
            applicantResult.error
              .details,

          hint:
            applicantResult.error
              .hint,
        }
      );
    } else {
      applicants =
        (
          applicantResult.data ??
          []
        ) as ApplicantProfileRow[];
    }

    if (
      vehicleResult.error
    ) {
      console.error(
        "Loading submitted delivery-partner vehicles failed:",
        {
          code:
            vehicleResult.error
              .code,

          message:
            vehicleResult.error
              .message,

          details:
            vehicleResult.error
              .details,

          hint:
            vehicleResult.error
              .hint,
        }
      );
    } else {
      vehicles =
        (
          vehicleResult.data ??
          []
        ) as DeliveryPartnerVehicleRow[];
    }
  }

  const applicantById =
    new Map(
      applicants.map(
        (applicant) => [
          applicant.id,
          applicant,
        ]
      )
    );

  const vehicleByDriverId =
    new Map<
      string,
      DeliveryPartnerVehicleRow
    >();

  for (
    const vehicle
    of vehicles
  ) {
    if (
      !vehicleByDriverId.has(
        vehicle.driver_user_id
      )
    ) {
      vehicleByDriverId.set(
        vehicle.driver_user_id,
        vehicle
      );
    }
  }

  const queueItems:
    DeliveryPartnerQueueItem[] =
      applications.map(
        (application) => ({
          application,

          applicant:
            applicantById.get(
              application.user_id
            ) ?? null,

          vehicle:
            vehicleByDriverId.get(
              application.user_id
            ) ?? null,
        })
      );

  const pendingCount =
    applications.filter(
      (application) =>
        application.application_status ===
        "pending"
    ).length;

  const underReviewCount =
    applications.filter(
      (application) =>
        application.application_status ===
        "under_review"
    ).length;

  const blockedCount =
    queueItems.filter(
      (item) =>
        item.applicant
          ?.is_blocked ===
        true
    ).length;

  return (
    <>
      <style>{`
        @keyframes athimartAdminFadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .athimart-admin-enter {
          animation:
            athimartAdminFadeUp
            560ms
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            )
            both;
        }

        /*
         * Protect blue action controls from global
         * link styles that may apply a dark colour.
         */
        .athimart-blue-action,
        .athimart-blue-action:visited,
        .athimart-blue-action:hover,
        .athimart-blue-action:focus,
        .athimart-blue-action:active,
        .athimart-blue-action *,
        .athimart-blue-action:visited *,
        .athimart-blue-action:hover *,
        .athimart-blue-action:focus *,
        .athimart-blue-action:active * {
          color: #ffffff !important;
        }

        .athimart-blue-action svg,
        .athimart-blue-action:hover svg,
        .athimart-blue-action:focus svg,
        .athimart-blue-action:active svg {
          color: #ffffff !important;
          stroke: #ffffff !important;
        }

        @media (
          prefers-reduced-motion:
          reduce
        ) {
          .athimart-admin-enter {
            animation: none;
          }
        }
      `}</style>

      <div className="mx-auto w-full max-w-[1480px] space-y-10 pb-12">
        {/* Hero */}
        <section className="athimart-admin-enter relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#12347c_0%,#1749a8_55%,#2465d8_100%)] px-7 py-9 text-white shadow-[0_24px_70px_rgba(23,73,168,0.22)] sm:px-10 sm:py-11 lg:px-12 lg:py-12">
          <div
            aria-hidden="true"
            className="absolute -right-28 -top-36 h-[390px] w-[390px] rounded-full border border-white/10 bg-white/[0.055]"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-32 right-20 h-72 w-72 rounded-full bg-[var(--brand-orange)]/15 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute bottom-8 left-[45%] h-24 w-24 rounded-full border border-white/[0.07]"
          />

          <div className="relative grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-stretch">
            <div className="flex flex-col justify-center py-2">
              <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-50" />

                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-300" />
                </span>

                <span className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-white/85">
                  Delivery Operations
                </span>
              </div>

              <h1 className="mt-7 max-w-4xl font-[var(--font-display)] text-4xl font-light uppercase leading-[1.02] tracking-[0.025em] sm:text-5xl lg:text-[58px]">
                Delivery Partner

                <span className="mt-1 block text-white/62">
                  Review Centre
                </span>
              </h1>

              <p className="mt-6 max-w-2xl font-[var(--font-body)] text-sm leading-7 text-white/70">
                Review applicant identity,
                submitted vehicles, requested
                service areas and verification
                information before providing
                access to AthiMart delivery
                operations.
              </p>
            </div>

            <div className="flex min-h-[240px] flex-col justify-between rounded-[28px] border border-white/15 bg-white/10 p-7 shadow-[0_18px_45px_rgba(7,26,70,0.12)] backdrop-blur-md sm:p-8">
              <div className="flex items-start justify-between gap-5">
                <span className="flex h-13 w-13 items-center justify-center rounded-[18px] bg-white text-[var(--brand-blue)] shadow-[0_12px_28px_rgba(7,26,70,0.17)]">
                  <BadgeCheck
                    aria-hidden="true"
                    className="h-6 w-6"
                    strokeWidth={1.8}
                  />
                </span>

                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.15em] text-white/65">
                  Oldest First
                </span>
              </div>

              <div className="mt-9">
                <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55">
                  Awaiting Decisions
                </p>

                <div className="mt-3 flex items-end justify-between gap-6">
                  <p className="font-[var(--font-display)] text-6xl font-light leading-none">
                    {applications.length}
                  </p>

                  <p className="pb-1 font-[var(--font-body)] text-[10px] text-white/55">
                    application
                    {applications.length ===
                    1
                      ? ""
                      : "s"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Summary cards */}
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div
            className="athimart-admin-enter"
            style={{
              animationDelay:
                "70ms",
            }}
          >
            <SummaryCard
              label="Pending Review"
              value={pendingCount}
              helper="Waiting for an administrator"
              icon={Clock3}
              iconClassName="text-blue-700"
              iconBackgroundClassName="bg-blue-50"
            />
          </div>

          <div
            className="athimart-admin-enter"
            style={{
              animationDelay:
                "130ms",
            }}
          >
            <SummaryCard
              label="Under Review"
              value={
                underReviewCount
              }
              helper="Currently being inspected"
              icon={
                UserRoundCheck
              }
              iconClassName="text-amber-700"
              iconBackgroundClassName="bg-amber-50"
            />
          </div>

          <div
            className="athimart-admin-enter"
            style={{
              animationDelay:
                "190ms",
            }}
          >
            <SummaryCard
              label="Submitted Vehicles"
              value={
                vehicleByDriverId
                  .size
              }
              helper="Vehicles connected to requests"
              icon={Truck}
              iconClassName="text-orange-700"
              iconBackgroundClassName="bg-orange-50"
            />
          </div>

          <div
            className="athimart-admin-enter"
            style={{
              animationDelay:
                "250ms",
            }}
          >
            <SummaryCard
              label="Blocked Accounts"
              value={blockedCount}
              helper={
                blockedCount >
                0
                  ? "Requires administrator attention"
                  : "No restricted applicants"
              }
              icon={
                ShieldCheck
              }
              iconClassName={
                blockedCount >
                0
                  ? "text-red-700"
                  : "text-emerald-700"
              }
              iconBackgroundClassName={
                blockedCount >
                0
                  ? "bg-red-50"
                  : "bg-emerald-50"
              }
            />
          </div>
        </section>

        {/* Queue heading */}
        <section className="athimart-admin-enter flex flex-col justify-between gap-6 px-1 pt-3 sm:flex-row sm:items-end">
          <div>
            <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-orange-dark)]">
              Application Queue
            </p>

            <h2 className="mt-3 font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.035em] text-slate-900 sm:text-4xl">
              Awaiting Review
            </h2>

            <p className="mt-3 max-w-2xl font-[var(--font-body)] text-xs leading-6 text-slate-500">
              Applications are arranged according
              to submission time, with the oldest
              application displayed first.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--brand-blue)] opacity-25" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--brand-blue)]" />
            </span>

            <span className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              {queueItems.length} in queue
            </span>
          </div>
        </section>

        {/* Error state */}
        {applicationError && (
          <section className="rounded-[26px] border border-red-200 bg-red-50 p-7 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-red-100 text-red-700">
                <ShieldCheck
                  aria-hidden="true"
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />
              </span>

              <div>
                <p className="font-[var(--font-body)] text-sm font-semibold text-red-700">
                  Applications could not be loaded
                </p>

                <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-red-700/70">
                  Check the server console for the
                  complete Supabase error
                  information.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Empty state */}
        {!applicationError &&
          queueItems.length ===
            0 && (
            <section className="athimart-admin-enter relative overflow-hidden rounded-[32px] border border-slate-200 bg-white px-7 py-24 text-center shadow-[0_16px_50px_rgba(15,23,42,0.055)]">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-50 blur-3xl"
              />

              <div className="relative">
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-[var(--brand-blue-soft)] text-[var(--brand-blue)] shadow-[0_16px_35px_rgba(23,73,168,0.14)]">
                  <UserRoundCheck
                    aria-hidden="true"
                    className="h-9 w-9"
                    strokeWidth={1.6}
                  />
                </span>

                <h2 className="mt-8 font-[var(--font-display)] text-4xl font-light uppercase tracking-[0.04em] text-slate-900">
                  Queue Is Clear
                </h2>

                <p className="mx-auto mt-5 max-w-xl font-[var(--font-body)] text-sm leading-7 text-slate-500">
                  New delivery-partner
                  applications will appear here
                  after applicants submit their
                  registration and required
                  documents.
                </p>
              </div>
            </section>
          )}

        {/* Application cards */}
        {queueItems.length >
          0 && (
          <section className="space-y-7">
            {queueItems.map(
              (
                {
                  application,
                  applicant,
                  vehicle,
                },
                index
              ) => {
                const status =
                  getStatusStyles(
                    application.application_status
                  );

                const serviceAreas =
                  application.requested_service_areas ??
                  [];

                return (
                  <article
                    key={
                      application.user_id
                    }
                    className="athimart-admin-enter group relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.055)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_26px_65px_rgba(15,23,42,0.11)] motion-reduce:hover:translate-y-0"
                    style={{
                      animationDelay:
                        `${
                          300 +
                          index *
                            80
                        }ms`,
                    }}
                  >
                    <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[var(--brand-blue)] to-blue-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="grid 2xl:grid-cols-[minmax(0,1fr)_380px]">
                      {/* Main application information */}
                      <div className="p-6 sm:p-8 lg:p-10">
                        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
                          <div className="flex min-w-0 items-start gap-5">
                            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-[linear-gradient(145deg,#edf4ff,#dce9ff)] font-[var(--font-body)] text-base font-bold text-[var(--brand-blue)] shadow-[0_12px_30px_rgba(23,73,168,0.14)] transition-transform duration-300 group-hover:-rotate-2 group-hover:scale-105">
                              {getApplicantInitials(
                                applicant
                              )}
                            </span>

                            <div className="min-w-0 pt-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="font-[var(--font-display)] text-3xl font-light uppercase leading-tight tracking-[0.035em] text-slate-900 sm:text-4xl">
                                  {getApplicantName(
                                    applicant
                                  )}
                                </h3>

                                <span
                                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] ${status.badge}`}
                                >
                                  <span className="relative flex h-2 w-2">
                                    <span
                                      className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-35 ${status.dot}`}
                                    />

                                    <span
                                      className={`relative inline-flex h-2 w-2 rounded-full ${status.dot}`}
                                    />
                                  </span>

                                  {
                                    status.label
                                  }
                                </span>

                                {applicant?.is_blocked && (
                                  <span className="rounded-full border border-red-200 bg-red-50 px-3.5 py-2 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] text-red-700">
                                    Blocked
                                  </span>
                                )}
                              </div>

                              <div className="mt-4 flex flex-col gap-2 font-[var(--font-body)] text-[11px] text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-6">
                                <span className="break-all">
                                  {applicant?.email ??
                                    "Email unavailable"}
                                </span>

                                <span>
                                  {applicant?.phone ??
                                    "Phone unavailable"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="w-fit shrink-0 rounded-[18px] border border-slate-100 bg-slate-50 px-5 py-4 lg:text-right">
                            <p className="font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                              Submitted
                            </p>

                            <p className="mt-2 font-[var(--font-body)] text-[11px] font-semibold text-slate-700">
                              {formatDate(
                                application.application_submitted_at
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-9 grid gap-5 lg:grid-cols-2">
                          {/* Vehicle */}
                          <div className="group/detail min-h-[150px] rounded-[24px] border border-slate-200 bg-slate-50/70 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/60 hover:shadow-[0_12px_30px_rgba(23,73,168,0.07)]">
                            <div className="flex items-start gap-4">
                              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-white text-[var(--brand-blue)] shadow-[0_7px_18px_rgba(15,23,42,0.08)] transition-transform duration-300 group-hover/detail:scale-110">
                                <Truck
                                  aria-hidden="true"
                                  className="h-5 w-5"
                                  strokeWidth={1.8}
                                />
                              </span>

                              <div className="min-w-0 pt-1">
                                <p className="font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.17em] text-slate-400">
                                  Submitted Vehicle
                                </p>

                                <p className="mt-3 font-[var(--font-body)] text-sm font-semibold text-slate-800">
                                  {getVehicleTitle(
                                    vehicle
                                  )}
                                </p>

                                <p className="mt-2 font-[var(--font-body)] text-[11px] text-slate-500">
                                  {vehicle?.registration_number ??
                                    "Registration unavailable"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Requested service areas */}
                          <div className="group/detail min-h-[150px] rounded-[24px] border border-slate-200 bg-slate-50/70 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/60 hover:shadow-[0_12px_30px_rgba(234,88,12,0.07)]">
                            <div className="flex items-start gap-4">
                              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-white text-[var(--brand-orange-dark)] shadow-[0_7px_18px_rgba(15,23,42,0.08)] transition-transform duration-300 group-hover/detail:scale-110">
                                <MapPin
                                  aria-hidden="true"
                                  className="h-5 w-5"
                                  strokeWidth={1.8}
                                />
                              </span>

                              <div className="min-w-0 flex-1 pt-1">
                                <p className="font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.17em] text-slate-400">
                                  Requested Areas
                                </p>

                                {serviceAreas.length >
                                0 ? (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {serviceAreas
                                      .slice(
                                        0,
                                        4
                                      )
                                      .map(
                                        (
                                          area
                                        ) => (
                                          <span
                                            key={
                                              area
                                            }
                                            className="rounded-full border border-orange-200 bg-white px-3 py-1.5 font-[var(--font-body)] text-[9px] font-medium text-orange-700"
                                          >
                                            {
                                              area
                                            }
                                          </span>
                                        )
                                      )}

                                    {serviceAreas.length >
                                      4 && (
                                      <span className="rounded-full bg-slate-200 px-3 py-1.5 font-[var(--font-body)] text-[9px] font-medium text-slate-600">
                                        +
                                        {serviceAreas.length -
                                          4}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <p className="mt-3 font-[var(--font-body)] text-[11px] text-slate-500">
                                    No areas recorded
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Review action panel */}
                      <div className="relative flex min-h-[350px] flex-col justify-between border-t border-slate-200 bg-[linear-gradient(145deg,#f8fafc_0%,#eef4ff_100%)] p-7 sm:p-9 2xl:border-l 2xl:border-t-0">
                        <div
                          aria-hidden="true"
                          className="absolute right-0 top-0 h-36 w-36 rounded-bl-full bg-blue-50/80"
                        />

                        <div
                          aria-hidden="true"
                          className="absolute bottom-10 right-10 h-20 w-20 rounded-full bg-white/55 blur-xl"
                        />

                        <div className="relative">
                          <span className="flex h-13 w-13 items-center justify-center rounded-[18px] bg-white text-[var(--brand-blue)] shadow-[0_10px_25px_rgba(15,23,42,0.09)] transition-transform duration-300 group-hover:scale-105">
                            <ShieldCheck
                              aria-hidden="true"
                              className="h-5 w-5"
                              strokeWidth={1.8}
                            />
                          </span>

                          <p className="mt-7 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Review Required
                          </p>

                          <h4 className="mt-3 font-[var(--font-display)] text-3xl font-light uppercase leading-tight tracking-[0.035em] text-slate-900">
                            Verify Application
                          </h4>

                          <p className="mt-4 max-w-sm font-[var(--font-body)] text-[12px] leading-7 text-slate-500">
                            Check identity documents,
                            driving-licence details,
                            vehicle capacity and
                            requested service areas
                            before making an
                            administrator decision.
                          </p>
                        </div>

                        <Link
                          href={`/admin/delivery-partners/${application.user_id}`}
                          aria-label={`Open ${getApplicantName(
                            applicant
                          )} delivery-partner application`}
                          style={{
                            color:
                              "#ffffff",
                          }}
                          className="athimart-blue-action group/button relative mt-9 flex min-h-[58px] items-center justify-between overflow-hidden rounded-[18px] bg-[var(--brand-blue)] px-6 text-white shadow-[0_14px_32px_rgba(23,73,168,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] hover:text-white hover:shadow-[0_20px_42px_rgba(23,73,168,0.33)]"
                        >
                          <span
                            style={{
                              color:
                                "#ffffff",
                            }}
                            className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.17em] text-white"
                          >
                            Open Application
                          </span>

                          <span
                            style={{
                              color:
                                "#ffffff",
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-white/15 text-white transition-all duration-300 group-hover/button:translate-x-1 group-hover/button:bg-white/25"
                          >
                            <ArrowRight
                              aria-hidden="true"
                              style={{
                                color:
                                  "#ffffff",
                                stroke:
                                  "#ffffff",
                              }}
                              className="h-4 w-4 text-white"
                              strokeWidth={1.9}
                            />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </section>
        )}
      </div>
    </>
  );
}
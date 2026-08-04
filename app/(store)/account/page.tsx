// app/(store)/account/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  CircleDot,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  LogOut,
  Mail,
  Phone,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
} from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "My Account",

  description:
    "View and manage your AthiMart customer, seller, delivery-partner or administrator account.",

  robots: {
    index: false,
    follow: true,
  },
};

export const dynamic =
  "force-dynamic";

interface AccountPageProps {
  searchParams: Promise<{
    error?:
      | string
      | string[];
  }>;
}

interface ProfileRow {
  id: string;

  email:
    | string
    | null;

  full_name:
    | string
    | null;

  phone:
    | string
    | null;

  role:
    | string
    | null;

  seller_approval_status:
    | string
    | null;

  is_blocked:
    | boolean
    | null;

  created_at:
    | string
    | null;
}

interface UserRoleRow {
  role:
    | string
    | null;
}

interface DeliveryPartnerProfileRow {
  user_id: string;

  application_status:
    | string
    | null;

  availability_status:
    | string
    | null;

  requested_service_areas:
    | string[]
    | null;

  approved_service_areas:
    | string[]
    | null;

  approved_service_radius_km:
    | number
    | string
    | null;

  application_submitted_at:
    | string
    | null;

  reviewed_at:
    | string
    | null;

  rejection_reason:
    | string
    | null;

  suspension_reason:
    | string
    | null;
}

type DeliveryApplicationStatus =
  | "draft"
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "suspended";

type DeliveryAvailabilityStatus =
  | "offline"
  | "online"
  | "offered"
  | "busy";

interface DeliveryNavigation {
  href: string;
  label: string;
  description: string;
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

function getDisplayName(
  profileName: unknown,
  metadataName: unknown,
  email: string
): string {
  const storedProfileName =
    getText(
      profileName
    );

  if (storedProfileName) {
    return storedProfileName;
  }

  const storedMetadataName =
    getText(
      metadataName
    );

  if (storedMetadataName) {
    return storedMetadataName;
  }

  const emailName =
    email
      .split("@")[0]
      ?.trim();

  return (
    emailName ||
    "AthiMart User"
  );
}

function getInitials(
  displayName: string
): string {
  const nameParts =
    displayName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    nameParts.length === 0
  ) {
    return "AM";
  }

  if (
    nameParts.length === 1
  ) {
    return nameParts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  const firstName =
    nameParts[0] ?? "";

  const lastName =
    nameParts.at(-1) ?? "";

  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(date);
}

function formatStatus(
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
    return "Not available";
  }

  return normalizedValue.replace(
    /\b\w/g,
    (character) =>
      character.toUpperCase()
  );
}

function normalizeDeliveryApplicationStatus(
  value: unknown
): DeliveryApplicationStatus | null {
  const status =
    getText(
      value
    ).toLowerCase();

  if (
    status === "draft" ||
    status === "pending" ||
    status === "under_review" ||
    status === "approved" ||
    status === "rejected" ||
    status === "suspended"
  ) {
    return status;
  }

  return null;
}

function normalizeDeliveryAvailabilityStatus(
  value: unknown
): DeliveryAvailabilityStatus {
  const status =
    getText(
      value
    ).toLowerCase();

  if (
    status === "online" ||
    status === "offered" ||
    status === "busy"
  ) {
    return status;
  }

  return "offline";
}

function getDeliveryNavigation(
  status:
    | DeliveryApplicationStatus
    | null
): DeliveryNavigation {
  switch (status) {
    case "draft":
      return {
        href:
          "/delivery-partner/register",

        label:
          "Continue Delivery Registration",

        description:
          "Your delivery-partner registration is still incomplete. Continue entering your personal, vehicle and document details.",
      };

    case "pending":
    case "under_review":
      return {
        href:
          "/delivery-partner",

        label:
          "View Application Status",

        description:
          "Your delivery-partner application has been submitted and is waiting for administrator review.",
      };

    case "approved":
      return {
        href:
          "/delivery-partner/dashboard",

        label:
          "Open Driver Dashboard",

        description:
          "Manage your availability, location sharing, approved vehicle and delivery activity.",
      };

    case "rejected":
      return {
        href:
          "/delivery-partner/register",

        label:
          "Update Delivery Application",

        description:
          "Your application needs changes. Review the rejection information and update your registration details.",
      };

    case "suspended":
      return {
        href:
          "/delivery-partner",

        label:
          "View Delivery Status",

        description:
          "Your delivery-partner access is currently suspended. Open the status page for more information.",
      };

    default:
      return {
        href:
          "/delivery-partner",

        label:
          "Become a Delivery Partner",

        description:
          "Register to deliver AthiMart orders using an approved vehicle and service area.",
      };
  }
}

function getDeliveryStatusClasses(
  status:
    | DeliveryApplicationStatus
    | null
): string {
  switch (status) {
    case "approved":
      return "border-green-200 bg-green-50 text-green-800";

    case "pending":
    case "under_review":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "rejected":
      return "border-red-200 bg-red-50 text-red-800";

    case "suspended":
      return "border-red-300 bg-red-50 text-red-900";

    case "draft":
      return "border-blue-200 bg-blue-50 text-blue-800";

    default:
      return "border-[var(--border)] bg-neutral-50 text-neutral-700";
  }
}

function getAvailabilityClasses(
  status: DeliveryAvailabilityStatus
): string {
  switch (status) {
    case "online":
      return "bg-green-50 text-green-700";

    case "offered":
      return "bg-amber-50 text-amber-700";

    case "busy":
      return "bg-blue-50 text-blue-700";

    case "offline":
    default:
      return "bg-neutral-100 text-neutral-600";
  }
}

export default async function AccountPage({
  searchParams,
}: Readonly<AccountPageProps>) {
  const resolvedSearchParams =
    await searchParams;

  const pageError =
    getFirstValue(
      resolvedSearchParams.error
    );

  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    redirect(
      "/auth/login?next=%2Faccount"
    );
  }

  const [
    profileResult,
    userRoleResult,
    deliveryPartnerResult,
  ] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          `
            id,
            email,
            full_name,
            phone,
            role,
            seller_approval_status,
            is_blocked,
            created_at
          `
        )
        .eq(
          "id",
          user.id
        )
        .maybeSingle(),

      supabase
        .from("user_roles")
        .select(
          "role"
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle(),

      supabase
        .from(
          "delivery_partner_profiles"
        )
        .select(
          `
            user_id,
            application_status,
            availability_status,
            requested_service_areas,
            approved_service_areas,
            approved_service_radius_km,
            application_submitted_at,
            reviewed_at,
            rejection_reason,
            suspension_reason
          `
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle(),
    ]);

  if (
    profileResult.error
  ) {
    throw new Error(
      `Unable to load the AthiMart account profile: ${profileResult.error.message}`
    );
  }

  if (
    userRoleResult.error
  ) {
    throw new Error(
      `Unable to load the AthiMart account role: ${userRoleResult.error.message}`
    );
  }

  if (
    deliveryPartnerResult.error
  ) {
    throw new Error(
      `Unable to load the delivery-partner status: ${deliveryPartnerResult.error.message}`
    );
  }

  const profile =
    profileResult.data as
      | ProfileRow
      | null;

  const roleRecord =
    userRoleResult.data as
      | UserRoleRow
      | null;

  const deliveryPartner =
    deliveryPartnerResult.data as
      | DeliveryPartnerProfileRow
      | null;

  if (
    profile?.is_blocked ===
    true
  ) {
    redirect(
      "/account-blocked"
    );
  }

  const email =
    getText(
      profile?.email
    ) ||
    user.email ||
    "";

  const displayName =
    getDisplayName(
      profile?.full_name,
      user.user_metadata
        ?.full_name,
      email
    );

  const phone =
    getText(
      profile?.phone
    ) ||
    "Not provided";

  const initials =
    getInitials(
      displayName
    );

  const joinedDate =
    formatDate(
      profile?.created_at ??
        user.created_at ??
        null
    );

  const profileRole =
    getText(
      profile?.role
    ).toLowerCase();

  const sellerApprovalStatus =
    getText(
      profile
        ?.seller_approval_status
    ).toLowerCase();

  const userRole =
    getText(
      roleRecord?.role
    ).toLowerCase();

  const isAdministrator =
    userRole === "admin";

  const isSellerRole =
    profileRole === "seller" ||
    profileRole === "vendor";

  const isApprovedSeller =
    isSellerRole &&
    sellerApprovalStatus ===
      "approved";

  const isPendingSeller =
    sellerApprovalStatus ===
      "pending";

  const isRejectedSeller =
    sellerApprovalStatus ===
      "rejected";

  const deliveryApplicationStatus =
    normalizeDeliveryApplicationStatus(
      deliveryPartner
        ?.application_status
    );

  const deliveryAvailabilityStatus =
    normalizeDeliveryAvailabilityStatus(
      deliveryPartner
        ?.availability_status
    );

  const isApprovedDeliveryPartner =
    deliveryApplicationStatus ===
    "approved";

  const hasDeliveryApplication =
    deliveryApplicationStatus !==
    null;

  const deliveryNavigation =
    getDeliveryNavigation(
      deliveryApplicationStatus
    );

  const approvedServiceAreas =
    Array.isArray(
      deliveryPartner
        ?.approved_service_areas
    )
      ? deliveryPartner
          .approved_service_areas
          .filter(
            (
              area
            ): area is string =>
              typeof area ===
                "string" &&
              area.trim().length > 0
          )
      : [];

  const requestedServiceAreas =
    Array.isArray(
      deliveryPartner
        ?.requested_service_areas
    )
      ? deliveryPartner
          .requested_service_areas
          .filter(
            (
              area
            ): area is string =>
              typeof area ===
                "string" &&
              area.trim().length > 0
          )
      : [];

  const accountRoleLabels = [
    "AthiMart Customer",

    isApprovedSeller
      ? "Approved Seller"
      : null,

    isApprovedDeliveryPartner
      ? "Approved Delivery Partner"
      : hasDeliveryApplication
        ? "Delivery Partner Applicant"
        : null,

    isAdministrator
      ? "Administrator"
      : null,
  ].filter(
    (
      value
    ): value is string =>
      value !== null
  );

  const accountCardLabel =
    isAdministrator
      ? "AthiMart Administrator"
      : isApprovedSeller &&
          isApprovedDeliveryPartner
        ? "Seller and Delivery Partner"
        : isApprovedSeller
          ? "AthiMart Seller"
          : isApprovedDeliveryPartner
            ? "AthiMart Delivery Partner"
            : hasDeliveryApplication
              ? "Delivery Partner Applicant"
              : "AthiMart Customer";

  return (
    <main className="athimart-container py-10 sm:py-14 lg:py-20">
      {/* Page heading */}
      <header className="border-b border-[var(--border-strong)] pb-8 sm:pb-10">
        <p className="athimart-label text-[var(--brand-orange-dark)]">
          Connected AthiMart account
        </p>

        <h1 className="athimart-display-large mt-4 text-[var(--brand-blue-dark)]">
          My
          <br />

          <span className="text-[var(--brand-orange)]">
            Account
          </span>
        </h1>

        <p className="athimart-body-large mt-5 max-w-3xl">
          View your profile and open
          the marketplace tools connected
          to your customer, seller,
          delivery-partner or administrator
          account.
        </p>
      </header>

      {pageError ===
        "signout-failed" && (
        <div
          role="alert"
          className="mt-7 flex items-start gap-3 border-l-4 border-red-600 bg-red-50 p-4 text-red-800"
        >
          <AlertCircle
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0"
            strokeWidth={1.8}
          />

          <p className="font-[var(--font-body)] text-sm leading-6">
            Your account could not be
            signed out. Please try again.
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.28fr)]">
        {/* Account navigation card */}
        <aside className="overflow-hidden border border-[var(--border)] bg-white shadow-[0_20px_55px_rgba(17,42,91,0.07)]">
          <div className="bg-[linear-gradient(145deg,#163d91_0%,#2f68d2_100%)] p-8 text-white">
            <span className="flex h-24 w-24 items-center justify-center border border-white/25 bg-white/10 font-[var(--font-display)] text-4xl font-light">
              {initials}
            </span>

            <p className="mt-5 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-orange-light)]">
              {accountCardLabel}
            </p>

            <h2 className="mt-2 break-words font-[var(--font-display)] text-4xl font-light">
              {displayName}
            </h2>

            <p className="mt-1 break-all font-[var(--font-body)] text-sm text-white/80">
              {email}
            </p>

            {isApprovedDeliveryPartner && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em]">
                <CircleDot
                  aria-hidden="true"
                  className={
                    deliveryAvailabilityStatus ===
                    "online"
                      ? "h-4 w-4 text-green-300"
                      : "h-4 w-4 text-white/70"
                  }
                  strokeWidth={1.8}
                />

                Driver{" "}
                {formatStatus(
                  deliveryAvailabilityStatus
                )}
              </div>
            )}
          </div>

          <div className="p-7">
            <div className="flex items-center gap-3 text-[var(--success)]">
              <ShieldCheck
                aria-hidden="true"
                className="h-5 w-5"
                strokeWidth={1.8}
              />

              <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em]">
                Authenticated account
              </p>
            </div>

            <div className="mt-7 space-y-3">
              {/* Administrator navigation */}
              {isAdministrator && (
                <Link
                  href="/admin"
                  className="flex min-h-14 w-full items-center justify-center gap-3 bg-[var(--brand-orange)] px-5 text-center font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] !text-white transition-colors hover:bg-[var(--brand-orange-dark)] hover:!text-white [&_svg]:!text-white"
                >
                  <LayoutDashboard
                    aria-hidden="true"
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />

                  Open Admin Dashboard
                </Link>
              )}

              {/* Seller navigation */}
              {isApprovedSeller && (
                <Link
                  href="/seller"
                  className="flex min-h-14 w-full items-center justify-center gap-3 bg-[var(--brand-blue-dark)] px-5 text-center font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] !text-white transition-colors hover:bg-[var(--brand-blue)] hover:!text-white [&_svg]:!text-white"
                >
                  <Store
                    aria-hidden="true"
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />

                  Open Seller Dashboard
                </Link>
              )}

              {/* Delivery-partner navigation */}
              <Link
                href={
                  deliveryNavigation.href
                }
                className={`flex min-h-14 w-full items-center justify-center gap-3 px-5 text-center font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                  isApprovedDeliveryPartner
                    ? "bg-[var(--success)] !text-white hover:bg-green-700 hover:!text-white [&_svg]:!text-white"
                    : hasDeliveryApplication
                      ? "bg-[var(--brand-orange)] !text-white hover:bg-[var(--brand-orange-dark)] hover:!text-white [&_svg]:!text-white"
                      : "border border-[var(--brand-blue)] bg-white text-[var(--brand-blue)] hover:bg-[var(--brand-blue-soft)]"
                }`}
              >
                {isApprovedDeliveryPartner ? (
                  <LayoutDashboard
                    aria-hidden="true"
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />
                ) : hasDeliveryApplication ? (
                  <ClipboardList
                    aria-hidden="true"
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />
                ) : (
                  <Truck
                    aria-hidden="true"
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />
                )}

                {
                  deliveryNavigation.label
                }
              </Link>

              <Link
                href="/shop"
                className="flex min-h-14 w-full items-center justify-center gap-3 bg-[var(--brand-blue)] px-5 text-center font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] !text-white transition-colors hover:bg-[var(--brand-blue-dark)] hover:!text-white [&_svg]:!text-white"
              >
                <ShoppingBag
                  aria-hidden="true"
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />

                Continue Shopping
              </Link>

              <form
                action={signOut}
              >
                <button
                  type="submit"
                  className="flex min-h-14 w-full items-center justify-center gap-3 border border-red-500 bg-white px-5 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut
                    aria-hidden="true"
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />

                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </aside>

        <div className="space-y-8">
          {/* Main account information */}
          <section className="border border-[var(--border)] bg-white p-6 shadow-[0_20px_55px_rgba(17,42,91,0.06)] sm:p-8 lg:p-10">
            <div className="flex items-start justify-between gap-5 border-b border-[var(--border)] pb-7">
              <div>
                <p className="athimart-label text-[var(--brand-orange-dark)]">
                  Profile details
                </p>

                <h2 className="mt-3 font-[var(--font-display)] text-4xl font-light uppercase tracking-[0.03em] text-[var(--text)] sm:text-5xl">
                  Account
                  <br />
                  Information
                </h2>
              </div>

              <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
                <UserRound
                  aria-hidden="true"
                  className="h-7 w-7"
                  strokeWidth={1.8}
                />
              </span>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <article className="border border-[var(--border)] bg-[var(--linen-light)] p-5">
                <UserRound
                  aria-hidden="true"
                  className="h-5 w-5 text-[var(--brand-blue)]"
                  strokeWidth={1.8}
                />

                <p className="athimart-label mt-4 text-[var(--text-muted)]">
                  Full name
                </p>

                <p className="mt-2 break-words font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                  {displayName}
                </p>
              </article>

              <article className="border border-[var(--border)] bg-[var(--linen-light)] p-5">
                <Mail
                  aria-hidden="true"
                  className="h-5 w-5 text-[var(--brand-blue)]"
                  strokeWidth={1.8}
                />

                <p className="athimart-label mt-4 text-[var(--text-muted)]">
                  Email address
                </p>

                <p className="mt-2 break-all font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                  {email}
                </p>
              </article>

              <article className="border border-[var(--border)] bg-[var(--linen-light)] p-5">
                <Phone
                  aria-hidden="true"
                  className="h-5 w-5 text-[var(--brand-blue)]"
                  strokeWidth={1.8}
                />

                <p className="athimart-label mt-4 text-[var(--text-muted)]">
                  Phone number
                </p>

                <p className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                  {phone}
                </p>
              </article>

              <article className="border border-[var(--border)] bg-[var(--linen-light)] p-5">
                <CalendarDays
                  aria-hidden="true"
                  className="h-5 w-5 text-[var(--brand-blue)]"
                  strokeWidth={1.8}
                />

                <p className="athimart-label mt-4 text-[var(--text-muted)]">
                  Member since
                </p>

                <p className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                  {joinedDate}
                </p>
              </article>
            </div>

            {/* Connected marketplace roles */}
            <div className="mt-6 border-l-4 border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] p-5">
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Connected marketplace roles
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {accountRoleLabels.map(
                  (roleLabel) => (
                    <span
                      key={roleLabel}
                      className="inline-flex items-center gap-2 border border-[var(--border)] bg-white px-4 py-3 font-[var(--font-body)] text-xs font-semibold text-[var(--brand-blue-dark)]"
                    >
                      {roleLabel ===
                      "Administrator" ? (
                        <ShieldCheck
                          aria-hidden="true"
                          className="h-4 w-4 text-[var(--brand-orange)]"
                          strokeWidth={1.8}
                        />
                      ) : roleLabel.includes(
                          "Seller"
                        ) ? (
                        <Store
                          aria-hidden="true"
                          className="h-4 w-4 text-[var(--success)]"
                          strokeWidth={1.8}
                        />
                      ) : roleLabel.includes(
                          "Delivery"
                        ) ? (
                        <Truck
                          aria-hidden="true"
                          className="h-4 w-4 text-[var(--brand-blue)]"
                          strokeWidth={1.8}
                        />
                      ) : (
                        <ShieldCheck
                          aria-hidden="true"
                          className="h-4 w-4 text-[var(--brand-blue)]"
                          strokeWidth={1.8}
                        />
                      )}

                      {roleLabel}
                    </span>
                  )
                )}
              </div>
            </div>

            {(isPendingSeller ||
              isRejectedSeller) && (
              <div
                className={`mt-5 border-l-4 p-5 ${
                  isPendingSeller
                    ? "border-amber-500 bg-amber-50"
                    : "border-red-500 bg-red-50"
                }`}
              >
                <p className="athimart-label text-[var(--text-muted)]">
                  Seller application
                </p>

                <p className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                  {isPendingSeller
                    ? "Your seller application is pending review."
                    : "Your seller application was not approved."}
                </p>

                <Link
                  href="/seller-pending"
                  className="mt-4 inline-flex min-h-10 items-center gap-2 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-blue)]"
                >
                  <Store
                    aria-hidden="true"
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />

                  View Seller Status
                </Link>
              </div>
            )}
          </section>

          {/* Delivery-partner status and navigation */}
          <section className="border border-[var(--border)] bg-white p-6 shadow-[0_20px_55px_rgba(17,42,91,0.06)] sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center ${
                    isApprovedDeliveryPartner
                      ? "bg-green-50 text-green-700"
                      : hasDeliveryApplication
                        ? "bg-[var(--brand-orange-soft)] text-[var(--brand-orange-dark)]"
                        : "bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]"
                  }`}
                >
                  {deliveryApplicationStatus ===
                  "suspended" ? (
                    <ShieldAlert
                      aria-hidden="true"
                      className="h-7 w-7"
                      strokeWidth={1.8}
                    />
                  ) : deliveryApplicationStatus ===
                      "pending" ||
                    deliveryApplicationStatus ===
                      "under_review" ? (
                    <Clock3
                      aria-hidden="true"
                      className="h-7 w-7"
                      strokeWidth={1.8}
                    />
                  ) : isApprovedDeliveryPartner ? (
                    <BadgeCheck
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

                <div>
                  <p className="athimart-label text-[var(--brand-orange-dark)]">
                    Delivery partner
                  </p>

                  <h2 className="mt-2 font-[var(--font-display)] text-3xl font-light text-[var(--brand-blue-dark)]">
                    {isApprovedDeliveryPartner
                      ? "Driver Account"
                      : hasDeliveryApplication
                        ? "Application Status"
                        : "Delivery Opportunities"}
                  </h2>

                  <p className="mt-3 max-w-2xl font-[var(--font-body)] text-sm leading-7 text-[var(--text-muted)]">
                    {
                      deliveryNavigation.description
                    }
                  </p>
                </div>
              </div>

              <Link
                href={
                  deliveryNavigation.href
                }
                className={`inline-flex min-h-12 shrink-0 items-center justify-center gap-3 px-6 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                  isApprovedDeliveryPartner
                    ? "bg-[var(--success)] !text-white hover:bg-green-700 hover:!text-white [&_svg]:!text-white"
                    : "bg-[var(--brand-blue)] !text-white hover:bg-[var(--brand-blue-dark)] hover:!text-white [&_svg]:!text-white"
                }`}
              >
                {isApprovedDeliveryPartner ? (
                  <LayoutDashboard
                    aria-hidden="true"
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />
                ) : (
                  <Truck
                    aria-hidden="true"
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />
                )}

                {
                  deliveryNavigation.label
                }
              </Link>
            </div>

            {hasDeliveryApplication && (
              <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article
                  className={`border p-5 ${getDeliveryStatusClasses(
                    deliveryApplicationStatus
                  )}`}
                >
                  <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.16em] opacity-70">
                    Application
                  </p>

                  <p className="mt-2 font-[var(--font-display)] text-2xl font-light">
                    {formatStatus(
                      deliveryApplicationStatus ??
                        "unknown"
                    )}
                  </p>
                </article>

                <article className="border border-[var(--border)] bg-[var(--linen-light)] p-5">
                  <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Availability
                  </p>

                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] ${getAvailabilityClasses(
                        deliveryAvailabilityStatus
                      )}`}
                    >
                      <CircleDot
                        aria-hidden="true"
                        className="h-4 w-4"
                        strokeWidth={1.8}
                      />

                      {formatStatus(
                        deliveryAvailabilityStatus
                      )}
                    </span>
                  </div>
                </article>

                <article className="border border-[var(--border)] bg-[var(--linen-light)] p-5">
                  <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Service areas
                  </p>

                  <p className="mt-2 font-[var(--font-display)] text-2xl font-light text-[var(--brand-blue-dark)]">
                    {approvedServiceAreas.length >
                    0
                      ? approvedServiceAreas.length
                      : requestedServiceAreas.length}
                  </p>

                  <p className="mt-1 font-[var(--font-body)] text-xs text-[var(--text-muted)]">
                    {approvedServiceAreas.length >
                    0
                      ? "Approved"
                      : "Requested"}
                  </p>
                </article>

                <article className="border border-[var(--border)] bg-[var(--linen-light)] p-5">
                  <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Review date
                  </p>

                  <p className="mt-2 font-[var(--font-body)] text-sm font-semibold leading-6 text-[var(--text)]">
                    {deliveryPartner
                      ?.reviewed_at
                      ? formatDate(
                          deliveryPartner.reviewed_at
                        )
                      : deliveryPartner
                            ?.application_submitted_at
                        ? `Submitted ${formatDate(
                            deliveryPartner.application_submitted_at
                          )}`
                        : "Not submitted"}
                  </p>
                </article>
              </div>
            )}

            {deliveryApplicationStatus ===
              "rejected" &&
              deliveryPartner
                ?.rejection_reason && (
                <div className="mt-5 border-l-4 border-red-600 bg-red-50 p-5">
                  <p className="athimart-label text-red-700">
                    Rejection reason
                  </p>

                  <p className="mt-2 font-[var(--font-body)] text-sm leading-7 text-red-900">
                    {
                      deliveryPartner.rejection_reason
                    }
                  </p>
                </div>
              )}

            {deliveryApplicationStatus ===
              "suspended" &&
              deliveryPartner
                ?.suspension_reason && (
                <div className="mt-5 border-l-4 border-red-700 bg-red-50 p-5">
                  <p className="athimart-label text-red-800">
                    Suspension reason
                  </p>

                  <p className="mt-2 font-[var(--font-body)] text-sm leading-7 text-red-950">
                    {
                      deliveryPartner.suspension_reason
                    }
                  </p>
                </div>
              )}
          </section>
        </div>
      </div>
    </main>
  );
}
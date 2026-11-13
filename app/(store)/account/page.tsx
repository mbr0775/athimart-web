// app/(store)/account/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
} from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import DeliveryDetailsForm from "@/components/account/delivery-details-form";
import ProfileIdentityForm from "@/components/account/profile-identity-form";
import ProfileAvatar from "@/components/account/profile-avatar";
import { profileIdentity, googleAvatarUrl } from "@/lib/account/profile-identity";
import { deliveryDetailsFromProfile } from "@/lib/account/delivery-details";
import { editorialFont } from "@/lib/fonts";
import styles from "./account.module.css";

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

interface ProfileRow extends Record<string, unknown> {
  id: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;

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
        .select("*")
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

  const { name: displayName, avatarUrl } = profileIdentity(user, profile);

  const phone =
    getText(
      profile?.phone
    ) ||
    "Not provided";

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

  const DeliveryIcon = deliveryApplicationStatus === "suspended" ? ShieldAlert
    : deliveryApplicationStatus === "pending" || deliveryApplicationStatus === "under_review" ? Clock3
      : isApprovedDeliveryPartner ? BadgeCheck : Truck;

  return (
    <div className={`${styles.page} ${editorialFont.variable}`}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRight size={12} aria-hidden="true" /><span aria-current="page">My account</span></nav>
        <header className={styles.header}>
          <div><p className={styles.eyebrow}><span aria-hidden="true" />Your everyday, connected</p><h1 className={styles.heading}>A space for <em>you.</em></h1><p className={styles.subtitle}>Your details, your orders, and your next great discovery.</p></div>
          <Link href="/shop" className={styles.browseLink}>Back to the good finds<span><ArrowUpRight size={18} aria-hidden="true" /></span></Link>
        </header>

        {pageError === "signout-failed" && <div role="alert" className={styles.alert}><AlertCircle size={19} aria-hidden="true" /><p>Your account could not be signed out. Please try again.</p></div>}

        <div className={styles.layout}>
          <aside className={styles.sidebar} aria-label="Account navigation">
            <div className={styles.identity}>
              <div className={styles.avatar}><ProfileAvatar name={displayName} avatarUrl={avatarUrl} size={74} /><span className={styles.avatarCheck}><Check size={12} aria-hidden="true" /><span className="sr-only">Signed in</span></span></div>
              <p className={styles.roleLabel}>{accountCardLabel}</p>
              <h2>{displayName}</h2><p className={styles.identityEmail}>{email}</p>
              <span className={styles.verified}><ShieldCheck size={13} strokeWidth={1.6} aria-hidden="true" />Signed in to AthiMart</span>
              {isApprovedDeliveryPartner && <span className={styles.availability} data-availability={deliveryAvailabilityStatus}><CircleDot size={12} aria-hidden="true" />Driver {formatStatus(deliveryAvailabilityStatus)}</span>}
            </div>
            <nav className={styles.sideNav} aria-label="Your account">
              <Link href="/account" aria-current="page"><UserRound size={18} strokeWidth={1.5} aria-hidden="true" /><span>My profile</span><ChevronRight size={14} aria-hidden="true" /></Link>
              <a href="#delivery-details"><MapPin size={18} strokeWidth={1.5} aria-hidden="true" /><span>Contact &amp; delivery</span><ChevronRight size={14} aria-hidden="true" /></a>
              <Link href="/orders"><ReceiptText size={18} strokeWidth={1.5} aria-hidden="true" /><span>My orders</span><ArrowUpRight size={14} aria-hidden="true" /></Link>
              <a href="#delivery-workspace"><Truck size={18} strokeWidth={1.5} aria-hidden="true" /><span>{isApprovedDeliveryPartner ? "Driver workspace" : "Delivery opportunities"}</span><ChevronRight size={14} aria-hidden="true" /></a>
            </nav>
            {(isAdministrator || isApprovedSeller || isApprovedDeliveryPartner || hasDeliveryApplication) && <div className={styles.workspaceLinks}>
              {isAdministrator && <Link href="/admin"><LayoutDashboard size={15} aria-hidden="true" />Open admin dashboard<ArrowUpRight size={15} aria-hidden="true" /></Link>}
              {isApprovedSeller && <Link href="/seller"><Store size={15} aria-hidden="true" />Open seller dashboard<ArrowUpRight size={15} aria-hidden="true" /></Link>}
              {(isApprovedDeliveryPartner || hasDeliveryApplication) && <Link href={deliveryNavigation.href}><Truck size={15} aria-hidden="true" /><span>{deliveryNavigation.label}</span><ArrowUpRight size={15} aria-hidden="true" /></Link>}
            </div>}
            <div className={styles.sidebarBottom}><Link href="/shop"><ShoppingBag size={16} strokeWidth={1.5} aria-hidden="true" />Continue shopping</Link><form action={signOut}><button type="submit"><LogOut size={16} strokeWidth={1.5} aria-hidden="true" />Sign out</button></form></div>
          </aside>

          <div className={styles.content}>
            <section id="account-overview" className={styles.overview} aria-labelledby="account-overview-heading">
              <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>A little about you</p><h2 id="account-overview-heading">Your account<span>.</span></h2></div><Link href="/orders" className={styles.textLink}>View orders<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
              <dl className={styles.accountDetails}><div><dt><Mail size={14} strokeWidth={1.5} aria-hidden="true" />Email address</dt><dd>{email}</dd></div><div><dt><Phone size={14} strokeWidth={1.5} aria-hidden="true" />Phone number</dt><dd>{phone}</dd></div><div><dt><CalendarDays size={14} strokeWidth={1.5} aria-hidden="true" />Member since</dt><dd>{joinedDate}</dd></div></dl>
            </section>

            <ProfileIdentityForm name={displayName} avatarUrl={avatarUrl} googleUrl={googleAvatarUrl(user)} />
            <DeliveryDetailsForm initialDetails={deliveryDetailsFromProfile(profile)} />

            <section className={styles.access} aria-labelledby="account-access-heading">
              <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>One connected marketplace</p><h2 id="account-access-heading">Your marketplace access</h2></div><ShieldCheck size={23} strokeWidth={1.3} aria-hidden="true" className={styles.sectionIcon} /></div>
              <div className={styles.roleList}>{accountRoleLabels.map(roleLabel => <span key={roleLabel}><Check size={12} aria-hidden="true" />{roleLabel}</span>)}</div>
              {(isPendingSeller || isRejectedSeller) && <div className={styles.applicationNote} data-state={isPendingSeller ? "pending" : "rejected"}><div><p className={styles.eyebrow}>Seller application</p><p>{isPendingSeller ? "Your seller application is pending review." : "Your seller application was not approved."}</p></div><Link href="/seller-pending">View seller status<ArrowUpRight size={15} aria-hidden="true" /></Link></div>}
            </section>

            <section id="delivery-workspace" className={styles.delivery} aria-labelledby="delivery-workspace-heading">
              <div className={styles.deliveryHeader}><span className={styles.deliveryIcon}><DeliveryIcon size={24} strokeWidth={1.3} aria-hidden="true" /></span><div><p className={styles.eyebrow}>Your delivery workspace</p><h2 id="delivery-workspace-heading">{isApprovedDeliveryPartner ? "Driver account" : hasDeliveryApplication ? "Application status" : "A new way to be part of AthiMart."}</h2><p className={styles.deliveryDescription}>{deliveryNavigation.description}</p></div></div>
              {hasDeliveryApplication && <dl className={styles.deliveryStats}>
                <div><dt>Application</dt><dd><span className={styles.statusBadge} data-state={deliveryApplicationStatus}>{formatStatus(deliveryApplicationStatus ?? "unknown")}</span></dd></div>
                <div><dt>Availability</dt><dd><span className={styles.availability} data-availability={deliveryAvailabilityStatus}><CircleDot size={12} aria-hidden="true" />{formatStatus(deliveryAvailabilityStatus)}</span></dd></div>
                <div><dt>Service areas</dt><dd className={styles.serviceCount}>{approvedServiceAreas.length > 0 ? approvedServiceAreas.length : requestedServiceAreas.length}<span>{approvedServiceAreas.length > 0 ? "Approved" : "Requested"}</span></dd></div>
                <div><dt>Review date</dt><dd className={styles.reviewDate}>{deliveryPartner?.reviewed_at ? formatDate(deliveryPartner.reviewed_at) : deliveryPartner?.application_submitted_at ? `Submitted ${formatDate(deliveryPartner.application_submitted_at)}` : "Not submitted"}</dd></div>
              </dl>}
              {(approvedServiceAreas.length > 0 || requestedServiceAreas.length > 0) && <p className={styles.serviceAreas}><MapPin size={14} aria-hidden="true" /><span>{(approvedServiceAreas.length > 0 ? approvedServiceAreas : requestedServiceAreas).join(" · ")}</span></p>}
              {deliveryApplicationStatus === "rejected" && deliveryPartner?.rejection_reason && <div className={styles.reason} role="note"><p>Rejection reason</p><span>{deliveryPartner.rejection_reason}</span></div>}
              {deliveryApplicationStatus === "suspended" && deliveryPartner?.suspension_reason && <div className={styles.reason} role="note"><p>Suspension reason</p><span>{deliveryPartner.suspension_reason}</span></div>}
              <div className={styles.deliveryFooter}><p>{isApprovedDeliveryPartner ? "Your delivery activity, all in one place." : "Keep your application and details up to date."}</p><Link href={deliveryNavigation.href}>{deliveryNavigation.label}<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

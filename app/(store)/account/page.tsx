// app/(store)/account/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Store,
  UserRound,
} from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "My Account",

  description:
    "View and manage your AthiMart buyer, seller or administrator account.",

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
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  seller_approval_status:
    | string
    | null;
  is_blocked: boolean | null;
  created_at: string | null;
}

function getFirstValue(
  value:
    | string
    | string[]
    | undefined
): string {
  if (
    Array.isArray(value)
  ) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getText(
  value: unknown
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function getDisplayName(
  profileName: unknown,
  metadataName: unknown,
  email: string
): string {
  const storedProfileName =
    getText(profileName);

  if (storedProfileName) {
    return storedProfileName;
  }

  const storedMetadataName =
    getText(metadataName);

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
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) =>
        word
          .charAt(0)
          .toUpperCase()
      )
      .join("");

  return initials || "AM";
}

function formatRegistrationDate(
  value: string
): string {
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
      month: "long",
      day: "numeric",
    }
  ).format(date);
}

export default async function AccountPage({
  searchParams,
}: AccountPageProps) {
  const params =
    await searchParams;

  const errorCode =
    getFirstValue(
      params.error
    );

  const supabase =
    await createClient();

  const {
    data: { user },
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

  const {
    data: profileData,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      full_name,
      phone,
      role,
      seller_approval_status,
      is_blocked,
      created_at
    `)
    .eq(
      "id",
      user.id
    )
    .maybeSingle();

  if (profileError) {
    throw new Error(
      `Unable to load account profile: ${profileError.message}`
    );
  }

  const profile =
    profileData as
      | ProfileRow
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

  const initials =
    getInitials(
      displayName
    );

  const profilePhone =
    getText(
      profile?.phone
    );

  const metadataPhone =
    getText(
      user.user_metadata
        ?.phone
    );

  const phone =
    profilePhone ||
    metadataPhone ||
    "Not added";

  /*
   * Normalize database values so both
   * "Vendor" and "vendor" work correctly.
   */
  const marketplaceRole =
    getText(
      profile?.role
    ).toLowerCase();

  const sellerStatus =
    getText(
      profile
        ?.seller_approval_status
    ).toLowerCase();

  const isAdmin =
    marketplaceRole ===
    "admin";

  const isApprovedSeller =
    (
      marketplaceRole ===
        "vendor" ||
      marketplaceRole ===
        "seller"
    ) &&
    sellerStatus ===
      "approved";

  const isPendingSeller =
    sellerStatus ===
    "pending";

  const isRejectedSeller =
    sellerStatus ===
    "rejected";

  const joinedDateSource =
    getText(
      profile?.created_at
    ) ||
    user.created_at;

  const joinedDate =
    formatRegistrationDate(
      joinedDateSource
    );

  let accountTypeLabel =
    "AthiMart Customer";

  let pageEyebrow =
    "Customer account";

  let accountStatusLabel =
    "Authenticated customer";

  let description =
    "View your AthiMart customer profile and manage your connected mobile and web account.";

  if (isApprovedSeller) {
    accountTypeLabel =
      "AthiMart Seller";

    pageEyebrow =
      "Approved seller account";

    accountStatusLabel =
      "Approved seller";

    description =
      "View your approved AthiMart seller profile and manage your products through the Seller Centre.";
  } else if (
    isPendingSeller
  ) {
    accountTypeLabel =
      "Seller Applicant";

    pageEyebrow =
      "Seller application";

    accountStatusLabel =
      "Approval pending";

    description =
      "Your seller application is waiting for review by an AthiMart administrator.";
  } else if (
    isRejectedSeller
  ) {
    accountTypeLabel =
      "Seller Applicant";

    pageEyebrow =
      "Seller application";

    accountStatusLabel =
      "Application reviewed";

    description =
      "View the current status of your AthiMart seller application.";
  } else if (isAdmin) {
    accountTypeLabel =
      "AthiMart Administrator";

    pageEyebrow =
      "Administrator account";

    accountStatusLabel =
      "Administrator access";

    description =
      "View your AthiMart profile and access the protected administration centre.";
  }

  return (
    <div className="athimart-container py-8 sm:py-10 lg:py-14">
      {/* Page heading */}
      <header className="border-b border-[var(--border-strong)] pb-8 sm:pb-10">
        <p className="athimart-label text-[var(--brand-orange-dark)]">
          {pageEyebrow}
        </p>

        <h1 className="athimart-display-large mt-4 text-[var(--brand-blue-dark)]">
          My
          <br />

          <span className="text-[var(--brand-orange)]">
            Account
          </span>
        </h1>

        <p className="athimart-body-large mt-5 max-w-3xl">
          {description}
        </p>
      </header>

      {errorCode ===
        "signout-failed" && (
        <div
          role="alert"
          className="mt-7 border-l-4 border-[var(--sale)] bg-white px-5 py-4"
        >
          <p className="font-[var(--font-body)] text-sm leading-6 text-[var(--sale)]">
            Your account could not
            be signed out. Please
            try again.
          </p>
        </div>
      )}

      <div className="mt-9 grid gap-7 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10">
        {/* Identity card */}
        <aside className="overflow-hidden border border-[var(--border)] bg-white shadow-[0_18px_50px_rgba(18,63,158,0.08)]">
          <div className="bg-gradient-to-br from-[var(--brand-blue-dark)] via-[var(--brand-blue)] to-[var(--brand-blue-light)] p-7 text-white sm:p-9">
            <div className="flex h-24 w-24 items-center justify-center border border-white/25 bg-white/12 font-[var(--font-display)] text-4xl font-light uppercase tracking-[0.05em] text-white">
              {initials}
            </div>

            <p className="mt-8 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--brand-orange-light)]">
              {accountTypeLabel}
            </p>

            <h2 className="mt-3 break-words font-[var(--font-display)] text-4xl font-light text-white">
              {displayName}
            </h2>

            <p className="mt-2 break-all font-[var(--font-body)] text-sm text-white/75">
              {email}
            </p>
          </div>

          <div className="p-6 sm:p-7">
            <div className="flex items-center gap-3">
              {isApprovedSeller ? (
                <BadgeCheck
                  aria-hidden="true"
                  className="h-5 w-5 text-[var(--success)]"
                  strokeWidth={1.8}
                />
              ) : (
                <ShieldCheck
                  aria-hidden="true"
                  className="h-5 w-5 text-[var(--success)]"
                  strokeWidth={1.8}
                />
              )}

              <p className="font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--success)]">
                {accountStatusLabel}
              </p>
            </div>

            {isApprovedSeller && (
              <Link
                href="/seller"
                className="athimart-brand-button mt-7 w-full text-white!"
              >
                <Store
                  aria-hidden="true"
                  className="h-5 w-5 text-white!"
                  strokeWidth={1.8}
                />

                <span className="text-white!">
                  Open Seller Centre
                </span>
              </Link>
            )}

            {(
              isPendingSeller ||
              isRejectedSeller
            ) && (
              <Link
                href="/seller-pending"
                className="athimart-brand-button mt-7 w-full text-white!"
              >
                <Store
                  aria-hidden="true"
                  className="h-5 w-5 text-white!"
                  strokeWidth={1.8}
                />

                <span className="text-white!">
                  View Seller Status
                </span>
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="athimart-brand-button mt-7 w-full text-white!"
              >
                <LayoutDashboard
                  aria-hidden="true"
                  className="h-5 w-5 text-white!"
                  strokeWidth={1.8}
                />

                <span className="text-white!">
                  Open Admin Centre
                </span>
              </Link>
            )}

            {!isApprovedSeller &&
              !isPendingSeller &&
              !isRejectedSeller &&
              !isAdmin && (
                <Link
                  href="/shop"
                  className="athimart-brand-button mt-7 w-full text-white!"
                >
                  <ShoppingBag
                    aria-hidden="true"
                    className="h-5 w-5 text-white!"
                    strokeWidth={1.8}
                  />

                  <span className="text-white!">
                    Continue Shopping
                  </span>
                </Link>
              )}

            <form
              action={signOut}
              className="mt-3"
            >
              <button
                type="submit"
                className="inline-flex min-h-14 w-full items-center justify-center gap-3 border border-[var(--sale)] bg-white px-5 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--sale)] transition-all duration-200 hover:bg-[var(--sale)] hover:text-white"
              >
                <LogOut
                  aria-hidden="true"
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />

                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Account information */}
        <section
          aria-labelledby="account-information-heading"
          className="border border-[var(--border)] bg-white p-6 sm:p-8 lg:p-10"
        >
          <div className="flex items-start justify-between gap-5 border-b border-[var(--border)] pb-6">
            <div>
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Profile details
              </p>

              <h2
                id="account-information-heading"
                className="athimart-title-large mt-2 text-[var(--brand-blue-dark)]"
              >
                Account Information
              </h2>
            </div>

            <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
              {isApprovedSeller ? (
                <Store
                  aria-hidden="true"
                  className="h-6 w-6"
                  strokeWidth={1.7}
                />
              ) : (
                <UserRound
                  aria-hidden="true"
                  className="h-6 w-6"
                  strokeWidth={1.7}
                />
              )}
            </span>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <article className="border border-[var(--border)] bg-[var(--linen-light)] p-5">
              <UserRound
                aria-hidden="true"
                className="h-5 w-5 text-[var(--brand-blue)]"
                strokeWidth={1.8}
              />

              <p className="athimart-label mt-5 text-[var(--text-muted)]">
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

              <p className="athimart-label mt-5 text-[var(--text-muted)]">
                Email address
              </p>

              <p className="mt-2 break-all font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                {email ||
                  "Not available"}
              </p>
            </article>

            <article className="border border-[var(--border)] bg-[var(--linen-light)] p-5">
              <Phone
                aria-hidden="true"
                className="h-5 w-5 text-[var(--brand-blue)]"
                strokeWidth={1.8}
              />

              <p className="athimart-label mt-5 text-[var(--text-muted)]">
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

              <p className="athimart-label mt-5 text-[var(--text-muted)]">
                Member since
              </p>

              <p className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                {joinedDate}
              </p>
            </article>
          </div>

          {/* Marketplace role */}
          <div className="mt-6 border-l-4 border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] p-5">
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Marketplace role
            </p>

            <div className="mt-3 flex items-center gap-3">
              {isApprovedSeller ? (
                <BadgeCheck
                  aria-hidden="true"
                  className="h-6 w-6 shrink-0 text-[var(--success)]"
                  strokeWidth={1.8}
                />
              ) : (
                <ShieldCheck
                  aria-hidden="true"
                  className="h-6 w-6 shrink-0 text-[var(--brand-blue)]"
                  strokeWidth={1.8}
                />
              )}

              <p className="font-[var(--font-display)] text-2xl font-light text-[var(--brand-blue-dark)]">
                {accountTypeLabel}
              </p>
            </div>

            {isApprovedSeller && (
              <p className="mt-3 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                Your seller application
                has been approved. You can
                now create and manage your
                own AthiMart products.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
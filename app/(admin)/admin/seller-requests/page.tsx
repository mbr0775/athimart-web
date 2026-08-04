// app/(admin)/admin/seller-requests/page.tsx

import type { Metadata } from "next";
import {
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  UserRound,
  XCircle,
} from "lucide-react";

import { getCurrentAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

import {
  approveSeller,
  rejectSeller,
} from "./actions";

export const metadata: Metadata = {
  title: "Seller Requests",

  description:
    "Review and manage pending AthiMart seller account applications.",

  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic =
  "force-dynamic";

interface SellerRequest {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  role: string | null;

  seller_approval_status:
    | string
    | null;

  seller_requested_at:
    | string
    | null;
}

interface SellerRequestsPageProps {
  searchParams: Promise<{
    approved?: string | string[];
    rejected?: string | string[];
    error?: string | string[];
  }>;
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
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}

function getErrorMessage(
  errorCode: string
): string {
  switch (errorCode) {
    case "invalid-seller":
      return "The selected seller account is invalid.";

    case "approve-failed":
      return "The seller request could not be approved.";

    case "reject-failed":
      return "The seller request could not be rejected.";

    case "request-not-pending":
      return "This seller request is no longer pending.";

    case "missing-rejection-reason":
      return "Enter a clear rejection reason containing at least five characters.";

    default:
      return "";
  }
}

export default async function SellerRequestsPage({
  searchParams,
}: SellerRequestsPageProps) {
  await getCurrentAdmin();

  const params =
    await searchParams;

  const approved =
    getFirstValue(
      params.approved
    ) === "1";

  const rejected =
    getFirstValue(
      params.rejected
    ) === "1";

  const errorMessage =
    getErrorMessage(
      getFirstValue(
        params.error
      )
    );

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      full_name,
      phone,
      country,
      role,
      seller_approval_status,
      seller_requested_at
    `)
    .eq(
      "seller_approval_status",
      "pending"
    )
    .order(
      "seller_requested_at",
      {
        ascending: true,
      }
    );

  if (error) {
    throw new Error(
      `Unable to load seller requests: ${error.message}`
    );
  }

  const sellerRequests =
    (data ?? []) as SellerRequest[];

  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      {/* Page heading */}
      <header className="border-b border-[var(--border-strong)] pb-8">
        <p className="athimart-label text-[var(--brand-orange-dark)]">
          Marketplace access
        </p>

        <h1 className="athimart-display-large mt-4 text-[var(--brand-blue-dark)]">
          Seller
          <br />

          <span className="text-[var(--brand-orange)]">
            Requests
          </span>
        </h1>

        <p className="athimart-body-large mt-5 max-w-3xl">
          Review users who have confirmed
          their email and requested permission
          to sell products through AthiMart.
        </p>
      </header>

      {/* Feedback messages */}
      {approved && (
        <div
          role="status"
          className="mt-7 flex items-start gap-3 border-l-4 border-[var(--success)] bg-green-50 px-5 py-4"
        >
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]"
            strokeWidth={1.8}
          />

          <p className="font-[var(--font-body)] text-sm leading-6 text-[var(--text)]">
            The seller account was approved
            successfully.
          </p>
        </div>
      )}

      {rejected && (
        <div
          role="status"
          className="mt-7 flex items-start gap-3 border-l-4 border-[var(--sale)] bg-red-50 px-5 py-4"
        >
          <XCircle
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sale)]"
            strokeWidth={1.8}
          />

          <p className="font-[var(--font-body)] text-sm leading-6 text-[var(--text)]">
            The seller request was rejected.
          </p>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mt-7 flex items-start gap-3 border-l-4 border-[var(--sale)] bg-red-50 px-5 py-4"
        >
          <XCircle
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sale)]"
            strokeWidth={1.8}
          />

          <p className="font-[var(--font-body)] text-sm leading-6 text-[var(--sale)]">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Request summary */}
      <section className="mt-8 grid gap-5 sm:grid-cols-2">
        <article className="border border-[var(--border)] bg-white p-6">
          <span className="flex h-12 w-12 items-center justify-center bg-[var(--brand-orange-soft)] text-[var(--brand-orange-dark)]">
            <Clock3
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.8}
            />
          </span>

          <p className="athimart-label mt-6 text-[var(--text-muted)]">
            Pending applications
          </p>

          <p className="mt-3 font-[var(--font-display)] text-5xl font-light text-[var(--brand-blue-dark)]">
            {sellerRequests.length}
          </p>
        </article>

        <article className="border border-[var(--border)] bg-white p-6">
          <span className="flex h-12 w-12 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
            <ShieldCheck
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.8}
            />
          </span>

          <p className="athimart-label mt-6 text-[var(--text-muted)]">
            Review requirement
          </p>

          <p className="mt-3 font-[var(--font-display)] text-3xl font-light uppercase text-[var(--brand-blue-dark)]">
            Admin Approval
          </p>
        </article>
      </section>

      {/* Empty state */}
      {sellerRequests.length === 0 ? (
        <section className="mt-8 border border-[var(--border)] bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
            <Store
              aria-hidden="true"
              className="h-8 w-8"
              strokeWidth={1.7}
            />
          </span>

          <h2 className="mt-6 font-[var(--font-display)] text-3xl font-light uppercase text-[var(--brand-blue-dark)]">
            No Pending Requests
          </h2>

          <p className="athimart-body mx-auto mt-3 max-w-lg">
            New seller applications will appear
            here after the applicant creates an
            account and confirms their email.
          </p>
        </section>
      ) : (
        <section
          aria-labelledby="pending-sellers-heading"
          className="mt-8"
        >
          <div className="mb-5 flex items-center justify-between gap-5">
            <div>
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Awaiting review
              </p>

              <h2
                id="pending-sellers-heading"
                className="mt-2 font-[var(--font-display)] text-3xl font-light uppercase text-[var(--brand-blue-dark)]"
              >
                Pending Sellers
              </h2>
            </div>

            <span className="flex h-12 min-w-12 items-center justify-center bg-[var(--brand-orange)] px-4 font-[var(--font-display)] text-2xl font-light text-white">
              {sellerRequests.length}
            </span>
          </div>

          <div className="space-y-6">
            {sellerRequests.map(
              (seller) => {
                const sellerName =
                  seller.full_name?.trim() ||
                  "Unnamed seller";

                const sellerEmail =
                  seller.email?.trim() ||
                  "Email unavailable";

                const sellerPhone =
                  seller.phone?.trim() ||
                  "Not provided";

                const sellerCountry =
                  seller.country?.trim() ||
                  "Not provided";

                return (
                  <article
                    key={seller.id}
                    className="border border-[var(--border)] bg-white"
                  >
                    {/* Seller information */}
                    <div className="grid gap-6 p-6 lg:grid-cols-[1fr_0.85fr] lg:p-7">
                      <div>
                        <div className="flex items-start gap-4">
                          <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
                            <UserRound
                              aria-hidden="true"
                              className="h-7 w-7"
                              strokeWidth={1.7}
                            />
                          </span>

                          <div className="min-w-0">
                            <p className="athimart-label text-[var(--brand-orange-dark)]">
                              Seller applicant
                            </p>

                            <h3 className="mt-2 break-words font-[var(--font-display)] text-3xl font-light text-[var(--brand-blue-dark)]">
                              {sellerName}
                            </h3>

                            <p className="mt-2 break-all font-mono text-[10px] text-[var(--text-muted)]">
                              ID: {seller.id}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
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

                              <p className="mt-2 break-all font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
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

                              <p className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                                {sellerPhone}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 border border-[var(--border)] bg-[var(--linen-light)] p-4">
                            <MapPin
                              aria-hidden="true"
                              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-blue)]"
                              strokeWidth={1.8}
                            />

                            <div>
                              <p className="athimart-label text-[var(--text-muted)]">
                                Country
                              </p>

                              <p className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                                {sellerCountry}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 border border-[var(--border)] bg-[var(--linen-light)] p-4">
                            <Clock3
                              aria-hidden="true"
                              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-orange-dark)]"
                              strokeWidth={1.8}
                            />

                            <div>
                              <p className="athimart-label text-[var(--text-muted)]">
                                Requested
                              </p>

                              <p className="mt-2 font-[var(--font-body)] text-sm font-semibold leading-6 text-[var(--text)]">
                                {formatDate(
                                  seller.seller_requested_at
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Review controls */}
                      <div className="border border-[var(--border)] bg-[var(--linen-light)] p-5">
                        <p className="athimart-label text-[var(--brand-orange-dark)]">
                          Administrator decision
                        </p>

                        <h4 className="mt-3 font-[var(--font-display)] text-2xl font-light uppercase text-[var(--brand-blue-dark)]">
                          Review Application
                        </h4>

                        <p className="mt-3 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                          Approving changes the marketplace
                          profile role to vendor and enables
                          seller access.
                        </p>

                        {/* Approve */}
                        <form
                          action={approveSeller}
                          className="mt-6"
                        >
                          <input
                            type="hidden"
                            name="sellerId"
                            value={seller.id}
                          />

                          <button
                            type="submit"
                            className="inline-flex min-h-14 w-full items-center justify-center gap-3 bg-[var(--success)] px-5 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-90"
                          >
                            <CheckCircle2
                              aria-hidden="true"
                              className="h-5 w-5"
                              strokeWidth={1.8}
                            />

                            Approve seller
                          </button>
                        </form>

                        {/* Reject */}
                        <form
                          action={rejectSeller}
                          className="mt-5"
                        >
                          <input
                            type="hidden"
                            name="sellerId"
                            value={seller.id}
                          />

                          <label className="block">
                            <span className="athimart-label text-[var(--text-muted)]">
                              Rejection reason
                            </span>

                            <textarea
                              name="rejectionReason"
                              required
                              minLength={5}
                              maxLength={1000}
                              rows={4}
                              placeholder="Explain why this seller request cannot be approved."
                              className="mt-3 w-full resize-y border border-[var(--border)] bg-white px-4 py-3 font-[var(--font-body)] text-sm leading-6 text-[var(--text)] outline-none transition-colors placeholder:text-[var(--placeholder)] focus:border-[var(--sale)]"
                            />
                          </label>

                          <button
                            type="submit"
                            className="mt-4 inline-flex min-h-14 w-full items-center justify-center gap-3 border border-[var(--sale)] bg-white px-5 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--sale)] transition-colors hover:bg-[var(--sale)] hover:text-white"
                          >
                            <XCircle
                              aria-hidden="true"
                              className="h-5 w-5"
                              strokeWidth={1.8}
                            />

                            Reject request
                          </button>
                        </form>
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
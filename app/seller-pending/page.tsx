// app/seller-pending/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  Home,
  LogOut,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Seller Approval Status",

  description:
    "View the approval status of your AthiMart seller account.",

  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic =
  "force-dynamic";

interface SellerProfile {
  full_name: string | null;
  email: string | null;
  role: string | null;

  seller_approval_status:
    | string
    | null;

  seller_requested_at:
    | string
    | null;

  seller_rejection_reason:
    | string
    | null;
}

function formatRequestedDate(
  value: string | null | undefined
): string {
  if (!value) {
    return "Recently submitted";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Recently submitted";
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

export default async function SellerPendingPage() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * The seller must first confirm their email.
   * After confirmation, Supabase creates an
   * authenticated session.
   */
  if (!user) {
    redirect(
      "/auth/login?next=%2Fseller-pending"
    );
  }

  const {
    data,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(`
      full_name,
      email,
      role,
      seller_approval_status,
      seller_requested_at,
      seller_rejection_reason
    `)
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(
      `Unable to load seller approval status: ${profileError.message}`
    );
  }

  const profile =
    data as SellerProfile | null;

  const role =
    profile?.role?.trim() ||
    "customer";

  const approvalStatus =
    profile
      ?.seller_approval_status
      ?.trim() || "";

  /*
   * Admin accounts should use the
   * AthiMart admin dashboard.
   */
  if (role === "admin") {
    redirect("/admin");
  }

  /*
   * Approved sellers no longer need
   * the pending-status page.
   */
  if (
    approvalStatus === "approved" &&
    (
      role === "vendor" ||
      role === "seller"
    )
  ) {
    redirect("/account");
  }

  /*
   * A normal buyer has no seller request,
   * so the buyer should return to their
   * normal account page.
   */
  if (
    approvalStatus !== "pending" &&
    approvalStatus !== "rejected"
  ) {
    redirect("/account");
  }

  const isRejected =
    approvalStatus === "rejected";

  const fullName =
    profile?.full_name?.trim() ||
    user.user_metadata
      ?.full_name
      ?.toString()
      .trim() ||
    "AthiMart Seller";

  const email =
    profile?.email?.trim() ||
    user.email ||
    "";

  const requestedDate =
    formatRequestedDate(
      profile?.seller_requested_at
    );

  const rejectionReason =
    profile
      ?.seller_rejection_reason
      ?.trim() || "";

  async function signOutSeller(): Promise<never> {
    "use server";

    const serverClient =
      await createClient();

    const { error } =
      await serverClient.auth.signOut();

    if (error) {
      throw new Error(
        "Unable to sign out. Please try again."
      );
    }

    revalidatePath(
      "/",
      "layout"
    );

    redirect("/auth/login");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--linen)]">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[var(--brand-blue)]/8 blur-3xl" />

        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-[var(--brand-orange)]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-4xl items-center px-5 py-12 sm:px-10">
        <section className="w-full overflow-hidden border border-[var(--border)] bg-white shadow-[0_24px_70px_rgba(18,63,158,0.10)]">
          {/* Status header */}
          <header
            className={
              isRejected
                ? "bg-[var(--sale)] p-7 text-white sm:p-10"
                : "bg-gradient-to-br from-[var(--brand-blue-dark)] via-[var(--brand-blue)] to-[var(--brand-blue-light)] p-7 text-white sm:p-10"
            }
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                  AthiMart seller
                  account
                </p>

                <h1 className="mt-4 font-[var(--font-display)] text-4xl font-light uppercase leading-tight tracking-[0.04em] text-white sm:text-5xl">
                  {isRejected
                    ? "Request Rejected"
                    : "Approval Pending"}
                </h1>
              </div>

              <span className="flex h-16 w-16 shrink-0 items-center justify-center border border-white/25 bg-white/10">
                {isRejected ? (
                  <XCircle
                    aria-hidden="true"
                    className="h-8 w-8 text-white"
                    strokeWidth={1.7}
                  />
                ) : (
                  <Clock3
                    aria-hidden="true"
                    className="h-8 w-8 text-white"
                    strokeWidth={1.7}
                  />
                )}
              </span>
            </div>

            <p className="mt-7 max-w-2xl font-[var(--font-body)] text-sm leading-7 text-white/80">
              {isRejected
                ? "Your seller account request was reviewed but was not approved."
                : "Your email has been confirmed. Your seller account is now waiting for review and approval by the AthiMart administrator."}
            </p>
          </header>

          {/* Account information */}
          <div className="p-7 sm:p-10">
            <div className="grid gap-5 sm:grid-cols-2">
              <article className="border border-[var(--border)] bg-[var(--linen-light)] p-5">
                <p className="athimart-label text-[var(--text-muted)]">
                  Seller name
                </p>

                <p className="mt-3 font-[var(--font-display)] text-2xl font-light text-[var(--brand-blue-dark)]">
                  {fullName}
                </p>
              </article>

              <article className="border border-[var(--border)] bg-[var(--linen-light)] p-5">
                <p className="athimart-label text-[var(--text-muted)]">
                  Confirmed email
                </p>

                <p className="mt-3 break-all font-[var(--font-body)] text-sm font-semibold text-[var(--brand-blue-dark)]">
                  {email}
                </p>
              </article>
            </div>

            {/* Pending seller message */}
            {!isRejected && (
              <section className="mt-7 border-l-4 border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] p-5">
                <div className="flex items-start gap-4">
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 h-6 w-6 shrink-0 text-[var(--brand-orange-dark)]"
                    strokeWidth={1.8}
                  />

                  <div>
                    <h2 className="font-[var(--font-body)] text-sm font-semibold text-[var(--brand-blue-dark)]">
                      Administrator
                      approval required
                    </h2>

                    <p className="mt-2 font-[var(--font-body)] text-sm leading-6 text-[var(--text-muted)]">
                      You cannot publish
                      products or access
                      seller tools until
                      the AthiMart
                      administrator
                      approves your seller
                      request.
                    </p>

                    <p className="mt-3 font-[var(--font-body)] text-xs leading-5 text-[var(--text-muted)]">
                      Request submitted:{" "}
                      <strong className="text-[var(--text)]">
                        {requestedDate}
                      </strong>
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Rejected seller message */}
            {isRejected && (
              <section className="mt-7 border-l-4 border-[var(--sale)] bg-red-50 p-5">
                <h2 className="font-[var(--font-body)] text-sm font-semibold text-[var(--sale)]">
                  Administrator
                  response
                </h2>

                <p className="mt-2 font-[var(--font-body)] text-sm leading-6 text-[var(--text-muted)]">
                  {rejectionReason ||
                    "No rejection reason was provided. Contact AthiMart support for more information."}
                </p>
              </section>
            )}

            {/* Actions */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href="/"
                className="athimart-brand-button w-full text-white!"
              >
                <Home
                  aria-hidden="true"
                  className="h-5 w-5 text-white!"
                  strokeWidth={1.8}
                />

                <span className="text-white!">
                  Return to AthiMart
                </span>
              </Link>

              <form
                action={signOutSeller}
                className="w-full"
              >
                <button
                  type="submit"
                  className="inline-flex min-h-14 w-full items-center justify-center gap-3 border border-[var(--sale)] bg-white px-5 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--sale)] transition-colors hover:bg-[var(--sale)] hover:text-white"
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

            {/* Confirmation note */}
            <div className="mt-7 flex items-start gap-3 border-t border-[var(--border)] pt-6">
              <CheckCircle2
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]"
                strokeWidth={1.8}
              />

              <p className="font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                Your email verification
                is complete. You do not
                need to create another
                seller account while this
                request is being reviewed.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
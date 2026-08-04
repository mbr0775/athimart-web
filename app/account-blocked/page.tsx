// app/account-blocked/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  LockKeyhole,
  LogOut,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Account Blocked",

  description:
    "This AthiMart account has been restricted.",

  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic =
  "force-dynamic";

export default async function AccountBlockedPage() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const {
    data: profile,
  } = await supabase
    .from("profiles")
    .select(`
      full_name,
      email,
      is_blocked,
      blocked_reason
    `)
    .eq("id", user.id)
    .maybeSingle();

  if (
    profile &&
    profile.is_blocked !== true
  ) {
    redirect("/account");
  }

  const fullName =
    profile?.full_name
      ?.toString()
      .trim() ||
    user.user_metadata
      ?.full_name
      ?.toString()
      .trim() ||
    "AthiMart User";

  const email =
    profile?.email
      ?.toString()
      .trim() ||
    user.email ||
    "";

  const blockedReason =
    profile?.blocked_reason
      ?.toString()
      .trim() ||
    "Your account has been restricted by an AthiMart administrator.";

  async function signOut() {
    "use server";

    const supabase =
      await createClient();

    await supabase.auth.signOut();

    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen bg-[var(--linen)] px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-5">
          <Link
            href="/"
            className="font-[var(--font-display)] text-2xl font-light uppercase tracking-[0.18em] text-[var(--brand-blue-dark)]"
          >
            Athi
            <span className="text-[var(--brand-orange)]">
              Mart
            </span>
          </Link>

          <Link
            href="/"
            aria-label="Return to AthiMart"
            className="flex h-11 w-11 items-center justify-center border border-[var(--border)] bg-white text-[var(--brand-blue)] transition-colors hover:border-[var(--brand-blue)]"
          >
            <ArrowLeft
              aria-hidden="true"
              className="h-5 w-5"
              strokeWidth={1.8}
            />
          </Link>
        </header>

        <section className="mt-12 border border-[var(--border)] bg-white p-6 sm:p-10">
          <span className="flex h-16 w-16 items-center justify-center bg-red-50 text-[var(--sale)]">
            <ShieldAlert
              aria-hidden="true"
              className="h-8 w-8"
              strokeWidth={1.7}
            />
          </span>

          <p className="athimart-label mt-8 text-[var(--sale)]">
            Access restricted
          </p>

          <h1 className="athimart-display-medium mt-3 text-[var(--brand-blue-dark)]">
            Account
            <br />
            Blocked
          </h1>

          <p className="athimart-body-large mt-6">
            Hello{" "}
            <strong className="text-[var(--text)]">
              {fullName}
            </strong>
            . Your AthiMart account is currently restricted.
          </p>

          <div className="mt-7 border-l-4 border-[var(--sale)] bg-red-50 px-5 py-4">
            <p className="font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.14em] text-[var(--sale)]">
              Administrator message
            </p>

            <p className="mt-3 font-[var(--font-body)] text-sm leading-7 text-[var(--text-soft)]">
              {blockedReason}
            </p>
          </div>

          <div className="mt-7 space-y-3">
            <div className="flex items-center gap-3 border border-[var(--border)] bg-[var(--linen-light)] px-4 py-4">
              <Mail
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-[var(--brand-blue)]"
                strokeWidth={1.8}
              />

              <p className="break-all font-[var(--font-body)] text-sm text-[var(--text-muted)]">
                {email}
              </p>
            </div>

            <div className="flex items-start gap-3 border border-[var(--border)] bg-[var(--linen-light)] px-4 py-4">
              <LockKeyhole
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-orange-dark)]"
                strokeWidth={1.8}
              />

              <p className="font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                Product management, account management and seller tools are unavailable while the restriction remains active.
              </p>
            </div>
          </div>

          <form
            action={signOut}
            className="mt-8"
          >
            <button
              type="submit"
              className="athimart-brand-button w-full text-white!"
            >
              <LogOut
                aria-hidden="true"
                className="h-5 w-5 text-white!"
                strokeWidth={1.8}
              />

              <span className="text-white!">
                Sign out
              </span>
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
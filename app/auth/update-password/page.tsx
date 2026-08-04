// app/auth/update-password/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { updatePassword } from "./actions";

export const metadata: Metadata = {
  title: "Create New Password",

  description:
    "Create a new secure password for your AthiMart account.",

  robots: {
    index: false,
    follow: true,
  },
};

interface UpdatePasswordPageProps {
  searchParams: Promise<{
    error?: string | string[];
    status?: string | string[];
  }>;
}

function getFirstValue(
  value: string | string[] | undefined
): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getErrorMessage(
  errorCode: string
): string {
  switch (errorCode) {
    case "missing-fields":
      return "Enter and confirm your new password.";

    case "weak-password":
      return "Use a password containing at least eight characters.";

    case "password-mismatch":
      return "The two passwords do not match.";

    case "update-failed":
      return "The password could not be updated. Request a new recovery link and try again.";

    default:
      return "";
  }
}

export default async function UpdatePasswordPage({
  searchParams,
}: UpdatePasswordPageProps) {
  const params =
    await searchParams;

  const status =
    getFirstValue(params.status);

  const errorCode =
    getFirstValue(params.error);

  const errorMessage =
    getErrorMessage(errorCode);

  const passwordUpdated =
    status === "success";

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    !passwordUpdated
  ) {
    redirect(
      "/auth/forgot-password?error=session-expired"
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--linen)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[var(--brand-blue)]/8 blur-3xl" />

        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-[var(--brand-orange)]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-3xl items-center px-5 py-12 sm:px-10">
        <section className="w-full border border-[var(--border)] bg-white p-7 shadow-[0_24px_70px_rgba(18,63,158,0.10)] sm:p-12">
          {passwordUpdated ? (
            <div className="text-center">
              <span className="mx-auto flex h-20 w-20 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
                <CheckCircle2
                  aria-hidden="true"
                  className="h-10 w-10"
                  strokeWidth={1.7}
                />
              </span>

              <p className="athimart-label mt-8 text-[var(--brand-orange-dark)]">
                Password updated
              </p>

              <h1 className="athimart-display-medium mt-3 text-[var(--brand-blue-dark)]">
                Account
                <br />
                Secured
              </h1>

              <p className="athimart-body-large mx-auto mt-6 max-w-lg">
                Your new AthiMart password has been saved successfully.
              </p>

              <Link
                href="/"
                className="athimart-brand-button mt-8 w-full text-white!"
              >
                Continue to AthiMart
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="athimart-label text-[var(--brand-orange-dark)]">
                    Account recovery
                  </p>

                  <h1 className="athimart-display-medium mt-3 text-[var(--brand-blue-dark)]">
                    New
                    <br />
                    Password
                  </h1>
                </div>

                <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
                  <KeyRound
                    aria-hidden="true"
                    className="h-7 w-7"
                    strokeWidth={1.7}
                  />
                </span>
              </div>

              <p className="athimart-body-large mt-6 max-w-xl">
                Create a strong new password for your AthiMart mobile and web
                account.
              </p>

              {errorMessage && (
                <div
                  role="alert"
                  className="mt-7 border-l-4 border-[var(--sale)] bg-[var(--linen-light)] px-5 py-4"
                >
                  <p className="font-[var(--font-body)] text-sm leading-6 text-[var(--sale)]">
                    {errorMessage}
                  </p>
                </div>
              )}

              <form
                action={updatePassword}
                className="mt-9"
              >
                <label className="block">
                  <span className="athimart-label text-[var(--text-muted)]">
                    New password
                  </span>

                  <span className="mt-3 flex min-h-16 items-center border-b-2 border-[var(--border-strong)] transition-colors focus-within:border-[var(--brand-blue)]">
                    <LockKeyhole
                      aria-hidden="true"
                      className="mr-4 h-5 w-5 shrink-0 text-[var(--brand-blue)]"
                      strokeWidth={1.7}
                    />

                    <input
                      type="password"
                      name="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="Minimum 8 characters"
                      className="min-w-0 flex-1 border-0 bg-transparent py-4 font-[var(--font-display)] text-2xl font-light text-[var(--text)] outline-none placeholder:text-base placeholder:text-[var(--placeholder)] focus:outline-none focus-visible:!outline-none"
                    />
                  </span>
                </label>

                <label className="mt-7 block">
                  <span className="athimart-label text-[var(--text-muted)]">
                    Confirm new password
                  </span>

                  <span className="mt-3 flex min-h-16 items-center border-b-2 border-[var(--border-strong)] transition-colors focus-within:border-[var(--brand-blue)]">
                    <ShieldCheck
                      aria-hidden="true"
                      className="mr-4 h-5 w-5 shrink-0 text-[var(--brand-blue)]"
                      strokeWidth={1.7}
                    />

                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="Repeat new password"
                      className="min-w-0 flex-1 border-0 bg-transparent py-4 font-[var(--font-display)] text-2xl font-light text-[var(--text)] outline-none placeholder:text-base placeholder:text-[var(--placeholder)] focus:outline-none focus-visible:!outline-none"
                    />
                  </span>
                </label>

                <button
                  type="submit"
                  className="athimart-brand-button mt-9 w-full text-white!"
                >
                  <KeyRound
                    aria-hidden="true"
                    className="h-5 w-5 text-white!"
                    strokeWidth={1.8}
                  />

                  <span className="text-white!">
                    Update password
                  </span>
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
// app/auth/forgot-password/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Mail,
  Send,
} from "lucide-react";

import {
  sendPasswordResetLink,
} from "./actions";

export const metadata: Metadata = {
  title: "Forgot Password",

  description:
    "Request a secure password reset link for your AthiMart account.",

  robots: {
    index: false,
    follow: true,
  },
};

interface ForgotPasswordPageProps {
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
    case "missing-email":
      return "Enter the email address connected to your AthiMart account.";

    case "too-many-attempts":
      return "Too many reset requests. Wait a moment before trying again.";

    case "session-expired":
      return "Your recovery session expired. Request a new password reset link.";

    case "request-failed":
      return "The reset request could not be completed. Please try again.";

    default:
      return "";
  }
}

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params =
    await searchParams;

  const status =
    getFirstValue(params.status);

  const errorCode =
    getFirstValue(params.error);

  const errorMessage =
    getErrorMessage(errorCode);

  const emailSent =
    status === "check-email";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--linen)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[var(--brand-blue)]/8 blur-3xl" />

        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-[var(--brand-orange)]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center px-5 py-12 sm:px-10">
        <section className="mx-auto grid w-full overflow-hidden border border-[var(--border)] bg-white shadow-[0_24px_70px_rgba(18,63,158,0.10)] lg:grid-cols-[0.85fr_1.15fr]">
          {/* Brand panel */}
          <div className="hidden bg-gradient-to-br from-[var(--brand-blue-dark)] via-[var(--brand-blue)] to-[var(--brand-blue-light)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <Link
              href="/auth/login"
              className="inline-flex w-fit items-center gap-2 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75 transition-colors hover:text-white"
            >
              <ArrowLeft
                aria-hidden="true"
                className="h-4 w-4"
                strokeWidth={1.8}
              />

              Return to sign in
            </Link>

            <div className="py-14">
              <span className="flex h-16 w-16 items-center justify-center bg-[var(--brand-orange)] text-white">
                <KeyRound
                  aria-hidden="true"
                  className="h-8 w-8"
                  strokeWidth={1.6}
                />
              </span>

              <h2 className="mt-9 font-[var(--font-display)] text-5xl font-light uppercase leading-[0.98] tracking-[0.035em] text-white">
                Recover
                <br />
                Your
                <br />
                Account
              </h2>

              <p className="mt-6 font-[var(--font-body)] text-sm leading-7 text-white/75">
                We will send a secure recovery link to the email address
                connected to your AthiMart account.
              </p>
            </div>

            <p className="border-t border-white/20 pt-5 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.17em] text-white/55">
              AthiMart secure authentication
            </p>
          </div>

          {/* Form panel */}
          <div className="p-6 sm:p-10 lg:p-14">
            <div className="mb-10 flex items-center justify-between lg:hidden">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-blue)]"
              >
                <ArrowLeft
                  aria-hidden="true"
                  className="h-4 w-4"
                />

                Sign in
              </Link>

              <p className="font-[var(--font-display)] text-xl font-light uppercase tracking-[0.15em] text-[var(--brand-blue-dark)]">
                Athi
                <span className="text-[var(--brand-orange)]">
                  Mart
                </span>
              </p>
            </div>

            {emailSent ? (
              <div>
                <span className="flex h-16 w-16 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
                  <CheckCircle2
                    aria-hidden="true"
                    className="h-8 w-8"
                    strokeWidth={1.7}
                  />
                </span>

                <p className="athimart-label mt-8 text-[var(--brand-orange-dark)]">
                  Recovery request received
                </p>

                <h1 className="athimart-display-medium mt-3 text-[var(--brand-blue-dark)]">
                  Check Your
                  <br />
                  Email
                </h1>

                <p className="athimart-body-large mt-6">
                  If an AthiMart account exists for that email address, a
                  password recovery link has been sent.
                </p>

                <p className="athimart-body mt-4">
                  Open the message and follow the link to create a new
                  password.
                </p>

                <Link
                  href="/auth/login"
                  className="athimart-brand-button mt-8 w-full text-white!"
                >
                  Return to sign in
                </Link>
              </div>
            ) : (
              <>
                <header>
                  <p className="athimart-label text-[var(--brand-orange-dark)]">
                    Account recovery
                  </p>

                  <h1 className="athimart-display-medium mt-3 text-[var(--brand-blue-dark)]">
                    Forgot
                    <br />
                    Password
                  </h1>

                  <p className="athimart-body-large mt-5">
                    Enter your email address to receive a secure password
                    reset link.
                  </p>
                </header>

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
                  action={sendPasswordResetLink}
                  className="mt-9"
                >
                  <label className="block">
                    <span className="athimart-label text-[var(--text-muted)]">
                      Email address
                    </span>

                    <span className="mt-3 flex min-h-16 items-center border-b-2 border-[var(--border-strong)] transition-colors focus-within:border-[var(--brand-blue)]">
                      <Mail
                        aria-hidden="true"
                        className="mr-4 h-5 w-5 shrink-0 text-[var(--brand-blue)]"
                        strokeWidth={1.7}
                      />

                      <input
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        inputMode="email"
                        placeholder="you@example.com"
                        className="min-w-0 flex-1 border-0 bg-transparent py-4 font-[var(--font-display)] text-2xl font-light text-[var(--text)] outline-none placeholder:text-[var(--placeholder)] focus:outline-none focus-visible:!outline-none"
                      />
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="athimart-brand-button mt-9 w-full text-white!"
                  >
                    <Send
                      aria-hidden="true"
                      className="h-5 w-5 text-white!"
                      strokeWidth={1.8}
                    />

                    <span className="text-white!">
                      Send reset link
                    </span>
                  </button>
                </form>

                <p className="mt-7 text-center font-[var(--font-body)] text-sm text-[var(--text-muted)]">
                  Remember your password?{" "}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-[var(--brand-blue)] transition-colors hover:text-[var(--brand-orange-dark)]"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
// app/auth/login/page.tsx

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { login } from "./actions";

export const metadata: Metadata = {
  title: "Sign In",

  description:
    "Sign in to your AthiMart customer account to manage shopping, orders and profile information.",

  robots: {
    index: false,
    follow: true,
  },
};

interface LoginPageProps {
  searchParams: Promise<{
    error?: string | string[];
    next?: string | string[];
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

function getSafeNextPath(
  value: string
): string {
  const path = value.trim();

  if (
    !path.startsWith("/") ||
    path.startsWith("//")
  ) {
    return "/";
  }

  return path;
}

function getErrorMessage(
  errorCode: string
): string {
  switch (errorCode) {
    case "missing-fields":
      return "Enter both your email address and password.";

    case "too-many-attempts":
      return "Too many sign-in attempts. Wait a moment and try again.";

    case "invalid-credentials":
      return "The email address or password is incorrect.";

    default:
      return "";
  }
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params =
    await searchParams;

  const errorCode =
    getFirstValue(params.error);

  const nextPath =
    getSafeNextPath(
      getFirstValue(params.next)
    );

  const errorMessage =
    getErrorMessage(errorCode);

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * A signed-in customer does not need
   * to see the login page again.
   */
  if (user) {
    redirect(nextPath);
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

      <div className="relative mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[0.9fr_1.1fr]">
        {/* Branded section */}
        <section className="hidden overflow-hidden bg-gradient-to-br from-[var(--brand-blue-dark)] via-[var(--brand-blue)] to-[var(--brand-blue-light)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75 transition-colors hover:text-white"
          >
            <ArrowLeft
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={1.8}
            />

            Return to store
          </Link>

          <div className="py-14">
            <div className="inline-flex bg-white p-7 shadow-[0_24px_70px_rgba(0,0,0,0.20)]">
              <Image
                src="/brand/athimart-logo.png"
                alt="AthiMart marketplace logo"
                width={270}
                height={270}
                priority
                className="h-auto w-52 object-contain"
              />
            </div>

            <h2 className="mt-10 font-[var(--font-display)] text-6xl font-light uppercase leading-[0.96] tracking-[0.035em] text-white">
              Mobile
              <br />
              Meets
              <br />
              Web
            </h2>

            <p className="mt-7 max-w-lg font-[var(--font-body)] text-sm leading-7 text-white/72">
              Access the same AthiMart account across the mobile application
              and responsive website.
            </p>
          </div>

          <div className="flex items-center gap-3 border-t border-white/20 pt-6">
            <ShieldCheck
              aria-hidden="true"
              className="h-5 w-5 text-[var(--brand-orange-light)]"
              strokeWidth={1.7}
            />

            <p className="font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
              Secure Supabase authentication
            </p>
          </div>
        </section>

        {/* Login form section */}
        <section className="flex items-center px-5 py-10 sm:px-10 lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-xl">
            {/* Mobile brand */}
            <div className="mb-14 flex items-center justify-between lg:hidden">
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
                aria-label="Return to store"
                className="flex h-11 w-11 items-center justify-center border border-[var(--border)] bg-white text-[var(--brand-blue)]"
              >
                <ArrowLeft
                  aria-hidden="true"
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />
              </Link>
            </div>

            <header>
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Customer account
              </p>

              <h1 className="athimart-display-large mt-4 text-[var(--brand-blue-dark)]">
                Welcome
                <br />
                Back
              </h1>

              <p className="athimart-body-large mt-5">
                Sign in to continue shopping and manage your AthiMart account.
              </p>
            </header>

            {errorMessage && (
              <div
                role="alert"
                className="mt-7 border-l-4 border-[var(--sale)] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(180,35,24,0.08)]"
              >
                <p className="font-[var(--font-body)] text-sm leading-6 text-[var(--sale)]">
                  {errorMessage}
                </p>
              </div>
            )}

            <form
              action={login}
              className="mt-9"
            >
              <input
                type="hidden"
                name="next"
                value={nextPath}
              />

              {/* Email */}
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
                    className="min-w-0 flex-1 border-0 bg-transparent py-4 font-[var(--font-display)] text-2xl font-light text-[var(--text)] outline-none placeholder:text-[var(--placeholder)] focus:outline-none focus-visible:!outline-none sm:text-3xl"
                  />
                </span>
              </label>

              {/* Password */}
              <label className="mt-7 block">
                <span className="athimart-label text-[var(--text-muted)]">
                  Password
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
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="min-w-0 flex-1 border-0 bg-transparent py-4 font-[var(--font-display)] text-2xl font-light text-[var(--text)] outline-none placeholder:text-[var(--placeholder)] focus:outline-none focus-visible:!outline-none sm:text-3xl"
                  />
                </span>
              </label>

              <div className="mt-5 flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-blue)] transition-colors hover:text-[var(--brand-orange-dark)]"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="athimart-brand-button mt-8 w-full text-white!"
              >
                <LogIn
                  aria-hidden="true"
                  className="h-5 w-5 text-white!"
                  strokeWidth={1.8}
                />

                <span className="text-white!">
                  Sign in
                </span>
              </button>
            </form>

            <p className="mt-8 text-center font-[var(--font-body)] text-sm text-[var(--text-muted)]">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="font-semibold text-[var(--brand-blue)] transition-colors hover:text-[var(--brand-orange-dark)]"
              >
                Create one
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
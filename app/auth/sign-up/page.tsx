// app/auth/sign-up/page.tsx

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Store,
  UserPlus,
  UserRound,
} from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { signUp } from "./actions";

export const metadata: Metadata = {
  title: "Create Account",

  description:
    "Create an AthiMart buyer account or apply for an approved seller account.",

  robots: {
    index: false,
    follow: true,
  },
};

type AccountType =
  | "buyer"
  | "seller";

interface SignUpPageProps {
  searchParams: Promise<{
    error?: string | string[];
    status?: string | string[];
    email?: string | string[];
    next?: string | string[];
    accountType?: string | string[];
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

function getSafeNextPath(
  value: string
): string {
  const path =
    value.trim();

  if (
    !path.startsWith("/") ||
    path.startsWith("//")
  ) {
    return "/";
  }

  return path;
}

function getAccountType(
  value: string
): AccountType {
  return value === "seller"
    ? "seller"
    : "buyer";
}

function getErrorMessage(
  errorCode: string
): string {
  switch (errorCode) {
    case "missing-fields":
      return "Enter your name, email address and both password fields.";

    case "weak-password":
      return "Use a password containing at least eight characters.";

    case "password-mismatch":
      return "The two passwords do not match.";

    case "email-already-exists":
      return "An AthiMart account already exists with this email address. Sign in instead.";

    case "too-many-attempts":
      return "The confirmation email limit has been reached. Please wait about one hour before creating another account.";

    case "confirmation-failed":
      return "The confirmation link is invalid or has expired. Request a new confirmation email or try signing in if your account was already verified.";

    case "signup-failed":
      return "The account could not be created. Check your information and try again.";

    default:
      return "";
  }
}

export default async function SignUpPage({
  searchParams,
}: SignUpPageProps) {
  const params =
    await searchParams;

  const errorCode =
    getFirstValue(
      params.error
    );

  const status =
    getFirstValue(
      params.status
    );

  const email =
    getFirstValue(
      params.email
    );

  const nextPath =
    getSafeNextPath(
      getFirstValue(
        params.next
      )
    );

  const accountType =
    getAccountType(
      getFirstValue(
        params.accountType
      )
    );

  const isSeller =
    accountType === "seller";

  const errorMessage =
    getErrorMessage(
      errorCode
    );

  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (user) {
    redirect(nextPath);
  }

  const awaitingConfirmation =
    status === "check-email";

  const loginSearchParams =
    new URLSearchParams({
      next: nextPath,
    });

  const loginUrl =
    `/auth/login?${loginSearchParams.toString()}`;

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
        {/* Desktop brand panel */}
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
              One
              <br />
              Account
              <br />
              Everywhere
            </h2>

            <p className="mt-7 max-w-lg font-[var(--font-body)] text-sm leading-7 text-white/75">
              Create one AthiMart
              account for the connected
              mobile application and
              responsive website.
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

        {/* Registration panel */}
        <section className="flex px-5 py-6 sm:px-10 sm:py-10 lg:items-center lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-2xl">
            {/* Mobile header */}
            <div className="mb-12 flex items-center justify-between lg:hidden">
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
                aria-label="Return to AthiMart store"
                className="flex h-11 w-11 items-center justify-center border border-[var(--border)] bg-white text-[var(--brand-blue)]"
              >
                <ArrowLeft
                  aria-hidden="true"
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />
              </Link>
            </div>

            {awaitingConfirmation ? (
              <section>
                <span className="flex h-16 w-16 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
                  <CheckCircle2
                    aria-hidden="true"
                    className="h-8 w-8"
                    strokeWidth={1.7}
                  />
                </span>

                <p className="athimart-label mt-8 text-[var(--brand-orange-dark)]">
                  Registration received
                </p>

                <h1 className="athimart-display-medium mt-3 text-[var(--brand-blue-dark)]">
                  Check Your
                  <br />
                  Email
                </h1>

                <p className="athimart-body-large mt-6">
                  We sent a confirmation
                  link to:
                </p>

                <p className="mt-3 break-all font-[var(--font-body)] text-sm font-semibold text-[var(--brand-blue)]">
                  {email ||
                    "your email address"}
                </p>

                <div className="mt-7 border-l-4 border-[var(--brand-orange)] bg-white px-5 py-4">
                  {isSeller ? (
                    <>
                      <p className="font-[var(--font-body)] text-sm font-semibold text-[var(--brand-orange-dark)]">
                        Seller application
                      </p>

                      <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                        Confirm your email
                        address first. After
                        confirmation, your
                        seller request will
                        remain pending until
                        an AthiMart
                        administrator approves
                        it.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-[var(--font-body)] text-sm font-semibold text-[var(--brand-blue)]">
                        Buyer account
                      </p>

                      <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                        Confirm your email
                        address to activate
                        your buyer account and
                        continue shopping on
                        AthiMart.
                      </p>
                    </>
                  )}
                </div>

                <p className="athimart-body mt-6">
                  Open the latest AthiMart
                  email and click the
                  confirmation button. Check
                  your spam folder when the
                  message is not visible in
                  your inbox.
                </p>

                <Link
                  href={loginUrl}
                  className="athimart-brand-button mt-8 w-full text-white!"
                >
                  <span className="text-white!">
                    Continue to sign in
                  </span>
                </Link>

                <Link
                  href="/auth/sign-up"
                  className="athimart-brand-outline-button mt-3 w-full"
                >
                  Register another account
                </Link>
              </section>
            ) : (
              <>
                <header>
                  <p className="athimart-label text-[var(--brand-orange-dark)]">
                    Account registration
                  </p>

                  <h1 className="athimart-display-large mt-4 text-[var(--brand-blue-dark)]">
                    Create
                    <br />
                    Account
                  </h1>

                  <p className="athimart-body-large mt-5 max-w-2xl">
                    Choose whether you want
                    to shop as a buyer or
                    apply to sell products
                    through AthiMart.
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
                  action={signUp}
                  className="mt-9"
                >
                  <input
                    type="hidden"
                    name="next"
                    value={nextPath}
                  />

                  {/* Account type */}
                  <fieldset>
                    <legend className="athimart-label text-[var(--text-muted)]">
                      Select account type
                    </legend>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {/* Buyer */}
                      <label className="cursor-pointer">
                        <input
                          type="radio"
                          name="accountType"
                          value="buyer"
                          defaultChecked={
                            !isSeller
                          }
                          className="peer sr-only"
                        />

                        <span className="flex min-h-46 flex-col border-2 border-[var(--border)] bg-white p-5 transition-all peer-checked:border-[var(--brand-blue)] peer-checked:bg-[var(--brand-blue-soft)]">
                          <span className="flex h-11 w-11 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)] peer-checked:bg-white">
                            <ShoppingBag
                              aria-hidden="true"
                              className="h-5 w-5"
                              strokeWidth={1.8}
                            />
                          </span>

                          <span className="mt-6 font-[var(--font-display)] text-2xl font-light text-[var(--brand-blue-dark)]">
                            Buyer
                          </span>

                          <span className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                            Shop products,
                            manage orders and
                            maintain your
                            customer profile.
                          </span>
                        </span>
                      </label>

                      {/* Seller */}
                      <label className="cursor-pointer">
                        <input
                          type="radio"
                          name="accountType"
                          value="seller"
                          defaultChecked={
                            isSeller
                          }
                          className="peer sr-only"
                        />

                        <span className="flex min-h-46 flex-col border-2 border-[var(--border)] bg-white p-5 transition-all peer-checked:border-[var(--brand-orange)] peer-checked:bg-[var(--brand-orange-soft)]">
                          <span className="flex h-11 w-11 items-center justify-center bg-[var(--brand-orange-soft)] text-[var(--brand-orange)]">
                            <Store
                              aria-hidden="true"
                              className="h-5 w-5"
                              strokeWidth={1.8}
                            />
                          </span>

                          <span className="mt-6 font-[var(--font-display)] text-2xl font-light text-[var(--brand-blue-dark)]">
                            Seller
                          </span>

                          <span className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                            Confirm your email,
                            then wait for
                            administrator
                            approval before
                            selling.
                          </span>
                        </span>
                      </label>
                    </div>
                  </fieldset>

                  {/* Full name */}
                  <label className="mt-9 block">
                    <span className="athimart-label text-[var(--text-muted)]">
                      Full name
                    </span>

                    <span className="mt-3 flex min-h-16 items-center border-b-2 border-[var(--border-strong)] transition-colors focus-within:border-[var(--brand-blue)]">
                      <UserRound
                        aria-hidden="true"
                        className="mr-4 h-5 w-5 shrink-0 text-[var(--brand-blue)]"
                        strokeWidth={1.7}
                      />

                      <input
                        type="text"
                        name="fullName"
                        required
                        minLength={2}
                        maxLength={120}
                        autoComplete="name"
                        placeholder="Your full name"
                        className="min-w-0 flex-1 border-0 bg-transparent py-4 font-[var(--font-display)] text-xl font-light text-[var(--text)] outline-none placeholder:text-[var(--placeholder)] focus:outline-none focus-visible:!outline-none sm:text-2xl"
                      />
                    </span>
                  </label>

                  {/* Email */}
                  <label className="mt-7 block">
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
                        className="min-w-0 flex-1 border-0 bg-transparent py-4 font-[var(--font-display)] text-xl font-light text-[var(--text)] outline-none placeholder:text-[var(--placeholder)] focus:outline-none focus-visible:!outline-none sm:text-2xl"
                      />
                    </span>
                  </label>

                  {/* Phone */}
                  <label className="mt-7 block">
                    <span className="athimart-label text-[var(--text-muted)]">
                      Phone number — optional
                    </span>

                    <span className="mt-3 flex min-h-16 items-center border-b-2 border-[var(--border-strong)] transition-colors focus-within:border-[var(--brand-blue)]">
                      <Phone
                        aria-hidden="true"
                        className="mr-4 h-5 w-5 shrink-0 text-[var(--brand-blue)]"
                        strokeWidth={1.7}
                      />

                      <input
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        inputMode="tel"
                        maxLength={30}
                        placeholder="+94 77 123 4567"
                        className="min-w-0 flex-1 border-0 bg-transparent py-4 font-[var(--font-display)] text-xl font-light text-[var(--text)] outline-none placeholder:text-[var(--placeholder)] focus:outline-none focus-visible:!outline-none sm:text-2xl"
                      />
                    </span>
                  </label>

                  {/* Password fields */}
                  <div className="mt-7 grid gap-7 sm:grid-cols-2">
                    <label className="block">
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
                          minLength={8}
                          autoComplete="new-password"
                          placeholder="Minimum 8 characters"
                          className="min-w-0 flex-1 border-0 bg-transparent py-4 font-[var(--font-display)] text-lg font-light text-[var(--text)] outline-none placeholder:text-[var(--placeholder)] focus:outline-none focus-visible:!outline-none"
                        />
                      </span>
                    </label>

                    <label className="block">
                      <span className="athimart-label text-[var(--text-muted)]">
                        Confirm password
                      </span>

                      <span className="mt-3 flex min-h-16 items-center border-b-2 border-[var(--border-strong)] transition-colors focus-within:border-[var(--brand-blue)]">
                        <LockKeyhole
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
                          placeholder="Repeat password"
                          className="min-w-0 flex-1 border-0 bg-transparent py-4 font-[var(--font-display)] text-lg font-light text-[var(--text)] outline-none placeholder:text-[var(--placeholder)] focus:outline-none focus-visible:!outline-none"
                        />
                      </span>
                    </label>
                  </div>

                  <div className="mt-7 flex items-start gap-3 border-l-4 border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] px-4 py-3">
                    <ShieldCheck
                      aria-hidden="true"
                      className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-orange-dark)]"
                      strokeWidth={1.8}
                    />

                    <p className="font-[var(--font-body)] text-xs leading-6 text-[var(--text-soft)]">
                      A confirmation email
                      will be sent before the
                      account can be used.
                      Seller accounts also
                      require administrator
                      approval.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="athimart-brand-button mt-8 w-full text-white!"
                  >
                    <UserPlus
                      aria-hidden="true"
                      className="h-5 w-5 text-white!"
                      strokeWidth={1.8}
                    />

                    <span className="text-white!">
                      Create account
                    </span>
                  </button>
                </form>

                <p className="mt-7 text-center font-[var(--font-body)] text-sm text-[var(--text-muted)]">
                  Already have an account?{" "}

                  <Link
                    href={loginUrl}
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
// app/auth/sign-up/page.tsx

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, MailCheck, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import SignUpExperience from "./sign-up-experience";
import SignUpForm from "./sign-up-form";
import SignUpVisual from "./sign-up-visual";
import styles from "./sign-up.module.css";

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
    <SignUpExperience>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <Link href="/" className={styles.brand} aria-label="AthiMart home">
            <Image src="/brand/athimart-logo.png" alt="" width={44} height={44} priority />
            <span>Athi<span className={styles.brandAccent}>Mart</span><span className={styles.brandDot}>.</span></span>
          </Link>
          <Link href="/" className={styles.backLink}><ArrowLeft size={16} aria-hidden="true" /> Back to store</Link>
        </header>
        <div className={styles.layout}>
          <section className={styles.story} aria-labelledby="signup-story-title">
            <div className={styles.storyCopy}>
              <p className={styles.eyebrow}><span /> YOUR NEXT CHAPTER STARTS HERE</p>
              <h2 id="signup-story-title">One account.<br />A world of <span>possibilities.</span></h2>
              <p>Discover your next favourite find.<br />Or turn your passion into a storefront.</p>
            </div>
            <SignUpVisual />
            <div className={styles.benefits}>
              <span><Check size={14} aria-hidden="true" /> Shop your favourites</span>
              <span><Check size={14} aria-hidden="true" /> Build your business</span>
            </div>
            <div className={styles.storyFooter}>
              <span className={styles.footerIcon}><Smartphone size={20} strokeWidth={1.6} aria-hidden="true" /></span>
              <p><strong>Your world, connected.</strong><span>One account for our website and mobile app.</span></p>
              <Sparkles size={18} aria-hidden="true" />
            </div>
          </section>
          <section className={styles.formPanel} aria-labelledby="signup-title">
            <div className={styles.cardStage}>
              <div className={styles.card}>
                {awaitingConfirmation ? (
                  <div className={styles.confirmation}>
                    <span className={styles.confirmationIcon}><MailCheck size={34} strokeWidth={1.5} aria-hidden="true" /></span>
                    <p className={styles.formEyebrow}>YOU’RE ALMOST THERE</p>
                    <h1 id="signup-title">Check your <span>inbox.</span></h1>
                    <p className={styles.formIntro}>We sent a confirmation link to<br /><strong className={styles.email}>{email || "your email address"}</strong></p>
                    <div className={styles.confirmationNote}>
                      <ShieldCheck size={21} aria-hidden="true" />
                      <div><strong>{isSeller ? "Your seller application" : "Your buyer account"}</strong><p>{isSeller ? "Confirm your email first. Your application will then be reviewed by an AthiMart administrator before you can start selling." : "Confirm your email to activate your account and start discovering your favourites."}</p></div>
                    </div>
                    <p className={styles.inboxHelp}>Open the latest AthiMart email and follow the confirmation link. Check your spam folder if you don’t see it.</p>
                    <Link href={loginUrl} className={styles.submitButton}>Continue to sign in <ArrowRight size={18} aria-hidden="true" /></Link>
                    <Link href={`/auth/sign-up?${new URLSearchParams({ next: nextPath, accountType }).toString()}`} className={styles.secondaryButton}>Register another account</Link>
                  </div>
                ) : (
                  <>
                    <header className={styles.formHeader}>
                      <div className={styles.miniScene} aria-hidden="true"><span className={styles.miniHead} /><span className={styles.miniBody} /><span className={styles.miniPlus}>+</span></div>
                      <p className={styles.formEyebrow}>A LITTLE SIGNUP. A LOT TO DISCOVER.</p>
                      <h1 id="signup-title">Make yourself <span>at home.</span></h1>
                      <p className={styles.formIntro}>Create your account. Your next favourite awaits.</p>
                    </header>
                    <SignUpForm nextPath={nextPath} accountType={accountType} errorMessage={errorMessage} />
                    <p className={styles.signin}>Already part of AthiMart? <Link href={loginUrl}>Sign in <ArrowRight size={14} aria-hidden="true" /></Link></p>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
        <footer className={styles.pageFooter}>
          <p>A little discovery. A little delight. All AthiMart.</p>
          <span><ShieldCheck size={14} aria-hidden="true" /> Your account, protected.</span>
        </footer>
      </div>
    </SignUpExperience>
  );
}

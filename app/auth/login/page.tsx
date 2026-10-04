import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ShoppingBag, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import LoginForm from "./login-form";
import LoginVisual from "./login-visual";
import LoginExperience from "./login-experience";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your AthiMart customer account to manage shopping, orders and profile information.",
  robots: { index: false, follow: true },
};

interface LoginPageProps {
  searchParams: Promise<{
    error?: string | string[];
    next?: string | string[];
  }>;
}

function getFirstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getSafeNextPath(value: string): string {
  const path = value.trim();
  return !path.startsWith("/") || path.startsWith("//") ? "/" : path;
}

function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "missing-fields":
      return "Enter both your email address and password.";
    case "too-many-attempts":
      return "Too many sign-in attempts. Wait a moment and try again.";
    case "invalid-credentials":
      return "The email address or password is incorrect.";
    case "profile-check-failed":
      return "We couldn’t load your account. Please try signing in again.";
    default:
      return "";
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(getFirstValue(params.next));
  const errorMessage = getErrorMessage(getFirstValue(params.error));
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect(nextPath);

  return (
    <LoginExperience>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <Link href="/" className={styles.brand} aria-label="AthiMart home">
            <span className={styles.brandIcon}><ShoppingBag size={21} strokeWidth={1.7} aria-hidden="true" /></span>
            <span>Athi<span className={styles.brandAccent}>Mart</span><span className={styles.brandDot}>.</span></span>
          </Link>
          <Link href="/" className={styles.backLink}><ArrowLeft size={15} aria-hidden="true" /><span>Back to shopping</span></Link>
        </header>

        <div className={styles.layout}>
          <section className={styles.story} aria-labelledby="login-story-heading">
            <div className={styles.storyCopy}>
              <p className={styles.eyebrow}><span /> YOUR EVERYDAY MARKETPLACE</p>
              <h2 id="login-story-heading">Good finds.<br /><span>Great possibilities.</span></h2>
              <p>A world of favourites, all in one place.<br />Your next discovery starts here.</p>
            </div>
            <LoginVisual />
            <div className={styles.storyFooter}>
              <span className={styles.storyFooterIcon}><Sparkles size={18} strokeWidth={1.5} aria-hidden="true" /></span>
              <p>One account. <strong>Every possibility.</strong><span>Connected across mobile and web.</span></p>
              <ArrowUpRight size={19} strokeWidth={1.5} aria-hidden="true" />
            </div>
          </section>

          <section className={styles.formPanel} aria-labelledby="login-heading">
            <div className={styles.formDecorations} aria-hidden="true">
              <span className={styles.formHalo} />
              <span className={styles.floatingRing} />
              <span className={styles.floatingSphere} />
              <span className={styles.floatingCube}><span /><span /><span /></span>
              <span className={styles.floatingPearl} />
            </div>
            <div className={styles.cardStage}>
              <div className={styles.formContent} data-login-card>
                <div className={styles.lockScene} aria-hidden="true">
                  <span className={styles.lockShadow} />
                  <div className={styles.lockObject}><span className={styles.lockShackle} /><span className={styles.lockBody}><span className={styles.keyhole} /></span></div>
                  <span className={styles.lockSparkle}><Sparkles size={20} strokeWidth={1.5} /></span>
                </div>
                <p className={styles.formEyebrow}>YOUR ATHIMART ACCOUNT</p>
                <h1 id="login-heading">Welcome back<span>.</span></h1>
                <p className={styles.formIntro}>Good to see you again. Sign in to pick up<br className={styles.formBreak} /> where you left off.</p>
                <LoginForm nextPath={nextPath} errorMessage={errorMessage} />
                <p className={styles.signup}>New around here? <Link href={`/auth/sign-up?next=${encodeURIComponent(nextPath)}`}>Create an account <ArrowUpRight size={13} aria-hidden="true" /></Link></p>
                <div className={styles.formNote}><span /> Your favourites. Your orders. Your AthiMart.</div>
              </div>
            </div>
          </section>
        </div>

        <footer className={styles.pageFooter}>
          <p>AthiMart · A little more discovery, every day.</p>
          <Link href="/">Explore the marketplace <ArrowUpRight size={12} aria-hidden="true" /></Link>
        </footer>
      </div>
    </LoginExperience>
  );
}

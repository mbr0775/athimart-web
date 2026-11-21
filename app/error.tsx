"use client";

import Link from "@/components/navigation/navigation-link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import styles from "./status.module.css";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className={styles.page}>
      <div className={styles.content} role="alert">
        <span className={styles.icon}>
          <RotateCcw size={28} strokeWidth={1.2} aria-hidden="true" />
        </span>
        <p className={styles.eyebrow}>A small pause in your discovery</p>
        <h1>
          Let&apos;s give that
          <br />
          <em>another try.</em>
        </h1>
        <p className={styles.description}>
          Something went wrong while loading this page. Please try again in a
          moment.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={reset}
            className="athimart-brand-button"
          >
            Try again
            <RotateCcw size={15} aria-hidden="true" />
          </button>
          <Link href="/" className={styles.back}>
            <ArrowLeft size={15} aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

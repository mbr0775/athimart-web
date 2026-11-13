import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Compass } from "lucide-react";
import styles from "./status.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <span className={styles.icon}>
          <Compass size={30} strokeWidth={1.2} aria-hidden="true" />
        </span>
        <p className={styles.eyebrow}>A different path to discovery · 404</p>
        <h1>
          This find has
          <br />
          <em>wandered off.</em>
        </h1>
        <p className={styles.description}>
          We couldn&apos;t find that page. There are plenty more good finds
          waiting in the marketplace.
        </p>
        <div className={styles.actions}>
          <Link href="/shop" className="athimart-brand-button">
            Explore the shop
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/" className={styles.back}>
            <ArrowLeft size={15} aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </div>
      <span className={styles.backdrop} aria-hidden="true">
        404
      </span>
    </main>
  );
}

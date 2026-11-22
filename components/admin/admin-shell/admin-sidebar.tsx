"use client";

import Link from "@/components/navigation/navigation-link";
import { ArrowUpRight, ShieldCheck, UserRound, X } from "lucide-react";
import AdminNavigation from "./admin-navigation";
import AdminAvatar from "./admin-avatar";
import styles from "@/components/layout/workspace-shell.module.css";

export default function AdminSidebar({
  displayName,
  email,
  onClose,
}: {
  displayName: string;
  email: string;
  mobile?: boolean;
  onClose?: () => void;
}) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brandRow}>
        <Link href="/admin" className={styles.brand} onClick={onClose}>
          AthiMart<span>.</span>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close administrator menu"
            className={styles.closeButton}
          >
            <X size={20} aria-hidden="true" />
          </button>
        )}
      </div>
      <p className={styles.sidebarEyebrow}>The marketplace workspace</p>
      <div className={styles.sidebarScroll}>
        <p className={styles.navLabel}>Manage your marketplace</p>
        <AdminNavigation onNavigate={onClose} />
        <div className={styles.quickLinks}>
          <Link href="/" onClick={onClose}>
            Visit the storefront
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/account" onClick={onClose}>
            Your account
            <UserRound size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className={styles.profile}>
        <AdminAvatar name={displayName} />
        <div>
          <p>{displayName}</p>
          <span>{email}</span>
        </div>
        <ShieldCheck size={18} aria-hidden="true" />
      </div>
    </aside>
  );
}

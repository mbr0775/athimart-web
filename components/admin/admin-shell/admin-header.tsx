"use client";

import Link from "@/components/navigation/navigation-link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, ShieldCheck } from "lucide-react";
import AdminAvatar from "./admin-avatar";
import { adminNavigationItems } from "./admin-navigation";
import styles from "@/components/layout/workspace-shell.module.css";

export default function AdminHeader({
  displayName,
  onMenuClick,
}: {
  displayName: string;
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const item = [...adminNavigationItems]
    .reverse()
    .find(
      (item) =>
        pathname === item.href ||
        (item.href !== "/admin" && pathname.startsWith(item.href + "/")),
    );
  return (
    <header className={styles.header}>
      <button
        type="button"
        onClick={onMenuClick}
        className={styles.menuButton}
        aria-label="Open administrator menu"
        aria-haspopup="dialog"
      >
        <Menu size={20} aria-hidden="true" />
      </button>
      <div className={styles.headerTitle}>
        <span>AthiMart administration</span>
        <p>{item?.label ?? "Your workspace"}</p>
      </div>
      <div className={styles.headerActions}>
        <Link href="/">
          View store
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
        <span className={styles.roleBadge}>
          <ShieldCheck size={14} aria-hidden="true" />
          Administrator
        </span>
        <AdminAvatar name={displayName} />
      </div>
    </header>
  );
}

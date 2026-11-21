"use client";

import Link from "@/components/navigation/navigation-link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  CirclePlus,
  LayoutDashboard,
  Menu,
  Package,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import AdminAvatar from "@/components/admin/admin-shell/admin-avatar";
import { useProfileIdentity } from "@/components/account/profile-provider";
import styles from "@/components/layout/workspace-shell.module.css";

const links = [
  { label: "Overview", href: "/seller", icon: LayoutDashboard },
  { label: "Your products", href: "/seller/products", icon: Package },
  { label: "Add a product", href: "/seller/products/new", icon: CirclePlus },
];

export default function SellerShell({
  children,
  displayName: initialDisplayName,
  email,
}: {
  children: ReactNode;
  displayName: string;
  email: string;
}) {
  const displayName = useProfileIdentity()?.name || initialDisplayName;
  const pathname = usePathname();
  const active = [...links]
    .reverse()
    .find(
      (item) =>
        item.href === pathname ||
        (item.href !== "/seller" && pathname.startsWith(item.href + "/")),
    );
  const dialog = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const query = window.matchMedia("(min-width:1024px)");
    const close = () => {
      if (query.matches) dialog.current?.close();
    };
    query.addEventListener("change", close);
    return () => {
      document.body.style.overflow = previous;
      query.removeEventListener("change", close);
    };
  }, [isOpen]);
  function sidebar(mobile = false) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.brandRow}>
          <Link
            href="/seller"
            className={styles.brand}
            onClick={() => dialog.current?.close()}
          >
            AthiMart<span>.</span>
          </Link>
          {mobile && (
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => dialog.current?.close()}
              aria-label="Close seller menu"
            >
              <X size={20} aria-hidden="true" />
            </button>
          )}
        </div>
        <p className={styles.sidebarEyebrow}>
          Your marketplace. Your possibilities.
        </p>
        <div className={styles.sidebarScroll}>
          <p className={styles.navLabel}>Your seller centre</p>
          <nav aria-label="Seller navigation" className={styles.navigation}>
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active?.href === item.href ? "page" : undefined}
                  onClick={() => dialog.current?.close()}
                >
                  <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
                  <span>{item.label}</span>
                  {active?.href === item.href && (
                    <span className={styles.activeDot} aria-hidden="true" />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className={styles.quickLinks}>
            <Link href="/" onClick={() => dialog.current?.close()}>
              Visit the storefront
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/account" onClick={() => dialog.current?.close()}>
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
  return (
    <div className={`athimart-workspace ${styles.shell}`}>
      <div className={styles.desktopSidebar}>{sidebar()}</div>
      <div className={styles.content}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.menuButton}
            aria-label="Open seller menu"
            aria-haspopup="dialog"
            onClick={() => {
              dialog.current?.showModal();
              setIsOpen(true);
            }}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <div className={styles.headerTitle}>
            <span>AthiMart seller centre</span>
            <p>{active?.label ?? "Your workspace"}</p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/">
              View store
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
            <span className={styles.roleBadge}>
              <ShieldCheck size={14} aria-hidden="true" />
              Approved seller
            </span>
            <AdminAvatar name={displayName} />
          </div>
        </header>
        <main className={styles.main} id="seller-content">
          {children}
        </main>
      </div>
      <dialog
        ref={dialog}
        className={styles.mobileDialog}
        aria-label="Seller menu"
        onClose={() => setIsOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const targets = event.currentTarget.querySelectorAll<HTMLElement>(
            "a[href],button:not(:disabled)",
          );
          const first = targets[0],
            last = targets[targets.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        {sidebar(true)}
      </dialog>
    </div>
  );
}

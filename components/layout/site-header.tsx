// components/layout/site-header.tsx

import {
  Bell,
  Search,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { HeaderAuthActions } from "@/components/auth/header-auth-actions";

interface NavigationItem {
  label: string;
  href: string;
  className?: string;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Shop",
    href: "/shop",
  },
  {
    label: "Categories",
    href: "/#categories",
  },
  {
    label: "Markets",
    href: "/#markets",
    className: "hidden xl:inline-flex",
  },
  {
    label: "Why AthiMart",
    href: "/#why-athimart",
    className: "hidden xl:inline-flex",
  },
];

/**
 * Temporary placeholder displayed while the server
 * checks the current Supabase authentication state.
 */
function HeaderAuthFallback() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-2"
    >
      {/* Mobile placeholder */}
      <span className="h-12 w-12 animate-pulse border border-[var(--border)] bg-white lg:hidden" />

      {/* Desktop placeholders */}
      <span className="hidden h-12 w-24 animate-pulse border border-[var(--border)] bg-white lg:block" />

      <span className="hidden h-12 w-36 animate-pulse bg-[var(--brand-orange-soft)] lg:block" />
    </div>
  );
}

/**
 * Main AthiMart storefront header.
 *
 * Authentication controls are loaded separately through
 * HeaderAuthActions so signed-out users, customers and
 * administrators see the correct actions.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--linen)] shadow-[0_6px_24px_rgba(18,63,158,0.04)]">
      {/* AthiMart blue-to-orange brand line */}
      <div
        aria-hidden="true"
        className="h-[3px] w-full bg-gradient-to-r from-[var(--brand-blue-dark)] via-[var(--brand-blue)] to-[var(--brand-orange)]"
      />

      <div className="athimart-container">
        <div className="flex min-h-[82px] items-center justify-between gap-4 lg:min-h-[102px]">
          {/* =================================================
              AthiMart brand
          ================================================== */}
          <Link
            href="/"
            aria-label="AthiMart homepage"
            className="group flex shrink-0 items-center"
          >
            <span className="font-[var(--font-display)] text-[25px] font-light uppercase leading-none tracking-[0.17em] text-[var(--brand-blue-dark)] transition-colors duration-200 group-hover:text-[var(--brand-blue)] sm:text-[30px] lg:text-[34px]">
              Athi
            </span>

            <span className="font-[var(--font-display)] text-[25px] font-light uppercase leading-none tracking-[0.17em] text-[var(--brand-orange)] transition-colors duration-200 group-hover:text-[var(--brand-orange-dark)] sm:text-[30px] lg:text-[34px]">
              Mart
            </span>
          </Link>

          {/* =================================================
              Desktop navigation
          ================================================== */}
          <nav
            aria-label="Primary navigation"
            className="hidden min-w-0 flex-1 items-center justify-center gap-6 lg:flex xl:gap-8"
          >
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`relative min-h-11 items-center justify-center whitespace-nowrap px-1 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text)] transition-colors duration-200 after:absolute after:inset-x-1 after:bottom-1 after:h-[2px] after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-[var(--brand-blue)] after:to-[var(--brand-orange)] after:transition-transform after:duration-300 hover:text-[var(--brand-blue)] hover:after:scale-x-100 ${
                  item.className ?? "inline-flex"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* =================================================
              Header actions
          ================================================== */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Search */}
            <Link
              href="/search"
              aria-label="Search AthiMart products"
              title="Search products"
              className="flex h-12 w-12 items-center justify-center border border-[var(--border)] bg-white text-[var(--text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:bg-[var(--brand-blue-soft)] hover:text-[var(--brand-blue)]"
            >
              <Search
                aria-hidden="true"
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            </Link>

            {/* Notifications */}
            <Link
              href="/notifications"
              aria-label="View notifications"
              title="Notifications"
              className="hidden h-12 w-12 items-center justify-center border border-[var(--border)] bg-white text-[var(--text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-orange)] hover:bg-[var(--brand-orange-soft)] hover:text-[var(--brand-orange-dark)] xl:flex"
            >
              <Bell
                aria-hidden="true"
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            </Link>

            {/* Shopping cart */}
            <Link
              href="/cart"
              aria-label="Open shopping cart"
              title="Shopping cart"
              className="hidden h-12 w-12 items-center justify-center border border-[var(--border)] bg-white text-[var(--text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:bg-[var(--brand-blue-soft)] hover:text-[var(--brand-blue)] xl:flex"
            >
              <ShoppingBag
                aria-hidden="true"
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            </Link>

            {/* Dynamic login, registration, account and admin controls */}
            <Suspense fallback={<HeaderAuthFallback />}>
              <HeaderAuthActions />
            </Suspense>
          </div>
        </div>
      </div>
    </header>
  );
}
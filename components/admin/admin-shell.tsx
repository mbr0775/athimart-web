"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  Boxes,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

interface AdminShellProps {
  children: ReactNode;
  displayName: string;
  email: string;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  externalSection?: boolean;
}

const managementNavigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Boxes,
  },
  {
    label: "Seller Requests",
    href: "/admin/seller-requests",
    icon: UsersRound,
  },
  {
    label: "Manage Sellers",
    href: "/admin/sellers",
    icon: UserRound,
  },
  {
    label: "Delivery Partners",
    href: "/admin/delivery-partners",
    icon: Truck,
  },
];

const accountNavigation: NavigationItem[] = [
  {
    label: "View AthiMart Store",
    href: "/shop",
    icon: ShoppingBag,
    externalSection: true,
  },
  {
    label: "My Account",
    href: "/account",
    icon: UserRound,
    externalSection: true,
  },
];

function isNavigationActive(
  pathname: string,
  item: NavigationItem
): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`)
  );
}

function getInitials(
  displayName: string
): string {
  const parts = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "A";
  }

  const firstName =
    parts[0] ?? "A";

  if (parts.length === 1) {
    return firstName
      .slice(0, 2)
      .toUpperCase();
  }

  const lastName =
    parts.at(-1) ??
    firstName;

  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getCurrentPageTitle(
  pathname: string
): string {
  if (
    pathname.startsWith(
      "/admin/delivery-partners"
    )
  ) {
    return "Delivery Partners";
  }

  if (
    pathname.startsWith(
      "/admin/seller-requests"
    )
  ) {
    return "Seller Requests";
  }

  if (
    pathname.startsWith(
      "/admin/sellers"
    )
  ) {
    return "Manage Sellers";
  }

  if (
    pathname.startsWith(
      "/admin/products"
    )
  ) {
    return "Products";
  }

  return "Dashboard";
}

interface NavigationLinksProps {
  items: NavigationItem[];
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}

function NavigationLinks({
  items,
  pathname,
  collapsed = false,
  onNavigate,
}: Readonly<NavigationLinksProps>) {
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const active =
          isNavigationActive(
            pathname,
            item
          );

        const Icon =
          item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            title={
              collapsed
                ? item.label
                : undefined
            }
            aria-current={
              active
                ? "page"
                : undefined
            }
            onClick={onNavigate}
            className={`group relative flex min-h-[52px] items-center rounded-2xl transition-all duration-300 ease-out motion-reduce:transition-none ${
              collapsed
                ? "justify-center px-3"
                : "gap-3.5 px-4"
            } ${
              active
                ? "bg-white text-[var(--brand-blue)] shadow-[0_14px_35px_rgba(5,24,74,0.22)]"
                : "text-white/[0.68] hover:translate-x-1 hover:bg-white/10 hover:text-white motion-reduce:hover:translate-x-0"
            }`}
          >
            {active && (
              <span className="absolute -left-1 h-7 w-1 rounded-full bg-[var(--brand-orange)]" />
            )}

            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                active
                  ? "bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]"
                  : "bg-white/5 text-white/[0.65] group-hover:scale-105 group-hover:bg-white/10 group-hover:text-[var(--brand-orange-light)]"
              }`}
            >
              <Icon
                aria-hidden="true"
                className="h-[18px] w-[18px]"
                strokeWidth={1.8}
              />
            </span>

            {!collapsed && (
              <>
                <span className="min-w-0 flex-1 truncate font-[var(--font-body)] text-[11px] font-semibold tracking-[0.02em]">
                  {item.label}
                </span>

                {item.externalSection && (
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 opacity-45 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                    strokeWidth={1.8}
                  />
                )}
              </>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export default function AdminShell({
  children,
  displayName,
  email,
}: Readonly<AdminShellProps>) {
  const pathname =
    usePathname();

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(false);

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const initials =
    getInitials(
      displayName
    );

  const currentPageTitle =
    getCurrentPageTitle(
      pathname
    );

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[var(--text)]">
      {/* Decorative page background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -right-48 -top-56 h-[520px] w-[520px] rounded-full bg-[var(--brand-blue)]/[0.055] blur-3xl" />

        <div className="absolute -bottom-64 left-1/4 h-[500px] w-[500px] rounded-full bg-[var(--brand-orange)]/[0.05] blur-3xl" />
      </div>

      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden overflow-hidden border-r border-white/10 bg-[linear-gradient(165deg,#102f78_0%,#1749a8_48%,#102f78_100%)] text-white shadow-[18px_0_60px_rgba(12,35,91,0.15)] transition-[width] duration-300 ease-out lg:flex lg:flex-col ${
          sidebarCollapsed
            ? "w-[92px]"
            : "w-[286px]"
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-white/[0.055] blur-3xl"
        />

        {/* Brand */}
        <div
          className={`relative flex min-h-24 items-center border-b border-white/10 ${
            sidebarCollapsed
              ? "justify-center px-3"
              : "justify-between px-6"
          }`}
        >
          <Link
            href="/admin"
            aria-label="AthiMart administration"
            className="group inline-flex items-center"
          >
            {sidebarCollapsed ? (
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 font-[var(--font-display)] text-2xl font-light text-white shadow-lg backdrop-blur">
                A
                <span className="text-[var(--brand-orange-light)]">
                  M
                </span>
              </span>
            ) : (
              <div>
                <div className="flex items-baseline">
                  <span className="font-[var(--font-display)] text-[29px] font-light uppercase tracking-[0.16em] text-white">
                    Athi
                  </span>

                  <span className="font-[var(--font-display)] text-[29px] font-light uppercase tracking-[0.16em] text-[var(--brand-orange-light)]">
                    Mart
                  </span>
                </div>

                <p className="mt-1 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.28em] text-white/[0.45]">
                  Administration
                </p>
              </div>
            )}
          </Link>

          {!sidebarCollapsed && (
            <button
              type="button"
              aria-label="Collapse admin sidebar"
              onClick={() => {
                setSidebarCollapsed(
                  true
                );
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/[0.55] transition-all duration-300 hover:scale-105 hover:bg-white/[0.12] hover:text-white"
            >
              <ChevronLeft
                aria-hidden="true"
                className="h-4 w-4"
                strokeWidth={1.8}
              />
            </button>
          )}
        </div>

        {/* Desktop navigation */}
        <nav
          aria-label="Administrator navigation"
          className="relative flex-1 overflow-y-auto px-4 py-6"
        >
          {!sidebarCollapsed && (
            <p className="mb-3 px-4 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.24em] text-white/[0.38]">
              Marketplace Management
            </p>
          )}

          <NavigationLinks
            items={
              managementNavigation
            }
            pathname={pathname}
            collapsed={
              sidebarCollapsed
            }
          />

          <div className="my-6 h-px bg-white/10" />

          {!sidebarCollapsed && (
            <p className="mb-3 px-4 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.24em] text-white/[0.38]">
              Quick Access
            </p>
          )}

          <NavigationLinks
            items={
              accountNavigation
            }
            pathname={pathname}
            collapsed={
              sidebarCollapsed
            }
          />
        </nav>

        {/* Collapsed sidebar control */}
        {sidebarCollapsed && (
          <div className="px-4 pb-3">
            <button
              type="button"
              aria-label="Expand admin sidebar"
              onClick={() => {
                setSidebarCollapsed(
                  false
                );
              }}
              className="flex h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-white/[0.65] transition-all duration-300 hover:scale-[1.03] hover:bg-white/[0.14] hover:text-white"
            >
              <ChevronRight
                aria-hidden="true"
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            </button>
          </div>
        )}

        {/* Administrator account */}
        <div className="relative border-t border-white/10 p-4">
          {sidebarCollapsed ? (
            <Link
              href="/account"
              title={`${displayName} — ${email}`}
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-orange)] font-[var(--font-body)] text-xs font-bold text-white shadow-[0_12px_30px_rgba(236,108,26,0.32)] transition-transform duration-300 hover:scale-105"
            >
              {initials}
            </Link>
          ) : (
            <Link
              href="/account"
              className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3.5 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.11]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-orange)] font-[var(--font-body)] text-xs font-bold text-white shadow-[0_10px_24px_rgba(236,108,26,0.28)]">
                {initials}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate font-[var(--font-body)] text-[11px] font-semibold text-white">
                  {displayName}
                </span>

                <span className="mt-1 block truncate font-[var(--font-body)] text-[9px] text-white/[0.48]">
                  {email}
                </span>
              </span>

              <ShieldCheck
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-[var(--brand-orange-light)] transition-transform duration-300 group-hover:scale-110"
                strokeWidth={1.8}
              />
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      <button
        type="button"
        aria-label="Close administrator menu"
        onClick={closeMobileMenu}
        className={`fixed inset-0 z-[60] bg-[#071a46]/55 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex w-[310px] max-w-[88vw] flex-col bg-[linear-gradient(165deg,#102f78_0%,#1749a8_52%,#102f78_100%)] text-white shadow-[30px_0_80px_rgba(7,26,70,0.34)] transition-transform duration-300 ease-out lg:hidden ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex min-h-[88px] items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/admin"
            onClick={closeMobileMenu}
            className="inline-flex items-baseline"
          >
            <span className="font-[var(--font-display)] text-2xl font-light uppercase tracking-[0.15em]">
              Athi
            </span>

            <span className="font-[var(--font-display)] text-2xl font-light uppercase tracking-[0.15em] text-[var(--brand-orange-light)]">
              Mart
            </span>
          </Link>

          <button
            type="button"
            aria-label="Close administrator navigation"
            onClick={closeMobileMenu}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/[0.65] transition-colors hover:bg-white/[0.12] hover:text-white"
          >
            <X
              aria-hidden="true"
              className="h-5 w-5"
              strokeWidth={1.8}
            />
          </button>
        </div>

        <nav
          aria-label="Mobile administrator navigation"
          className="flex-1 overflow-y-auto px-4 py-6"
        >
          <p className="mb-3 px-4 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.24em] text-white/[0.38]">
            Marketplace Management
          </p>

          <NavigationLinks
            items={
              managementNavigation
            }
            pathname={pathname}
            onNavigate={
              closeMobileMenu
            }
          />

          <div className="my-6 h-px bg-white/10" />

          <p className="mb-3 px-4 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.24em] text-white/[0.38]">
            Quick Access
          </p>

          <NavigationLinks
            items={
              accountNavigation
            }
            pathname={pathname}
            onNavigate={
              closeMobileMenu
            }
          />
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-orange)] font-[var(--font-body)] text-xs font-bold text-white">
              {initials}
            </span>

            <div className="min-w-0">
              <p className="truncate font-[var(--font-body)] text-[11px] font-semibold text-white">
                {displayName}
              </p>

              <p className="mt-1 truncate font-[var(--font-body)] text-[9px] text-white/[0.48]">
                {email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main administration area */}
      <div
        className={`relative min-h-screen transition-[padding] duration-300 ease-out ${
          sidebarCollapsed
            ? "lg:pl-[92px]"
            : "lg:pl-[286px]"
        }`}
      >
        {/* Modern top header */}
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex min-h-[78px] max-w-[1700px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open administrator navigation"
                onClick={() => {
                  setMobileMenuOpen(
                    true
                  );
                }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[var(--brand-blue)] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:shadow-md lg:hidden"
              >
                <Menu
                  aria-hidden="true"
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="hidden h-2 w-2 rounded-full bg-[var(--success)] shadow-[0_0_0_5px_rgba(22,163,74,0.10)] sm:block" />

                  <p className="truncate font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.19em] text-[var(--text-muted)]">
                    Protected Administration
                  </p>
                </div>

                <h1 className="mt-1 truncate font-[var(--font-display)] text-[23px] font-light uppercase tracking-[0.035em] text-[var(--text)] sm:text-[27px]">
                  {currentPageTitle}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/shop"
                className="group hidden min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.13em] text-[var(--text-soft)] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--brand-orange)] hover:text-[var(--brand-orange-dark)] hover:shadow-md sm:inline-flex"
              >
                <ShoppingBag
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-300 group-hover:scale-110"
                  strokeWidth={1.8}
                />

                View Store

                <ArrowUpRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 opacity-45 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                  strokeWidth={1.8}
                />
              </Link>

              <div className="hidden min-h-11 items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 text-[var(--brand-orange-dark)] sm:flex">
                <ShieldCheck
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />

                <span className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em]">
                  Administrator
                </span>
              </div>

              <Link
                href="/account"
                aria-label="Open administrator account"
                title={displayName}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-blue)] font-[var(--font-body)] text-[10px] font-bold text-white shadow-[0_10px_25px_rgba(23,73,168,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-[var(--brand-blue-dark)]"
              >
                {initials}
              </Link>
            </div>
          </div>
        </header>

        {/* Protected page content */}
        <main className="relative">
          <div className="mx-auto w-full max-w-[1700px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
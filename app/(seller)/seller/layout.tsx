// app/(seller)/seller/layout.tsx

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CirclePlus,
  LayoutDashboard,
  PackageSearch,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";

import { getCurrentSeller } from "@/lib/auth/seller";

export const dynamic =
  "force-dynamic";

interface SellerLayoutProps {
  children: ReactNode;
}

export default async function SellerLayout({
  children,
}: Readonly<SellerLayoutProps>) {
  /*
   * Protect every route under /seller.
   *
   * Pending or rejected sellers are redirected
   * to /seller-pending.
   *
   * Normal buyers are redirected to /account.
   *
   * Blocked users are redirected to
   * /account-blocked.
   */
  const { profile } =
    await getCurrentSeller();

  return (
    <div className="min-h-screen bg-[var(--linen)]">
      <div className="grid min-h-screen lg:grid-cols-[270px_minmax(0,1fr)]">
        {/* Desktop seller sidebar */}
        <aside className="hidden bg-gradient-to-b from-[var(--brand-blue-dark)] via-[var(--brand-blue)] to-[var(--brand-blue-light)] text-white lg:flex lg:flex-col">
          {/* Brand */}
          <div className="border-b border-white/15 px-7 py-8">
            <Link
              href="/seller"
              aria-label="AthiMart seller dashboard"
              className="inline-flex items-baseline"
            >
              <span className="font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.16em] text-white">
                Athi
              </span>

              <span className="font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.16em] text-[var(--brand-orange-light)]">
                Mart
              </span>
            </Link>

            <p className="mt-3 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.2em] text-white/55">
              Seller Centre
            </p>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Seller navigation"
            className="flex-1 px-5 py-8"
          >
            <p className="px-3 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-white/45">
              Seller tools
            </p>

            <div className="mt-4 space-y-2">
              <Link
                href="/seller"
                className="group flex min-h-14 items-center gap-4 border border-white/20 bg-white/12 px-4 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition-all hover:border-[var(--brand-orange-light)] hover:bg-white/18"
              >
                <LayoutDashboard
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-[var(--brand-orange-light)]"
                  strokeWidth={1.7}
                />

                Dashboard
              </Link>

              <Link
                href="/seller/products"
                className="group flex min-h-14 items-center gap-4 border border-transparent px-4 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 transition-all hover:border-white/15 hover:bg-white/10 hover:text-white"
              >
                <PackageSearch
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 group-hover:text-[var(--brand-orange-light)]"
                  strokeWidth={1.7}
                />

                My Products
              </Link>

              <Link
                href="/seller/products/new"
                className="group flex min-h-14 items-center gap-4 border border-transparent px-4 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 transition-all hover:border-white/15 hover:bg-white/10 hover:text-white"
              >
                <CirclePlus
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 group-hover:text-[var(--brand-orange-light)]"
                  strokeWidth={1.7}
                />

                Add Product
              </Link>

              <Link
                href="/"
                className="group flex min-h-14 items-center gap-4 border border-transparent px-4 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 transition-all hover:border-white/15 hover:bg-white/10 hover:text-white"
              >
                <Store
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 group-hover:text-[var(--brand-orange-light)]"
                  strokeWidth={1.7}
                />

                View Store
              </Link>

              <Link
                href="/account"
                className="group flex min-h-14 items-center gap-4 border border-transparent px-4 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 transition-all hover:border-white/15 hover:bg-white/10 hover:text-white"
              >
                <UserRound
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 group-hover:text-[var(--brand-orange-light)]"
                  strokeWidth={1.7}
                />

                My Account
              </Link>
            </div>
          </nav>

          {/* Seller account */}
          <div className="border-t border-white/15 p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--brand-orange)] text-white">
                <Store
                  aria-hidden="true"
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />
              </span>

              <div className="min-w-0">
                <p className="truncate font-[var(--font-body)] text-xs font-semibold text-white">
                  {profile.fullName}
                </p>

                <p className="mt-1 truncate font-[var(--font-body)] text-[9px] text-white/55">
                  {profile.email}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 border border-white/15 bg-white/8 px-3 py-2">
              <ShieldCheck
                aria-hidden="true"
                className="h-4 w-4 text-[var(--brand-orange-light)]"
                strokeWidth={1.8}
              />

              <p className="font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-orange-light)]">
                Approved Seller
              </p>
            </div>
          </div>
        </aside>

        {/* Seller content area */}
        <div className="min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 backdrop-blur">
            <div className="flex min-h-20 items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">
              <Link
                href="/seller"
                className="inline-flex items-baseline lg:hidden"
              >
                <span className="font-[var(--font-display)] text-2xl font-light uppercase tracking-[0.15em] text-[var(--brand-blue-dark)]">
                  Athi
                </span>

                <span className="font-[var(--font-display)] text-2xl font-light uppercase tracking-[0.15em] text-[var(--brand-orange)]">
                  Mart
                </span>
              </Link>

              <div className="hidden lg:block">
                <p className="athimart-label text-[var(--brand-orange-dark)]">
                  Approved seller access
                </p>

                <p className="mt-1 font-[var(--font-body)] text-sm text-[var(--text-muted)]">
                  Manage your AthiMart products
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden items-center gap-2 border border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] px-3 py-2 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-orange-dark)] sm:inline-flex">
                  <ShieldCheck
                    aria-hidden="true"
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />

                  Approved Seller
                </span>

                <Link
                  href="/"
                  aria-label="Return to AthiMart store"
                  title="Return to store"
                  className="flex h-11 w-11 items-center justify-center border border-[var(--border)] bg-white text-[var(--brand-blue)] transition-all hover:border-[var(--brand-orange)] hover:bg-[var(--brand-orange-soft)] hover:text-[var(--brand-orange-dark)]"
                >
                  <ArrowLeft
                    aria-hidden="true"
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />
                </Link>
              </div>
            </div>

            {/* Mobile seller navigation */}
            <nav
              aria-label="Mobile seller navigation"
              className="flex gap-2 overflow-x-auto border-t border-[var(--border)] px-5 py-3 sm:px-8 lg:hidden"
            >
              <Link
                href="/seller"
                className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-[var(--brand-blue)] bg-[var(--brand-blue-soft)] px-4 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-blue)]"
              >
                <LayoutDashboard
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />

                Dashboard
              </Link>

              <Link
                href="/seller/products"
                className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-[var(--border)] bg-white px-4 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]"
              >
                <PackageSearch
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />

                Products
              </Link>

              <Link
                href="/seller/products/new"
                className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-[var(--border)] bg-white px-4 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]"
              >
                <CirclePlus
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />

                Add Product
              </Link>

              <Link
                href="/account"
                className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-[var(--border)] bg-white px-4 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]"
              >
                <UserRound
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />

                Account
              </Link>
            </nav>
          </header>

          <main>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
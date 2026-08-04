// app/(admin)/admin/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Database,
  PackagePlus,
  ShieldCheck,
  Smartphone,
  Store,
  UsersRound,
} from "lucide-react";

import { getCurrentAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Admin Dashboard",

  description:
    "Secure AthiMart marketplace administration dashboard.",

  robots: {
    index: false,
    follow: false,
  },
};

function getAdminName(
  fullName: unknown,
  email: string
): string {
  if (
    typeof fullName === "string" &&
    fullName.trim()
  ) {
    return fullName.trim();
  }

  return (
    email.split("@")[0] ||
    "Administrator"
  );
}

export default async function AdminDashboardPage() {
  const { user, role } =
    await getCurrentAdmin();

  const email =
    user.email ??
    "Admin account";

  const adminName =
    getAdminName(
      user.user_metadata?.full_name,
      email
    );

  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      {/* Dashboard heading */}
      <header className="border-b border-[var(--border-strong)] pb-8">
        <p className="athimart-label text-[var(--brand-orange-dark)]">
          AthiMart control centre
        </p>

        <h1 className="athimart-display-large mt-4 text-[var(--brand-blue-dark)]">
          Admin
          <br />
          <span className="text-[var(--brand-orange)]">
            Dashboard
          </span>
        </h1>

        <p className="athimart-body-large mt-5 max-w-3xl">
          Welcome, {adminName}. Manage the shared AthiMart mobile and web
          marketplace from this protected administration area.
        </p>
      </header>

      {/* Security and platform summary */}
      <section
        aria-labelledby="admin-status-heading"
        className="mt-9"
      >
        <h2
          id="admin-status-heading"
          className="sr-only"
        >
          Admin status
        </h2>

        <div className="grid border-l border-t border-[var(--border)] md:grid-cols-3">
          <article className="border-b border-r border-[var(--border)] bg-white p-6">
            <span className="flex h-12 w-12 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
              <ShieldCheck
                aria-hidden="true"
                className="h-6 w-6"
                strokeWidth={1.7}
              />
            </span>

            <p className="athimart-label mt-7 text-[var(--text-muted)]">
              Access level
            </p>

            <h2 className="mt-3 font-[var(--font-display)] text-3xl font-light uppercase text-[var(--brand-blue-dark)]">
              {role}
            </h2>

            <p className="athimart-body mt-3">
              Your permanent Supabase user ID is connected to the administrator
              role.
            </p>
          </article>

          <article className="border-b border-r border-[var(--border)] bg-white p-6">
            <span className="flex h-12 w-12 items-center justify-center bg-[var(--brand-orange-soft)] text-[var(--brand-orange-dark)]">
              <Database
                aria-hidden="true"
                className="h-6 w-6"
                strokeWidth={1.7}
              />
            </span>

            <p className="athimart-label mt-7 text-[var(--text-muted)]">
              Database
            </p>

            <h2 className="mt-3 font-[var(--font-display)] text-3xl font-light uppercase text-[var(--brand-blue-dark)]">
              Shared
            </h2>

            <p className="athimart-body mt-3">
              The Flutter application and Next.js website use the same
              Supabase marketplace data.
            </p>
          </article>

          <article className="border-b border-r border-[var(--border)] bg-white p-6">
            <span className="flex h-12 w-12 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
              <Smartphone
                aria-hidden="true"
                className="h-6 w-6"
                strokeWidth={1.7}
              />
            </span>

            <p className="athimart-label mt-7 text-[var(--text-muted)]">
              Platforms
            </p>

            <h2 className="mt-3 font-[var(--font-display)] text-3xl font-light uppercase text-[var(--brand-blue-dark)]">
              Mobile + Web
            </h2>

            <p className="athimart-body mt-3">
              Future admin updates will be reflected across both AthiMart
              platforms.
            </p>
          </article>
        </div>
      </section>

      {/* Admin identity */}
      <section className="mt-9 grid gap-7 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="border border-[var(--border)] bg-white p-6 sm:p-8">
          <p className="athimart-label text-[var(--brand-orange-dark)]">
            Verified administrator
          </p>

          <h2 className="athimart-title-large mt-3 text-[var(--brand-blue-dark)]">
            Account Details
          </h2>

          <dl className="mt-7 border-l border-t border-[var(--border)]">
            <div className="border-b border-r border-[var(--border)] p-5">
              <dt className="athimart-label text-[var(--text-muted)]">
                Admin email
              </dt>

              <dd className="mt-3 break-all font-[var(--font-body)] text-sm text-[var(--text)]">
                {email}
              </dd>
            </div>

            <div className="border-b border-r border-[var(--border)] p-5">
              <dt className="athimart-label text-[var(--text-muted)]">
                Supabase user ID
              </dt>

              <dd className="mt-3 break-all font-mono text-xs leading-6 text-[var(--text)]">
                {user.id}
              </dd>
            </div>
          </dl>
        </article>

        <article className="overflow-hidden bg-gradient-to-br from-[var(--brand-blue-dark)] via-[var(--brand-blue)] to-[var(--brand-blue-light)] p-7 text-white sm:p-8">
          <span className="flex h-14 w-14 items-center justify-center bg-[var(--brand-orange)] text-white">
            <PackagePlus
              aria-hidden="true"
              className="h-7 w-7"
              strokeWidth={1.7}
            />
          </span>

          <p className="mt-8 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-orange-light)]">
            Next admin module
          </p>

          <h2 className="mt-3 font-[var(--font-display)] text-4xl font-light uppercase leading-tight text-white">
            Product
            <br />
            Management
          </h2>

          <p className="mt-5 font-[var(--font-body)] text-sm leading-7 text-white/72">
            The next step will create the admin products table with add, edit,
            activate, deactivate and stock-management controls.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex min-h-13 items-center justify-center gap-3 border border-white/35 bg-white/10 px-5 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:border-[var(--brand-orange-light)] hover:bg-[var(--brand-orange)]"
          >
            <Store
              aria-hidden="true"
              className="h-5 w-5"
              strokeWidth={1.8}
            />

            View current store

            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          </Link>
        </article>
      </section>

      {/* Future modules */}
      <section
        aria-labelledby="future-admin-modules-heading"
        className="mt-9 border border-[var(--border)] bg-white p-6 sm:p-8"
      >
        <p className="athimart-label text-[var(--brand-orange-dark)]">
          Administration roadmap
        </p>

        <h2
          id="future-admin-modules-heading"
          className="athimart-title-large mt-3 text-[var(--brand-blue-dark)]"
        >
          Upcoming Modules
        </h2>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="border border-[var(--border)] bg-[var(--brand-blue-soft)] p-5">
            <PackagePlus
              aria-hidden="true"
              className="h-5 w-5 text-[var(--brand-blue)]"
              strokeWidth={1.8}
            />

            <p className="mt-4 font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.15em] text-[var(--brand-blue-dark)]">
              Products
            </p>
          </div>

          <div className="border border-[var(--border)] bg-white p-5">
            <UsersRound
              aria-hidden="true"
              className="h-5 w-5 text-[var(--brand-orange-dark)]"
              strokeWidth={1.8}
            />

            <p className="mt-4 font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.15em] text-[var(--brand-blue-dark)]">
              Users
            </p>
          </div>

          <div className="border border-[var(--border)] bg-[var(--brand-orange-soft)] p-5">
            <Store
              aria-hidden="true"
              className="h-5 w-5 text-[var(--brand-blue)]"
              strokeWidth={1.8}
            />

            <p className="mt-4 font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.15em] text-[var(--brand-blue-dark)]">
              Orders
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
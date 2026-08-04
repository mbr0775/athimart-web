import Link from "next/link";

import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <section aria-labelledby="footer-about-heading">
          <h2
            id="footer-about-heading"
            className="text-xl font-bold"
          >
            <span className="text-[var(--brand-blue)]">Athi</span>
            <span className="text-[var(--brand-orange)]">Mart</span>
          </h2>

          <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--text-secondary)]">
            {siteConfig.tagline}
          </p>

          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            A connected online marketplace being developed for customers,
            sellers and businesses in Sri Lanka and the Maldives.
          </p>
        </section>

        <nav aria-labelledby="footer-shopping-heading">
          <h2
            id="footer-shopping-heading"
            className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]"
          >
            Shopping
          </h2>

          <div className="mt-4 grid gap-3 text-sm text-[var(--text-secondary)]">
            <Link
              href="/shop"
              className="hover:text-[var(--brand-blue)]"
            >
              Browse products
            </Link>

            <Link
              href="/#categories"
              className="hover:text-[var(--brand-blue)]"
            >
              Product categories
            </Link>

            <Link
              href="/#markets"
              className="hover:text-[var(--brand-blue)]"
            >
              Available markets
            </Link>
          </div>
        </nav>

        <nav aria-labelledby="footer-support-heading">
          <h2
            id="footer-support-heading"
            className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]"
          >
            AthiMart
          </h2>

          <div className="mt-4 grid gap-3 text-sm text-[var(--text-secondary)]">
            <Link
              href="/#why-athimart"
              className="hover:text-[var(--brand-blue)]"
            >
              About the marketplace
            </Link>

            <Link
              href="/auth/login"
              className="hover:text-[var(--brand-blue)]"
            >
              Customer account
            </Link>

            <span>Powered by {siteConfig.creator}</span>
          </div>
        </nav>
      </div>

      <div className="border-t border-[var(--border)] bg-[var(--surface-soft)]">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-[var(--text-muted)] sm:px-6 lg:px-8">
          © {currentYear} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
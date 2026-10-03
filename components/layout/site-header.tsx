// components/layout/site-header.tsx

import { Bell, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { HeaderAuthActions } from "@/components/auth/header-auth-actions";

const navigationItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/#categories" },
  { label: "Markets", href: "/#markets" },
  { label: "Why AthiMart", href: "/#why-athimart" },
];

function HeaderAuthFallback() {
  return <div className="h-10 w-24 animate-pulse rounded-full bg-white/50" />;
}

export function SiteHeader() {
  return (
    <header
      className="
        fixed
        left-0
        top-0
        z-50
        w-full
        px-4
        pt-4
        lg:px-8
        lg:pt-6
      "
    >
      <div
        className="
          mx-auto
          flex
          max-w-[1320px]
          items-center
          justify-between
          gap-4
          rounded-full
          border
          border-white/50
          bg-white/55
          px-5
          py-3
          shadow-[0_20px_60px_rgba(30,40,50,0.12)]
          backdrop-blur-xl
          transition-all
          duration-300
          lg:px-8
          lg:py-4
        "
      >
        <Link href="/" className="flex items-center shrink-0">
          <span className="font-[var(--font-display)] text-2xl font-light tracking-[0.18em] text-[var(--brand-blue-dark)] lg:text-3xl">
            ATHI
          </span>
          <span className="font-[var(--font-display)] text-2xl font-light tracking-[0.18em] text-[var(--brand-orange)] lg:text-3xl">
            MART
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.22em]
                text-black/65
                transition
                hover:text-[var(--brand-blue)]
              "
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 transition hover:bg-white"
          >
            <Search className="h-4 w-4" />
          </Link>

          <Link
            href="/notifications"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 transition hover:bg-white xl:flex"
          >
            <Bell className="h-4 w-4" />
          </Link>

          <Link
            href="/cart"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 transition hover:bg-white xl:flex"
          >
            <ShoppingBag className="h-4 w-4" />
          </Link>

          <Suspense fallback={<HeaderAuthFallback />}>
            <HeaderAuthActions />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

// components/layout/mobile-bottom-nav.tsx

"use client";

import type { LucideIcon } from "lucide-react";
import {
  Home,
  ReceiptText,
  ShoppingBag,
  Store,
  UserRound,
} from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  matchingPaths: string[];
}

const navigationItems: NavigationItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    matchingPaths: ["/"],
  },
  {
    label: "Shop",
    href: "/shop",
    icon: Store,
    matchingPaths: [
      "/shop",
      "/category",
      "/product",
      "/products",
      "/search",
    ],
  },
  {
    label: "Cart",
    href: "/cart",
    icon: ShoppingBag,
    matchingPaths: ["/cart", "/checkout"],
  },
  {
    label: "Orders",
    href: "/orders",
    icon: ReceiptText,
    matchingPaths: ["/orders"],
  },
  {
    label: "Profile",
    href: "/account",
    icon: UserRound,
    matchingPaths: ["/account", "/auth"],
  },
];

function isItemActive(
  pathname: string,
  item: NavigationItem
): boolean {
  if (item.href === "/") {
    return pathname === "/";
  }

  return item.matchingPaths.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`)
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--linen)]/95 shadow-[0_-8px_24px_rgba(23,23,23,0.06)] backdrop-blur-md md:hidden"
    >
      <div className="mx-auto grid max-w-xl grid-cols-5 px-1 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2">
        {navigationItems.map((item) => {
          const active = isItemActive(pathname, item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="relative flex min-h-[68px] items-center justify-center"
            >
              {active && (
                <m.span
                  layoutId="mobile-navigation-active"
                  className="absolute inset-x-2 top-0 h-[3px] bg-[var(--black)]"
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 34,
                  }}
                />
              )}

              <m.span
                whileTap={{
                  scale: 0.86,
                }}
                className="flex flex-col items-center justify-center gap-1.5"
              >
                <Icon
                  aria-hidden="true"
                  strokeWidth={active ? 2.5 : 1.9}
                  className={`h-[27px] w-[27px] transition-colors duration-200 ${
                    active
                      ? "text-[var(--text)]"
                      : "text-[var(--text-muted)]"
                  }`}
                />

                <span
                  className={`font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.2em] transition-colors duration-200 ${
                    active
                      ? "text-[var(--text)]"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  {item.label}
                </span>
              </m.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
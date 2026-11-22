// components/layout/mobile-bottom-nav.tsx

"use client";

import type { LucideIcon } from "lucide-react";
import { Home, ReceiptText, ShoppingBag, Store, UserRound } from "lucide-react";
import styles from "./mobile-bottom-nav.module.css";
import Link from "@/components/navigation/navigation-link";
import { usePathname } from "next/navigation";
import ProfileAvatar from "@/components/account/profile-avatar";
import { useProfileIdentity } from "@/components/account/profile-provider";

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
    matchingPaths: ["/shop", "/category", "/product", "/products", "/search"],
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

function isItemActive(pathname: string, item: NavigationItem): boolean {
  if (item.href === "/") {
    return pathname === "/";
  }

  return item.matchingPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function MobileBottomNav() {
  const identity = useProfileIdentity();
  const pathname = usePathname();

  return (
    <nav aria-label="Mobile primary navigation" className={styles.navigation}>
      <div className={styles.items}>
        {navigationItems.map((item) => {
          const active = isItemActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.href === "/account" && identity ? `Open account for ${identity.name}` : undefined}
              aria-current={active ? "page" : undefined}
              className={styles.item}
            >
              <span className={styles.icon}>
                {item.href === "/account" && identity ? <ProfileAvatar name={identity.name} avatarUrl={identity.avatarUrl} size={24} /> : <Icon
                  size={22}
                  strokeWidth={active ? 1.9 : 1.5}
                  aria-hidden="true"
                />}
              </span>
              <span className={styles.itemLabel}>{item.href === "/account" && identity ? identity.name.split(/\s+/)[0] : item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

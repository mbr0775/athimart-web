"use client";

import Link from "@/components/navigation/navigation-link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  UserRound,
  Truck,
  Route,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "@/components/layout/workspace-shell.module.css";

export const adminNavigationItems = [
  { label: "Overview", href: "/admin", icon: "overview" },
  { label: "Products", href: "/admin/products", icon: "box" },
  { label: "Seller requests", href: "/admin/seller-requests", icon: "users" },
  { label: "Sellers", href: "/admin/sellers", icon: "user" },
  {
    label: "Delivery partners",
    href: "/admin/delivery-partners",
    icon: "truck",
  },
  { label: "Shipments", href: "/admin/delivery-shipments", icon: "route" },
];
const icons: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  box: Package,
  package: Package,
  users: Users,
  user: UserRound,
  truck: Truck,
  route: Route,
};

export default function AdminNavigation({
  items = adminNavigationItems,
  pathname,
  onNavigate,
}: {
  items?: typeof adminNavigationItems;
  pathname?: string;
  onNavigate?: () => void;
}) {
  const currentPath = usePathname();
  const activePath = pathname ?? currentPath;
  return (
    <nav aria-label="Administrator navigation" className={styles.navigation}>
      {items.map((item) => {
        const active =
          item.href === "/admin"
            ? activePath === item.href
            : activePath === item.href ||
              activePath.startsWith(item.href + "/");
        const Icon = icons[item.icon] ?? Package;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
          >
            <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
            <span>{item.label}</span>
            {active && <span className={styles.activeDot} aria-hidden="true" />}
          </Link>
        );
      })}
    </nav>
  );
}

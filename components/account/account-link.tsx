"use client";

import Link from "@/components/navigation/navigation-link";
import { usePathname } from "next/navigation";
import ProfileAvatar from "./profile-avatar";
import { useProfileIdentity } from "./profile-provider";
import styles from "./account-link.module.css";

export function AccountLink({ floating = false }: { floating?: boolean }) {
  const identity = useProfileIdentity();
  if (!identity) return null;
  return <Link href="/account" className={`${styles.link} ${floating ? styles.floating : ""}`} aria-label={`Open account for ${identity.name}`} title={identity.name}><ProfileAvatar name={identity.name} avatarUrl={identity.avatarUrl} size={36} /></Link>;
}

// Auth/status pages have their own presentation instead of a store/workspace
// header. Keep the account accessible there too, only while signed in.
export function StandaloneAccountLink() {
  const pathname = usePathname();
  return pathname.startsWith("/auth/") || ["/seller-pending", "/account-blocked", "/connection-test"].includes(pathname)
    ? <AccountLink floating /> : null;
}

"use client";

import ProfileAvatar from "@/components/account/profile-avatar";
import { useProfileIdentity } from "@/components/account/profile-provider";
import Link from "@/components/navigation/navigation-link";
import styles from "@/components/layout/workspace-shell.module.css";

export default function AdminAvatar({ name }: { name: string }) {
  const identity = useProfileIdentity();
  const displayName = identity?.name || name;
  return (
    <Link href="/account" className={styles.avatar} title={displayName} aria-label={`Open account for ${displayName}`}>
      <ProfileAvatar name={displayName} avatarUrl={identity?.avatarUrl ?? null} size={40} />
    </Link>
  );
}

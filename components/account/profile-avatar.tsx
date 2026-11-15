"use client";

import { useState } from "react";
import { profileInitials } from "@/lib/account/profile-identity";

export default function ProfileAvatar({ name, avatarUrl, size = 32, loading }: { name: string; avatarUrl: string | null; size?: number; loading?: "eager" | "lazy" }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  return (
    <span style={{ display: "inline-flex", width: size, height: size, maxWidth: "100%", maxHeight: "100%", flexShrink: 0, alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: "50%", background: "var(--brand)", color: "var(--background)", fontFamily: "var(--font-body), sans-serif", fontSize: Math.round(size * 0.35), lineHeight: 1, fontWeight: 500 }}>
      {avatarUrl && failedUrl !== avatarUrl ? (
        // Provider avatars and public Storage objects are already small. A native
        // image supports Google URLs without proxying personal photos via Next.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={`${name}'s profile photo`} width={size} height={size} loading={loading} referrerPolicy="no-referrer" onError={() => setFailedUrl(avatarUrl)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : <span aria-label={`${name}'s initials`}>{profileInitials(name)}</span>}
    </span>
  );
}

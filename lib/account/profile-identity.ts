import type { User } from "@supabase/supabase-js";

export interface ProfileIdentity {
  name: string;
  avatarUrl: string | null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function safeAvatarUrl(value: unknown): string | null {
  try {
    const url = new URL(text(value));
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function googleAvatarUrl(user: Pick<User, "user_metadata" | "identities">): string | null {
  const google = user.identities?.find(identity => identity.provider === "google")?.identity_data;
  return safeAvatarUrl(google?.avatar_url) || safeAvatarUrl(google?.picture)
    || safeAvatarUrl(user.user_metadata?.avatar_url) || safeAvatarUrl(user.user_metadata?.picture);
}

export function profileIdentity(user: Pick<User, "email" | "user_metadata" | "identities">, profile?: { full_name?: unknown; avatar_url?: unknown } | null): ProfileIdentity {
  return {
    name: text(profile?.full_name) || text(user.user_metadata?.full_name)
      || text(user.user_metadata?.name) || user.email?.split("@")[0] || "AthiMart User",
    avatarUrl: safeAvatarUrl(profile?.avatar_url) || googleAvatarUrl(user),
  };
}

export function profileInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(part => Array.from(part)[0] || "").join("").toUpperCase() || "A";
}

export const AVATAR_BUCKET = "profile-avatars";
export const MAX_AVATAR_UPLOAD_BYTES = 600 * 1024;

// Public display also supports photos uploaded by the mobile applications.
// Keep deletion rules below separate from this read-only lookup.
export function publicProfileAvatarPath(url: unknown, supabaseUrl: string, userId: string): string | null {
  try {
    const candidate = new URL(text(url));
    const base = new URL(supabaseUrl);
    const prefix = `/storage/v1/object/public/${AVATAR_BUCKET}/${userId}/`;
    if (candidate.protocol !== "https:" || candidate.username || candidate.password
      || candidate.origin !== base.origin || !candidate.pathname.startsWith(prefix)) return null;
    const filename = candidate.pathname.slice(prefix.length);
    return /^[a-z0-9_-]+\.(webp|png|jpe?g)$/i.test(filename) ? `${userId}/${filename}` : null;
  } catch {
    return null;
  }
}

// Only our own objects can be removed; never trust an arbitrary saved URL.
export function ownedAvatarPath(url: unknown, supabaseUrl: string, userId: string): string | null {
  try {
    const candidate = new URL(text(url));
    const base = new URL(supabaseUrl);
    const prefix = `/storage/v1/object/public/${AVATAR_BUCKET}/${userId}/`;
    if (candidate.origin !== base.origin || !candidate.pathname.startsWith(prefix)) return null;
    const filename = candidate.pathname.slice(prefix.length);
    return /^[a-f0-9-]+\.webp$/.test(filename) ? `${userId}/${filename}` : null;
  } catch {
    return null;
  }
}

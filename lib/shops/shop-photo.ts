import { AVATAR_BUCKET, publicProfileAvatarPath, safeAvatarUrl } from "@/lib/account/profile-identity";

export interface ShopPhotoRow { id: string; object_path?: string | null; avatar_url?: string | null }

export function shopPhotoUrl(row: ShopPhotoRow, supabaseUrl: string): string | null {
  if (row.object_path) {
    try {
      // Reconstruct our own origin, rather than accepting an arbitrary host
      // which happens to contain a Storage-looking pathname.
      const base = new URL(supabaseUrl);
      const url = new URL(`/storage/v1/object/public/${AVATAR_BUCKET}/${row.object_path}`, base.origin).href;
      return publicProfileAvatarPath(url, base.origin, row.id) === row.object_path ? url : null;
    } catch { return null; }
  }
  const url = safeAvatarUrl(row.avatar_url);
  if (!url) return null;
  const host = new URL(url).hostname;
  return host === "googleusercontent.com" || host.endsWith(".googleusercontent.com") ? url : null;
}

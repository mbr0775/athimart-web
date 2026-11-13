import type { SupabaseClient } from "@supabase/supabase-js";

export function safeSignInPath(value: unknown): string {
  if (typeof value !== "string") return "/";

  const path = value.trim();
  if (!path.startsWith("/") || path.startsWith("//") || /[\\\u0000-\u001f]/.test(path)) {
    return "/";
  }

  return path;
}

export async function getSignInDestination(
  supabase: SupabaseClient,
  userId: string,
  nextPath: string
): Promise<string | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("seller_approval_status, is_blocked")
    .eq("id", userId)
    .maybeSingle();

  if (error) return null;
  if (profile?.is_blocked === true) return "/account-blocked";

  const sellerStatus = profile?.seller_approval_status?.toString().trim();
  if (sellerStatus === "pending" || sellerStatus === "rejected") {
    return "/seller-pending";
  }

  return nextPath;
}

export function googleSignInError(from: unknown, nextPath: string): string {
  const page = from === "signup" ? "/auth/sign-up" : "/auth/login";
  const params = new URLSearchParams({ error: "google-sign-in-failed", next: nextPath });
  return page + "?" + params;
}

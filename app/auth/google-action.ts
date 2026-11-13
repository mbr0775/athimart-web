"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { googleSignInError, safeSignInPath } from "@/lib/auth/sign-in";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle(formData: FormData) {
  const nextPath = safeSignInPath(formData.get("next"));
  const from = formData.get("from") === "signup" ? "signup" : "login";
  const errorUrl = googleSignInError(from, nextPath);
  const origin = process.env.NODE_ENV === "development"
    ? (await headers()).get("origin") || "http://localhost:3000"
    : process.env.NEXT_PUBLIC_SITE_URL;

  if (!origin) redirect(errorUrl);

  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("flow", "google");
  callback.searchParams.set("from", from);
  callback.searchParams.set("next", nextPath);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString() },
  });

  if (error || !data.url) redirect(errorUrl);
  redirect(data.url);
}

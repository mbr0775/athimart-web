// app/auth/forgot-password/actions.ts

"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function getSiteUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  return (
    configuredUrl ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

function getErrorCode(
  status: number | undefined
): string {
  if (status === 429) {
    return "too-many-attempts";
  }

  return "request-failed";
}

export async function sendPasswordResetLink(
  formData: FormData
): Promise<never> {
  const emailValue =
    formData.get("email");

  const email =
    typeof emailValue === "string"
      ? emailValue
          .trim()
          .toLowerCase()
      : "";

  if (!email) {
    redirect(
      "/auth/forgot-password?error=missing-email"
    );
  }

  const callbackUrl =
    new URL(
      "/auth/callback",
      getSiteUrl()
    );

  callbackUrl.searchParams.set(
    "next",
    "/auth/update-password"
  );

  const supabase =
    await createClient();

  const { error } =
    await supabase.auth
      .resetPasswordForEmail(
        email,
        {
          redirectTo:
            callbackUrl.toString(),
        }
      );

  if (error) {
    redirect(
      `/auth/forgot-password?error=${getErrorCode(
        error.status
      )}`
    );
  }

  /*
   * Keep this response generic. It should not reveal
   * whether an account exists for the entered email.
   */
  redirect(
    "/auth/forgot-password?status=check-email"
  );
}
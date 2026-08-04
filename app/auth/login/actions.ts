// app/auth/login/actions.ts

"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Only allow internal website paths.
 * This prevents external redirect attacks.
 */
function getSafeRedirectPath(
  value: FormDataEntryValue | null
): string {
  if (typeof value !== "string") {
    return "/";
  }

  const path = value.trim();

  if (
    !path.startsWith("/") ||
    path.startsWith("//")
  ) {
    return "/";
  }

  return path;
}

/**
 * Sign in using the same Supabase Auth
 * account used by the Flutter application.
 */
export async function login(
  formData: FormData
): Promise<never> {
  const emailValue =
    formData.get("email");

  const passwordValue =
    formData.get("password");

  const requestedPath =
    getSafeRedirectPath(
      formData.get("next")
    );

  const email =
    typeof emailValue === "string"
      ? emailValue
          .trim()
          .toLowerCase()
      : "";

  const password =
    typeof passwordValue === "string"
      ? passwordValue
      : "";

  const encodedRequestedPath =
    encodeURIComponent(
      requestedPath
    );

  if (!email || !password) {
    redirect(
      `/auth/login?error=missing-fields&next=${encodedRequestedPath}`
    );
  }

  const supabase =
    await createClient();

  const {
    data: signInData,
    error: signInError,
  } =
    await supabase.auth
      .signInWithPassword({
        email,
        password,
      });

  if (
    signInError ||
    !signInData.user
  ) {
    const errorCode =
      signInError?.status === 429
        ? "too-many-attempts"
        : "invalid-credentials";

    redirect(
      `/auth/login?error=${errorCode}&next=${encodedRequestedPath}`
    );
  }

  /*
   * Load the signed-in user's marketplace
   * role and seller approval status.
   */
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(`
      role,
      seller_approval_status,
      is_blocked
    `)
    .eq(
      "id",
      signInData.user.id
    )
    .maybeSingle();

  if (profileError) {
    await supabase.auth.signOut();

    redirect(
      `/auth/login?error=profile-check-failed&next=${encodedRequestedPath}`
    );
  }

  const role =
    profile?.role
      ?.toString()
      .trim() || "customer";

  const sellerApprovalStatus =
    profile
      ?.seller_approval_status
      ?.toString()
      .trim() || "";

  const isBlocked =
    profile?.is_blocked === true;

  /*
   * Blocked accounts must not continue
   * into the website.
   */
  if (isBlocked) {
    redirect("/account-blocked");
  }

  /*
   * A seller who is still waiting for
   * approval must remain on the pending page.
   *
   * A rejected seller also sees the same page,
   * where the rejection reason is displayed.
   */
  if (
    sellerApprovalStatus === "pending" ||
    sellerApprovalStatus === "rejected"
  ) {
    redirect("/seller-pending");
  }

  /*
   * Approved seller.
   */
  if (
    sellerApprovalStatus === "approved" &&
    (
      role === "vendor" ||
      role === "seller"
    )
  ) {
    redirect(requestedPath);
  }

  /*
   * Normal buyer or administrator.
   */
  redirect(requestedPath);
}
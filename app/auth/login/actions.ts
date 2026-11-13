// app/auth/login/actions.ts

"use server";

import { redirect } from "next/navigation";

import { getSignInDestination, safeSignInPath } from "@/lib/auth/sign-in";
import { createClient } from "@/lib/supabase/server";

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
    safeSignInPath(
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

  const destination = await getSignInDestination(supabase, signInData.user.id, requestedPath);
  if (!destination) {
    await supabase.auth.signOut();

    redirect(
      `/auth/login?error=profile-check-failed&next=${encodedRequestedPath}`
    );
  }

  redirect(destination);
}

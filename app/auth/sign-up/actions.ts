// app/auth/sign-up/actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type AccountType =
  | "buyer"
  | "seller";

function getSafeRedirectPath(
  value: FormDataEntryValue | null
): string {
  if (
    typeof value !== "string"
  ) {
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

function getAccountType(
  value: FormDataEntryValue | null
): AccountType {
  return value === "seller"
    ? "seller"
    : "buyer";
}

function getSiteUrl(): string {
  const configuredUrl =
    process.env
      .NEXT_PUBLIC_SITE_URL
      ?.trim();

  return (
    configuredUrl ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

function getErrorCode(
  errorCode: string | undefined
): string {
  switch (errorCode) {
    case "weak_password":
      return "weak-password";

    case "over_request_rate_limit":
    case "email_rate_limit_exceeded":
    case "over_email_send_rate_limit":
      return "too-many-attempts";

    case "user_already_exists":
    case "email_exists":
      return "email-already-exists";

    default:
      return "signup-failed";
  }
}

function createSignUpUrl({
  error,
  nextPath,
  accountType,
}: {
  error: string;
  nextPath: string;
  accountType: AccountType;
}): string {
  const searchParams =
    new URLSearchParams({
      error,
      next: nextPath,
      accountType,
    });

  return `/auth/sign-up?${searchParams.toString()}`;
}

export async function signUp(
  formData: FormData
): Promise<never> {
  const fullNameValue =
    formData.get("fullName");

  const emailValue =
    formData.get("email");

  const phoneValue =
    formData.get("phone");

  const passwordValue =
    formData.get("password");

  const confirmPasswordValue =
    formData.get(
      "confirmPassword"
    );

  const nextPath =
    getSafeRedirectPath(
      formData.get("next")
    );

  const accountType =
    getAccountType(
      formData.get(
        "accountType"
      )
    );

  const fullName =
    typeof fullNameValue ===
      "string"
      ? fullNameValue.trim()
      : "";

  const email =
    typeof emailValue ===
      "string"
      ? emailValue
          .trim()
          .toLowerCase()
      : "";

  const phone =
    typeof phoneValue ===
      "string"
      ? phoneValue.trim()
      : "";

  const password =
    typeof passwordValue ===
      "string"
      ? passwordValue
      : "";

  const confirmPassword =
    typeof confirmPasswordValue ===
      "string"
      ? confirmPasswordValue
      : "";

  if (
    fullName.length < 2 ||
    !email ||
    !password ||
    !confirmPassword
  ) {
    redirect(
      createSignUpUrl({
        error:
          "missing-fields",
        nextPath,
        accountType,
      })
    );
  }

  if (
    password.length < 8
  ) {
    redirect(
      createSignUpUrl({
        error:
          "weak-password",
        nextPath,
        accountType,
      })
    );
  }

  if (
    password !==
    confirmPassword
  ) {
    redirect(
      createSignUpUrl({
        error:
          "password-mismatch",
        nextPath,
        accountType,
      })
    );
  }

  const siteUrl =
    getSiteUrl();

  const confirmationDestination =
    accountType === "seller"
      ? "/seller-pending"
      : nextPath;

  const callbackUrl =
    new URL(
      "/auth/callback",
      siteUrl
    );

  callbackUrl.searchParams.set(
    "next",
    confirmationDestination
  );

  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase.auth.signUp({
      email,
      password,

      options: {
        emailRedirectTo:
          callbackUrl.toString(),

        data: {
          full_name:
            fullName,

          phone:
            phone || null,

          account_type:
            accountType,
        },
      },
    });

  if (error) {
    console.error(
      "SUPABASE SIGNUP ERROR:",
      {
        message:
          error.message,

        code:
          error.code,

        status:
          error.status,

        name:
          error.name,
      }
    );

    const errorCode =
      getErrorCode(
        error.code
      );

    redirect(
      createSignUpUrl({
        error:
          errorCode,
        nextPath,
        accountType,
      })
    );
  }

  /*
   * When email confirmation is disabled,
   * Supabase may immediately create a session.
   */
  if (data.session) {
    revalidatePath(
      "/",
      "layout"
    );

    if (
      accountType ===
      "seller"
    ) {
      redirect(
        "/seller-pending"
      );
    }

    redirect(nextPath);
  }

  /*
   * Email confirmation is enabled.
   * Show the check-email screen.
   */
  const checkEmailParams =
    new URLSearchParams({
      status:
        "check-email",

      email,

      next:
        confirmationDestination,

      accountType,
    });

  redirect(
    `/auth/sign-up?${checkEmailParams.toString()}`
  );
}
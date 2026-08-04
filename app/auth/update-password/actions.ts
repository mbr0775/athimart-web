// app/auth/update-password/actions.ts

"use server";

import {
  revalidatePath,
} from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function getUpdateErrorCode(
  errorCode: string | undefined
): string {
  if (
    errorCode === "weak_password"
  ) {
    return "weak-password";
  }

  return "update-failed";
}

export async function updatePassword(
  formData: FormData
): Promise<never> {
  const passwordValue =
    formData.get("password");

  const confirmPasswordValue =
    formData.get("confirmPassword");

  const password =
    typeof passwordValue === "string"
      ? passwordValue
      : "";

  const confirmPassword =
    typeof confirmPasswordValue ===
    "string"
      ? confirmPasswordValue
      : "";

  if (
    !password ||
    !confirmPassword
  ) {
    redirect(
      "/auth/update-password?error=missing-fields"
    );
  }

  if (password.length < 8) {
    redirect(
      "/auth/update-password?error=weak-password"
    );
  }

  if (
    password !== confirmPassword
  ) {
    redirect(
      "/auth/update-password?error=password-mismatch"
    );
  }

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/auth/forgot-password?error=session-expired"
    );
  }

  const { error } =
    await supabase.auth.updateUser({
      password,
    });

  if (error) {
    redirect(
      `/auth/update-password?error=${getUpdateErrorCode(
        error.code
      )}`
    );
  }

  revalidatePath("/", "layout");

  redirect(
    "/auth/update-password?status=success"
  );
}
// app/(store)/account/actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Sign out the current AthiMart customer.
 */
export async function signOut(): Promise<never> {
  const supabase = await createClient();

  const { error } =
    await supabase.auth.signOut();

  if (error) {
    redirect(
      "/account?error=signout-failed"
    );
  }

  /*
   * Refresh layouts that may display
   * authenticated user information.
   */
  revalidatePath("/", "layout");

  redirect("/auth/login");
}
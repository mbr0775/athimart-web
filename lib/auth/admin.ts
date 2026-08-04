// lib/auth/admin.ts

import "server-only";

import type { User } from "@supabase/supabase-js";
import {
  notFound,
  redirect,
} from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type AppRole =
  | "customer"
  | "admin";

export interface AdminSession {
  user: User;
  role: "admin";
}

/**
 * Verify that the current Supabase user has
 * the AthiMart admin role.
 *
 * Results are cached during the current server render,
 * so the layout and page can safely call this function.
 */
export const getCurrentAdmin = cache(
  async (): Promise<AdminSession> => {
    const supabase =
      await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    /*
     * Signed-out visitors must authenticate first.
     */
    if (userError || !user) {
      redirect(
        "/auth/login?next=%2Fadmin"
      );
    }

    /*
     * RLS allows the authenticated user to read
     * only the role connected to their own user ID.
     */
    const {
      data: roleRecord,
      error: roleError,
    } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleError) {
      throw new Error(
        `Unable to verify admin access: ${roleError.message}`
      );
    }

    /*
     * Hide the admin route from authenticated
     * users who do not have the admin role.
     */
    if (roleRecord?.role !== "admin") {
      notFound();
    }

    return {
      user,
      role: "admin",
    };
  }
);
// lib/auth/seller.ts

import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type ApprovedSellerRole =
  | "vendor"
  | "seller";

export interface SellerProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: ApprovedSellerRole;
  sellerApprovalStatus: "approved";
}

export interface SellerSession {
  user: User;
  profile: SellerProfile;
}

/**
 * Verify that the current Supabase user
 * is an approved and unblocked seller.
 *
 * This function can safely be called from
 * seller layouts, pages, actions and services.
 */
export const getCurrentSeller = cache(
  async (): Promise<SellerSession> => {
    const supabase =
      await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    /*
     * Signed-out visitors must authenticate.
     */
    if (userError || !user) {
      redirect(
        "/auth/login?next=%2Fseller"
      );
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        full_name,
        phone,
        role,
        seller_approval_status,
        is_blocked
      `)
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(
        `Unable to verify seller access: ${profileError.message}`
      );
    }

    if (!profile) {
      redirect("/account");
    }

    /*
     * Blocked users cannot enter seller tools.
     */
    if (profile.is_blocked === true) {
      redirect("/account-blocked");
    }

    const role =
      profile.role
        ?.toString()
        .trim() ?? "";

    const approvalStatus =
      profile
        .seller_approval_status
        ?.toString()
        .trim() ?? "";

    /*
     * Pending and rejected applicants must
     * remain on the seller-status page.
     */
    if (
      approvalStatus === "pending" ||
      approvalStatus === "rejected"
    ) {
      redirect("/seller-pending");
    }

    /*
     * Normal customers cannot use seller tools.
     */
    if (
      approvalStatus !== "approved" ||
      (
        role !== "vendor" &&
        role !== "seller"
      )
    ) {
      redirect("/account");
    }

    const email =
      profile.email
        ?.toString()
        .trim() ||
      user.email ||
      "";

    const fullName =
      profile.full_name
        ?.toString()
        .trim() ||
      user.user_metadata
        ?.full_name
        ?.toString()
        .trim() ||
      email.split("@")[0] ||
      "AthiMart Seller";

    const phone =
      profile.phone
        ?.toString()
        .trim() || "";

    return {
      user,

      profile: {
        id: user.id,
        email,
        fullName,
        phone,

        role:
          role as ApprovedSellerRole,

        sellerApprovalStatus:
          "approved",
      },
    };
  }
);
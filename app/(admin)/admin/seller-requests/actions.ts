// app/(admin)/admin/seller-requests/actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getSellerId(
  formData: FormData
): string {
  const value =
    formData.get("sellerId");

  if (typeof value !== "string") {
    return "";
  }

  const sellerId =
    value.trim();

  return UUID_PATTERN.test(sellerId)
    ? sellerId
    : "";
}

function getRejectionReason(
  formData: FormData
): string {
  const value =
    formData.get("rejectionReason");

  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .slice(0, 1000);
}

function refreshSellerPages(): void {
  revalidatePath(
    "/admin/seller-requests"
  );

  revalidatePath(
    "/seller-pending"
  );

  revalidatePath(
    "/account"
  );

  revalidatePath(
    "/",
    "layout"
  );
}

/**
 * Approve a pending AthiMart seller.
 *
 * The account remains a normal authenticated
 * Supabase user, but its marketplace profile
 * becomes an approved vendor.
 */
export async function approveSeller(
  formData: FormData
): Promise<never> {
  const admin =
    await getCurrentAdmin();

  const sellerId =
    getSellerId(formData);

  if (!sellerId) {
    redirect(
      "/admin/seller-requests?error=invalid-seller"
    );
  }

  /*
   * Prevent the administrator from accidentally
   * modifying their own admin profile through
   * the seller approval screen.
   */
  if (
    sellerId === admin.user.id
  ) {
    redirect(
      "/admin/seller-requests?error=invalid-seller"
    );
  }

  const supabase =
    await createClient();

  /*
   * Only approve an account that is currently
   * waiting for seller approval.
   */
  const {
    data: updatedSeller,
    error,
  } = await supabase
    .from("profiles")
    .update({
      role: "vendor",

      seller_approval_status:
        "approved",

      seller_reviewed_at:
        new Date().toISOString(),

      seller_reviewed_by:
        admin.user.id,

      seller_rejection_reason:
        null,
    })
    .eq("id", sellerId)
    .eq(
      "seller_approval_status",
      "pending"
    )
    .select("id")
    .maybeSingle();

  if (error) {
    redirect(
      "/admin/seller-requests?error=approve-failed"
    );
  }

  if (!updatedSeller) {
    redirect(
      "/admin/seller-requests?error=request-not-pending"
    );
  }

  refreshSellerPages();

  redirect(
    "/admin/seller-requests?approved=1"
  );
}

/**
 * Reject a pending AthiMart seller request.
 */
export async function rejectSeller(
  formData: FormData
): Promise<never> {
  const admin =
    await getCurrentAdmin();

  const sellerId =
    getSellerId(formData);

  const rejectionReason =
    getRejectionReason(
      formData
    );

  if (!sellerId) {
    redirect(
      "/admin/seller-requests?error=invalid-seller"
    );
  }

  if (
    sellerId === admin.user.id
  ) {
    redirect(
      "/admin/seller-requests?error=invalid-seller"
    );
  }

  if (
    rejectionReason.length < 5
  ) {
    redirect(
      "/admin/seller-requests?error=missing-rejection-reason"
    );
  }

  const supabase =
    await createClient();

  const {
    data: updatedSeller,
    error,
  } = await supabase
    .from("profiles")
    .update({
      role: "customer",

      seller_approval_status:
        "rejected",

      seller_reviewed_at:
        new Date().toISOString(),

      seller_reviewed_by:
        admin.user.id,

      seller_rejection_reason:
        rejectionReason,
    })
    .eq("id", sellerId)
    .eq(
      "seller_approval_status",
      "pending"
    )
    .select("id")
    .maybeSingle();

  if (error) {
    redirect(
      "/admin/seller-requests?error=reject-failed"
    );
  }

  if (!updatedSeller) {
    redirect(
      "/admin/seller-requests?error=request-not-pending"
    );
  }

  refreshSellerPages();

  redirect(
    "/admin/seller-requests?rejected=1"
  );
}
// app/(admin)/admin/sellers/actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getValidSellerId(
  sellerId: string
): string {
  const cleanedSellerId =
    sellerId.trim();

  if (
    !UUID_PATTERN.test(
      cleanedSellerId
    )
  ) {
    throw new Error(
      "Invalid seller account ID."
    );
  }

  return cleanedSellerId;
}

function getText(
  formData: FormData,
  name: string
): string {
  const value =
    formData.get(name);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function revalidateSellerPages(): void {
  revalidatePath("/admin");

  revalidatePath(
    "/admin/sellers"
  );

  revalidatePath(
    "/admin/seller-requests"
  );

  revalidatePath("/seller");

  revalidatePath(
    "/seller/products"
  );

  revalidatePath("/account");

  revalidatePath(
    "/",
    "layout"
  );
}

/**
 * Temporarily block an approved seller.
 *
 * The seller keeps the marketplace role,
 * but cannot access their account or seller
 * product-management tools while blocked.
 */
export async function blockSeller(
  sellerId: string,
  formData: FormData
): Promise<void> {
  await getCurrentAdmin();

  const cleanedSellerId =
    getValidSellerId(
      sellerId
    );

  const reason =
    getText(
      formData,
      "reason"
    );

  if (reason.length < 5) {
    redirect(
      `/admin/sellers?error=block-reason-required&sellerId=${encodeURIComponent(
        cleanedSellerId
      )}`
    );
  }

  const supabase =
    await createClient();

  const {
    data: seller,
    error: lookupError,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      role,
      seller_approval_status,
      is_blocked
    `)
    .eq(
      "id",
      cleanedSellerId
    )
    .maybeSingle();

  if (lookupError) {
    throw new Error(
      `Unable to verify seller account: ${lookupError.message}`
    );
  }

  if (!seller) {
    redirect(
      "/admin/sellers?error=seller-not-found"
    );
  }

  const marketplaceRole =
    seller.role
      ?.toString()
      .trim()
      .toLowerCase() ?? "";

  const approvalStatus =
    seller
      .seller_approval_status
      ?.toString()
      .trim()
      .toLowerCase() ?? "";

  if (
    (
      marketplaceRole !== "vendor" &&
      marketplaceRole !== "seller"
    ) ||
    approvalStatus !== "approved"
  ) {
    redirect(
      "/admin/sellers?error=not-approved-seller"
    );
  }

  const {
    data: updatedSeller,
    error: updateError,
  } = await supabase
    .from("profiles")
    .update({
      is_blocked: true,
      blocked_reason: reason,
    })
    .eq(
      "id",
      cleanedSellerId
    )
    .select("id")
    .maybeSingle();

  if (updateError) {
    throw new Error(
      `Unable to block seller: ${updateError.message}`
    );
  }

  if (!updatedSeller) {
    throw new Error(
      "The seller account was not blocked."
    );
  }

  revalidateSellerPages();

  redirect(
    "/admin/sellers?status=blocked"
  );
}

/**
 * Restore access to a blocked approved seller.
 */
export async function unblockSeller(
  sellerId: string,
  formData: FormData
): Promise<void> {
  void formData;

  await getCurrentAdmin();

  const cleanedSellerId =
    getValidSellerId(
      sellerId
    );

  const supabase =
    await createClient();

  const {
    data: seller,
    error: lookupError,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      role,
      seller_approval_status
    `)
    .eq(
      "id",
      cleanedSellerId
    )
    .maybeSingle();

  if (lookupError) {
    throw new Error(
      `Unable to verify seller account: ${lookupError.message}`
    );
  }

  if (!seller) {
    redirect(
      "/admin/sellers?error=seller-not-found"
    );
  }

  const marketplaceRole =
    seller.role
      ?.toString()
      .trim()
      .toLowerCase() ?? "";

  const approvalStatus =
    seller
      .seller_approval_status
      ?.toString()
      .trim()
      .toLowerCase() ?? "";

  if (
    (
      marketplaceRole !== "vendor" &&
      marketplaceRole !== "seller"
    ) ||
    approvalStatus !== "approved"
  ) {
    redirect(
      "/admin/sellers?error=not-approved-seller"
    );
  }

  const {
    data: updatedSeller,
    error: updateError,
  } = await supabase
    .from("profiles")
    .update({
      is_blocked: false,
      blocked_reason: null,
    })
    .eq(
      "id",
      cleanedSellerId
    )
    .select("id")
    .maybeSingle();

  if (updateError) {
    throw new Error(
      `Unable to unblock seller: ${updateError.message}`
    );
  }

  if (!updatedSeller) {
    throw new Error(
      "The seller account was not unblocked."
    );
  }

  revalidateSellerPages();

  redirect(
    "/admin/sellers?status=unblocked"
  );
}
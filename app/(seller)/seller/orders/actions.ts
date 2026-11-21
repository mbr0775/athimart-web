"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSeller } from "@/lib/auth/seller";
import { createClient } from "@/lib/supabase/server";
import { isSellerOrderStatus, nextSellerOrderStatus } from "@/lib/orders/seller-order-status";

export interface SellerOrderActionState { success: boolean; message: string }

export async function advanceSellerOrder(_previous: SellerOrderActionState, form: FormData): Promise<SellerOrderActionState> {
  await getCurrentSeller();
  const id = form.get("fulfillmentId");
  const expected = form.get("expectedStatus");
  const next = form.get("nextStatus");
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    || !isSellerOrderStatus(expected) || !isSellerOrderStatus(next) || nextSellerOrderStatus(expected) !== next) {
    return { success: false, message: "This order update is invalid. Refresh your inbox and try again." };
  }
  try {
    const supabase = await createClient();
    // No client-supplied seller or customer ID. The database verifies ownership
    // and the current status atomically, including calls outside this app.
    const { data, error } = await supabase.rpc("advance_seller_order", { p_fulfillment_id: id, p_expected_status: expected, p_next_status: next });
    if (error || data?.id !== id || data?.status !== next) {
      return { success: false, message: error?.code === "40001" ? "This order changed in another session. Refresh your inbox before updating it." : "The order could not be updated. It may be closed or no longer available to your account. Refresh and try again." };
    }
    revalidatePath("/seller/orders");
    revalidatePath("/seller");
    revalidatePath("/orders");
    return { success: true, message: "Order updated. Your customer can see the new preparation status." };
  } catch {
    return { success: false, message: "Your update could not be confirmed. Refresh the order before trying again." };
  }
}

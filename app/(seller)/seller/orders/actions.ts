"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSeller } from "@/lib/auth/seller";
import { createClient } from "@/lib/supabase/server";
import { nextSellerStatus } from "@/lib/orders/seller-orders";

export interface SellerOrderActionState { message: string; success: boolean }

export async function progressSellerOrder(
  _state: SellerOrderActionState,
  form: FormData,
): Promise<SellerOrderActionState> {
  await getCurrentSeller();
  const id = String(form.get("fulfillmentId") ?? "");
  const current = String(form.get("expectedStatus") ?? "");
  const next = Object.hasOwn(nextSellerStatus, current) ? nextSellerStatus[current] : undefined;
  if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id) || !next) {
    return { success: false, message: "Refresh the orders page and try again." };
  }
  const client = await createClient();
  const { error } = await client.rpc("web_progress_seller_order", {
    p_fulfillment_id: id, p_expected_status: current, p_status: next.status,
  });
  if (error) {
    console.error("Seller order update failed", error.code);
    return { success: false, message: "The order could not be updated. Refresh to check its current status." };
  }
  revalidatePath("/seller/orders");
  revalidatePath("/seller");
  revalidatePath("/orders");
  return { success: true, message: "Order updated." };
}

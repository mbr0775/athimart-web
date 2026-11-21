import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { SellerFulfillment, SellerInbox } from "./seller-order-status";

export async function getSellerInbox(status: string, page: number): Promise<{ inbox: SellerInbox | null; error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("seller_order_inbox", { p_status: status, p_page: page });
  if (error) return { inbox: null, error: "Your order inbox could not be loaded. Refresh to try again. If this continues, contact AthiMart support." };
  if (!data || !Array.isArray(data.orders) || !data.summary || typeof data.total !== "number") {
    return { inbox: null, error: "Your order inbox returned an incomplete response. Please try again." };
  }
  return { inbox: data as SellerInbox, error: "" };
}

export async function getCustomerFulfillments(orderIds: string[]): Promise<{ fulfillments: SellerFulfillment[]; available: boolean }> {
  if (!orderIds.length) return { fulfillments: [], available: true };
  const supabase = await createClient();
  // Ownership is enforced by RLS as well as the caller's list of own order IDs.
  const { data, error } = await supabase.from("seller_order_fulfillments")
    .select("id,order_id,seller_name,status,seller_order_lines(id,product_name,quantity,unit_price,line_total)")
    .in("order_id", orderIds).order("created_at", { ascending: true });
  return { fulfillments: error ? [] : (data ?? []) as SellerFulfillment[], available: !error };
}

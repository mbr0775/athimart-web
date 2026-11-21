import "server-only";

import { getCurrentSeller } from "@/lib/auth/seller";
import { createClient } from "@/lib/supabase/server";

export interface SellerOrder {
  id: string;
  order_id: string;
  order_number: string;
  status: string;
  created_at: string;
  shipping_name: string;
  shipping_phone: string;
  address: string;
  payment_method: string;
  currency: string;
  items: { id: string; product_name: string; quantity: number; price: number; total: number }[];
}

export const nextSellerStatus: Record<string, { status: string; label: string }> = {
  pending: { status: "accepted", label: "Accept order" },
  accepted: { status: "preparing", label: "Start preparing" },
  preparing: { status: "ready", label: "Ready for collection" },
};

export async function getSellerOrders(offset = 0) {
  await getCurrentSeller();
  const client = await createClient();
  const { data, error } = await client.rpc("web_seller_orders", { p_offset: offset });
  if (error) {
    console.error("Seller order inbox unavailable", error.code);
    return { orders: [] as SellerOrder[], unavailable: true };
  }
  return { orders: (data ?? []) as SellerOrder[], unavailable: false };
}

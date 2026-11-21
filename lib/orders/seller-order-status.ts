export const sellerOrderStatuses = ["new", "accepted", "preparing", "ready"] as const;
export type SellerOrderStatus = typeof sellerOrderStatuses[number];
export const sellerOrderLabels: Record<SellerOrderStatus, string> = {
  new: "New order", accepted: "Accepted", preparing: "Preparing", ready: "Ready for dispatch",
};
export function isSellerOrderStatus(value: unknown): value is SellerOrderStatus {
  return typeof value === "string" && sellerOrderStatuses.includes(value as SellerOrderStatus);
}
export function nextSellerOrderStatus(status: SellerOrderStatus): SellerOrderStatus | null {
  return sellerOrderStatuses[sellerOrderStatuses.indexOf(status) + 1] ?? null;
}
export function isOrderClosed(status: string): boolean {
  return ["cancelled", "canceled", "completed", "delivered", "refunded"].includes(status.trim().toLowerCase());
}
export function orderMoney(value: number | string, currency = "LKR") {
  const amount = Number(value);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat("en-LK", { style: "currency", currency, maximumFractionDigits: 2 }).format(safeAmount);
  } catch {
    return `${currency || "LKR"} ${safeAmount.toFixed(2)}`;
  }
}

export interface SellerOrderLine {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number | string;
  line_total: number | string;
}
export interface SellerFulfillment {
  id: string;
  order_id: string;
  seller_name: string;
  status: SellerOrderStatus;
  seller_order_lines: SellerOrderLine[];
}
export interface SellerOrder extends SellerFulfillment {
  order_number: string;
  order_status: string;
  customer_name: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string;
  currency_code: string;
  payment_method: string;
  subtotal: number | string;
  created_at: string;
}
export interface SellerInbox {
  orders: SellerOrder[];
  total: number;
  summary: Record<SellerOrderStatus, number>;
}

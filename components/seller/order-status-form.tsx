"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { advanceSellerOrder } from "@/app/(seller)/seller/orders/actions";
import { isOrderClosed, nextSellerOrderStatus, type SellerOrderStatus } from "@/lib/orders/seller-order-status";

const labels = { accepted: "Accept order", preparing: "Start preparing", ready: "Ready for dispatch" };
export default function OrderStatusForm({ id, status, orderStatus }: { id: string; status: SellerOrderStatus; orderStatus: string }) {
  const [state, action, pending] = useActionState(advanceSellerOrder, { success: false, message: "" });
  const next = nextSellerOrderStatus(status);
  if (isOrderClosed(orderStatus)) return <p className="text-sm text-[var(--text-muted)]">This order is {orderStatus.toLowerCase()}. Preparation updates are closed.</p>;
  if (!next || next === "new") return <p className="text-sm text-[var(--success)]">Ready for AthiMart dispatch. Delivery is managed separately.</p>;
  return <form action={action} className="flex flex-wrap items-center gap-4" aria-busy={pending}>
    <input type="hidden" name="fulfillmentId" value={id} />
    <input type="hidden" name="expectedStatus" value={status} />
    <input type="hidden" name="nextStatus" value={next} />
    <button className="athimart-brand-button" disabled={pending} type="submit">{pending && <LoaderCircle size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}{pending ? "Updating order…" : labels[next]}</button>
    <p role={state.message && !state.success ? "alert" : "status"} className={`text-sm ${state.success ? "text-[var(--success)]" : "text-[var(--sale)]"}`}>{state.message}</p>
  </form>;
}

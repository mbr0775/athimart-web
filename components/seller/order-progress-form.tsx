"use client";

import { useActionState } from "react";
import { progressSellerOrder } from "@/app/(seller)/seller/orders/actions";

export default function OrderProgressForm({ id, status, label }: { id: string; status: string; label: string }) {
  const [state, action, pending] = useActionState(progressSellerOrder, { success: false, message: "" });
  return <form action={action} className="mt-4 space-y-2">
    <input type="hidden" name="fulfillmentId" value={id} />
    <input type="hidden" name="expectedStatus" value={status} />
    <button disabled={pending} className="athimart-brand-button disabled:opacity-50">
      {pending ? "Updating…" : label}
    </button>
    {state.message && <p role="status" className="text-sm">{state.message}</p>}
  </form>;
}

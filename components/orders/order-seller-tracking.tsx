import { createClient } from "@/lib/supabase/server";

export default async function OrderSellerTracking({ orderId }: { orderId: string }) {
  const client = await createClient();
  // Customer RLS permits tracking only on the signed-in customer's own orders.
  const { data, error } = await client.from("marketplace_fulfillments")
    .select("seller_name, status, rejection_reason")
    .eq("order_id", orderId).order("created_at");
  if (error || !data?.length) return null;
  return <section aria-label="Seller preparation" className="border-t border-[var(--border)] p-5 sm:px-7">
    <h3 className="text-sm font-semibold">Seller preparation</h3>
    <ul className="mt-2 space-y-2 text-sm">
      {data.map((row, index) => <li key={index}>
        <span className="font-medium">{row.seller_name}</span>{" · "}
        <span className="capitalize">{row.status.replaceAll("_", " ")}</span>
        {row.rejection_reason && <p>{row.rejection_reason}</p>}
      </li>)}
    </ul>
  </section>;
}

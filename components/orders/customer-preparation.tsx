import { orderMoney, sellerOrderLabels, type SellerFulfillment } from "@/lib/orders/seller-order-status";

export default function CustomerPreparation({ fulfillments, currency }: { fulfillments: SellerFulfillment[]; currency: string }) {
  if (!fulfillments.length) return null;
  return <section aria-label="Seller preparation updates" className="border-t border-[var(--border)] p-5 sm:p-7">
    <h3 className="mb-4 text-sm font-semibold">From your sellers</h3>
    <div className="grid gap-4">{fulfillments.map(fulfillment => <div key={fulfillment.id} className="rounded-2xl border border-[var(--border)] p-4"><div className="mb-3 flex flex-wrap justify-between gap-3 text-sm"><h4 className="font-medium">{fulfillment.seller_name}</h4><span className="text-[var(--brand-hover)]">{sellerOrderLabels[fulfillment.status]}</span></div><ul className="space-y-2">{fulfillment.seller_order_lines.map(item => <li key={item.id} className="flex justify-between gap-4 text-sm"><span>{item.quantity} × {item.product_name}</span><span className="shrink-0">{orderMoney(item.line_total, currency)}</span></li>)}</ul></div>)}</div>
    <p className="mt-4 text-xs leading-6 text-[var(--text-muted)]">Preparation is shown separately for each seller. Delivery updates appear in your overall order status.</p>
  </section>;
}

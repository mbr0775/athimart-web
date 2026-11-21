import type { Metadata } from "next";
import Link from "@/components/navigation/navigation-link";
import { PackageOpen, ShoppingBag, MapPin } from "lucide-react";
import { getCurrentSeller } from "@/lib/auth/seller";
import { getSellerInbox } from "@/lib/orders/seller-order-service";
import { isSellerOrderStatus, orderMoney, sellerOrderLabels, sellerOrderStatuses } from "@/lib/orders/seller-order-status";
import OrderStatusForm from "@/components/seller/order-status-form";
import OrderRefresh from "@/components/orders/order-refresh";

export const metadata: Metadata = { title: "Seller orders", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SellerOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  await getCurrentSeller();
  const params = await searchParams;
  const status = isSellerOrderStatus(params.status) ? params.status : "all";
  const page = Math.min(10000, Math.max(1, Math.trunc(Number(params.page)) || 1));
  const { inbox, error } = await getSellerInbox(status, page);
  const pageHref = (next: number) => `/seller/orders?status=${status}&page=${next}`;
  return <div className="min-w-0 space-y-8">
    <header className="flex flex-wrap items-end justify-between gap-5 border-b border-[var(--border)] pb-8">
      <div><p className="athimart-label text-[var(--text-muted)]">Your seller centre</p><h1 className="athimart-display-large mt-4">Incoming orders<span className="text-[var(--brand-hover)]">.</span></h1><p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-soft)]">Receive orders for your products, prepare each customer&apos;s items, and keep them informed. This inbox refreshes every 30 seconds while open.</p></div>
      <OrderRefresh />
    </header>
    <nav aria-label="Filter seller orders" className="flex flex-wrap gap-3">
      <Link href="/seller/orders" aria-current={status === "all" ? "page" : undefined} className={status === "all" ? "athimart-brand-button" : "athimart-brand-outline-button"}>All orders{inbox ? ` (${Object.values(inbox.summary).reduce((a,b) => a+b, 0)})` : ""}</Link>
      {sellerOrderStatuses.map(value => <Link key={value} href={`/seller/orders?status=${value}`} aria-current={status === value ? "page" : undefined} className={status === value ? "athimart-brand-button" : "athimart-brand-outline-button"}>{sellerOrderLabels[value]}{inbox ? ` (${inbox.summary[value]})` : ""}</Link>)}
    </nav>
    {error ? <div role="alert" className="athimart-panel p-6 text-sm leading-7">{error}</div> : inbox?.orders.length === 0 ? <section className="athimart-panel space-y-4 p-8 text-center"><PackageOpen className="mx-auto" size={36} aria-hidden="true" /><h2 className="text-xl">{status === "all" ? "Your next order starts here" : "No orders in this stage"}</h2><p className="text-sm text-[var(--text-soft)]">When customers order your products, their orders will appear in this inbox.</p><Link href="/seller/products" className="athimart-brand-outline-button"><ShoppingBag size={16} aria-hidden="true" />Your products</Link></section> : inbox?.orders.map(order => <article key={order.id} className="athimart-panel overflow-hidden">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] p-6"><div><p className="text-xs text-[var(--text-muted)]">Order number</p><h2 className="mt-2 break-all font-editorial text-2xl">{order.order_number}</h2><p className="mt-2 text-xs text-[var(--text-muted)]">{new Intl.DateTimeFormat("en-LK", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Colombo" }).format(new Date(order.created_at))}</p></div><span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-sm">{sellerOrderLabels[order.status]}</span></header>
      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"><div><h3 className="mb-4 text-sm font-semibold">Your items</h3><ul className="divide-y divide-[var(--border)]">{order.seller_order_lines.map(item => <li key={item.id} className="flex justify-between gap-4 py-3 text-sm"><div><p className="break-words font-medium">{item.product_name}</p><p className="mt-1 text-xs text-[var(--text-muted)]">{item.quantity} × {orderMoney(item.unit_price, order.currency_code)}</p></div><span className="shrink-0">{orderMoney(item.line_total, order.currency_code)}</span></li>)}</ul><p className="mt-4 flex flex-wrap justify-between gap-3 border-t border-[var(--border)] pt-4 text-sm font-semibold"><span>Your items subtotal</span><span>{orderMoney(order.subtotal, order.currency_code)}</span></p></div>
      <div className="space-y-3 rounded-2xl bg-[var(--surface-soft)] p-5 text-sm leading-7"><h3 className="flex items-center gap-2 font-semibold"><MapPin size={16} aria-hidden="true" />Customer &amp; delivery</h3><p className="font-medium">{order.customer_name}</p><a href={`tel:${order.shipping_phone}`} className="underline underline-offset-4">{order.shipping_phone}</a><p className="break-words">{[order.shipping_address_line1, order.shipping_address_line2, order.shipping_city, order.shipping_state, order.shipping_postal_code, order.shipping_country].filter(Boolean).join(", ")}</p><p className="text-xs text-[var(--text-muted)]">{order.payment_method} · Overall order: {order.order_status}</p></div></div>
      <footer className="border-t border-[var(--border)] p-6"><OrderStatusForm id={order.id} status={order.status} orderStatus={order.order_status} /></footer>
    </article>)}
    {inbox && inbox.total > 20 && <nav aria-label="Seller order pages" className="flex flex-wrap items-center justify-between gap-4"><p className="text-sm">Page {page} of {Math.max(1, Math.ceil(inbox.total / 20))}</p><div className="flex gap-3">{page > 1 && <Link href={pageHref(page - 1)} className="athimart-brand-outline-button">Previous</Link>}{page * 20 < inbox.total && <Link href={pageHref(page + 1)} className="athimart-brand-outline-button">Next</Link>}</div></nav>}
  </div>;
}

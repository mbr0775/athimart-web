import type { Metadata } from "next";
import Link from "next/link";
import { getSellerOrders, nextSellerStatus } from "@/lib/orders/seller-orders";
import OrderProgressForm from "@/components/seller/order-progress-form";
import OrdersRefresh from "@/components/seller/orders-refresh";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Seller orders", robots: { index: false, follow: false } };

export default async function SellerOrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = Math.min(10000, Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1));
  const { orders, unavailable } = await getSellerOrders((page - 1) * 20);
  const money = (value: number, currency: string) => new Intl.NumberFormat("en-LK", {
    style: "currency", currency: currency === "LKR" ? currency : "LKR", maximumFractionDigits: 2,
  }).format(value);
  return <div className="min-w-0 space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
      <div><h1 className="font-editorial text-4xl">Your orders</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Receive orders, prepare items and arrange collection. Updates every 30 seconds.</p></div>
      <OrdersRefresh />
    </header>
    {unavailable ? <p role="alert">Your order inbox is temporarily unavailable. Please refresh in a moment.</p>
      : orders.length === 0 ? <p>No orders on this page yet.</p>
        : orders.slice(0, 20).map(order => {
          const next = nextSellerStatus[order.status.toLowerCase()];
          return <article key={order.id} className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="break-all text-lg font-semibold">{order.order_number}</h2>
                <p className="text-sm">{new Date(order.created_at).toLocaleString("en-LK", { timeZone: "Asia/Colombo" })}</p></div>
              <span className="rounded-full bg-[var(--linen-light)] px-3 py-1 text-sm capitalize">{order.status.replaceAll("_", " ")}</span>
            </header>
            <ul className="my-4 divide-y divide-[var(--border)]">
              {order.items.map(item => <li key={item.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <span className="break-words">{item.product_name} × {item.quantity}</span><strong>{money(item.total, order.currency)}</strong>
              </li>)}
            </ul>
            <p className="text-sm font-semibold">Your items total {money(order.items.reduce((sum, item) => sum + Number(item.total), 0), order.currency)}</p>
            <p className="mt-1 text-sm">{order.payment_method}</p>
            <address className="mt-4 break-words text-sm not-italic">
              <strong>{order.shipping_name}</strong><p>{order.shipping_phone}</p><p>{order.address}</p>
            </address>
            {next && <OrderProgressForm key={order.status} id={order.id} status={order.status.toLowerCase()} label={next.label} />}
          </article>;
        })}
    {!unavailable && <nav aria-label="Order pages" className="flex gap-4">
      {page > 1 && <Link href={`/seller/orders?page=${page - 1}`}>Previous</Link>}
      {orders.length > 20 && <Link href={`/seller/orders?page=${page + 1}`}>Next</Link>}
    </nav>}
  </div>;
}

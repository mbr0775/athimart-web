"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function OrderRefresh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible" && !pending) startTransition(() => router.refresh());
    };
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [router, pending]);
  return <button type="button" className="athimart-brand-outline-button" disabled={pending} onClick={() => startTransition(() => router.refresh())}>
    <RefreshCw size={16} aria-hidden="true" className={pending ? "animate-spin motion-reduce:animate-none" : ""} />
    <span role="status">{pending ? "Refreshing orders…" : "Refresh orders"}</span>
  </button>;
}

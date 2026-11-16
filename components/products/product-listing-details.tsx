"use client";

import { useEffect, useRef, useState } from "react";
import { getProductPath } from "@/lib/products/product-url";
import { productListingEmoji, productListingSku, productListingSlug } from "@/lib/products/product-listing-identifiers";

type Listing = { name?: string; category?: string; subCategory?: string; sku?: string | null; slug?: string; emoji?: string | null };

export default function ProductListingDetails({ product, sellerName = "", errors = {} }: {
  product?: Listing;
  sellerName?: string;
  errors?: Record<string, string | undefined>;
}) {
  const section = useRef<HTMLElement>(null);
  const [fields, setFields] = useState({ name: product?.name ?? "", category: product?.category ?? "", subCategory: product?.subCategory ?? "", seller: sellerName, token: "" });
  const [customSku, setCustomSku] = useState("");

  useEffect(() => {
    const form = section.current?.closest("form");
    if (!form) return;
    const token = form.querySelector<HTMLInputElement>('[name="listingToken"]')?.value
      || crypto.randomUUID().replaceAll("-", "").slice(0, 16);
    const read = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? "";
    const sync = () => {
      const shop = form.elements.namedItem("shopId") as HTMLSelectElement | null;
      setFields({ name: read("name"), category: read("category"), subCategory: read("subCategory"), seller: sellerName || (shop?.value ? shop.selectedOptions[0]?.text ?? "" : ""), token });
    };
    const syncAfterChange = () => queueMicrotask(sync);
    syncAfterChange();
    form.addEventListener("input", syncAfterChange);
    form.addEventListener("change", syncAfterChange);
    return () => {
      form.removeEventListener("input", syncAfterChange);
      form.removeEventListener("change", syncAfterChange);
    };
  }, [sellerName]);

  const { name, category, subCategory, seller, token } = fields;
  const sku = product?.sku || (name.trim() && token ? productListingSku(name, token, "", seller) : "");
  const visibleSku = product?.sku || customSku.trim().toUpperCase() || sku;
  useEffect(() => {
    section.current?.closest("form")?.dispatchEvent(new Event("productlistingchange"));
  }, [visibleSku]);
  const slug = product?.slug || (name.trim() && token ? productListingSlug(name, token) : "");
  const url = slug && category && subCategory ? getProductPath({ slug, category, subCategory }) : "";
  const emoji = product?.emoji || productListingEmoji(category, subCategory);

  return (
    <section ref={section} aria-label="Listing details" className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <h2 className="text-lg font-semibold">Listing details</h2>
      <input type="hidden" data-listing-sku value={visibleSku} />
      <input type="hidden" name="listingToken" value={token} />
      <input type="hidden" name="sku" value={product?.sku || customSku} />
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium">Inventory SKU</dt>
          <dd className="mt-1 break-words text-sm text-[var(--text-muted)]">{visibleSku || "Generated from the product name"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium">Product icon</dt>
          <dd className="mt-1">{emoji}</dd>
        </div>
        <div className="min-w-0 sm:col-span-2">
          <dt className="text-sm font-medium">Product URL</dt>
          <dd className="mt-1 break-all text-sm text-[var(--text-muted)]">{url || "Generated from the name and category"}</dd>
        </div>
      </dl>
      {!product?.sku && (
        <details>
          <summary className="min-h-9 cursor-pointer text-sm font-medium">Use my own SKU</summary>
          <label className="block text-sm">
            Custom SKU
            <input value={customSku} maxLength={100} onChange={(event) => setCustomSku(event.target.value)}
              className="mt-1 min-h-11 w-full rounded-xl border border-[var(--border)] px-3" />
          </label>
        </details>
      )}
      {["sku", "slug"].flatMap((field) => errors[field] ? [<p key={field} role="alert" className="text-sm text-[var(--sale)]">{errors[field]}</p>] : [])}
    </section>
  );
}

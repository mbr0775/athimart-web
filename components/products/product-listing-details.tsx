"use client";

import { useEffect, useRef, useState } from "react";
import { customListingAttributes, generateListingMetadata, mergeListingAttributes, type ListingMetadataSource } from "@/lib/products/product-listing-metadata";
import { getProductPath } from "@/lib/products/product-url";
import { productListingEmoji, productListingSku, productListingSlug } from "@/lib/products/product-listing-identifiers";

type Listing = ListingMetadataSource & { sku?: string | null; slug?: string; emoji?: string | null; seoTitle?: string; seoDescription?: string; attributes?: Record<string, unknown> };
const metadataControl = "mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--linen-light)] px-3 py-2 text-sm";

export default function ProductListingDetails({ product, sellerName = "", errors = {}, showMetadata = false, onChange }: {
  product?: Listing;
  sellerName?: string;
  errors?: Record<string, string | undefined>;
  showMetadata?: boolean;
  onChange?: (field: string) => void;
}) {
  const section = useRef<HTMLElement>(null);
  const customization = useRef<HTMLDetailsElement>(null);
  const hasMetadataError = Boolean(errors.seoTitle || errors.seoDescription || errors.attributes);
  useEffect(() => {
    if (hasMetadataError && customization.current) customization.current.open = true;
  }, [hasMetadataError]);
  const [fields, setFields] = useState({ name: product?.name ?? "", category: product?.category ?? "", subCategory: product?.subCategory ?? "", description: product?.description ?? "", brand: product?.brand ?? "", seller: sellerName, token: "" });
  const [customSku, setCustomSku] = useState("");
  const [metadataOverrides, setMetadataOverrides] = useState(() => {
    const original = generateListingMetadata(product ?? {});
    const custom = customListingAttributes(product ?? {}, product?.attributes ?? {});
    return {
      seoTitle: product?.seoTitle === original.title ? "" : product?.seoTitle ?? "",
      seoDescription: product?.seoDescription === original.description ? "" : product?.seoDescription ?? "",
      attributes: Object.keys(custom).length ? JSON.stringify(custom, null, 2) : "",
    };
  });
  const metadata = generateListingMetadata(fields);
  let specifications: Record<string, unknown> = metadata.attributes;
  try {
    const custom: unknown = JSON.parse(metadataOverrides.attributes || "{}");
    if (custom && typeof custom === "object" && !Array.isArray(custom)) {
      specifications = mergeListingAttributes(fields, custom as Record<string, unknown>);
    }
  } catch {
    // Keep previewing the generated values until optional JSON is valid.
  }

  useEffect(() => {
    const form = section.current?.closest("form");
    if (!form) return;
    const token = form.querySelector<HTMLInputElement>('[name="listingToken"]')?.value
      || crypto.randomUUID().replaceAll("-", "").slice(0, 16);
    const read = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? "";
    const sync = () => {
      const shop = form.elements.namedItem("shopId") as HTMLSelectElement | null;
      setFields({ name: read("name"), category: read("category"), subCategory: read("subCategory"), description: read("description"), brand: read("brand"), seller: sellerName || (shop?.value ? shop.selectedOptions[0]?.text ?? "" : ""), token });
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
      {showMetadata && (
        <>
          <section aria-label="Product SEO" className="space-y-2 border-t border-[var(--border)] pt-4">
            <h3 className="font-semibold">Product SEO</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium">SEO title</dt>
                <dd className="break-words text-[var(--text-muted)]">{metadataOverrides.seoTitle.trim() || metadata.title || "Add a product name"}</dd>
              </div>
              <div>
                <dt className="font-medium">SEO description</dt>
                <dd className="break-words text-[var(--text-muted)]">{metadataOverrides.seoDescription.trim() || metadata.description || "Add a product description"}</dd>
              </div>
            </dl>
          </section>
          <section aria-label="Additional specifications" className="space-y-2 border-t border-[var(--border)] pt-4">
            <h3 className="font-semibold">Additional specifications</h3>
            {Object.keys(specifications).length > 0 ? (
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="min-w-0">
                    <dt className="break-words font-medium">{key.replaceAll("_", " ")}</dt>
                    <dd className="break-words text-[var(--text-muted)]">{typeof value === "string" ? value : JSON.stringify(value)}</dd>
                  </div>
                ))}
              </dl>
            ) : <p className="text-sm text-[var(--text-muted)]">Add a category and product type to generate specifications.</p>}
          </section>
          <details ref={customization} data-product-field="attributes">
            <summary className="cursor-pointer text-sm font-medium">Customize SEO or add specifications</summary>
            <div className="mt-3 space-y-3">
              <p className="text-xs text-[var(--text-muted)]">Leave these fields blank to use the automatic values.</p>
              {([{ key: "seoTitle", label: "Custom SEO title", limit: 70 }, { key: "seoDescription", label: "Custom SEO description", limit: 160 }, { key: "attributes", label: "Attributes JSON (optional)", limit: undefined }] as const).map(({ key, label, limit }) => (
                <label key={key} className="block text-sm">
                  {label}
                  <textarea name={key} maxLength={limit} rows={key === "seoTitle" ? 1 : 3}
                    value={metadataOverrides[key]} aria-invalid={Boolean(errors[key])}
                    className={metadataControl}
                    onChange={(event) => {
                      const value = event.target.value;
                      setMetadataOverrides((current) => ({ ...current, [key]: value }));
                      onChange?.(key);
                    }} />
                  {errors[key] && <span role="alert" className="block text-xs text-[var(--sale)]">{errors[key]}</span>}
                </label>
              ))}
              {Object.keys(specifications).length > 0 && (
                <details>
                  <summary className="cursor-pointer text-xs font-medium">View generated JSON</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-all text-xs">{JSON.stringify(specifications, null, 2)}</pre>
                </details>
              )}
            </div>
          </details>
        </>
      )}
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

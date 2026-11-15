"use client";

import { useId, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  MAX_PRODUCT_VARIANTS, productVariantFields, variantKey, variantSummary,
  type VariantKey, type VariantRow, type VariantValues,
} from "@/lib/products/product-variants";

const control = "mt-1 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--linen-light)] px-3 text-sm";
const smallButton = "inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] px-3 text-sm font-medium hover:bg-[var(--linen-light)]";

export default function ProductVariantFields({ values = {}, error, onChange }: {
  values?: VariantValues;
  error?: string;
  onChange?: () => void;
}) {
  const id = useId();
  const [rows, setRows] = useState<VariantRow[]>(() => variantSummary(values) ? [{ values, price: "", stock: "" }] : []);
  const [selection, setSelection] = useState<VariantValues>({});
  const [checked, setChecked] = useState<Partial<Record<VariantKey, boolean>>>(
    () => Object.fromEntries(Object.keys(values).map((key) => [key, true])),
  );
  const [editing, setEditing] = useState<number | null>(null);
  const [draftError, setDraftError] = useState("");
  const hasDraft = editing !== null || productVariantFields.some(({ key }) => checked[key] && selection[key]?.trim());
  const message = draftError || error;

  function clearDraft() {
    setSelection({});
    setEditing(null);
    setDraftError("");
    onChange?.();
  }

  function addVariant() {
    const enabled = productVariantFields.filter(({ key }) => checked[key]);
    if (!enabled.length || enabled.some(({ key }) => !selection[key]?.trim())) {
      setDraftError("Tick at least one option and enter a value for every ticked option.");
      return;
    }
    const next = Object.fromEntries(enabled.map(({ key }) => [key, selection[key]!.trim()]));
    if (rows.some((row, index) => index !== editing && variantKey(row.values) === variantKey(next))) {
      setDraftError("This variant is already in the list.");
      return;
    }
    if (editing === null && rows.length >= MAX_PRODUCT_VARIANTS) {
      setDraftError("Save up to 100 variants per product.");
      return;
    }
    setRows((current) => editing === null
      ? [...current, { values: next, price: "", stock: "" }]
      : current.map((row, index) => index === editing ? { ...row, values: next } : row));
    clearDraft();
  }

  function editRow(index: number) {
    const row = rows[index];
    setSelection(row.values);
    setChecked(Object.fromEntries(Object.keys(row.values).map((key) => [key, true])));
    setEditing(index);
    setDraftError("");
  }

  return (
    <fieldset data-product-field="variants" className="min-w-0 rounded-2xl border border-[var(--border)] p-4 sm:col-span-2"
      aria-describedby={message ? `${id}-help ${id}-error` : `${id}-help`}>
      <legend className="px-2 font-semibold">Product variants</legend>
      <p id={`${id}-help`} className="mb-3 text-sm text-[var(--text-muted)]">
        Enter a size, colour, style or other option, then click Add variant. Repeat for each combination.
        All variants share the product details and images. Each has its own price and stock.
      </p>
      <input type="hidden" name="variantRows" value={JSON.stringify(rows)} />
      <input type="hidden" name="variantDraftPending" value={String(hasDraft)} />
      {rows.length > 0 && (
        <ul aria-label="Added variants" className="mb-4 space-y-2">
          {rows.map((row, index) => {
            const label = variantSummary(row.values);
            return (
              <li key={variantKey(row.values)} className="rounded-xl border border-[var(--border)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div><strong className="text-sm">{label}</strong>{index === 0 && (
                    <p className="text-xs text-[var(--text-muted)]">Uses the price and stock in Pricing &amp; Stock below.</p>
                  )}</div>
                  <div className="flex gap-1">
                    <button type="button" className={smallButton} aria-label={`Edit ${label} options`} onClick={() => editRow(index)}>Edit</button>
                    {(index > 0 || rows.length === 1) && (
                      <button type="button" className={smallButton} aria-label={`Remove ${label}`} onClick={() => {
                        setRows((current) => current.filter((_, position) => position !== index));
                        clearDraft();
                      }}><Trash2 size={15} aria-hidden="true" /></button>
                    )}
                  </div>
                </div>
                {index > 0 && (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {(["price", "stock"] as const).map((field) => (
                      <label key={field} className="text-sm">
                        {field === "price" ? "Price (LKR)" : "Stock"}
                        <input className={control} aria-label={`${field === "price" ? "Price" : "Stock"} for ${label}`}
                          type="number" min={0} step={field === "price" ? "0.01" : "1"} value={row[field]}
                          onChange={(event) => {
                            const value = event.target.value;
                            setRows((current) => current.map((item, position) => position === index ? { ...item, [field]: value } : item));
                            onChange?.();
                          }} />
                      </label>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {productVariantFields.map(({ key, label, examples }) => (
          <div key={key} className="min-w-0 rounded-xl border border-[var(--border)] p-2.5">
            <label className="flex min-h-8 cursor-pointer items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={Boolean(checked[key])} className="size-4 accent-[var(--brand)]"
                onChange={(event) => {
                  const isChecked = event.target.checked;
                  setChecked((current) => ({ ...current, [key]: isChecked }));
                }} />
              {label}
            </label>
            {checked[key] && <input type="text" value={selection[key] ?? ""} maxLength={48}
              aria-label={`${label} value`} list={examples.length ? `${id}-${key}` : undefined}
              placeholder={examples[0] ?? "Enter an option"} className={control}
              onChange={(event) => {
                const value = event.target.value;
                setSelection((current) => ({ ...current, [key]: value }));
                setDraftError("");
              }} />}
            {examples.length > 0 && (
              <datalist id={`${id}-${key}`}>{examples.map((example) => <option value={example} key={example} />)}</datalist>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={smallButton} onClick={addVariant}>
          <Plus size={16} aria-hidden="true" />{editing === null ? "Add variant" : "Update variant"}
        </button>
        {hasDraft && <button type="button" className={smallButton} onClick={clearDraft}>Cancel option</button>}
      </div>
      {message && <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-[var(--sale)]">{message}</p>}
    </fieldset>
  );
}

"use client";

import { useId, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  MAX_PRODUCT_VARIANTS, productVariantFields, variantKey, variantSummary,
  type VariantKey, type VariantRow, type VariantValues,
} from "@/lib/products/product-variants";

const control = "mt-1 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--linen-light)] px-3 text-sm";
const smallButton = "inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] px-3 text-sm font-medium hover:bg-[var(--linen-light)]";

const pricingFields = [
  { key: "price", name: "priceLkr", label: "Selling price (LKR)", step: "0.01" },
  { key: "originalPrice", name: "originalPriceLkr", label: "Original price (optional, LKR)", step: "0.01" },
  { key: "stock", name: "stock", label: "Stock", step: "1" },
] as const;

const emptyPricing = { price: "", originalPrice: "", stock: "" };

export default function ProductVariantFields({ values = {}, initialPricing, errors = {}, onChange }: {
  values?: VariantValues;
  initialPricing: { priceLkr?: number; originalPriceLkr?: number; stock: number };
  errors?: Record<string, string | undefined>;
  onChange?: (field: string) => void;
}) {
  const id = useId();
  const [primaryPricing, setPrimaryPricing] = useState(() => ({
    price: String(initialPricing.priceLkr ?? ""),
    originalPrice: String(initialPricing.originalPriceLkr ?? ""),
    stock: String(initialPricing.stock),
  }));
  const [rows, setRows] = useState<VariantRow[]>(() => variantSummary(values) ? [{ values, ...emptyPricing }] : []);
  const [selection, setSelection] = useState<VariantValues>({});
  const [checked, setChecked] = useState<Partial<Record<VariantKey, boolean>>>(
    () => Object.fromEntries(Object.keys(values).map((key) => [key, true])),
  );
  const [editing, setEditing] = useState<number | null>(null);
  const [draftError, setDraftError] = useState("");
  const hasDraft = editing !== null || productVariantFields.some(({ key }) => checked[key] && selection[key]?.trim());
  const message = draftError || errors.variants;
  const pricingRows = rows.length ? rows : [{ values: {}, ...emptyPricing }];

  function clearDraft() {
    setSelection({});
    setEditing(null);
    setDraftError("");
    onChange?.("variants");
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
      ? [...current, { values: next, ...emptyPricing }]
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
        Set the price and stock for each variant here. Enter an original price only for a genuine discount.
      </p>
      <input type="hidden" name="variantRows" value={JSON.stringify(rows)} />
      <input type="hidden" name="variantDraftPending" value={String(hasDraft)} />
      <ul aria-label="Product prices and stock" className="mb-4 space-y-2">
        {pricingRows.map((row, index) => {
          const label = variantSummary(row.values);
          const primary = index === 0;
          const pricing = primary ? primaryPricing : row;
          return (
            <li key={primary ? "primary" : variantKey(row.values)} className="rounded-xl border border-[var(--border)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-sm">{label || "Product price and stock"}</strong>
                {label && (
                  <div className="flex gap-1">
                    <button type="button" className={smallButton} aria-label={`Edit ${label} options`} onClick={() => editRow(index)}>Edit</button>
                    {(!primary || rows.length === 1) && (
                      <button type="button" className={smallButton} aria-label={`Remove ${label}`} onClick={() => {
                        setRows((current) => current.filter((_, position) => position !== index));
                        clearDraft();
                      }}><Trash2 size={15} aria-hidden="true" /></button>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {pricingFields.map(({ key, name, label: fieldLabel, step }) => {
                  const fieldError = primary ? errors[name] : undefined;
                  const fieldErrorId = `${id}-${name}-error`;
                  return (
                    <label key={key} className="min-w-0 text-sm" data-product-field={primary ? name : undefined}>
                      {fieldLabel}
                      <input className={`${control}${fieldError ? " border-[var(--sale)]" : ""}`}
                        name={primary ? name : undefined}
                        aria-label={label ? `${fieldLabel} for ${label}` : undefined}
                        aria-invalid={Boolean(fieldError)}
                        aria-describedby={fieldError ? fieldErrorId : undefined}
                        type="number" min={0} step={step} required={key !== "originalPrice"} value={pricing[key]}
                        onChange={(event) => {
                          const value = event.target.value;
                          if (primary) {
                            setPrimaryPricing((current) => ({ ...current, [key]: value }));
                            onChange?.(name);
                          } else {
                            setRows((current) => current.map((item, position) => position === index ? { ...item, [key]: value } : item));
                            onChange?.("variants");
                          }
                        }} />
                      {fieldError && <span id={fieldErrorId} className="mt-1 block text-xs text-[var(--sale)]">{fieldError}</span>}
                    </label>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
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

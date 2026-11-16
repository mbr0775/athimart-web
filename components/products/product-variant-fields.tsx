"use client";

import { useEffect, useId, useRef, useState } from "react";
import { productVariantSku } from "@/lib/products/product-listing-identifiers";
import { Check, Plus, Trash2 } from "lucide-react";
import {
  generateVariantCombinations, MAX_PRODUCT_VARIANTS, productVariantFields, variantKey, variantSummary,
  type VariantKey, type VariantRow, type VariantValues,
} from "@/lib/products/product-variants";

const control = "mt-1 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--linen-light)] px-3 text-sm";
const smallButton = "inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] px-3 text-sm font-medium hover:bg-[var(--linen-light)]";

const pricingFields = [
  { key: "price", name: "priceLkr", label: "Selling price (LKR)", step: "0.01" },
  { key: "originalPrice", name: "originalPriceLkr", label: "Original price (optional, LKR)", step: "0.01" },
  { key: "stock", name: "stock", label: "Stock", step: "1" },
] as const;

const emptyPricing = { price: "", originalPrice: "", stock: "0" };
const quickPackSizes = ["100 g", "250 g", "500 g", "1 kg"];

export default function ProductVariantFields({ values = {}, initialPricing, errors = {}, onChange }: {
  values?: VariantValues;
  initialPricing: { priceLkr?: number; originalPriceLkr?: number; stock: number };
  errors?: Record<string, string | undefined>;
  onChange?: (field: string) => void;
}) {
  const id = useId();
  const fieldset = useRef<HTMLFieldSetElement>(null);
  const [listingSku, setListingSku] = useState("");
  useEffect(() => {
    const form = fieldset.current?.closest("form");
    if (!form) return;
    const sync = () => setListingSku(form.querySelector<HTMLInputElement>("[data-listing-sku]")?.value ?? "");
    queueMicrotask(sync);
    form.addEventListener("productlistingchange", sync);
    return () => form.removeEventListener("productlistingchange", sync);
  }, []);
  const composer = useRef<HTMLDivElement>(null);
  const pendingPriceFocus = useRef<string | null>(null);
  const [primaryPricing, setPrimaryPricing] = useState(() => ({
    price: String(initialPricing.priceLkr ?? ""),
    originalPrice: String(initialPricing.originalPriceLkr ?? ""),
    stock: String(initialPricing.stock),
  }));
  const [rows, setRows] = useState<VariantRow[]>(() => variantSummary(values) ? [{ values, ...emptyPricing }] : []);
  const hasSavedVariant = Boolean(variantSummary(values));
  const [withVariants, setWithVariants] = useState(hasSavedVariant);
  const [optionKeys, setOptionKeys] = useState<VariantKey[]>(() => Object.keys(values) as VariantKey[]);
  const [selection, setSelection] = useState<VariantValues>({});
  const [showOptionMenu, setShowOptionMenu] = useState(false);
  const [bulkSelection, setBulkSelection] = useState<Set<string>>(() => new Set());
  const [bulkPricing, setBulkPricing] = useState(emptyPricing);
  const [editing, setEditing] = useState<number | null>(null);
  const [draftError, setDraftError] = useState("");
  const [savedPrices, setSavedPrices] = useState<Record<string, string>>({});
  const activeRows = withVariants ? rows : [];
  const hasDraft = withVariants && (editing !== null || optionKeys.some((key) => selection[key]?.trim()));
  const currentOptionFields = optionKeys.map((key) => productVariantFields.find((field) => field.key === key)!);
  const onlyPackSize = optionKeys.length === 1 && optionKeys[0] === "packSize";
  const addingSeveral = optionKeys.some((key) => (selection[key] ?? "").split(",").filter((value) => value.trim()).length > 1);
  const message = draftError || errors.variants;
  const pricingRows = (activeRows.length ? activeRows : [{ values: {}, ...emptyPricing }])
    .map((row, index) => ({ row, index })).reverse();

  function startVariants() {
    setWithVariants(true);
    const category = fieldset.current?.closest("form")?.elements.namedItem("category") as HTMLSelectElement | null;
    if (!optionKeys.length && category?.value.toLowerCase() === "grocery") setOptionKeys(["packSize"]);
    setDraftError("");
  }

  function applyBulkPricing() {
    const changes = Object.fromEntries(Object.entries(bulkPricing).filter(([, value]) => value !== ""));
    if (!Object.keys(changes).length) return;
    if (Object.values(changes).some((value) => !Number.isFinite(Number(value)) || Number(value) < 0)
      || (changes.stock !== undefined && (!Number.isSafeInteger(Number(changes.stock)) || Number(changes.stock) > 2147483647))) {
      setDraftError("Use nonnegative prices and whole numbers for stock.");
      return;
    }
    if (bulkSelection.has(variantKey(rows[0].values))) {
      setPrimaryPricing((current) => ({ ...current, ...changes }));
      for (const { key, name } of pricingFields) if (key in changes) onChange?.(name);
    }
    setRows((current) => current.map((item) => bulkSelection.has(variantKey(item.values)) ? { ...item, ...changes } : item));
    onChange?.("variants");
    setBulkPricing(emptyPricing);
    setDraftError("");
  }

  function clearDraft() {
    setSelection({});
    setShowOptionMenu(false);
    setEditing(null);
    setDraftError("");
    onChange?.("variants");
  }

  function addVariant(input = selection) {
    const chosen = Object.fromEntries(optionKeys.map((key) => {
      const text = input[key] ?? "";
      const values = (editing === null ? text.split(",") : [text]).map((value) => value.trim()).filter(Boolean);
      return [key, [...new Map(values.map((value) => [variantKey({ [key]: value }), value])).values()]];
    }));
    if (!Object.keys(chosen).length || Object.values(chosen).some((values) => !values.length)) {
      setDraftError("Enter a value for each option, or remove any option you do not need.");
      return;
    }
    if (Object.values(chosen).some((values) => values.some((value) => value.length > 48))) {
      setDraftError("Use 48 characters or fewer per option value.");
      return;
    }
    const generated = generateVariantCombinations(chosen);
    if (!generated) {
      setDraftError("These options create more than 100 variants. Remove some values and try again.");
      return;
    }
    const existing = new Set(rows.filter((_, index) => index !== editing).map((row) => variantKey(row.values)));
    const next = generated.filter((values) => !existing.has(variantKey(values)));
    if (!next.length) {
      setDraftError("This variant is already in the list.");
      return;
    }
    if (editing === null && rows.length + next.length > MAX_PRODUCT_VARIANTS) {
      setDraftError("Save up to 100 variants per product.");
      return;
    }
    pendingPriceFocus.current = variantKey(next.at(-1)!);
    setRows((current) => editing === null
      ? [...current, ...next.map((values) => ({ values, ...emptyPricing }))]
      : current.map((row, index) => index === editing ? { ...row, values: next[0] } : row));
    clearDraft();
  }

  function removeRow(index: number) {
    const key = variantKey(rows[index].values);
    setSavedPrices((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    const remaining = rows.filter((_, position) => position !== index);
    if (index === 0 && remaining.length) {
      const { price, originalPrice, stock } = remaining[0];
      setPrimaryPricing({ price, originalPrice, stock });
      for (const { name } of pricingFields) onChange?.(name);
    }
    setRows(remaining);
    clearDraft();
  }

  function editRow(index: number) {
    const row = rows[index];
    setSelection(row.values);
    setOptionKeys(Object.keys(row.values) as VariantKey[]);
    setEditing(index);
    setDraftError("");
    composer.current?.focus();
  }

  return (
    <fieldset ref={fieldset} data-product-field="variants" className="min-w-0 rounded-2xl border border-[var(--border)] p-4 sm:col-span-2"
      aria-describedby={message ? `${id}-help ${id}-error` : `${id}-help`}>
      <legend className="px-2 font-semibold">Product variants</legend>
      <p id={`${id}-help`} className="mb-3 text-sm text-[var(--text-muted)]">
        Add the sizes or options you sell. Each has its own price and stock.
      </p>
      <input type="hidden" name="variantMode" value={withVariants ? "multiple" : "single"} />
      <input type="hidden" name="variantRows" value={JSON.stringify(activeRows)} />
      <input type="hidden" name="variantDraftPending" value={String(hasDraft)} />
      {!hasSavedVariant && (
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Product inventory type">
          {[false, true].map((hasOptions) => (
            <button key={String(hasOptions)} type="button" aria-pressed={withVariants === hasOptions}
              className={`${smallButton} aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--linen-light)]`}
              onClick={hasOptions ? startVariants : () => { setWithVariants(false); setDraftError(""); }}>
              {hasOptions ? "Product with variants" : "Single product"}
            </button>
          ))}
        </div>
      )}
      {withVariants && (
        <div ref={composer} tabIndex={-1} className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--linen-light)] p-3 sm:p-4">
          {currentOptionFields.map(({ key, label, examples }) => (
            <div key={key}>
              <div className="flex items-center justify-between gap-2">
                <label htmlFor={`${id}-value-${key}`} className="text-sm font-medium">{label}</label>
                <button type="button" className="min-h-8 px-1 text-xs underline" onClick={() => {
                  setOptionKeys((current) => current.filter((option) => option !== key));
                  setSelection((current) => ({ ...current, [key]: "" }));
                  setDraftError("");
                }}>Remove <span className="sr-only">{label}</span></button>
              </div>
              <input id={`${id}-value-${key}`} type="text" value={selection[key] ?? ""}
                maxLength={editing === null ? 4900 : 48}
                list={!onlyPackSize && examples.length ? `${id}-${key}` : undefined}
                placeholder={key === "packSize" ? "e.g. 100 g, 250 g" : examples[0] ?? "Enter a value"} className={control}
                onChange={(event) => {
                  setSelection((current) => ({ ...current, [key]: event.target.value }));
                  setDraftError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    addVariant();
                  }
                }} />
              {!onlyPackSize && examples.length > 0 && (
                <datalist id={`${id}-${key}`}>{examples.map((example) => <option value={example} key={example} />)}</datalist>
              )}
            </div>
          ))}
          {onlyPackSize && editing === null && !selection.packSize?.trim() && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Quick pack sizes">
              {quickPackSizes.map((size) => {
                const added = rows.some((row) => variantKey(row.values) === variantKey({ packSize: size }));
                return (
                  <button key={size} type="button" className={`${smallButton} rounded-full disabled:opacity-50`}
                    disabled={added} aria-label={added ? `${size} added` : `Add ${size}`}
                    onClick={() => addVariant({ packSize: size })}>
                    {added ? "✓" : "+"} {size}
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {optionKeys.length > 0 && (
              <button type="button" className="min-h-10 rounded-lg bg-[var(--brand)] px-3 text-sm font-medium text-[var(--linen-light)] hover:bg-[var(--brand-hover)] disabled:opacity-50"
                disabled={!optionKeys.every((key) => selection[key]?.trim())}
                onClick={() => addVariant()}>
                {editing !== null ? "Update variant" : addingSeveral ? "Add variants" : onlyPackSize ? "Add size" : "Add variant"}
              </button>
            )}
            {!optionKeys.length || showOptionMenu ? (
              <select aria-label={optionKeys.length ? "Choose another attribute" : "Variant option"} value="" className={smallButton}
                onChange={(event) => {
                  const key = event.target.value as VariantKey;
                  setOptionKeys((current) => [...current, key]);
                  setShowOptionMenu(false);
                  setDraftError("");
                }}>
                <option value="" disabled>Choose an option</option>
                {productVariantFields.filter(({ key }) => !optionKeys.includes(key)).map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
              </select>
            ) : optionKeys.length < productVariantFields.length && (
              <button type="button" className={smallButton} onClick={() => setShowOptionMenu(true)}>
                <Plus size={16} aria-hidden="true" />Add another attribute
              </button>
            )}
            {hasDraft && <button type="button" className={smallButton} onClick={clearDraft}>Cancel entry</button>}
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            {activeRows.length ? "You can save with the variants you have added." : "One size or option is enough. Use commas to enter several at once."}
          </p>
        </div>
      )}
      {message && <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-[var(--sale)]">{message}</p>}
      {(!withVariants || activeRows.length > 0) && <ul aria-label="Product prices and stock" className="mt-3 space-y-2">
        {pricingRows.map(({ row, index }) => {
          const label = variantSummary(row.values);
          const primary = index === 0;
          const pricing = primary ? primaryPricing : row;
          const rowKey = variantKey(row.values);
          const pricingSnapshot = JSON.stringify([pricing.price, pricing.originalPrice, pricing.stock]);
          const saved = savedPrices[rowKey] === pricingSnapshot;
          return (
            <li key={primary ? "primary" : rowKey} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 focus-within:border-[var(--brand-hover)] sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <strong className="text-sm">{label || "Product price and stock"}</strong>
                  {listingSku && <p className="break-words text-xs text-[var(--text-muted)]">
                    SKU {primary ? listingSku : productVariantSku(listingSku, label.replaceAll(" / ", " "), variantKey(row.values))}
                  </p>}
                </div>
                {label && (
                  <div className="flex gap-1">
                    <button type="button" className={smallButton} aria-label={`Edit ${label} options`} onClick={() => editRow(index)}>Edit</button>
                    {(!primary || !hasSavedVariant) && (
                      <button type="button" className={smallButton} aria-label={`Remove ${label}`}
                        onClick={() => removeRow(index)}><Trash2 size={15} aria-hidden="true" /></button>
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
                        ref={key === "price" ? (input) => {
                          if (input && pendingPriceFocus.current === rowKey) {
                            pendingPriceFocus.current = null;
                            input.focus();
                          }
                        } : undefined}
                        name={primary ? name : undefined}
                        aria-label={label ? `${fieldLabel} for ${label}` : undefined}
                        aria-invalid={Boolean(fieldError)}
                        aria-describedby={fieldError ? fieldErrorId : undefined}
                        type="number" min={0} max={key === "stock" ? 2147483647 : undefined} step={step}
                        required={key !== "originalPrice"} value={pricing[key]}
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
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                <button type="button" className={smallButton}
                  aria-label={label ? `Save price and stock for ${label}` : "Save price and stock"}
                  onClick={(event) => {
                    const inputs = event.currentTarget.closest("li")?.querySelectorAll("input");
                    if (!inputs || !Array.from(inputs).every((input) => input.reportValidity())) return;
                    setSavedPrices((current) => ({ ...current, [rowKey]: pricingSnapshot }));
                  }}>
                  Save
                </button>
                <span role="status" className="inline-flex items-center gap-1 text-xs text-[var(--brand)]">
                  {saved && <><Check size={14} aria-hidden="true" />Saved in form</>}
                </span>
              </div>
            </li>
          );
        })}
      </ul>}
      {activeRows.length > 1 && (
        <details className="mt-3 rounded-xl border border-[var(--border)] p-3">
          <summary className="cursor-pointer text-sm font-medium">Set prices and stock for several variants</summary>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Variants to update">
            <button type="button" className={smallButton} onClick={() => setBulkSelection(new Set(activeRows.map((row) => variantKey(row.values))))}>Select all</button>
            {pricingRows.map(({ row }) => {
              const key = variantKey(row.values);
              return <label key={key} className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] px-3 text-sm">
                <input type="checkbox" checked={bulkSelection.has(key)} onChange={(event) => {
                  const checked = event.target.checked;
                  setBulkSelection((current) => {
                    const next = new Set(current);
                    if (checked) next.add(key);
                    else next.delete(key);
                    return next;
                  });
                }} />
                {variantSummary(row.values)}
              </label>;
            })}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {pricingFields.map(({ key, label, step }) => (
              <label key={key} className="text-sm">
                {label}
                <input type="number" min={0} step={step} value={bulkPricing[key]} className={control}
                  onChange={(event) => setBulkPricing((current) => ({ ...current, [key]: event.target.value }))} />
              </label>
            ))}
          </div>
          <button type="button" className={`${smallButton} mt-3 disabled:opacity-50`}
            disabled={!activeRows.some((row) => bulkSelection.has(variantKey(row.values)))} onClick={applyBulkPricing}>Apply to selected</button>
        </details>
      )}
    </fieldset>
  );
}

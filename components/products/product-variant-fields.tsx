"use client";

import { useId, useState } from "react";
import { productVariantFields, type VariantKey, type VariantValues } from "@/lib/products/product-variants";

const control = "mt-1 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--linen-light)] px-3 text-sm";

export default function ProductVariantFields({ group, values = {}, error, onChange }: {
  group?: string;
  values?: VariantValues;
  error?: string;
  onChange?: () => void;
}) {
  const id = useId();
  const [variantGroup, setVariantGroup] = useState(group ?? "");
  const [selection, setSelection] = useState(values);
  const [checked, setChecked] = useState<Partial<Record<VariantKey, boolean>>>(
    () => Object.fromEntries(Object.keys(values).map((key) => [key, true])),
  );

  return (
    <fieldset data-product-field="variants" className="min-w-0 rounded-2xl border border-[var(--border)] p-4 sm:col-span-2"
      aria-describedby={error ? `${id}-help ${id}-error` : `${id}-help`}>
      <legend className="px-2 font-semibold">Product variants</legend>
      <p id={`${id}-help`} className="mb-3 text-sm text-[var(--text-muted)]">
        Tick the options for this listing. For a product with multiple combinations, give each combination its own
        listing, price and stock. Enter the same variant group on each listing and include its choices in the product name.
      </p>
      <label className="mb-4 block text-sm font-medium">
        Variant group (optional)
        <input name="variantGroup" value={variantGroup} maxLength={72} placeholder="e.g. classic-cotton-tee"
          onChange={(event) => { setVariantGroup(event.target.value); onChange?.(); }} className={control} />
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        {productVariantFields.map(({ key, label, examples }) => (
          <div key={key} className="min-w-0 rounded-xl border border-[var(--border)] p-2.5">
            <label className="flex min-h-8 cursor-pointer items-center gap-2 text-sm font-medium">
              <input type="checkbox" name={`variantEnabled-${key}`} checked={Boolean(checked[key])}
                className="size-4 accent-[var(--brand)]"
                onChange={(event) => {
                  const isChecked = event.target.checked;
                  setChecked((current) => ({ ...current, [key]: isChecked }));
                  onChange?.();
                }} />
              {label}
            </label>
            <input type="text" name={`variantValue-${key}`} value={selection[key] ?? ""} maxLength={48}
              aria-label={`${label} value`} list={examples.length ? `${id}-${key}` : undefined}
              placeholder={examples[0] ?? "e.g. 220 V"} className={control}
              onChange={(event) => {
                const value = event.target.value;
                setSelection((current) => ({ ...current, [key]: value }));
                onChange?.();
              }}
              hidden={!checked[key]} disabled={!checked[key]} />
            {examples.length > 0 && (
              <datalist id={`${id}-${key}`}>{examples.map((example) => <option value={example} key={example} />)}</datalist>
            )}
          </div>
        ))}
      </div>
      {error && <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-[var(--sale)]">{error}</p>}
    </fieldset>
  );
}

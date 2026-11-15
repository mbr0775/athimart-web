interface PackFieldsProps {
  group?: string;
  size?: string;
  error?: string;
  onChange?: () => void;
}

const control = "mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--linen-light)] px-3";

export default function ProductPackFields({ group, size, error, onChange }: PackFieldsProps) {
  return (
    <fieldset data-product-field="pack" className="rounded-2xl border border-[var(--border)] p-4 sm:col-span-2">
      <legend className="px-2 font-semibold">Pack options</legend>
      <p className="mb-3 text-sm text-[var(--text-muted)]" id="pack-help">
        Give each size its own listing, price and stock. Use the same pack group to link those sizes.
        Include the size in each product name. Leave these fields blank for single-size products.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Pack group
          <input name="packGroup" defaultValue={group} maxLength={72} placeholder="anchor-milk-powder"
            onChange={onChange} className={control} aria-describedby={error ? "pack-help pack-error" : "pack-help"} />
        </label>
        <label className="text-sm font-medium">
          This pack size
          <input name="packSize" defaultValue={size} maxLength={40} placeholder="400 g"
            onChange={onChange} className={control} aria-describedby={error ? "pack-help pack-error" : "pack-help"} />
        </label>
      </div>
      {error && <p id="pack-error" role="alert" className="mt-2 text-sm text-[var(--sale)]">{error}</p>}
    </fieldset>
  );
}

import { useState } from "react";

export interface CategoryOption {
  name: string;
  slug: string;
  subcategories: { name: string; slug: string }[];
}

type CategoryField = "category" | "subCategory";

interface ProductCategoryFieldsProps {
  categories: CategoryOption[];
  initialCategory?: string;
  initialSubcategory?: string;
  inputClassName: (field: CategoryField) => string;
  errors: Partial<Record<CategoryField, string>>;
  onChange?: (field: CategoryField) => void;
}

export function ProductCategoryFields({
  categories,
  initialCategory = "",
  initialSubcategory = "",
  inputClassName,
  errors,
  onChange,
}: ProductCategoryFieldsProps) {
  const [category, setCategory] = useState(initialCategory);
  const [subcategory, setSubcategory] = useState(initialCategory ? initialSubcategory : "");
  const currentCategory = categories.find((option) => option.name === category);
  const types = currentCategory?.subcategories ?? [];

  return (
    <fieldset className="min-w-0 rounded-2xl border border-[var(--border)] p-4 sm:col-span-2 sm:p-5">
      <legend className="px-2 font-body text-sm font-semibold text-[var(--text)]">Product category</legend>
      <p id="seller-category-help" className="mb-4 text-sm text-[var(--text-muted)]">
        For crackers and biscuits, choose Grocery, then Biscuits &amp; Snacks.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label data-product-field="category">
          <span className="athimart-label text-[var(--text-muted)]">Category <span aria-hidden="true">*</span></span>
          <select
            name="category"
            value={category}
            required
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? "seller-category-help category-error" : "seller-category-help"}
            className={inputClassName("category")}
            onChange={(event) => {
              setCategory(event.target.value);
              setSubcategory("");
              onChange?.("category");
              onChange?.("subCategory");
            }}
          >
            <option value="">Select a category</option>
            {category && !currentCategory && <option value={category}>{category} (current)</option>}
            {categories.map((option) => <option key={option.slug} value={option.name}>{option.name}</option>)}
          </select>
          {errors.category && <p id="category-error" className="mt-2 text-sm text-[var(--sale)]">{errors.category}</p>}
        </label>
        <label data-product-field="subCategory">
          <span className="athimart-label text-[var(--text-muted)]">Product type <span aria-hidden="true">*</span></span>
          <select
            name="subCategory"
            value={subcategory}
            required
            disabled={!category}
            aria-invalid={Boolean(errors.subCategory)}
            aria-describedby={errors.subCategory ? "subCategory-error" : undefined}
            className={inputClassName("subCategory") + " disabled:opacity-60"}
            onChange={(event) => {
              setSubcategory(event.target.value);
              onChange?.("subCategory");
            }}
          >
            <option value="">{category ? "Select a product type" : "Choose a category first"}</option>
            {subcategory && !types.some((type) => type.name === subcategory) && (
              <option value={subcategory}>{subcategory} (current)</option>
            )}
            {types.map((type) => <option key={type.slug} value={type.name}>{type.name}</option>)}
          </select>
          {errors.subCategory && <p id="subCategory-error" className="mt-2 text-sm text-[var(--sale)]">{errors.subCategory}</p>}
        </label>
      </div>
    </fieldset>
  );
}

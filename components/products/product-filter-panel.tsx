"use client";

import Link from "@/components/navigation/navigation-link";
import { useNavigationRouter as useRouter } from "@/components/navigation/navigation-feedback";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  LoaderCircle,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type {
  ProductFilterOptions,
  ProductSortOption,
  ProductStockFilter,
} from "@/types/product-filter";
import styles from "./product-filter-panel.module.css";

interface CurrentProductFilters {
  category?: string;
  subcategory?: string;
  brand?: string;
  stock: ProductStockFilter;
  sort: ProductSortOption;
  minPrice?: number;
  maxPrice?: number;
}

interface ProductFilterPanelProps {
  options: ProductFilterOptions;
  currentFilters: CurrentProductFilters;
  resultCount?: number;
}

const sortOptions: { value: ProductSortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "name-az", label: "Name: A to Z" },
  { value: "name-za", label: "Name: Z to A" },
];

const filterNames = [
  "category",
  "subcategory",
  "brand",
  "stock",
  "sort",
  "minPrice",
  "maxPrice",
] as const;
type FilterName = (typeof filterNames)[number];

function queryFromFilters(filters: CurrentProductFilters) {
  const query = new URLSearchParams();
  for (const name of filterNames) {
    const value = filters[name];
    if (
      value !== undefined &&
      value !== "" &&
      !(name === "stock" && value === "all") &&
      !(name === "sort" && value === "newest")
    )
      query.set(name, String(value));
  }
  return query;
}

function SelectField({
  id,
  name,
  label,
  value,
  values,
  placeholder,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  values: string[];
  placeholder: string;
  onChange?: (form: HTMLFormElement | null) => void;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.selectWrap}>
        <select
          id={id}
          name={name}
          defaultValue={value}
          onChange={(event) => onChange?.(event.currentTarget.form)}
        >
          <option value="">{placeholder}</option>
          {value && !values.includes(value) && (
            <option value={value}>{value}</option>
          )}
          {values.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown size={15} aria-hidden="true" />
      </div>
    </div>
  );
}

export function ProductFilterPanel({
  options,
  currentFilters,
  resultCount,
}: Readonly<ProductFilterPanelProps>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();
  const formKey = JSON.stringify(currentFilters);
  const activeChips: { key: FilterName; label: string; description: string }[] =
    [];
  if (currentFilters.category)
    activeChips.push({
      key: "category",
      label: currentFilters.category,
      description: "category",
    });
  if (currentFilters.subcategory)
    activeChips.push({
      key: "subcategory",
      label: currentFilters.subcategory,
      description: "product type",
    });
  if (currentFilters.brand)
    activeChips.push({
      key: "brand",
      label: currentFilters.brand,
      description: "brand",
    });
  if (currentFilters.stock !== "all")
    activeChips.push({
      key: "stock",
      label: currentFilters.stock === "in-stock" ? "In stock" : "Out of stock",
      description: "availability",
    });
  if (currentFilters.minPrice !== undefined)
    activeChips.push({
      key: "minPrice",
      label: `From Rs ${currentFilters.minPrice.toLocaleString("en-LK")}`,
      description: "minimum price",
    });
  if (currentFilters.maxPrice !== undefined)
    activeChips.push({
      key: "maxPrice",
      label: `Up to Rs ${currentFilters.maxPrice.toLocaleString("en-LK")}`,
      description: "maximum price",
    });

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function navigate(query: URLSearchParams) {
    startTransition(() =>
      router.push(`/shop${query.size ? `?${query.toString()}` : ""}`, {
        scroll: false,
      }),
    );
  }

  function updateFilter(name: FilterName, value: string) {
    const query = queryFromFilters(currentFilters);
    if (
      !value ||
      (name === "stock" && value === "all") ||
      (name === "sort" && value === "newest")
    )
      query.delete(name);
    else query.set(name, value);
    // Product types belong to their category; do not carry one into a new category.
    if (name === "category") query.delete("subcategory");
    navigate(query);
  }

  function closeDialog() {
    dialogRef.current?.close();
  }
  function openDialog() {
    dialogRef.current?.showModal();
    setIsOpen(true);
  }

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const minimum = String(data.get("minPrice") ?? "");
    const maximum = String(data.get("maxPrice") ?? "");
    const maximumInput = form.elements.namedItem(
      "maxPrice",
    ) as HTMLInputElement;
    maximumInput.setCustomValidity(
      minimum && maximum && Number(minimum) > Number(maximum)
        ? "Maximum price must be equal to or higher than the minimum price."
        : "",
    );
    if (!form.reportValidity()) return;
    const query = new URLSearchParams();
    for (const name of filterNames) {
      const value = String(data.get(name) ?? "").trim();
      if (
        value &&
        !(name === "stock" && value === "all") &&
        !(name === "sort" && value === "newest")
      )
        query.set(name, value);
    }
    navigate(query);
    closeDialog();
  }

  return (
    <div
      className={styles.panel}
      data-pending={isPending}
      aria-busy={isPending}
    >
      <nav aria-label="Shop by category" className={styles.categories}>
        <button
          type="button"
          onClick={() => updateFilter("category", "")}
          aria-pressed={!currentFilters.category}
          disabled={isPending}
        >
          All finds{" "}
          {!currentFilters.category && <Check size={13} aria-hidden="true" />}
        </button>
        {[...options.categories]
          .sort((a, b) => a.localeCompare(b))
          .map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => updateFilter("category", category)}
              aria-pressed={currentFilters.category === category}
              disabled={isPending}
            >
              {category}
              {currentFilters.category === category && (
                <Check size={13} aria-hidden="true" />
              )}
            </button>
          ))}
      </nav>

      <div className={styles.toolbar}>
        <p className={styles.resultCount} role="status" aria-live="polite">
          {isPending ? (
            <>
              <LoaderCircle
                size={14}
                className={styles.spinner}
                aria-hidden="true"
              />
              Updating finds…
            </>
          ) : resultCount !== undefined ? (
            <>
              <span>
                {resultCount === 48
                  ? "Showing 48"
                  : String(resultCount).padStart(2, "0")}
              </span>
              {resultCount === 1 ? "thoughtful find" : "thoughtful finds"}
              {activeChips.length > 0 && (
                <span className={styles.refined}> · just for you</span>
              )}
            </>
          ) : (
            "Explore the collection"
          )}
        </p>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.filterTrigger}
            onClick={openDialog}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={`${id}-dialog`}
            disabled={isPending}
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            Filters{activeChips.length > 0 && <span>{activeChips.length}</span>}
          </button>
          <div className={styles.sortControl}>
            <label htmlFor={`${id}-sort`}>Sort by</label>
            <select
              id={`${id}-sort`}
              aria-label="Sort products"
              value={currentFilters.sort}
              onChange={(event) =>
                updateFilter("sort", event.currentTarget.value)
              }
              disabled={isPending}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={13} aria-hidden="true" />
          </div>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className={styles.activeFilters} aria-label="Applied filters">
          {activeChips.map((chip) => (
            <button
              type="button"
              key={chip.key}
              onClick={() => updateFilter(chip.key, "")}
              disabled={isPending}
              aria-label={`Remove ${chip.description} filter: ${chip.label}`}
            >
              {chip.label}
              <X size={12} aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            className={styles.clearAll}
            onClick={() => navigate(new URLSearchParams())}
            disabled={isPending}
          >
            Clear all
          </button>
        </div>
      )}

      <dialog
        ref={dialogRef}
        id={`${id}-dialog`}
        className={styles.dialog}
        aria-labelledby={`${id}-heading`}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), a[href], select:not(:disabled), input:not([type="hidden"]):not(:disabled)',
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClose={() => setIsOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
      >
        <div className={styles.drawer}>
          <header className={styles.drawerHeader}>
            <div>
              <p className={styles.eyebrow}>A little more your way</p>
              <h2 id={`${id}-heading`}>Refine your finds.</h2>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              aria-label="Close filters"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </header>
          <form
            key={formKey}
            action="/shop"
            method="get"
            onSubmit={submitFilters}
            onInput={(event) =>
              (
                event.currentTarget.elements.namedItem(
                  "maxPrice",
                ) as HTMLInputElement
              ).setCustomValidity("")
            }
          >
            <div className={styles.formBody}>
              <p className={styles.drawerIntro}>
                A few thoughtful choices to find exactly what you&apos;re
                looking for.
              </p>
              <SelectField
                id={`${id}-category`}
                name="category"
                label="Category"
                value={currentFilters.category ?? ""}
                values={options.categories}
                placeholder="All categories"
                onChange={(form) => {
                  const field = form?.elements.namedItem("subcategory");
                  if (field instanceof HTMLSelectElement) field.value = "";
                }}
              />
              <SelectField
                id={`${id}-subcategory`}
                name="subcategory"
                label="Product type"
                value={currentFilters.subcategory ?? ""}
                values={options.subcategories}
                placeholder="All product types"
              />
              <SelectField
                id={`${id}-brand`}
                name="brand"
                label="Brand"
                value={currentFilters.brand ?? ""}
                values={options.brands}
                placeholder="All brands"
              />
              <div className={styles.field}>
                <label htmlFor={`${id}-stock`}>Availability</label>
                <div className={styles.selectWrap}>
                  <select
                    id={`${id}-stock`}
                    name="stock"
                    defaultValue={currentFilters.stock}
                  >
                    <option value="all">All availability</option>
                    <option value="in-stock">In stock</option>
                    <option value="out-of-stock">Out of stock</option>
                  </select>
                  <ChevronDown size={15} aria-hidden="true" />
                </div>
              </div>
              <fieldset className={styles.priceRange}>
                <legend>
                  Price range <span>LKR</span>
                </legend>
                <div>
                  {(
                    [
                      ["minPrice", "From", currentFilters.minPrice],
                      ["maxPrice", "To", currentFilters.maxPrice],
                    ] as const
                  ).map(([name, label, value]) => (
                    <label key={name}>
                      <span>{label}</span>
                      <div>
                        <span aria-hidden="true">Rs</span>
                        <input
                          type="number"
                          name={name}
                          aria-label={
                            name === "minPrice"
                              ? "Minimum price"
                              : "Maximum price"
                          }
                          min="0"
                          step="1"
                          defaultValue={value ?? ""}
                          placeholder="Any"
                          inputMode="numeric"
                        />
                      </div>
                    </label>
                  ))}
                </div>
                <p>Leave either amount open to explore more.</p>
              </fieldset>
              <input type="hidden" name="sort" value={currentFilters.sort} />
            </div>
            <footer className={styles.drawerFooter}>
              <button
                type="button"
                className={styles.resetButton}
                onClick={() => {
                  navigate(new URLSearchParams());
                  closeDialog();
                }}
              >
                <RotateCcw size={15} aria-hidden="true" />
                Reset
              </button>
              <button type="submit" className={styles.applyButton}>
                Apply filters
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </footer>
          </form>
          <p className={styles.drawerNote}>
            <Link href="/search" onClick={closeDialog}>
              Looking for something specific? Try search{" "}
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </p>
        </div>
      </dialog>
    </div>
  );
}

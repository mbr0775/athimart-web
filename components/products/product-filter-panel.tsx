// components/products/product-filter-panel.tsx

"use client";

import type { ReactNode } from "react";
import {
  useEffect,
  useState,
} from "react";

import {
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  m,
} from "motion/react";
import Link from "next/link";

import type {
  ProductFilterOptions,
  ProductSortOption,
  ProductStockFilter,
} from "@/types/product-filter";

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

  currentFilters:
    CurrentProductFilters;
}

interface FilterFormProps
  extends ProductFilterPanelProps {
  idPrefix: string;
  onSubmit?: () => void;
}

interface SelectFieldProps {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
  children: ReactNode;
}

const stockOptions: Array<{
  value: ProductStockFilter;
  label: string;
}> = [
  {
    value: "all",
    label: "All availability",
  },
  {
    value: "in-stock",
    label: "In stock",
  },
  {
    value: "out-of-stock",
    label: "Out of stock",
  },
];

const sortOptions: Array<{
  value: ProductSortOption;
  label: string;
}> = [
  {
    value: "newest",
    label: "Newest first",
  },
  {
    value: "oldest",
    label: "Oldest first",
  },
  {
    value: "price-low",
    label: "Price: low to high",
  },
  {
    value: "price-high",
    label: "Price: high to low",
  },
  {
    value: "name-az",
    label: "Name: A to Z",
  },
  {
    value: "name-za",
    label: "Name: Z to A",
  },
];

/**
 * Count only filters that differ from
 * the default Shop configuration.
 */
function getActiveFilterCount(
  filters: CurrentProductFilters
): number {
  return [
    Boolean(filters.category),
    Boolean(filters.subcategory),
    Boolean(filters.brand),

    filters.stock !== "all",
    filters.sort !== "newest",

    filters.minPrice !== undefined,
    filters.maxPrice !== undefined,
  ].filter(Boolean).length;
}

/**
 * Shared filter select field.
 */
function SelectField({
  id,
  name,
  label,
  defaultValue,
  children,
}: Readonly<SelectFieldProps>) {
  return (
    <div>
      <label
        htmlFor={id}
        className="font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--text-muted)]"
      >
        {label}
      </label>

      <div className="relative mt-2">
        <select
          id={id}
          name={name}
          defaultValue={defaultValue}
          className="min-h-13 w-full appearance-none border border-[var(--border)] bg-white px-4 pr-11 font-[var(--font-body)] text-sm text-[var(--text)] outline-none transition-colors duration-200 focus:border-[var(--brand-blue)] focus:outline-none focus-visible:!outline-none"
        >
          {children}
        </select>

        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-blue)]"
          strokeWidth={1.8}
        />
      </div>
    </div>
  );
}

/**
 * Shared form used by both:
 *
 * - desktop sidebar
 * - mobile sliding drawer
 */
function FilterForm({
  options,
  currentFilters,
  idPrefix,
  onSubmit,
}: Readonly<FilterFormProps>) {
  return (
    <form
      action="/shop"
      method="get"
      onSubmit={onSubmit}
    >
      <div className="space-y-6">
        {/* Category */}
        <SelectField
          id={`${idPrefix}-category`}
          name="category"
          label="Category"
          defaultValue={
            currentFilters.category ?? ""
          }
        >
          <option value="">
            All categories
          </option>

          {options.categories.map(
            (category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            )
          )}
        </SelectField>

        {/* Product type */}
        <SelectField
          id={`${idPrefix}-subcategory`}
          name="subcategory"
          label="Product type"
          defaultValue={
            currentFilters.subcategory ??
            ""
          }
        >
          <option value="">
            All product types
          </option>

          {options.subcategories.map(
            (subcategory) => (
              <option
                key={subcategory}
                value={subcategory}
              >
                {subcategory}
              </option>
            )
          )}
        </SelectField>

        {/* Brand */}
        <SelectField
          id={`${idPrefix}-brand`}
          name="brand"
          label="Company / Brand"
          defaultValue={
            currentFilters.brand ?? ""
          }
        >
          <option value="">
            All brands
          </option>

          {options.brands.map(
            (brand) => (
              <option
                key={brand}
                value={brand}
              >
                {brand}
              </option>
            )
          )}
        </SelectField>

        {/* Availability */}
        <SelectField
          id={`${idPrefix}-stock`}
          name="stock"
          label="Availability"
          defaultValue={
            currentFilters.stock
          }
        >
          {stockOptions.map(
            (option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            )
          )}
        </SelectField>

        {/* Price */}
        <div>
          <p className="font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--text-muted)]">
            Price range
          </p>

          <div className="mt-2 grid grid-cols-2 gap-3">
            <label>
              <span className="sr-only">
                Minimum price
              </span>

              <input
                type="number"
                name="minPrice"
                min="0"
                step="1"
                defaultValue={
                  currentFilters.minPrice ??
                  ""
                }
                placeholder="Min Rs"
                inputMode="numeric"
                className="min-h-13 w-full border border-[var(--border)] bg-white px-4 font-[var(--font-body)] text-sm text-[var(--text)] outline-none transition-colors duration-200 placeholder:text-[var(--placeholder)] focus:border-[var(--brand-blue)] focus:outline-none focus-visible:!outline-none"
              />
            </label>

            <label>
              <span className="sr-only">
                Maximum price
              </span>

              <input
                type="number"
                name="maxPrice"
                min="0"
                step="1"
                defaultValue={
                  currentFilters.maxPrice ??
                  ""
                }
                placeholder="Max Rs"
                inputMode="numeric"
                className="min-h-13 w-full border border-[var(--border)] bg-white px-4 font-[var(--font-body)] text-sm text-[var(--text)] outline-none transition-colors duration-200 placeholder:text-[var(--placeholder)] focus:border-[var(--brand-blue)] focus:outline-none focus-visible:!outline-none"
              />
            </label>
          </div>
        </div>

        {/* Sort */}
        <SelectField
          id={`${idPrefix}-sort`}
          name="sort"
          label="Sort products"
          defaultValue={
            currentFilters.sort
          }
        >
          {sortOptions.map(
            (option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            )
          )}
        </SelectField>
      </div>

      {/* Actions */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        <Link
          href="/shop"
          className="inline-flex min-h-13 items-center justify-center gap-2 border border-[var(--brand-blue)] bg-white px-4 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-blue)] transition-all duration-200 hover:bg-[var(--brand-blue-soft)]"
        >
          <RotateCcw
            aria-hidden="true"
            className="h-4 w-4"
            strokeWidth={1.8}
          />

          Reset
        </Link>

        <button
          type="submit"
          className="inline-flex min-h-13 items-center justify-center gap-2 border border-[var(--brand-blue)] bg-[var(--brand-blue)] px-4 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.15em] text-white! shadow-[0_10px_24px_rgba(18,63,158,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-orange)] hover:bg-[var(--brand-orange)] hover:text-white! hover:shadow-[0_12px_28px_rgba(255,121,0,0.20)]"
        >
          <SlidersHorizontal
            aria-hidden="true"
            className="h-4 w-4 text-white!"
            strokeWidth={1.8}
          />

          <span className="text-white!">
            Apply
          </span>
        </button>
      </div>
    </form>
  );
}

export function ProductFilterPanel({
  options,
  currentFilters,
}: Readonly<ProductFilterPanelProps>) {
  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const activeFilterCount =
    getActiveFilterCount(
      currentFilters
    );

  /**
   * Prevent the page behind the mobile
   * filter drawer from scrolling.
   */
  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile filter trigger */}
      <button
        type="button"
        onClick={() =>
          setMobileOpen(true)
        }
        aria-expanded={mobileOpen}
        aria-controls="mobile-product-filters"
        className="flex min-h-14 w-full items-center justify-between border border-[var(--brand-blue)] bg-[var(--brand-blue)] px-5 text-white! shadow-[0_12px_28px_rgba(18,63,158,0.16)] md:hidden"
      >
        <span className="inline-flex items-center gap-3 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.17em] text-white!">
          <SlidersHorizontal
            aria-hidden="true"
            className="h-5 w-5 text-white!"
            strokeWidth={1.8}
          />

          Filter products
        </span>

        {activeFilterCount > 0 && (
          <span className="flex h-7 min-w-7 items-center justify-center bg-[var(--brand-orange)] px-2 font-[var(--font-body)] text-[10px] font-bold text-white!">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden md:block">
        <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto border border-[var(--border)] bg-white p-6 shadow-[0_16px_40px_rgba(18,63,158,0.06)]">
          <div className="mb-7 flex items-center justify-between border-b border-[var(--border)] pb-5">
            <div>
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Refine collection
              </p>

              <h2 className="mt-2 font-[var(--font-display)] text-3xl font-light uppercase text-[var(--brand-blue-dark)]">
                Filters
              </h2>
            </div>

            <span className="flex h-11 w-11 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
              <SlidersHorizontal
                aria-hidden="true"
                className="h-5 w-5"
                strokeWidth={1.7}
              />
            </span>
          </div>

          <FilterForm
            idPrefix="desktop-filter"
            options={options}
            currentFilters={
              currentFilters
            }
          />
        </div>
      </aside>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[80] md:hidden">
            {/* Overlay */}
            <m.button
              type="button"
              aria-label="Close product filters"
              onClick={() =>
                setMobileOpen(false)
              }
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            />

            {/* Drawer */}
            <m.aside
              id="mobile-product-filters"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-filter-heading"
              initial={{
                x: "100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "100%",
              }}
              transition={{
                type: "spring",
                stiffness: 330,
                damping: 34,
              }}
              className="absolute bottom-0 right-0 top-0 flex w-[min(92vw,430px)] flex-col bg-[var(--linen)] shadow-[-20px_0_60px_rgba(0,0,0,0.18)]"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-white px-5 py-5">
                <div>
                  <p className="athimart-label text-[var(--brand-orange-dark)]">
                    Refine collection
                  </p>

                  <h2
                    id="mobile-filter-heading"
                    className="mt-2 font-[var(--font-display)] text-3xl font-light uppercase text-[var(--brand-blue-dark)]"
                  >
                    Filter Products
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  aria-label="Close filters"
                  className="flex h-12 w-12 items-center justify-center border border-[var(--border)] bg-white text-[var(--text)] transition-colors duration-200 hover:border-[var(--brand-orange)] hover:text-[var(--brand-orange-dark)]"
                >
                  <X
                    aria-hidden="true"
                    className="h-6 w-6"
                    strokeWidth={1.8}
                  />
                </button>
              </div>

              {/* Drawer form */}
              <div className="flex-1 overflow-y-auto p-5 pb-[calc(24px+env(safe-area-inset-bottom))]">
                <FilterForm
                  idPrefix="mobile-filter"
                  options={options}
                  currentFilters={
                    currentFilters
                  }
                  onSubmit={() =>
                    setMobileOpen(false)
                  }
                />
              </div>
            </m.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
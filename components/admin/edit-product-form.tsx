// components/admin/edit-product-form.tsx

"use client";

import {
  AlertCircle,
  Check,
  ImagePlus,
  Save,
  SearchCheck,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import {
  useActionState,
  useState,
} from "react";

import { updateProduct } from "@/app/(admin)/admin/products/[productId]/edit/actions";
import { ProductImageUploader } from "@/components/admin/product-image-uploader";
import type { AdminEditableProduct } from "@/lib/products/admin-product-edit-service";
import type { AdminProductFormState } from "@/types/admin-product-form";

interface SubcategoryOption {
  name: string;
  slug: string;
}

interface CategoryOption {
  name: string;
  slug: string;
  subcategories: SubcategoryOption[];
}

interface EditProductFormProps {
  product: AdminEditableProduct;
  categories: CategoryOption[];
}

const initialState: AdminProductFormState = {
  message: "",
  fieldErrors: {},
};

const inputClassName =
  "mt-2 min-h-13 w-full border border-[var(--border)] bg-white px-4 font-[var(--font-body)] text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--placeholder)] focus:border-[var(--brand-blue)] focus-visible:!outline-none";

const textareaClassName =
  "mt-2 w-full border border-[var(--border)] bg-white px-4 py-3 font-[var(--font-body)] text-sm leading-6 text-[var(--text)] outline-none transition-colors placeholder:text-[var(--placeholder)] focus:border-[var(--brand-blue)] focus-visible:!outline-none";

function FieldError({
  message,
}: Readonly<{
  message?: string;
}>) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-2 flex items-start gap-2 font-[var(--font-body)] text-xs leading-5 text-[var(--sale)]">
      <AlertCircle
        aria-hidden="true"
        className="mt-0.5 h-4 w-4 shrink-0"
        strokeWidth={1.8}
      />

      <span>{message}</span>
    </p>
  );
}

export function EditProductForm({
  product,
  categories,
}: Readonly<EditProductFormProps>) {
  /*
   * Preserve the product's current
   * category even if it has not yet
   * been added to the website config.
   */
  const initialCategory =
    product.category ||
    categories[0]?.name ||
    "";

  const initialCategoryRecord =
    categories.find(
      (category) =>
        category.name ===
        initialCategory
    );

  const initialSubcategory =
    product.subCategory ||
    initialCategoryRecord
      ?.subcategories[0]
      ?.name ||
    "";

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(
    initialCategory
  );

  const [
    selectedSubcategory,
    setSelectedSubcategory,
  ] = useState(
    initialSubcategory
  );

  const updateProductWithId =
    updateProduct.bind(
      null,
      product.id
    );

  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    updateProductWithId,
    initialState
  );

  const currentCategory =
    categories.find(
      (category) =>
        category.name ===
        selectedCategory
    );

  const subcategories =
    currentCategory
      ?.subcategories ?? [];

  const currentCategoryMissing =
    Boolean(
      selectedCategory
    ) &&
    !categories.some(
      (category) =>
        category.name ===
        selectedCategory
    );

  const currentSubcategoryMissing =
    Boolean(
      selectedSubcategory
    ) &&
    !subcategories.some(
      (subcategory) =>
        subcategory.name ===
        selectedSubcategory
    );

  function handleCategoryChange(
    categoryName: string
  ) {
    setSelectedCategory(
      categoryName
    );

    const nextCategory =
      categories.find(
        (category) =>
          category.name ===
          categoryName
      );

    const firstSubcategory =
      nextCategory
        ?.subcategories[0]
        ?.name ?? "";

    setSelectedSubcategory(
      firstSubcategory
    );
  }

  return (
    <form action={formAction}>
      {/* Main form error */}
      {state.message && (
        <div
          role="alert"
          className="mb-7 border-l-4 border-[var(--sale)] bg-red-50 px-5 py-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sale)]"
              strokeWidth={1.8}
            />

            <div>
              <p className="font-[var(--font-body)] text-sm font-semibold text-[var(--sale)]">
                {state.message}
              </p>

              {state.fieldErrors.form && (
                <p className="mt-2 font-[var(--font-body)] text-xs leading-5 text-[var(--sale)]">
                  {
                    state
                      .fieldErrors
                      .form
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-7 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Left column */}
        <div className="space-y-7">
          {/* Product details */}
          <section className="border border-[var(--border)] bg-white p-5 sm:p-7">
            <div className="border-b border-[var(--border)] pb-5">
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Core information
              </p>

              <h2 className="athimart-title-large mt-2 text-[var(--brand-blue-dark)]">
                Product Details
              </h2>

              <p className="mt-3 break-all font-mono text-[10px] text-[var(--text-muted)]">
                Product ID:{" "}
                {product.id}
              </p>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {/* Product name */}
              <label className="sm:col-span-2">
                <span className="athimart-label text-[var(--text-muted)]">
                  Product name{" "}
                  <span className="text-[var(--sale)]">
                    *
                  </span>
                </span>

                <input
                  type="text"
                  name="name"
                  required
                  minLength={2}
                  maxLength={150}
                  defaultValue={
                    product.name
                  }
                  placeholder="Example: Honor X6c"
                  className={
                    inputClassName
                  }
                />

                <FieldError
                  message={
                    state
                      .fieldErrors
                      .name
                  }
                />
              </label>

              {/* Company */}
              <label>
                <span className="athimart-label text-[var(--text-muted)]">
                  Company / Seller{" "}
                  <span className="text-[var(--sale)]">
                    *
                  </span>
                </span>

                <input
                  type="text"
                  name="companyName"
                  required
                  minLength={2}
                  maxLength={120}
                  defaultValue={
                    product.companyName
                  }
                  placeholder="Example: AthiMart"
                  className={
                    inputClassName
                  }
                />

                <FieldError
                  message={
                    state
                      .fieldErrors
                      .companyName
                  }
                />
              </label>

              {/* Brand */}
              <label>
                <span className="athimart-label text-[var(--text-muted)]">
                  Brand
                </span>

                <input
                  type="text"
                  name="brand"
                  maxLength={100}
                  defaultValue={
                    product.brand
                  }
                  placeholder="Example: Honor"
                  className={
                    inputClassName
                  }
                />

                <FieldError
                  message={
                    state
                      .fieldErrors
                      .brand
                  }
                />
              </label>

              {/* Model */}
              <label>
                <span className="athimart-label text-[var(--text-muted)]">
                  Model
                </span>

                <input
                  type="text"
                  name="model"
                  maxLength={100}
                  defaultValue={
                    product.model
                  }
                  placeholder="Example: X6c"
                  className={
                    inputClassName
                  }
                />

                <FieldError
                  message={
                    state
                      .fieldErrors
                      .model
                  }
                />
              </label>

              {/* SKU */}
              <label>
                <span className="athimart-label text-[var(--text-muted)]">
                  SKU
                </span>

                <input
                  type="text"
                  name="sku"
                  maxLength={100}
                  defaultValue={
                    product.sku
                  }
                  placeholder="Example: HON-X6C-128"
                  className={
                    inputClassName
                  }
                />

                <FieldError
                  message={
                    state
                      .fieldErrors
                      .sku
                  }
                />
              </label>

              {/* Category */}
              <label>
                <span className="athimart-label text-[var(--text-muted)]">
                  Category{" "}
                  <span className="text-[var(--sale)]">
                    *
                  </span>
                </span>

                <select
                  name="category"
                  required
                  value={
                    selectedCategory
                  }
                  onChange={(event) =>
                    handleCategoryChange(
                      event.target
                        .value
                    )
                  }
                  className={
                    inputClassName
                  }
                >
                  {!selectedCategory && (
                    <option value="">
                      Select a
                      category
                    </option>
                  )}

                  {currentCategoryMissing && (
                    <option
                      value={
                        selectedCategory
                      }
                    >
                      {
                        selectedCategory
                      }{" "}
                      — Current
                    </option>
                  )}

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category.slug
                        }
                        value={
                          category.name
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}
                </select>

                <FieldError
                  message={
                    state
                      .fieldErrors
                      .category
                  }
                />
              </label>

              {/* Subcategory */}
              <label>
                <span className="athimart-label text-[var(--text-muted)]">
                  Product type{" "}
                  <span className="text-[var(--sale)]">
                    *
                  </span>
                </span>

                <select
                  name="subCategory"
                  required
                  value={
                    selectedSubcategory
                  }
                  onChange={(event) =>
                    setSelectedSubcategory(
                      event.target
                        .value
                    )
                  }
                  className={
                    inputClassName
                  }
                >
                  {!selectedSubcategory && (
                    <option value="">
                      Select a
                      product type
                    </option>
                  )}

                  {currentSubcategoryMissing && (
                    <option
                      value={
                        selectedSubcategory
                      }
                    >
                      {
                        selectedSubcategory
                      }{" "}
                      — Current
                    </option>
                  )}

                  {subcategories.map(
                    (subcategory) => (
                      <option
                        key={
                          subcategory.slug
                        }
                        value={
                          subcategory.name
                        }
                      >
                        {
                          subcategory.name
                        }
                      </option>
                    )
                  )}
                </select>

                <FieldError
                  message={
                    state
                      .fieldErrors
                      .subCategory
                  }
                />
              </label>

              {/* Slug */}
              <label>
                <span className="athimart-label text-[var(--text-muted)]">
                  Product URL slug{" "}
                  <span className="text-[var(--sale)]">
                    *
                  </span>
                </span>

                <input
                  type="text"
                  name="slug"
                  required
                  maxLength={160}
                  defaultValue={
                    product.slug
                  }
                  placeholder="honor-x6c"
                  className={
                    inputClassName
                  }
                />

                <p className="mt-2 font-[var(--font-body)] text-xs leading-5 text-[var(--text-muted)]">
                  Use lowercase words
                  separated by
                  hyphens.
                </p>

                <FieldError
                  message={
                    state
                      .fieldErrors
                      .slug
                  }
                />
              </label>

              {/* Emoji */}
              <label>
                <span className="athimart-label text-[var(--text-muted)]">
                  Product emoji
                </span>

                <input
                  type="text"
                  name="emoji"
                  maxLength={10}
                  defaultValue={
                    product.emoji ||
                    "📦"
                  }
                  placeholder="📦"
                  className={
                    inputClassName
                  }
                />

                <FieldError
                  message={
                    state
                      .fieldErrors
                      .emoji
                  }
                />
              </label>

              {/* Description */}
              <label className="sm:col-span-2">
                <span className="athimart-label text-[var(--text-muted)]">
                  Product description{" "}
                  <span className="text-[var(--sale)]">
                    *
                  </span>
                </span>

                <textarea
                  name="description"
                  required
                  rows={8}
                  defaultValue={
                    product.description
                  }
                  placeholder="Describe the product, features, benefits, condition and suitable customers."
                  className={
                    textareaClassName
                  }
                />

                <p className="mt-2 font-[var(--font-body)] text-xs leading-5 text-[var(--text-muted)]">
                  Existing short
                  descriptions can
                  still be edited and
                  saved.
                </p>

                <FieldError
                  message={
                    state
                      .fieldErrors
                      .description
                  }
                />
              </label>
            </div>
          </section>

          {/* Product images */}
          <section className="border border-[var(--border)] bg-white p-5 sm:p-7">
            <div className="flex items-start justify-between gap-5 border-b border-[var(--border)] pb-5">
              <div>
                <p className="athimart-label text-[var(--brand-orange-dark)]">
                  Product gallery
                </p>

                <h2 className="athimart-title-large mt-2 text-[var(--brand-blue-dark)]">
                  Product Images
                </h2>

                <p className="mt-2 max-w-xl font-[var(--font-body)] text-xs leading-5 text-[var(--text-muted)]">
                  Review the existing
                  images or upload new
                  ones. The first
                  image is used as the
                  primary product
                  image.
                </p>
              </div>

              <ImagePlus
                aria-hidden="true"
                className="h-7 w-7 shrink-0 text-[var(--brand-blue)]"
                strokeWidth={1.7}
              />
            </div>

            <div className="mt-6">
              <ProductImageUploader
                initialUrls={
                  product.imageUrls
                }
                maximumImages={6}
              />

              <FieldError
                message={
                  state
                    .fieldErrors
                    .imageUrls
                }
              />
            </div>

            <div className="mt-5 border-l-4 border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] px-4 py-3">
              <p className="font-[var(--font-body)] text-xs leading-5 text-[var(--text-soft)]">
                Removing an image here
                removes its URL from
                the product record
                after saving. It does
                not permanently delete
                the physical Storage
                file.
              </p>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-7">
          {/* Pricing and stock */}
          <section className="border border-[var(--border)] bg-white p-5 sm:p-7">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-5">
              <Settings2
                aria-hidden="true"
                className="h-5 w-5 text-[var(--brand-blue)]"
                strokeWidth={1.8}
              />

              <h2 className="font-[var(--font-display)] text-3xl font-light uppercase text-[var(--brand-blue-dark)]">
                Pricing & Stock
              </h2>
            </div>

            <div className="mt-6 space-y-6">
              {/* Selling price */}
              <label className="block">
                <span className="athimart-label text-[var(--text-muted)]">
                  Selling price —
                  LKR{" "}
                  <span className="text-[var(--sale)]">
                    *
                  </span>
                </span>

                <input
                  type="number"
                  name="priceLkr"
                  required
                  min="0"
                  step="0.01"
                  defaultValue={
                    product.priceLkr
                  }
                  className={
                    inputClassName
                  }
                />

                <FieldError
                  message={
                    state
                      .fieldErrors
                      .priceLkr
                  }
                />
              </label>

              {/* Original price */}
              <label className="block">
                <span className="athimart-label text-[var(--text-muted)]">
                  Original price —
                  LKR
                </span>

                <input
                  type="number"
                  name="originalPriceLkr"
                  min="0"
                  step="0.01"
                  defaultValue={
                    product.originalPriceLkr
                  }
                  className={
                    inputClassName
                  }
                />

                <p className="mt-2 font-[var(--font-body)] text-xs leading-5 text-[var(--text-muted)]">
                  Use a higher original
                  price only when the
                  product has a genuine
                  discount.
                </p>

                <FieldError
                  message={
                    state
                      .fieldErrors
                      .originalPriceLkr
                  }
                />
              </label>

              {/* Stock */}
              <label className="block">
                <span className="athimart-label text-[var(--text-muted)]">
                  Available stock{" "}
                  <span className="text-[var(--sale)]">
                    *
                  </span>
                </span>

                <input
                  type="number"
                  name="stock"
                  required
                  min="0"
                  step="1"
                  defaultValue={
                    product.stock
                  }
                  className={
                    inputClassName
                  }
                />

                <FieldError
                  message={
                    state
                      .fieldErrors
                      .stock
                  }
                />
              </label>

              {/* Discount preview */}
              <div className="border border-[var(--border)] bg-[var(--linen-light)] p-4">
                <p className="athimart-label text-[var(--text-muted)]">
                  Current discount
                </p>

                <p className="mt-2 font-[var(--font-display)] text-3xl font-light text-[var(--brand-orange-dark)]">
                  {
                    product.discountPercent
                  }
                  %
                </p>

                <p className="mt-2 font-[var(--font-body)] text-xs leading-5 text-[var(--text-muted)]">
                  The discount is
                  recalculated when
                  the product is
                  saved.
                </p>
              </div>
            </div>
          </section>

          {/* SEO */}
          <section className="border border-[var(--border)] bg-white p-5 sm:p-7">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-5">
              <SearchCheck
                aria-hidden="true"
                className="h-5 w-5 text-[var(--brand-orange-dark)]"
                strokeWidth={1.8}
              />

              <h2 className="font-[var(--font-display)] text-3xl font-light uppercase text-[var(--brand-blue-dark)]">
                Product SEO
              </h2>
            </div>

            <div className="mt-6 space-y-6">
              {/* SEO title */}
              <label className="block">
                <span className="athimart-label text-[var(--text-muted)]">
                  SEO title
                </span>

                <input
                  type="text"
                  name="seoTitle"
                  maxLength={70}
                  defaultValue={
                    product.seoTitle
                  }
                  placeholder="Maximum 70 characters"
                  className={
                    inputClassName
                  }
                />

                <p className="mt-2 font-[var(--font-body)] text-xs leading-5 text-[var(--text-muted)]">
                  Leave blank to use
                  the product name.
                </p>

                <FieldError
                  message={
                    state
                      .fieldErrors
                      .seoTitle
                  }
                />
              </label>

              {/* SEO description */}
              <label className="block">
                <span className="athimart-label text-[var(--text-muted)]">
                  SEO description
                </span>

                <textarea
                  name="seoDescription"
                  maxLength={160}
                  rows={5}
                  defaultValue={
                    product.seoDescription
                  }
                  placeholder="Write a short search description of up to 160 characters."
                  className={
                    textareaClassName
                  }
                />

                <FieldError
                  message={
                    state
                      .fieldErrors
                      .seoDescription
                  }
                />
              </label>
            </div>
          </section>

          {/* Specifications */}
          <section className="border border-[var(--border)] bg-white p-5 sm:p-7">
            <h2 className="font-[var(--font-display)] text-3xl font-light uppercase text-[var(--brand-blue-dark)]">
              Specifications
            </h2>

            <p className="mt-3 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              Update extra product
              specifications using a
              valid JSON object.
            </p>

            <label className="mt-6 block">
              <span className="athimart-label text-[var(--text-muted)]">
                Attributes JSON
              </span>

              <textarea
                name="attributes"
                rows={10}
                defaultValue={JSON.stringify(
                  product.attributes,
                  null,
                  2
                )}
                className="mt-2 w-full border border-[var(--border)] bg-[var(--linen-light)] px-4 py-3 font-mono text-xs leading-6 text-[var(--text)] outline-none transition-colors focus:border-[var(--brand-blue)] focus-visible:!outline-none"
              />

              <p className="mt-2 font-[var(--font-body)] text-xs leading-5 text-[var(--text-muted)]">
                Example:{" "}
                {`{"storage":"128GB","color":"Black","condition":"New"}`}
              </p>

              <FieldError
                message={
                  state
                    .fieldErrors
                    .attributes
                }
              />
            </label>
          </section>

          {/* Visibility */}
          <section className="border border-[var(--border)] bg-white p-5 sm:p-7">
            <h2 className="font-[var(--font-display)] text-3xl font-light uppercase text-[var(--brand-blue-dark)]">
              Visibility
            </h2>

            <div className="mt-6 space-y-3">
              {/* Active */}
              <label className="flex cursor-pointer items-center justify-between gap-5 border border-[var(--border)] p-4 transition-colors hover:border-[var(--brand-blue)]">
                <div>
                  <p className="font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                    Active product
                  </p>

                  <p className="mt-1 font-[var(--font-body)] text-xs leading-5 text-[var(--text-muted)]">
                    Show this product
                    on the website and
                    mobile application.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={
                    product.isActive
                  }
                  className="h-5 w-5 shrink-0 accent-[var(--brand-blue)]"
                />
              </label>

              {/* Featured */}
              <label className="flex cursor-pointer items-center justify-between gap-5 border border-[var(--border)] p-4 transition-colors hover:border-[var(--brand-orange)]">
                <div>
                  <p className="font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                    Featured product
                  </p>

                  <p className="mt-1 font-[var(--font-body)] text-xs leading-5 text-[var(--text-muted)]">
                    Prioritize this
                    product in featured
                    sections.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="isFeatured"
                  defaultChecked={
                    product.isFeatured
                  }
                  className="h-5 w-5 shrink-0 accent-[var(--brand-orange)]"
                />
              </label>
            </div>
          </section>

          {/* Actions */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <button
              type="submit"
              disabled={pending}
              className="athimart-brand-button w-full text-white! disabled:cursor-wait disabled:opacity-70"
            >
              {pending ? (
                <Settings2
                  aria-hidden="true"
                  className="h-5 w-5 animate-spin text-white!"
                  strokeWidth={1.8}
                />
              ) : (
                <Save
                  aria-hidden="true"
                  className="h-5 w-5 text-white!"
                  strokeWidth={1.8}
                />
              )}

              <span className="text-white!">
                {pending
                  ? "Updating product..."
                  : "Save changes"}
              </span>
            </button>

            <Link
              href="/admin/products"
              className="athimart-brand-outline-button w-full"
            >
              Cancel
            </Link>
          </div>

          {/* Shared database reminder */}
          <div className="flex items-start gap-3 border-l-4 border-[var(--success)] bg-green-50 p-4">
            <Check
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]"
              strokeWidth={1.8}
            />

            <p className="font-[var(--font-body)] text-xs leading-6 text-[var(--text-soft)]">
              Saved product changes
              and image URLs update
              the shared Supabase
              records used by the
              AthiMart website and
              Flutter application.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
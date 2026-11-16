// components/seller/edit-product-form.tsx

"use client";

import {
  AlertCircle,
  Check,
  ImagePlus,
  Save,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import {
  useActionState,
} from "react";

import { updateProduct } from "@/app/(seller)/seller/products/[productId]/edit/actions";
import { ProductImageUploader } from "@/components/admin/product-image-uploader";
import type { SellerEditableProduct } from "@/lib/products/seller-product-edit-service";
import type { AdminProductFormState } from "@/types/admin-product-form";
import { readVariant } from "@/lib/products/product-variants";
import ProductListingDetails from "@/components/products/product-listing-details";
import ProductVariantFields from "@/components/products/product-variant-fields";
import { ProductCategoryFields, type CategoryOption } from "./product-category-fields";

interface EditProductFormProps {
  product: SellerEditableProduct;
  categories: CategoryOption[];
  sellerName: string;
}

const initialState: AdminProductFormState = {
  message: "",
  fieldErrors: {},
};

const inputClassName =
  "mt-2 min-h-13 w-full border border-[var(--border)] bg-[var(--surface)] px-4 font-body text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--placeholder)] focus:border-[var(--brand-blue)] ";

const textareaClassName =
  "mt-2 w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 font-body text-sm leading-6 text-[var(--text)] outline-none transition-colors placeholder:text-[var(--placeholder)] focus:border-[var(--brand-blue)] ";

function FieldError({
  message,
}: Readonly<{
  message?: string;
}>) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-2 flex items-start gap-2 font-body text-xs leading-5 text-[var(--sale)]">
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
  sellerName,
}: Readonly<EditProductFormProps>) {
  const variant = readVariant(product.attributes);
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
              <p className="font-body text-sm font-semibold text-[var(--sale)]">
                {state.message}
              </p>

              {state.fieldErrors.form && (
                <p className="mt-2 font-body text-xs leading-5 text-[var(--sale)]">
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
          <section className="border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 rounded-[24px]">
            <div className="border-b border-[var(--border)] pb-5">
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Seller product
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
                  placeholder="Example: Fresh Milk"
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

              {/* Company or seller */}
              <label>
                <span className="athimart-label text-[var(--text-muted)]">
                  Manufacturer / Brand{" "}

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
                  placeholder="Example: Xiaomi"
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
                  placeholder="Example: Agro Herds"
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
                  placeholder="Example: 1L Pack"
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

              <ProductCategoryFields
                categories={categories}
                initialCategory={product.category}
                initialSubcategory={product.subCategory}
                inputClassName={() => inputClassName + " rounded-xl"}
                errors={state.fieldErrors}
              />

              <ProductVariantFields values={variant.values} initialPricing={product} errors={state.fieldErrors} />

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

                <p className="mt-2 font-body text-xs leading-5 text-[var(--text-muted)]">
                  Existing short
                  descriptions can still
                  be edited and saved.
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


        </div>

        {/* Right column */}
        <div className="space-y-7">
          {/* Visibility */}
          <section className="border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 rounded-[24px]">
            <h2 className="font-editorial text-3xl font-light normal-case text-[var(--brand-blue-dark)]">
              Visibility
            </h2>

            <div className="mt-6">
              <label className="flex cursor-pointer items-center justify-between gap-5 border border-[var(--border)] p-4 transition-colors hover:border-[var(--brand-blue)]">
                <div>
                  <p className="font-body text-sm font-semibold text-[var(--text)]">
                    Active product
                  </p>

                  <p className="mt-1 font-body text-xs leading-5 text-[var(--text-muted)]">
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
            </div>

            <div className="mt-4 border-l-4 border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] px-4 py-3">
              <p className="font-body text-xs leading-6 text-[var(--text-soft)]">
                Featured marketplace
                placement is controlled
                only by AthiMart
                administrators. Editing
                this product will not
                change its existing
                featured status.
              </p>
            </div>
          </section>

        </div>
      </div>
      <div className="mt-7 space-y-5">
        <ProductListingDetails product={product} sellerName={sellerName} errors={state.fieldErrors} showMetadata />
          <section className="border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 rounded-[24px]">
            <div className="flex items-start justify-between gap-5 border-b border-[var(--border)] pb-5">
              <div>
                <p className="athimart-label text-[var(--brand-orange-dark)]">
                  Product gallery
                </p>

                <h2 className="athimart-title-large mt-2 text-[var(--brand-blue-dark)]">
                  Product Images
                </h2>

                <p className="mt-2 max-w-xl font-body text-xs leading-5 text-[var(--text-muted)]">
                  Review existing
                  images or upload new
                  ones. The first image
                  is used as the primary
                  product image.
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
              <p className="font-body text-xs leading-5 text-[var(--text-soft)]">
                When you remove an
                uploaded AthiMart image
                and save the product,
                its unused Storage file
                will also be cleaned up
                when possible.
              </p>
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
              href="/seller/products"
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

            <p className="font-body text-xs leading-6 text-[var(--text-soft)]">
              Saved product changes
              and image URLs update the
              shared Supabase records
              used by the AthiMart
              website and Flutter
              application.
            </p>
          </div>
      </div>
    </form>
  );
}
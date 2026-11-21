// components/seller/product-form.tsx

"use client";

import {
  AlertCircle,
  ImagePlus,
  PackagePlus,
  Save,
  Settings2,
} from "lucide-react";
import Link from "@/components/navigation/navigation-link";
import type {
  FormEvent,
  ReactNode,
} from "react";
import {
  useActionState,
  useState,
} from "react";

import { createProduct } from "@/app/(seller)/seller/products/new/actions";
import { ProductImageUploader } from "@/components/admin/product-image-uploader";
import type { AdminProductFormState } from "@/types/admin-product-form";
import { parseVariantRows } from "@/lib/products/product-variants";
import ProductListingDetails from "@/components/products/product-listing-details";
import ProductVariantFields from "@/components/products/product-variant-fields";
import { ProductCategoryFields, type CategoryOption } from "./product-category-fields";

interface ProductFormProps {
  categories: CategoryOption[];
  sellerName: string;
}

type FieldErrors =
  Record<string, string>;

const initialState: AdminProductFormState = {
  message: "",
  fieldErrors: {},
};

const validationOrder = [
  "name",
  "companyName",
  "category",
  "subCategory",
  "description",
  "imageUrls",
  "priceLkr",
  "stock",
  "attributes",
  "variants",
] as const;

const inputClassName =
  "mt-2 min-h-13 w-full border border-[var(--border)] bg-[var(--surface)] px-4 font-body text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--placeholder)] focus:border-[var(--brand-blue)] ";

const textareaClassName =
  "mt-2 w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 font-body text-sm leading-6 text-[var(--text)] outline-none transition-colors placeholder:text-[var(--placeholder)] focus:border-[var(--brand-blue)] ";

function RequiredLabel({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <span className="athimart-label text-[var(--text-muted)]">
      {children}{" "}

      <span
        aria-hidden="true"
        className="text-[var(--sale)]"
      >
        *
      </span>
    </span>
  );
}

function FieldError({
  id,
  message,
}: Readonly<{
  id: string;
  message?: string;
}>) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className="mt-2 flex items-start gap-2 font-body text-xs leading-5 text-[var(--sale)]"
    >
      <AlertCircle
        aria-hidden="true"
        className="mt-0.5 h-4 w-4 shrink-0"
        strokeWidth={1.8}
      />

      <span>
        {message}
      </span>
    </p>
  );
}

function getTextValue(
  formData: FormData,
  fieldName: string
): string {
  const value =
    formData.get(fieldName);

  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function validateProductForm(
  form: HTMLFormElement
): FieldErrors {
  const formData =
    new FormData(form);

  const errors: FieldErrors =
    {};

  const name =
    getTextValue(
      formData,
      "name"
    );

  const companyName =
    getTextValue(
      formData,
      "companyName"
    );

  const category =
    getTextValue(
      formData,
      "category"
    );

  const subCategory =
    getTextValue(
      formData,
      "subCategory"
    );

  const description =
    getTextValue(
      formData,
      "description"
    );

  const imageUrls =
    getTextValue(
      formData,
      "imageUrls"
    );

  const priceValue =
    getTextValue(
      formData,
      "priceLkr"
    );

  const originalPriceValue =
    getTextValue(
      formData,
      "originalPriceLkr"
    );

  const stockValue =
    getTextValue(
      formData,
      "stock"
    );

  const attributesValue =
    getTextValue(
      formData,
      "attributes"
    );

  if (!name) {
    errors.name =
      "Product name is required.";
  } else if (
    name.length < 2
  ) {
    errors.name =
      "Product name must contain at least 2 characters.";
  }

  if (!companyName) {
    errors.companyName =
      "Manufacturer or brand name is required.";
  } else if (
    companyName.length <
    2
  ) {
    errors.companyName =
      "Manufacturer or brand name must contain at least 2 characters.";
  }

  if (!category) {
    errors.category =
      "Select a product category.";
  }

  if (!subCategory) {
    errors.subCategory =
      "Select a product type.";
  }

  if (!description) {
    errors.description =
      "Product description is required.";
  } else if (
    description.length <
    40
  ) {
    const remainingCharacters =
      40 -
      description.length;

    errors.description =
      `Add at least ${remainingCharacters} more ${
        remainingCharacters ===
        1
          ? "character"
          : "characters"
      } to the description.`;
  }

  if (!imageUrls) {
    errors.imageUrls =
      "Upload at least one product image.";
  }

  if (!priceValue) {
    errors.priceLkr =
      "Selling price is required.";
  } else {
    const price =
      Number(priceValue);

    if (
      !Number.isFinite(
        price
      ) ||
      price < 0
    ) {
      errors.priceLkr =
        "Enter a valid selling price.";
    }
  }

  if (
    originalPriceValue
  ) {
    const originalPrice =
      Number(
        originalPriceValue
      );

    if (
      !Number.isFinite(
        originalPrice
      ) ||
      originalPrice < 0
    ) {
      errors.originalPriceLkr =
        "Enter a valid original price.";
    }
  }

  if (!stockValue) {
    errors.stock =
      "Available stock is required.";
  } else {
    const stock =
      Number(stockValue);

    if (
      !Number.isInteger(
        stock
      ) ||
      stock < 0
    ) {
      errors.stock =
        "Stock must be a whole number of zero or more.";
    }
  }

  const variants = parseVariantRows(formData);
  if (!variants.valid) errors.variants = variants.error;

  if (attributesValue) {
    try {
      const parsedAttributes: unknown =
        JSON.parse(
          attributesValue
        );

      if (
        typeof parsedAttributes !==
          "object" ||
        parsedAttributes ===
          null ||
        Array.isArray(
          parsedAttributes
        )
      ) {
        errors.attributes =
          "Specifications must be a JSON object.";
      }
    } catch {
      errors.attributes =
        "Specifications contain invalid JSON.";
    }
  }


  return errors;
}

export function ProductForm({
  categories,
  sellerName,
}: Readonly<ProductFormProps>) {
  const [
    clientErrors,
    setClientErrors,
  ] =
    useState<FieldErrors>(
      {}
    );

  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    createProduct,
    initialState
  );

  const combinedErrors: FieldErrors =
    {
      ...state.fieldErrors,
      ...clientErrors,
    };

  const visibleErrorMessages =
    Array.from(
      new Set(
        Object.entries(
          combinedErrors
        )
          .filter(
            ([fieldName]) =>
              fieldName !==
              "form"
          )
          .map(
            ([, message]) =>
              message
          )
          .filter(Boolean)
      )
    );

  const hasErrors =
    visibleErrorMessages.length >
      0 ||
    Boolean(
      combinedErrors.form
    );

  function getFieldError(
    fieldName: string
  ): string | undefined {
    return combinedErrors[
      fieldName
    ];
  }

  function getInputClass(
    fieldName: string,
    baseClassName =
      inputClassName
  ): string {
    const hasError =
      Boolean(
        getFieldError(
          fieldName
        )
      );

    return `${baseClassName} ${
      hasError
        ? "border-[var(--sale)]! bg-red-50/40!"
        : ""
    }`;
  }

  function clearClientError(
    fieldName: string
  ) {
    setClientErrors(
      (currentErrors) => {
        if (
          !currentErrors[
            fieldName
          ]
        ) {
          return currentErrors;
        }

        const nextErrors = {
          ...currentErrors,
        };

        delete nextErrors[
          fieldName
        ];

        return nextErrors;
      }
    );
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    const form =
      event.currentTarget;

    const errors =
      validateProductForm(
        form
      );

    if (
      Object.keys(
        errors
      ).length === 0
    ) {
      setClientErrors(
        {}
      );

      return;
    }

    event.preventDefault();

    setClientErrors(
      errors
    );

    const firstInvalidField =
      validationOrder.find(
        (fieldName) =>
          Boolean(
            errors[
              fieldName
            ]
          )
      );

    window.requestAnimationFrame(
      () => {
        if (
          !firstInvalidField
        ) {
          return;
        }

        const fieldSection =
          document.querySelector(
            `[data-product-field="${firstInvalidField}"]`
          );

        fieldSection
          ?.scrollIntoView({
            behavior:
              "smooth",
            block:
              "center",
          });

        const fieldElement =
          form.elements.namedItem(
            firstInvalidField
          );

        if (
          fieldElement instanceof
            HTMLElement &&
          fieldElement.getAttribute(
            "type"
          ) !== "hidden"
        ) {
          fieldElement.focus({
            preventScroll:
              true,
          });
        }
      }
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={
        handleSubmit
      }
    >
      {/* Required fields reminder */}
      <div className="mb-7 flex items-start gap-3 border-l-4 border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] px-5 py-4">
        <AlertCircle
          aria-hidden="true"
          className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-orange-dark)]"
          strokeWidth={
            1.8
          }
        />

        <div>
          <p className="font-body text-sm font-semibold text-[var(--brand-orange-dark)]">
            Complete all
            required product
            information.
          </p>

          <p className="mt-1 font-body text-xs leading-5 text-[var(--text-soft)]">
            Fields marked with
            a red{" "}

            <span className="font-bold text-[var(--sale)]">
              *
            </span>{" "}

            must be completed
            before the product
            can be added.
            Missing or invalid
            fields will be
            highlighted in red.
          </p>
        </div>
      </div>

      {/* Validation summary */}
      {(state.message ||
        hasErrors) && (
        <div
          id="product-form-errors"
          role="alert"
          className="mb-7 border-l-4 border-[var(--sale)] bg-red-50 px-5 py-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sale)]"
              strokeWidth={
                1.8
              }
            />

            <div>
              <p className="font-body text-sm font-semibold text-[var(--sale)]">
                {state.message ||
                  "Complete the fields highlighted in red before adding the product."}
              </p>

              {combinedErrors.form && (
                <p className="mt-2 font-body text-xs leading-5 text-[var(--sale)]">
                  {
                    combinedErrors.form
                  }
                </p>
              )}

              {visibleErrorMessages.length >
                0 && (
                <ul className="mt-3 space-y-1.5">
                  {visibleErrorMessages.map(
                    (
                      message
                    ) => (
                      <li
                        key={
                          message
                        }
                        className="font-body text-xs leading-5 text-[var(--sale)]"
                      >
                        •{" "}
                        {
                          message
                        }
                      </li>
                    )
                  )}
                </ul>
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
                Core
                information
              </p>

              <h2 className="athimart-title-large mt-2 text-[var(--brand-blue-dark)]">
                Product
                Details
              </h2>

              <p className="mt-3 max-w-2xl font-body text-xs leading-6 text-[var(--text-muted)]">
                Enter the
                information
                customers will
                see on the
                AthiMart website
                and mobile
                application.
              </p>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {/* Product name */}
              <label
                data-product-field="name"
                className="sm:col-span-2"
              >
                <RequiredLabel>
                  Product name
                </RequiredLabel>

                <input
                  type="text"
                  name="name"
                  maxLength={
                    150
                  }
                  placeholder="Example: Honor X6c"
                  aria-invalid={Boolean(
                    getFieldError(
                      "name"
                    )
                  )}
                  aria-describedby="name-error"
                  onChange={() =>
                    clearClientError(
                      "name"
                    )
                  }
                  className={getInputClass(
                    "name"
                  )}
                />

                <FieldError
                  id="name-error"
                  message={getFieldError(
                    "name"
                  )}
                />
              </label>

              {/* Company */}
              <label data-product-field="companyName">
                <RequiredLabel>
                  Manufacturer / Brand
                </RequiredLabel>

                <input
                  type="text"
                  name="companyName"
                  maxLength={
                    120
                  }
                  placeholder="Example: AthiMart"
                  aria-invalid={Boolean(
                    getFieldError(
                      "companyName"
                    )
                  )}
                  aria-describedby="companyName-error"
                  onChange={() =>
                    clearClientError(
                      "companyName"
                    )
                  }
                  className={getInputClass(
                    "companyName"
                  )}
                />

                <FieldError
                  id="companyName-error"
                  message={getFieldError(
                    "companyName"
                  )}
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
                  maxLength={
                    100
                  }
                  placeholder="Example: Honor"
                  className={
                    inputClassName
                  }
                />

                <FieldError
                  id="brand-error"
                  message={getFieldError(
                    "brand"
                  )}
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
                  maxLength={
                    100
                  }
                  placeholder="Example: X6c"
                  className={
                    inputClassName
                  }
                />

                <FieldError
                  id="model-error"
                  message={getFieldError(
                    "model"
                  )}
                />
              </label>

              <ProductCategoryFields
                categories={categories}
                inputClassName={getInputClass}
                errors={{ category: getFieldError("category"), subCategory: getFieldError("subCategory") }}
                onChange={clearClientError}
              />

              <ProductVariantFields initialPricing={{ stock: 0 }} errors={combinedErrors} onChange={clearClientError} />

              {/* Description */}
              <label
                data-product-field="description"
                className="sm:col-span-2"
              >
                <RequiredLabel>
                  Product
                  description
                </RequiredLabel>

                <textarea
                  name="description"
                  rows={8}
                  placeholder="Describe the product, features, condition, benefits and suitable customers."
                  aria-invalid={Boolean(
                    getFieldError(
                      "description"
                    )
                  )}
                  aria-describedby="description-help description-error"
                  onChange={() =>
                    clearClientError(
                      "description"
                    )
                  }
                  className={getInputClass(
                    "description",
                    textareaClassName
                  )}
                />

                <p
                  id="description-help"
                  className="mt-2 font-body text-xs leading-5 text-[var(--text-muted)]"
                >
                  A minimum of
                  40 characters
                  is required.
                </p>

                <FieldError
                  id="description-error"
                  message={getFieldError(
                    "description"
                  )}
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
                    Active
                    product
                  </p>

                  <p className="mt-1 font-body text-xs leading-5 text-[var(--text-muted)]">
                    Show this
                    product on
                    the website
                    and mobile
                    application.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked
                  className="h-5 w-5 shrink-0 accent-[var(--brand-blue)]"
                />
              </label>
            </div>

            <div className="mt-4 border-l-4 border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] px-4 py-3">
              <p className="font-body text-xs leading-5 text-[var(--text-soft)]">
                Featured
                marketplace
                placement is
                controlled by
                AthiMart
                administrators.
              </p>
            </div>
          </section>

        </div>
      </div>
      <div className="mt-7 space-y-5">
        <ProductListingDetails sellerName={sellerName} errors={combinedErrors} showMetadata onChange={clearClientError} />
          <section
            data-product-field="imageUrls"
            className={`border bg-[var(--surface)] p-5 sm:p-7 ${
              getFieldError(
                "imageUrls"
              )
                ? "border-[var(--sale)]!"
                : "border-[var(--border)]"
            }`}
          >
            <div className="flex items-start justify-between gap-5 border-b border-[var(--border)] pb-5">
              <div>
                <p className="athimart-label text-[var(--brand-orange-dark)]">
                  Product gallery
                </p>

                <h2 className="athimart-title-large mt-2 text-[var(--brand-blue-dark)]">
                  Product
                  Images{" "}

                  <span
                    aria-hidden="true"
                    className="text-[var(--sale)]"
                  >
                    *
                  </span>
                </h2>

                <p className="mt-2 font-body text-xs leading-5 text-[var(--text-muted)]">
                  Upload at
                  least one
                  product image.
                  The first
                  image becomes
                  the primary
                  image.
                </p>
              </div>

              <ImagePlus
                aria-hidden="true"
                className="h-7 w-7 shrink-0 text-[var(--brand-blue)]"
                strokeWidth={
                  1.7
                }
              />
            </div>

            <div className="mt-6">
              <ProductImageUploader
                initialUrls={
                  []
                }
                maximumImages={
                  6
                }
              />

              <FieldError
                id="imageUrls-error"
                message={getFieldError(
                  "imageUrls"
                )}
              />
            </div>
          </section>
          {/* Actions */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <button
              type="submit"
              disabled={
                pending
              }
              className="athimart-brand-button w-full text-white! disabled:cursor-wait disabled:opacity-70"
            >
              {pending ? (
                <Settings2
                  aria-hidden="true"
                  className="h-5 w-5 animate-spin text-white!"
                  strokeWidth={
                    1.8
                  }
                />
              ) : (
                <Save
                  aria-hidden="true"
                  className="h-5 w-5 text-white!"
                  strokeWidth={
                    1.8
                  }
                />
              )}

              <span className="text-white!">
                {pending
                  ? "Creating product..."
                  : "Add Product"}
              </span>
            </button>

            <Link
              href="/seller/products"
              className="athimart-brand-outline-button w-full"
            >
              Cancel
            </Link>
          </div>

          <div className="flex items-start gap-3 border-l-4 border-[var(--brand-blue)] bg-[var(--brand-blue-soft)] p-4">
            <PackagePlus
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-blue)]"
              strokeWidth={
                1.8
              }
            />

            <p className="font-body text-xs leading-6 text-[var(--text-soft)]">
              The product and
              uploaded image
              URLs will be
              saved in the
              shared Supabase
              database used by
              the website and
              Flutter
              application.
            </p>
          </div>
      </div>
    </form>
  );
}
// components/seller/product-row-actions.tsx

"use client";

import {
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  useState,
  useTransition,
} from "react";

import {
  deleteProduct,
  setProductActive,
} from "@/app/(seller)/seller/products/actions";

interface ProductRowActionsProps {
  productId: string;
  productName: string;
  productSlug: string | null;
  isActive: boolean;
}

export function ProductRowActions({
  productId,
  productName,
  productSlug,
  isActive,
}: Readonly<ProductRowActionsProps>) {
  const [
    isDeleteOpen,
    setIsDeleteOpen,
  ] = useState(false);

  const [
    isStatusPending,
    startStatusTransition,
  ] = useTransition();

  const [
    isDeletePending,
    startDeleteTransition,
  ] = useTransition();

  function handleStatusChange() {
    const nextStatus =
      !isActive;

    const message =
      nextStatus
        ? `Activate "${productName}" and show it in the AthiMart marketplace?`
        : `Deactivate "${productName}" and hide it from the AthiMart marketplace?`;

    if (
      !window.confirm(message)
    ) {
      return;
    }

    const formData =
      new FormData();

    startStatusTransition(
      async () => {
        await setProductActive(
          productId,
          nextStatus,
          formData
        );
      }
    );
  }

  function handleDelete() {
    const formData =
      new FormData();

    formData.set(
      "confirmation",
      "DELETE"
    );

    startDeleteTransition(
      async () => {
        await deleteProduct(
          productId,
          formData
        );
      }
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 lg:flex-col">
        <Link
          href={`/seller/products/${productId}/edit`}
          aria-label={`Edit ${productName}`}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 border border-[var(--brand-blue)] bg-white px-4 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-blue)] transition-colors hover:bg-[var(--brand-blue)] hover:text-white lg:flex-none"
        >
          <Pencil
            aria-hidden="true"
            className="h-4 w-4"
            strokeWidth={1.8}
          />

          Edit
        </Link>

        {productSlug &&
          isActive && (
            <Link
              href={`/shop?product=${encodeURIComponent(
                productSlug
              )}`}
              aria-label={`View ${productName}`}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 border border-[var(--border)] bg-white px-4 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] transition-colors hover:border-[var(--brand-orange)] hover:text-[var(--brand-orange-dark)] lg:flex-none"
            >
              <Eye
                aria-hidden="true"
                className="h-4 w-4"
                strokeWidth={1.8}
              />

              View
            </Link>
          )}

        <button
          type="button"
          disabled={
            isStatusPending ||
            isDeletePending
          }
          onClick={
            handleStatusChange
          }
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 border border-[var(--brand-orange)] bg-white px-4 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-orange-dark)] transition-colors hover:bg-[var(--brand-orange-soft)] disabled:cursor-wait disabled:opacity-60 lg:flex-none"
        >
          {isActive ? (
            <EyeOff
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          ) : (
            <Eye
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          )}

          {isStatusPending
            ? "Updating..."
            : isActive
              ? "Deactivate"
              : "Activate"}
        </button>

        <button
          type="button"
          disabled={
            isStatusPending ||
            isDeletePending
          }
          onClick={() =>
            setIsDeleteOpen(true)
          }
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 border border-[var(--sale)] bg-white px-4 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--sale)] transition-colors hover:bg-red-50 disabled:cursor-wait disabled:opacity-60 lg:flex-none"
        >
          <Trash2
            aria-hidden="true"
            className="h-4 w-4"
            strokeWidth={1.8}
          />

          Delete
        </button>
      </div>

      {isDeleteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-product-${productId}`}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/55 px-5 py-8"
        >
          <div className="w-full max-w-lg border border-[var(--border)] bg-white p-6 shadow-2xl sm:p-8">
            <span className="flex h-14 w-14 items-center justify-center bg-red-50 text-[var(--sale)]">
              <Trash2
                aria-hidden="true"
                className="h-7 w-7"
                strokeWidth={1.7}
              />
            </span>

            <p className="athimart-label mt-6 text-[var(--sale)]">
              Permanent deletion
            </p>

            <h2
              id={`delete-product-${productId}`}
              className="mt-2 font-[var(--font-display)] text-3xl font-light text-[var(--brand-blue-dark)]"
            >
              Delete {productName}?
            </h2>

            <p className="mt-4 font-[var(--font-body)] text-sm leading-7 text-[var(--text-muted)]">
              This permanently removes the
              product from AthiMart. Uploaded
              product images will also be
              removed when possible. This
              action cannot be undone.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={
                  isDeletePending
                }
                onClick={() =>
                  setIsDeleteOpen(false)
                }
                className="athimart-brand-outline-button w-full disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  isDeletePending
                }
                onClick={
                  handleDelete
                }
                className="inline-flex min-h-14 items-center justify-center gap-3 border border-[var(--sale)] bg-[var(--sale)] px-5 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-800 disabled:cursor-wait disabled:opacity-60"
              >
                <Trash2
                  aria-hidden="true"
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />

                {isDeletePending
                  ? "Deleting..."
                  : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
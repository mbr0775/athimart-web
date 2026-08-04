"use client";

import {
  AlertTriangle,
  LoaderCircle,
  Trash2,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import { useFormStatus } from "react-dom";

import { deleteProduct } from "@/app/(admin)/admin/products/actions";

interface ProductDeleteFormProps {
  productId: string;
  productName: string;
}

function DeleteSubmitButton() {
  const { pending } =
    useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 border border-[var(--sale)] bg-[var(--sale)] px-4 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-white! transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? (
        <LoaderCircle
          aria-hidden="true"
          className="h-4 w-4 animate-spin text-white!"
          strokeWidth={1.8}
        />
      ) : (
        <Trash2
          aria-hidden="true"
          className="h-4 w-4 text-white!"
          strokeWidth={1.8}
        />
      )}

      <span className="text-white!">
        {pending
          ? "Deleting..."
          : "Delete permanently"}
      </span>
    </button>
  );
}

export function ProductDeleteForm({
  productId,
  productName,
}: Readonly<ProductDeleteFormProps>) {
  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false);

  const deleteProductWithId =
    deleteProduct.bind(
      null,
      productId
    );

  useEffect(() => {
    if (!dialogOpen) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setDialogOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        "";
    };
  }, [dialogOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setDialogOpen(true)
        }
        className="inline-flex min-h-10 items-center justify-center gap-2 border border-[var(--sale)] bg-red-50 px-3 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--sale)] transition-colors hover:bg-[var(--sale)] hover:text-white!"
      >
        <Trash2
          aria-hidden="true"
          className="h-4 w-4"
          strokeWidth={1.8}
        />

        <span>Delete</span>
      </button>

      {dialogOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-5 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setDialogOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-product-${productId}`}
            className="w-full max-w-lg border border-[var(--border)] bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-5 border-b border-[var(--border)] p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-red-50 text-[var(--sale)]">
                  <AlertTriangle
                    aria-hidden="true"
                    className="h-6 w-6"
                    strokeWidth={1.8}
                  />
                </span>

                <div>
                  <p className="athimart-label text-[var(--sale)]">
                    Permanent action
                  </p>

                  <h2
                    id={`delete-product-${productId}`}
                    className="mt-2 font-[var(--font-display)] text-3xl font-light uppercase text-[var(--brand-blue-dark)]"
                  >
                    Delete Product?
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDialogOpen(false)
                }
                aria-label="Close delete confirmation"
                className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:border-[var(--sale)] hover:text-[var(--sale)]"
              >
                <X
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <p className="font-[var(--font-body)] text-sm leading-7 text-[var(--text-soft)]">
                You are about to
                permanently delete:
              </p>

              <p className="mt-3 border-l-4 border-[var(--sale)] bg-red-50 px-4 py-3 font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                {productName}
              </p>

              <p className="mt-5 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                This removes the shared
                product record from both
                the AthiMart website and
                Flutter application. This
                action cannot be undone.
              </p>

              <form
                action={
                  deleteProductWithId
                }
                className="mt-7 flex flex-col gap-3 sm:flex-row"
              >
                <input
                  type="hidden"
                  name="confirmation"
                  value="DELETE"
                />

                <button
                  type="button"
                  onClick={() =>
                    setDialogOpen(false)
                  }
                  className="athimart-brand-outline-button flex-1"
                >
                  Cancel
                </button>

                <DeleteSubmitButton />
              </form>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
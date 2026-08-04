"use client";

import {
  LoaderCircle,
  Power,
  PowerOff,
} from "lucide-react";
import { useFormStatus } from "react-dom";

import { setProductActive } from "@/app/(admin)/admin/products/actions";

interface ProductStatusFormProps {
  productId: string;
  isActive: boolean;
}

interface StatusButtonProps {
  isActive: boolean;
}

function StatusButton({
  isActive,
}: Readonly<StatusButtonProps>) {
  const { pending } =
    useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex min-h-10 items-center justify-center gap-2 border px-3 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] transition-colors disabled:cursor-wait disabled:opacity-60 ${
        isActive
          ? "border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] text-[var(--brand-orange-dark)] hover:bg-[var(--brand-orange)] hover:text-white!"
          : "border-[var(--success)] bg-green-50 text-[var(--success)] hover:bg-[var(--success)] hover:text-white!"
      }`}
    >
      {pending ? (
        <LoaderCircle
          aria-hidden="true"
          className="h-4 w-4 animate-spin"
          strokeWidth={1.8}
        />
      ) : isActive ? (
        <PowerOff
          aria-hidden="true"
          className="h-4 w-4"
          strokeWidth={1.8}
        />
      ) : (
        <Power
          aria-hidden="true"
          className="h-4 w-4"
          strokeWidth={1.8}
        />
      )}

      <span>
        {pending
          ? "Updating..."
          : isActive
            ? "Deactivate"
            : "Activate"}
      </span>
    </button>
  );
}

export function ProductStatusForm({
  productId,
  isActive,
}: Readonly<ProductStatusFormProps>) {
  const changeStatusAction =
    setProductActive.bind(
      null,
      productId,
      !isActive
    );

  return (
    <form
      action={changeStatusAction}
    >
      <StatusButton
        isActive={isActive}
      />
    </form>
  );
}
// app/(admin)/admin/products/new/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  PackagePlus,
} from "lucide-react";

import { ProductForm } from "@/components/admin/product-form";
import { productCategories } from "@/config/categories";
import { getCurrentAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Add Product",

  description:
    "Add a new product to the AthiMart marketplace.",

  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic =
  "force-dynamic";

export default async function NewProductPage() {
  await getCurrentAdmin();

  const categoryOptions =
    productCategories.map(
      (category) => ({
        name: category.name,
        slug: category.slug,

        subcategories:
          category.subcategories.map(
            (subcategory) => ({
              name:
                subcategory.name,

              slug:
                subcategory.slug,
            })
          ),
      })
    );

  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <header className="border-b border-[var(--border-strong)] pb-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-blue)] transition-colors hover:text-[var(--brand-orange-dark)]"
        >
          <ArrowLeft
            aria-hidden="true"
            className="h-4 w-4"
            strokeWidth={1.8}
          />

          Back to products
        </Link>

        <div className="mt-7 flex items-start justify-between gap-6">
          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Marketplace administration
            </p>

            <h1 className="athimart-display-large mt-4 text-[var(--brand-blue-dark)]">
              Add
              <br />
              <span className="text-[var(--brand-orange)]">
                Product
              </span>
            </h1>

            <p className="athimart-body-large mt-5 max-w-3xl">
              Create a product record
              for the shared AthiMart
              mobile application and
              website marketplace.
            </p>
          </div>

          <span className="hidden h-16 w-16 shrink-0 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)] sm:flex">
            <PackagePlus
              aria-hidden="true"
              className="h-8 w-8"
              strokeWidth={1.6}
            />
          </span>
        </div>
      </header>

      <div className="mt-8">
        <ProductForm
          categories={
            categoryOptions
          }
        />
      </div>
    </div>
  );
}
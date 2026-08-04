// app/(seller)/seller/products/new/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  PackagePlus,
  ShieldCheck,
} from "lucide-react";

import { ProductForm } from "@/components/seller/product-form";
import { productCategories } from "@/config/categories";
import { getCurrentSeller } from "@/lib/auth/seller";

export const metadata: Metadata = {
  title: "Add Seller Product",

  description:
    "Add a new product through your approved AthiMart seller account.",

  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic =
  "force-dynamic";

export default async function NewSellerProductPage() {
  const { profile } =
    await getCurrentSeller();

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
          href="/seller/products"
          className="inline-flex items-center gap-2 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-blue)] transition-colors hover:text-[var(--brand-orange-dark)]"
        >
          <ArrowLeft
            aria-hidden="true"
            className="h-4 w-4"
            strokeWidth={1.8}
          />

          Back to my products
        </Link>

        <div className="mt-7 flex items-start justify-between gap-6">
          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Approved seller product upload
            </p>

            <h1 className="athimart-display-large mt-4 text-[var(--brand-blue-dark)]">
              Add
              <br />

              <span className="text-[var(--brand-orange)]">
                Product
              </span>
            </h1>

            <p className="athimart-body-large mt-5 max-w-3xl">
              Add product details, images,
              pricing, stock and specifications
              to your AthiMart seller inventory.
            </p>

            <div className="mt-5 inline-flex items-center gap-3 border border-green-200 bg-green-50 px-4 py-3">
              <ShieldCheck
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-[var(--success)]"
                strokeWidth={1.8}
              />

              <div>
                <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--success)]">
                  Approved seller
                </p>

                <p className="mt-1 font-[var(--font-body)] text-xs text-[var(--text-muted)]">
                  {profile.fullName}
                </p>
              </div>
            </div>
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
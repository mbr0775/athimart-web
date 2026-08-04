// app/(seller)/seller/products/[productId]/edit/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Pencil,
} from "lucide-react";
import { notFound } from "next/navigation";

import { EditProductForm } from "@/components/seller/edit-product-form";
import { productCategories } from "@/config/categories";
import { getSellerEditableProduct } from "@/lib/products/seller-product-edit-service";

export const metadata: Metadata = {
  title: "Edit Seller Product",

  description:
    "Update a product belonging to your approved AthiMart seller account.",

  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic =
  "force-dynamic";

interface EditSellerProductPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default async function EditSellerProductPage({
  params,
}: EditSellerProductPageProps) {
  const {
    productId,
  } = await params;

  /*
   * This service verifies that:
   *
   * 1. The user is an approved seller.
   * 2. The product exists.
   * 3. The product vendor_id belongs to
   *    the signed-in seller.
   */
  const product =
    await getSellerEditableProduct(
      productId
    );

  if (!product) {
    notFound();
  }

  const categoryOptions =
    productCategories.map(
      (category) => ({
        name:
          category.name,

        slug:
          category.slug,

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
      {/* Page heading */}
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

        <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Seller product management
            </p>

            <h1 className="athimart-display-large mt-4 text-[var(--brand-blue-dark)]">
              Edit
              <br />

              <span className="text-[var(--brand-orange)]">
                Product
              </span>
            </h1>

            <p className="athimart-body-large mt-5 max-w-3xl">
              Update the product details,
              pricing, stock, images,
              specifications and marketplace
              visibility.
            </p>
          </div>

          <span className="flex h-16 w-16 shrink-0 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
            <Pencil
              aria-hidden="true"
              className="h-8 w-8"
              strokeWidth={1.6}
            />
          </span>
        </div>

        {/* Product summary */}
        <div className="mt-7 flex flex-col gap-4 border border-[var(--border)] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-[var(--font-display)] text-2xl font-light text-[var(--brand-blue-dark)]">
              {product.name}
            </p>

            <p className="mt-2 break-all font-mono text-[10px] text-[var(--text-muted)]">
              Product ID: {product.id}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 border border-green-200 bg-green-50 px-4 py-3">
            <BadgeCheck
              aria-hidden="true"
              className="h-5 w-5 text-[var(--success)]"
              strokeWidth={1.8}
            />

            <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--success)]">
              Your seller product
            </p>
          </div>
        </div>
      </header>

      {/* Seller edit form */}
      <div className="mt-8">
        <EditProductForm
          product={product}
          categories={
            categoryOptions
          }
        />
      </div>
    </div>
  );
}
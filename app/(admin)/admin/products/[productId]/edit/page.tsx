// app/(admin)/admin/products/[productId]/edit/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
} from "lucide-react";
import { notFound } from "next/navigation";

import { EditProductForm } from "@/components/admin/edit-product-form";
import { productCategories } from "@/config/categories";
import { getAdminEditableProduct } from "@/lib/products/admin-product-edit-service";

export const metadata: Metadata = {
  title: "Edit Product",

  description:
    "Edit an AthiMart marketplace product.",

  robots: {
    index: false,
    follow: false,
  },
};

/**
 * The page depends on the authenticated
 * administrator and the latest product data.
 */
export const dynamic =
  "force-dynamic";

interface EditProductPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default async function EditProductPage({
  params,
}: Readonly<EditProductPageProps>) {
  const { productId } =
    await params;

  const product =
    await getAdminEditableProduct(
      productId
    );

  if (!product) {
    notFound();
  }

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
      {/* Page heading */}
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
              Product administration
            </p>

            <h1 className="athimart-display-large mt-4 text-[var(--brand-blue-dark)]">
              Edit
              <br />

              <span className="text-[var(--brand-orange)]">
                Product
              </span>
            </h1>

            <p className="athimart-body-large mt-5 max-w-3xl">
              Update {product.name},
              including its product
              information, images,
              pricing, stock, SEO and
              marketplace visibility.
            </p>
          </div>

          <span className="hidden h-16 w-16 shrink-0 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)] sm:flex">
            <Pencil
              aria-hidden="true"
              className="h-8 w-8"
              strokeWidth={1.6}
            />
          </span>
        </div>
      </header>

      {/* Editable product form */}
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
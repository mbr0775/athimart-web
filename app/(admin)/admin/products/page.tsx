// app/(admin)/admin/products/page.tsx

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Archive,
  Boxes,
  ChevronLeft,
  ChevronRight,
  CircleOff,
  PackageCheck,
  PackagePlus,
  Pencil,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { ProductDeleteForm } from "@/components/admin/product-delete-form";
import { ProductStatusForm } from "@/components/admin/product-status-form";
import {
  getAdminProductStatistics,
  getPaginatedAdminProducts,
  type AdminProductStatus,
} from "@/lib/products/admin-product-service";

export const metadata: Metadata = {
  title: "Manage Products",
  description:
    "Manage AthiMart marketplace products, prices, stock and availability.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface AdminProductsPageProps {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    page?: string | string[];
    created?: string | string[];
    updated?: string | string[];
    statusChanged?: string | string[];
    deleted?: string | string[];
  }>;
}

interface ProductsUrlOptions {
  query: string;
  status: AdminProductStatus;
  page?: number;
}

type PaginationItem =
  | number
  | "ellipsis-left"
  | "ellipsis-right";

const PAGE_SIZE = 20;

const validStatuses =
  new Set<AdminProductStatus>([
    "all",
    "active",
    "inactive",
    "out-of-stock",
  ]);

function getFirstValue(
  value:
    | string
    | string[]
    | undefined
): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function getStatus(
  value: string
): AdminProductStatus {
  return validStatuses.has(
    value as AdminProductStatus
  )
    ? (value as AdminProductStatus)
    : "all";
}

function getPageNumber(
  value: string
): number {
  const parsedPage =
    Number.parseInt(value, 10);

  if (
    !Number.isFinite(
      parsedPage
    ) ||
    parsedPage < 1
  ) {
    return 1;
  }

  return parsedPage;
}

function formatLkr(
  value: number
): string {
  const formattedAmount =
    new Intl.NumberFormat(
      "en-US",
      {
        maximumFractionDigits:
          0,
      }
    ).format(value);

  return `Rs ${formattedAmount}`;
}

function createProductsUrl({
  query,
  status,
  page = 1,
}: ProductsUrlOptions): string {
  const parameters =
    new URLSearchParams();

  if (query) {
    parameters.set(
      "q",
      query
    );
  }

  if (status !== "all") {
    parameters.set(
      "status",
      status
    );
  }

  /*
   * Keep page 1 URLs clean.
   */
  if (page > 1) {
    parameters.set(
      "page",
      String(page)
    );
  }

  const queryString =
    parameters.toString();

  return queryString
    ? `/admin/products?${queryString}`
    : "/admin/products";
}

function getPaginationItems(
  currentPage: number,
  totalPages: number
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from(
      {
        length: totalPages,
      },
      (_, index) =>
        index + 1
    );
  }

  const items: PaginationItem[] =
    [1];

  let rangeStart =
    Math.max(
      2,
      currentPage - 1
    );

  let rangeEnd =
    Math.min(
      totalPages - 1,
      currentPage + 1
    );

  /*
   * Show additional beginning pages
   * when the current page is near page 1.
   */
  if (currentPage <= 4) {
    rangeStart = 2;
    rangeEnd = 5;
  }

  /*
   * Show additional ending pages when
   * the current page is near the last page.
   */
  if (
    currentPage >=
    totalPages - 3
  ) {
    rangeStart =
      totalPages - 4;

    rangeEnd =
      totalPages - 1;
  }

  if (rangeStart > 2) {
    items.push(
      "ellipsis-left"
    );
  }

  for (
    let page = rangeStart;
    page <= rangeEnd;
    page += 1
  ) {
    items.push(page);
  }

  if (
    rangeEnd <
    totalPages - 1
  ) {
    items.push(
      "ellipsis-right"
    );
  }

  items.push(totalPages);

  return items;
}

export default async function AdminProductsPage({
  searchParams,
}: Readonly<AdminProductsPageProps>) {
  const parameters =
    await searchParams;

  const query =
    getFirstValue(
      parameters.q
    );

  const status = getStatus(
    getFirstValue(
      parameters.status
    )
  );

  const requestedPage =
    getPageNumber(
      getFirstValue(
        parameters.page
      )
    );

  const productCreated =
    getFirstValue(
      parameters.created
    ) === "1";

  const productUpdated =
    getFirstValue(
      parameters.updated
    ) === "1";

  const productDeleted =
    getFirstValue(
      parameters.deleted
    ) === "1";

  const statusChanged =
    getFirstValue(
      parameters.statusChanged
    );

  const productActivated =
    statusChanged ===
    "activated";

  const productDeactivated =
    statusChanged ===
    "deactivated";

  const [
    pagination,
    statistics,
  ] = await Promise.all([
    getPaginatedAdminProducts(
      {
        query,
        status,
        page: requestedPage,
        pageSize: PAGE_SIZE,
      }
    ),

    getAdminProductStatistics(),
  ]);

  const {
    products,
    total,
    page,
    totalPages,
    from,
    to,
    hasPreviousPage,
    hasNextPage,
  } = pagination;

  const statusFilters: Array<{
    value: AdminProductStatus;
    label: string;
    count: number;
  }> = [
    {
      value: "all",
      label: "All",
      count: statistics.total,
    },
    {
      value: "active",
      label: "Active",
      count: statistics.active,
    },
    {
      value: "inactive",
      label: "Inactive",
      count: statistics.inactive,
    },
    {
      value: "out-of-stock",
      label: "Out of stock",
      count:
        statistics.outOfStock,
    },
  ];

  const activeFilterLabel =
    statusFilters.find(
      (filter) =>
        filter.value ===
        status
    )?.label ?? "All";

  const paginationItems =
    getPaginationItems(
      page,
      totalPages
    );

  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      {/* Page heading */}
      <header className="border-b border-[var(--border-strong)] pb-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Marketplace
              administration
            </p>

            <h1 className="athimart-display-large mt-4 text-[var(--brand-blue-dark)]">
              Manage
              <br />

              <span className="text-[var(--brand-orange)]">
                Products
              </span>
            </h1>

            <p className="athimart-body-large mt-5 max-w-3xl">
              Review products shared
              by the AthiMart mobile
              application and website,
              including pricing,
              stock, featured status
              and store visibility.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="athimart-brand-button self-start text-white! xl:self-auto"
          >
            <PackagePlus
              aria-hidden="true"
              className="h-5 w-5 text-white!"
              strokeWidth={1.8}
            />

            <span className="text-white!">
              Add Product
            </span>
          </Link>
        </div>
      </header>

      {/* Created message */}
      {productCreated && (
        <div
          role="status"
          className="mt-7 flex items-start justify-between gap-5 border-l-4 border-[var(--success)] bg-green-50 px-5 py-4"
        >
          <div>
            <p className="font-[var(--font-body)] text-sm font-semibold text-[var(--success)]">
              Product created
              successfully.
            </p>

            <p className="mt-1 font-[var(--font-body)] text-xs leading-5 text-[var(--text-soft)]">
              The new product has
              been added to the shared
              AthiMart database.
            </p>
          </div>

          <Link
            href="/admin/products"
            aria-label="Close creation message"
            className="flex h-9 w-9 shrink-0 items-center justify-center text-[var(--success)] transition-colors hover:bg-white"
          >
            <X
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          </Link>
        </div>
      )}

      {/* Updated message */}
      {productUpdated && (
        <div
          role="status"
          className="mt-7 flex items-start justify-between gap-5 border-l-4 border-[var(--brand-blue)] bg-[var(--brand-blue-soft)] px-5 py-4"
        >
          <div>
            <p className="font-[var(--font-body)] text-sm font-semibold text-[var(--brand-blue-dark)]">
              Product updated
              successfully.
            </p>

            <p className="mt-1 font-[var(--font-body)] text-xs leading-5 text-[var(--text-soft)]">
              The updated product
              information has been
              saved in the AthiMart
              database.
            </p>
          </div>

          <Link
            href="/admin/products"
            aria-label="Close update message"
            className="flex h-9 w-9 shrink-0 items-center justify-center text-[var(--brand-blue)] transition-colors hover:bg-white"
          >
            <X
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          </Link>
        </div>
      )}

      {/* Activated message */}
      {productActivated && (
        <div
          role="status"
          className="mt-7 flex items-start justify-between gap-5 border-l-4 border-[var(--success)] bg-green-50 px-5 py-4"
        >
          <div className="flex items-start gap-3">
            <PackageCheck
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]"
              strokeWidth={1.8}
            />

            <div>
              <p className="font-[var(--font-body)] text-sm font-semibold text-[var(--success)]">
                Product activated
                successfully.
              </p>

              <p className="mt-1 font-[var(--font-body)] text-xs leading-5 text-[var(--text-soft)]">
                The product is now
                available in the
                AthiMart storefront.
              </p>
            </div>
          </div>

          <Link
            href="/admin/products"
            aria-label="Close activation message"
            className="flex h-9 w-9 shrink-0 items-center justify-center text-[var(--success)] transition-colors hover:bg-white"
          >
            <X
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          </Link>
        </div>
      )}

      {/* Deactivated message */}
      {productDeactivated && (
        <div
          role="status"
          className="mt-7 flex items-start justify-between gap-5 border-l-4 border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] px-5 py-4"
        >
          <div className="flex items-start gap-3">
            <Archive
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-orange-dark)]"
              strokeWidth={1.8}
            />

            <div>
              <p className="font-[var(--font-body)] text-sm font-semibold text-[var(--brand-orange-dark)]">
                Product deactivated
                successfully.
              </p>

              <p className="mt-1 font-[var(--font-body)] text-xs leading-5 text-[var(--text-soft)]">
                The product is hidden
                from the storefront
                but remains in the
                AthiMart database.
              </p>
            </div>
          </div>

          <Link
            href="/admin/products"
            aria-label="Close deactivation message"
            className="flex h-9 w-9 shrink-0 items-center justify-center text-[var(--brand-orange-dark)] transition-colors hover:bg-white"
          >
            <X
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          </Link>
        </div>
      )}

      {/* Deleted message */}
      {productDeleted && (
        <div
          role="status"
          className="mt-7 flex items-start justify-between gap-5 border-l-4 border-[var(--sale)] bg-red-50 px-5 py-4"
        >
          <div className="flex items-start gap-3">
            <Trash2
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sale)]"
              strokeWidth={1.8}
            />

            <div>
              <p className="font-[var(--font-body)] text-sm font-semibold text-[var(--sale)]">
                Product deleted
                permanently.
              </p>

              <p className="mt-1 font-[var(--font-body)] text-xs leading-5 text-[var(--text-soft)]">
                The product was
                removed from the
                AthiMart database and
                its recognized images
                were cleaned from the
                AthiMart server.
              </p>
            </div>
          </div>

          <Link
            href="/admin/products"
            aria-label="Close deletion message"
            className="flex h-9 w-9 shrink-0 items-center justify-center text-[var(--sale)] transition-colors hover:bg-white"
          >
            <X
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          </Link>
        </div>
      )}

      {/* Statistics */}
      <section
        aria-labelledby="product-statistics-heading"
        className="mt-8"
      >
        <h2
          id="product-statistics-heading"
          className="sr-only"
        >
          Product statistics
        </h2>

        <div className="grid border-l border-t border-[var(--border)] sm:grid-cols-2 xl:grid-cols-4">
          <article className="border-b border-r border-[var(--border)] bg-white p-5">
            <Boxes
              aria-hidden="true"
              className="h-6 w-6 text-[var(--brand-blue)]"
              strokeWidth={1.7}
            />

            <p className="athimart-label mt-6 text-[var(--text-muted)]">
              Total products
            </p>

            <p className="mt-2 font-[var(--font-display)] text-4xl font-light text-[var(--brand-blue-dark)]">
              {statistics.total}
            </p>
          </article>

          <article className="border-b border-r border-[var(--border)] bg-[var(--brand-blue-soft)] p-5">
            <PackageCheck
              aria-hidden="true"
              className="h-6 w-6 text-[var(--success)]"
              strokeWidth={1.7}
            />

            <p className="athimart-label mt-6 text-[var(--text-muted)]">
              Active
            </p>

            <p className="mt-2 font-[var(--font-display)] text-4xl font-light text-[var(--success)]">
              {statistics.active}
            </p>
          </article>

          <article className="border-b border-r border-[var(--border)] bg-white p-5">
            <Archive
              aria-hidden="true"
              className="h-6 w-6 text-[var(--brand-orange-dark)]"
              strokeWidth={1.7}
            />

            <p className="athimart-label mt-6 text-[var(--text-muted)]">
              Inactive
            </p>

            <p className="mt-2 font-[var(--font-display)] text-4xl font-light text-[var(--brand-orange-dark)]">
              {statistics.inactive}
            </p>
          </article>

          <article className="border-b border-r border-[var(--border)] bg-[var(--brand-orange-soft)] p-5">
            <CircleOff
              aria-hidden="true"
              className="h-6 w-6 text-[var(--sale)]"
              strokeWidth={1.7}
            />

            <p className="athimart-label mt-6 text-[var(--text-muted)]">
              Out of stock
            </p>

            <p className="mt-2 font-[var(--font-display)] text-4xl font-light text-[var(--sale)]">
              {
                statistics.outOfStock
              }
            </p>
          </article>
        </div>
      </section>

      {/* Search */}
      <section className="mt-8 border border-[var(--border)] bg-white p-5 sm:p-6">
        <form
          action="/admin/products"
          method="get"
          role="search"
          className="flex flex-col gap-4 lg:flex-row"
        >
          {status !== "all" && (
            <input
              type="hidden"
              name="status"
              value={status}
            />
          )}

          <label className="flex min-h-14 flex-1 items-center border border-[var(--border)] bg-[var(--linen-light)] px-4 transition-colors focus-within:border-[var(--brand-blue)]">
            <Search
              aria-hidden="true"
              className="mr-3 h-5 w-5 shrink-0 text-[var(--brand-blue)]"
              strokeWidth={1.8}
            />

            <span className="sr-only">
              Search products
            </span>

            <input
              type="search"
              name="q"
              defaultValue={query}
              maxLength={80}
              autoComplete="off"
              placeholder="Search name, brand, model, category or SKU..."
              className="min-w-0 flex-1 border-0 bg-transparent py-3 font-[var(--font-body)] text-sm text-[var(--text)] outline-none placeholder:text-[var(--placeholder)] focus:outline-none focus-visible:!outline-none"
            />

            {query && (
              <Link
                href={createProductsUrl(
                  {
                    query: "",
                    status,
                    page: 1,
                  }
                )}
                aria-label="Clear product search"
                className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center text-[var(--text-muted)] transition-colors hover:bg-white hover:text-[var(--sale)]"
              >
                <X
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              </Link>
            )}
          </label>

          <button
            type="submit"
            className="athimart-brand-button min-w-44 text-white!"
          >
            <Search
              aria-hidden="true"
              className="h-4 w-4 text-white!"
              strokeWidth={1.8}
            />

            <span className="text-white!">
              Search
            </span>
          </button>
        </form>
      </section>

      {/* Status filters */}
      <nav
        aria-label="Filter products by status"
        className="mt-6 flex gap-2 overflow-x-auto pb-2"
      >
        {statusFilters.map(
          (filter) => {
            const isActive =
              status ===
              filter.value;

            return (
              <Link
                key={
                  filter.value
                }
                href={createProductsUrl(
                  {
                    query,
                    status:
                      filter.value,
                    page: 1,
                  }
                )}
                aria-current={
                  isActive
                    ? "page"
                    : undefined
                }
                className={`inline-flex min-h-12 shrink-0 items-center gap-2 border px-4 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                  isActive
                    ? "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white!"
                    : "border-[var(--border)] bg-white text-[var(--text-muted)] hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
                }`}
              >
                <span
                  className={
                    isActive
                      ? "text-white!"
                      : ""
                  }
                >
                  {filter.label}
                </span>

                <span
                  className={`flex h-6 min-w-6 items-center justify-center px-1 ${
                    isActive
                      ? "bg-white/20 text-white!"
                      : "bg-[var(--linen)] text-[var(--text-muted)]"
                  }`}
                >
                  {filter.count}
                </span>
              </Link>
            );
          }
        )}
      </nav>

      {/* Product records */}
      <section
        aria-labelledby="admin-product-list-heading"
        className="mt-6"
      >
        <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Product records
            </p>

            <h2
              id="admin-product-list-heading"
              className="athimart-title-large mt-2 text-[var(--brand-blue-dark)]"
            >
              {query
                ? `Results for “${query}”`
                : status ===
                    "all"
                  ? "All Products"
                  : `${activeFilterLabel} Products`}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <Sparkles
              aria-hidden="true"
              className="h-4 w-4 text-[var(--brand-orange)]"
              strokeWidth={1.8}
            />

            <span className="athimart-label whitespace-nowrap">
              {total === 0
                ? "0 products"
                : `${from}–${to} of ${total}`}
            </span>
          </div>
        </div>

        {products.length ===
        0 ? (
          <div className="mt-6 border border-[var(--border)] bg-white p-10 text-center">
            <Boxes
              aria-hidden="true"
              className="mx-auto h-12 w-12 text-[var(--brand-blue)]"
              strokeWidth={1.5}
            />

            <h3 className="athimart-title-large mt-6 text-[var(--brand-blue-dark)]">
              No products found
            </h3>

            <p className="athimart-body mx-auto mt-4 max-w-xl">
              Try another search
              term, select another
              status or create a new
              product.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/admin/products"
                className="athimart-brand-outline-button"
              >
                Reset product list
              </Link>

              <Link
                href="/admin/products/new"
                className="athimart-brand-button text-white!"
              >
                <PackagePlus
                  aria-hidden="true"
                  className="h-5 w-5 text-white!"
                  strokeWidth={1.8}
                />

                <span className="text-white!">
                  Add Product
                </span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="mt-6 hidden overflow-x-auto border border-[var(--border)] bg-white lg:block">
              <table className="w-full min-w-[1260px] border-collapse text-left">
                <thead className="bg-[var(--brand-blue-dark)]">
                  <tr>
                    {[
                      "Product",
                      "Category",
                      "Price",
                      "Stock",
                      "Status",
                      "Featured",
                      "Actions",
                    ].map(
                      (heading) => (
                        <th
                          key={
                            heading
                          }
                          scope="col"
                          className="px-5 py-4 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.16em] text-white!"
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {products.map(
                    (product) => (
                      <tr
                        key={
                          product.id
                        }
                        className="border-t border-[var(--border)] transition-colors hover:bg-[var(--brand-blue-soft)]"
                      >
                        {/* Product */}
                        <td className="px-5 py-4">
                          <div className="flex min-w-64 items-center gap-4">
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-[var(--border)] bg-white">
                              {product.imageUrl ? (
                                <Image
                                  src={
                                    product.imageUrl
                                  }
                                  alt={`${product.name} product image`}
                                  fill
                                  sizes="64px"
                                  className="object-contain p-1.5"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <Boxes
                                    aria-hidden="true"
                                    className="h-5 w-5 text-[var(--text-muted)]"
                                    strokeWidth={
                                      1.7
                                    }
                                  />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                                {
                                  product.name
                                }
                              </p>

                              <p className="mt-1 truncate font-[var(--font-body)] text-[9px] uppercase tracking-[0.13em] text-[var(--text-muted)]">
                                {product.brand ??
                                  product.companyName}
                              </p>

                              <p className="mt-1 truncate font-mono text-[10px] text-[var(--text-muted)]">
                                {product.sku ??
                                  product.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4">
                          <p className="font-[var(--font-body)] text-xs font-semibold text-[var(--text)]">
                            {
                              product.category
                            }
                          </p>

                          <p className="mt-1 font-[var(--font-body)] text-[10px] text-[var(--text-muted)]">
                            {
                              product.subCategory
                            }
                          </p>
                        </td>

                        {/* Price */}
                        <td className="px-5 py-4">
                          <p className="font-[var(--font-body)] text-sm font-bold text-[var(--text)]">
                            {formatLkr(
                              product.priceLkr
                            )}
                          </p>

                          {product.discountPercent >
                            0 && (
                            <>
                              <p className="mt-1 font-[var(--font-body)] text-[10px] text-[var(--text-muted)] line-through">
                                {formatLkr(
                                  product.originalPriceLkr
                                )}
                              </p>

                              <p className="mt-1 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--sale)]">
                                {
                                  product.discountPercent
                                }
                                % off
                              </p>
                            </>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="px-5 py-4">
                          <span
                            className={`font-[var(--font-body)] text-sm font-semibold ${
                              product.stock <=
                              0
                                ? "text-[var(--sale)]"
                                : product.stock <=
                                    5
                                  ? "text-[var(--warning)]"
                                  : "text-[var(--success)]"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex border px-3 py-2 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] ${
                              product.isActive
                                ? "border-[var(--success)] bg-green-50 text-[var(--success)]"
                                : "border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] text-[var(--brand-orange-dark)]"
                            }`}
                          >
                            {product.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        {/* Featured */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex border px-3 py-2 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] ${
                              product.isFeatured
                                ? "border-[var(--brand-blue)] bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]"
                                : "border-[var(--border)] bg-white text-[var(--text-muted)]"
                            }`}
                          >
                            {product.isFeatured
                              ? "Featured"
                              : "Standard"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex min-w-72 flex-wrap items-center gap-2">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="inline-flex min-h-10 items-center justify-center gap-2 border border-[var(--brand-blue)] bg-[var(--brand-blue-soft)] px-3 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-blue)] transition-colors hover:bg-[var(--brand-blue)] hover:text-white!"
                            >
                              <Pencil
                                aria-hidden="true"
                                className="h-4 w-4"
                                strokeWidth={
                                  1.8
                                }
                              />

                              <span>
                                Edit
                              </span>
                            </Link>

                            <ProductStatusForm
                              productId={
                                product.id
                              }
                              isActive={
                                product.isActive
                              }
                            />

                            <ProductDeleteForm
                              productId={
                                product.id
                              }
                              productName={
                                product.name
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile and tablet cards */}
            <div className="mt-6 grid gap-4 lg:hidden">
              {products.map(
                (product) => (
                  <article
                    key={
                      product.id
                    }
                    className="border border-[var(--border)] bg-white p-4"
                  >
                    <div className="flex gap-4">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden border border-[var(--border)] bg-white">
                        {product.imageUrl ? (
                          <Image
                            src={
                              product.imageUrl
                            }
                            alt={`${product.name} product image`}
                            fill
                            sizes="96px"
                            className="object-contain p-2"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Boxes
                              aria-hidden="true"
                              className="h-6 w-6 text-[var(--text-muted)]"
                              strokeWidth={
                                1.7
                              }
                            />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-orange-dark)]">
                          {product.brand ??
                            product.companyName}
                        </p>

                        <h3 className="mt-1 font-[var(--font-display)] text-2xl font-light leading-tight text-[var(--brand-blue-dark)]">
                          {
                            product.name
                          }
                        </h3>

                        {product.model && (
                          <p className="mt-1 font-[var(--font-body)] text-[10px] text-[var(--text-muted)]">
                            {
                              product.model
                            }
                          </p>
                        )}

                        <p className="mt-2 font-[var(--font-body)] text-sm font-bold text-[var(--text)]">
                          {formatLkr(
                            product.priceLkr
                          )}
                        </p>

                        {product.discountPercent >
                          0 && (
                          <p className="mt-1 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--sale)]">
                            {
                              product.discountPercent
                            }
                            % off
                          </p>
                        )}
                      </div>
                    </div>

                    <dl className="mt-4 grid grid-cols-2 border-l border-t border-[var(--border)]">
                      <div className="border-b border-r border-[var(--border)] p-3">
                        <dt className="athimart-label text-[var(--text-muted)]">
                          Category
                        </dt>

                        <dd className="mt-2 font-[var(--font-body)] text-xs text-[var(--text)]">
                          {
                            product.category
                          }
                        </dd>
                      </div>

                      <div className="border-b border-r border-[var(--border)] p-3">
                        <dt className="athimart-label text-[var(--text-muted)]">
                          Stock
                        </dt>

                        <dd
                          className={`mt-2 font-[var(--font-body)] text-xs font-semibold ${
                            product.stock <=
                            0
                              ? "text-[var(--sale)]"
                              : product.stock <=
                                  5
                                ? "text-[var(--warning)]"
                                : "text-[var(--success)]"
                          }`}
                        >
                          {product.stock}
                        </dd>
                      </div>

                      <div className="border-b border-r border-[var(--border)] p-3">
                        <dt className="athimart-label text-[var(--text-muted)]">
                          Status
                        </dt>

                        <dd className="mt-2 font-[var(--font-body)] text-xs text-[var(--text)]">
                          {product.isActive
                            ? "Active"
                            : "Inactive"}
                        </dd>
                      </div>

                      <div className="border-b border-r border-[var(--border)] p-3">
                        <dt className="athimart-label text-[var(--text-muted)]">
                          Featured
                        </dt>

                        <dd className="mt-2 font-[var(--font-body)] text-xs text-[var(--text)]">
                          {product.isFeatured
                            ? "Yes"
                            : "No"}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 border border-[var(--brand-blue)] bg-[var(--brand-blue-soft)] px-4 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-blue)] transition-colors hover:bg-[var(--brand-blue)] hover:text-white!"
                      >
                        <Pencil
                          aria-hidden="true"
                          className="h-4 w-4"
                          strokeWidth={
                            1.8
                          }
                        />

                        <span>
                          Edit
                        </span>
                      </Link>

                      <div className="[&_form]:h-full [&_form]:w-full [&_button]:h-full [&_button]:min-h-11 [&_button]:w-full">
                        <ProductStatusForm
                          productId={
                            product.id
                          }
                          isActive={
                            product.isActive
                          }
                        />
                      </div>

                      <div className="[&_button]:min-h-11 [&_button]:w-full">
                        <ProductDeleteForm
                          productId={
                            product.id
                          }
                          productName={
                            product.name
                          }
                        />
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                aria-label="Product list pagination"
                className="mt-8 border border-[var(--border)] bg-white p-4 sm:p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-[var(--font-body)] text-sm font-semibold text-[var(--brand-blue-dark)]">
                      Showing {from}–
                      {to} of {total}{" "}
                      products
                    </p>

                    <p className="mt-1 font-[var(--font-body)] text-xs text-[var(--text-muted)]">
                      Page {page} of{" "}
                      {totalPages}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {hasPreviousPage ? (
                      <Link
                        href={createProductsUrl(
                          {
                            query,
                            status,
                            page:
                              page -
                              1,
                          }
                        )}
                        rel="prev"
                        aria-label="Go to previous product page"
                        className="inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--border)] bg-white px-4 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.13em] text-[var(--text-muted)] transition-colors hover:border-[var(--brand-blue)] hover:bg-[var(--brand-blue-soft)] hover:text-[var(--brand-blue)]"
                      >
                        <ChevronLeft
                          aria-hidden="true"
                          className="h-4 w-4"
                          strokeWidth={
                            1.8
                          }
                        />

                        <span>
                          Previous
                        </span>
                      </Link>
                    ) : (
                      <span
                        aria-disabled="true"
                        className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 border border-[var(--border)] bg-[var(--linen-light)] px-4 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.13em] text-[var(--text-muted)] opacity-45"
                      >
                        <ChevronLeft
                          aria-hidden="true"
                          className="h-4 w-4"
                          strokeWidth={
                            1.8
                          }
                        />

                        <span>
                          Previous
                        </span>
                      </span>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      {paginationItems.map(
                        (item) => {
                          if (
                            typeof item !==
                            "number"
                          ) {
                            return (
                              <span
                                key={
                                  item
                                }
                                aria-hidden="true"
                                className="flex h-11 min-w-8 items-center justify-center font-[var(--font-body)] text-sm text-[var(--text-muted)]"
                              >
                                …
                              </span>
                            );
                          }

                          const isCurrentPage =
                            item ===
                            page;

                          return (
                            <Link
                              key={
                                item
                              }
                              href={createProductsUrl(
                                {
                                  query,
                                  status,
                                  page: item,
                                }
                              )}
                              aria-current={
                                isCurrentPage
                                  ? "page"
                                  : undefined
                              }
                              aria-label={`Go to product page ${item}`}
                              className={`flex h-11 min-w-11 items-center justify-center border px-3 font-[var(--font-body)] text-xs font-semibold transition-colors ${
                                isCurrentPage
                                  ? "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white!"
                                  : "border-[var(--border)] bg-white text-[var(--text-muted)] hover:border-[var(--brand-blue)] hover:bg-[var(--brand-blue-soft)] hover:text-[var(--brand-blue)]"
                              }`}
                            >
                              <span
                                className={
                                  isCurrentPage
                                    ? "text-white!"
                                    : ""
                                }
                              >
                                {item}
                              </span>
                            </Link>
                          );
                        }
                      )}
                    </div>

                    {hasNextPage ? (
                      <Link
                        href={createProductsUrl(
                          {
                            query,
                            status,
                            page:
                              page +
                              1,
                          }
                        )}
                        rel="next"
                        aria-label="Go to next product page"
                        className="inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--brand-blue)] bg-[var(--brand-blue-soft)] px-4 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.13em] text-[var(--brand-blue)] transition-colors hover:bg-[var(--brand-blue)] hover:text-white!"
                      >
                        <span>
                          Next
                        </span>

                        <ChevronRight
                          aria-hidden="true"
                          className="h-4 w-4"
                          strokeWidth={
                            1.8
                          }
                        />
                      </Link>
                    ) : (
                      <span
                        aria-disabled="true"
                        className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 border border-[var(--border)] bg-[var(--linen-light)] px-4 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.13em] text-[var(--text-muted)] opacity-45"
                      >
                        <span>
                          Next
                        </span>

                        <ChevronRight
                          aria-hidden="true"
                          className="h-4 w-4"
                          strokeWidth={
                            1.8
                          }
                        />
                      </span>
                    )}
                  </div>
                </div>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
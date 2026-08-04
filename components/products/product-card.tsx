// components/products/product-card.tsx

import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  CircleX,
} from "lucide-react";

import { getProductPath } from "@/lib/products/product-url";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

/**
 * Format Sri Lankan product prices.
 *
 * Example:
 * 2000 → Rs 2,000
 */
function formatLkr(value: number): string {
  const formattedAmount = new Intl.NumberFormat(
    "en-LK",
    {
      maximumFractionDigits: 0,
    }
  ).format(value);

  return `Rs ${formattedAmount}`;
}

export function ProductCard({
  product,
  priority = false,
}: Readonly<ProductCardProps>) {
  const currentPrice = product.prices.LKR;
  const originalPrice =
    product.originalPrices.LKR;

  const hasPrice = currentPrice > 0;

  const hasDiscount =
    product.discountPercent > 0 &&
    originalPrice > currentPrice;

  const isOutOfStock = product.stock <= 0;

  const brandName =
    product.brand ??
    product.companyName;

  const productType =
    product.subCategory ||
    product.category;

  return (
    <article className="group h-full min-w-0">
      <Link
        href={getProductPath(product)}
        aria-label={`View ${product.name}`}
        className="flex h-full flex-col overflow-hidden border border-[var(--border)] bg-white transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[var(--black)] hover:shadow-[0_18px_45px_rgba(23,23,23,0.11)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--black)]"
      >
        {/* Product image */}
        <div className="relative aspect-[4/5] overflow-hidden border-b border-[var(--border)] bg-white">
          {product.imageUrls[0] ? (
            <Image
              src={product.imageUrls[0]}
              alt={`${product.name} by ${brandName}`}
              fill
              priority={priority}
              sizes="
                (max-width: 767px) 50vw,
                (max-width: 1279px) 33vw,
                380px
              "
              className="object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-[1.045] sm:p-4"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">
              <span aria-hidden="true">
                {product.emoji}
              </span>

              <span className="sr-only">
                No product image available
              </span>
            </div>
          )}

          {/* Discount badge */}
          {product.discountPercent > 0 && (
            <span className="absolute left-0 top-0 z-10 bg-[var(--sale)] px-3 py-2 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-white">
              {product.discountPercent}% off
            </span>
          )}

          {/* Out-of-stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-[1px]">
              <span className="athimart-label border border-[var(--black)] bg-white px-4 py-2.5 text-center">
                Out of stock
              </span>
            </div>
          )}
        </div>

        {/* Product information */}
        <div className="flex flex-1 flex-col p-3.5 sm:p-5">
          <div>
            <p className="truncate font-[var(--font-body)] text-[9px] font-semibold uppercase leading-normal tracking-[0.2em] text-[var(--text-muted)] sm:text-[10px]">
              {brandName}
            </p>

            <h3 className="mt-1.5 line-clamp-2 font-[var(--font-display)] text-[21px] font-normal leading-[1.1] tracking-[0.015em] text-[var(--text)] transition-opacity duration-200 group-hover:opacity-70 sm:mt-2 sm:text-[26px]">
              {product.name}
            </h3>

            <p className="mt-2 truncate font-[var(--font-body)] text-[9px] font-medium uppercase leading-normal tracking-[0.14em] text-[var(--text-muted)] sm:mt-2.5 sm:text-[10px]">
              {productType}
            </p>
          </div>

          {/* Price and availability */}
          <div className="mt-auto pt-4 sm:pt-5">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              {hasPrice ? (
                <>
                  <p className="font-[var(--font-body)] text-sm font-bold leading-tight text-[var(--text)] sm:text-lg">
                    {formatLkr(currentPrice)}
                  </p>

                  {hasDiscount && (
                    <p className="font-[var(--font-body)] text-[10px] leading-tight text-[var(--text-muted)] line-through sm:text-xs">
                      {formatLkr(
                        originalPrice
                      )}
                    </p>
                  )}
                </>
              ) : (
                <p className="font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--warning)] sm:text-xs">
                  Price unavailable
                </p>
              )}
            </div>

            <div
              className={`mt-3 inline-flex min-h-7 max-w-full items-center gap-1.5 border px-2 py-1 sm:gap-2 sm:px-2.5 ${
                isOutOfStock
                  ? "border-[var(--sale)] text-[var(--sale)]"
                  : "border-[var(--success)] text-[var(--success)]"
              }`}
            >
              {isOutOfStock ? (
                <CircleX
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0"
                  strokeWidth={2}
                />
              ) : (
                <CheckCircle2
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0"
                  strokeWidth={2}
                />
              )}

              <span className="truncate font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.11em] sm:text-[9px] sm:tracking-[0.14em]">
                {isOutOfStock
                  ? "Currently unavailable"
                  : `${product.stock} in stock`}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
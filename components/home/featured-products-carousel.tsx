"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getProductPath } from "@/lib/products/product-url";
import type { Product } from "@/types/product";

interface FeaturedProductsCarouselProps {
  products: Product[];
}

function formatPrice(
  value: number
): string {
  return `Rs ${new Intl.NumberFormat(
    "en-LK",
    {
      maximumFractionDigits: 0,
    }
  ).format(value)}`;
}

export function FeaturedProductsCarousel({
  products,
}: Readonly<FeaturedProductsCarouselProps>) {
  const [activeIndex, setActiveIndex] =
    useState(0);

  useEffect(() => {
    if (products.length < 2) {
      return;
    }

    const rotationTimer = window.setInterval(() => {
      setActiveIndex(
        (currentIndex) =>
          (currentIndex + 1) % products.length
      );
    }, 3000);

    return () => {
      window.clearInterval(rotationTimer);
    };
  }, [products.length]);

  const activeProduct =
    products[activeIndex] ??
    products[0];

  if (!activeProduct) {
    return (
      <div className="relative flex aspect-[1.34/1] items-end overflow-hidden rounded-xl bg-[radial-gradient(circle_at_52%_43%,#58647e_0_8%,#202c43_9%_15%,#080d16_48%)] p-4 text-white">
        <div className="absolute left-1/2 top-1/2 h-28 w-36 -translate-x-1/2 -translate-y-1/2 rounded bg-[#3f4653] shadow-[0_18px_30px_rgba(0,0,0,0.45)]" />

        <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-[7px] border-[#111827] bg-[#89909a] shadow-[inset_0_0_0_3px_#3c4d69]" />

        <div className="relative">
          <p className="font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-orange)]">
            Featured AI innovation
          </p>

          <h2 className="mt-1 font-[var(--font-body)] text-lg font-bold">
            Athi Sense Vision Pin
          </h2>

          <p className="text-xs text-white/85">
            Multimodal reasoning wearable · Rs 389
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      aria-live="polite"
      aria-label="Featured products"
      className="relative"
    >
      <Link
        key={activeProduct.id}
        href={getProductPath(activeProduct)}
        className="athimart-featured-product-slide group relative block aspect-[1.34/1] overflow-hidden rounded-xl bg-[#101521]"
      >
        {activeProduct.imageUrls[0] ? (
          <Image
            src={activeProduct.imageUrls[0]}
            alt={activeProduct.name}
            fill
            priority={activeIndex === 0}
            sizes="(max-width: 1023px) 100vw, 470px"
            className="object-cover opacity-90 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_50%_44%,#5b6680_0_7%,#273147_8%_14%,#101521_38%)] text-7xl">
            {activeProduct.emoji}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050912] via-[#050912]/80 to-transparent px-4 pb-4 pt-16 text-white">
          <p className="font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-orange)]">
            Featured product
          </p>

          <h2 className="mt-1 font-[var(--font-body)] text-base font-bold leading-tight sm:text-lg">
            {activeProduct.name}
          </h2>

          <p className="mt-1 text-xs text-white/85">
            {activeProduct.subCategory ||
              activeProduct.category} · {formatPrice(
              activeProduct.prices.LKR
            )}
          </p>
        </div>
      </Link>

      {products.length > 1 && (
        <div
          aria-hidden="true"
          className="absolute right-3 top-3 flex gap-1.5"
        >
          {products.map((product, index) => (
            <span
              key={product.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "w-5 bg-white"
                  : "w-1.5 bg-white/55"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

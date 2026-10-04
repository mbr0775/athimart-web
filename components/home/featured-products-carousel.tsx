"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { getProductPath } from "@/lib/products/product-url";
import type { Product } from "@/types/product";

interface FeaturedProductsCarouselProps {
  products: Product[];
}

function formatPrice(value: number): string {
  return `Rs ${new Intl.NumberFormat("en-LK", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

export function FeaturedProductsCarousel({
  products,
}: Readonly<FeaturedProductsCarouselProps>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const currentIndex = activeIndex % Math.max(products.length, 1);
  const activeProduct = products[currentIndex];

  useEffect(() => {
    if (products.length < 2 || isPaused || manuallyPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % products.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [products.length, isPaused, manuallyPaused]);

  if (!activeProduct) return null;

  function moveSlide(direction: number) {
    setActiveIndex((index) =>
      (index + direction + products.length) % products.length
    );
  }

  return (
    <section
      aria-labelledby="featured-drops-heading"
      className="bg-[#faf7ef] py-10 sm:py-14"
    >
      <div className="athimart-container">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8c8778] sm:text-xs">
                Handpicked for you
              </p>
              <h2 id="featured-drops-heading" className="!mt-2 font-(family-name:--font-display) text-2xl leading-tight text-[#303024] sm:text-3xl">
                Featured Drops
              </h2>
            </div>
            <Link href="/shop" className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#494638] hover:underline sm:text-sm">
              View all <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>

          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
            }}
            className="overflow-hidden rounded-3xl border border-[#e6e2d8] bg-white"
          >
            <Link
              href={getProductPath(activeProduct)}
              className="group grid focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#494638] sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
            >
              <div className="relative h-52 bg-[#efede7] sm:h-72">
                {activeProduct.imageUrls[0] ? (
                  <Image
                    src={activeProduct.imageUrls[0]}
                    alt={activeProduct.name}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 45vw, 400px"
                    className="object-contain p-5 transition-transform duration-500 group-hover:scale-105 sm:p-7 motion-reduce:transition-none"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-6xl">
                    {activeProduct.emoji || "🛍️"}
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-col justify-center p-5 sm:p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8c8778]">
                  {activeProduct.subCategory || activeProduct.category}
                </p>
                <h3 className="!mt-2 line-clamp-2 break-words text-xl font-semibold leading-snug text-[#303024] sm:text-2xl">
                  {activeProduct.name}
                </h3>
                <p className="!mt-3 text-lg font-semibold text-[#494638]">
                  {formatPrice(activeProduct.prices.LKR)}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#494638]">
                  Explore product <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
                </span>
              </div>
            </Link>

            {products.length > 1 && (
              <div className="flex items-center justify-between border-t border-[#efede7] px-5 py-3">
                <p aria-live={isPaused || manuallyPaused ? "polite" : "off"} aria-atomic="true" className="text-xs text-[#8c8778]">
                  {currentIndex + 1} / {products.length}
                </p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setManuallyPaused((paused) => !paused)} className="min-h-10 rounded-full px-3 text-xs text-[#494638] hover:bg-[#efede7]" aria-label={manuallyPaused ? "Resume featured drops" : "Pause featured drops"}>
                    {manuallyPaused ? "Play" : "Pause"}
                  </button>
                  <button type="button" onClick={() => moveSlide(-1)} aria-label="Previous featured drop" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e6e2d8] text-[#494638] hover:bg-[#efede7]">
                    <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => moveSlide(1)} aria-label="Next featured drop" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e6e2d8] text-[#494638] hover:bg-[#efede7]">
                    <ChevronRight aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

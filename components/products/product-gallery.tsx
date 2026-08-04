// components/products/product-gallery.tsx

"use client";

import Image from "next/image";
import { m } from "motion/react";
import { useMemo, useState } from "react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  companyName: string;
  fallbackEmoji: string;
  discountPercent: number;
}

export function ProductGallery({
  images,
  productName,
  companyName,
  fallbackEmoji,
  discountPercent,
}: Readonly<ProductGalleryProps>) {
  /*
   * Remove blank and duplicate image URLs.
   */
  const galleryImages = useMemo(
    () =>
      Array.from(
        new Set(
          images
            .map((image) => image.trim())
            .filter(Boolean)
        )
      ),
    [images]
  );

  const [selectedIndex, setSelectedIndex] =
    useState(0);

  const selectedImage =
    galleryImages[selectedIndex] ??
    galleryImages[0] ??
    null;

  return (
    <section
      aria-label={`${productName} image gallery`}
      className="min-w-0"
    >
      {/* Main selected image */}
      <div className="relative aspect-[4/5] overflow-hidden border border-[var(--border)] bg-white">
        {selectedImage ? (
          <m.div
            key={selectedImage}
            initial={{
              opacity: 0,
              scale: 0.985,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0"
          >
            <Image
              src={selectedImage}
              alt={`${productName} by ${companyName} — image ${
                selectedIndex + 1
              }`}
              fill
              priority={selectedIndex === 0}
              sizes="
                (max-width: 1023px) 100vw,
                55vw
              "
              className="object-contain p-5 sm:p-8"
            />
          </m.div>
        ) : (
          <div className="flex h-full items-center justify-center text-8xl">
            <span aria-hidden="true">
              {fallbackEmoji}
            </span>

            <span className="sr-only">
              No product image available
            </span>
          </div>
        )}

        {discountPercent > 0 && (
          <span className="absolute left-0 top-0 z-20 bg-[var(--sale)] px-4 py-3 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
            {discountPercent}% off
          </span>
        )}

        {galleryImages.length > 1 && (
          <span className="absolute bottom-4 right-4 z-20 border border-[var(--border)] bg-white/95 px-3 py-2 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text)] backdrop-blur">
            {selectedIndex + 1} /{" "}
            {galleryImages.length}
          </span>
        )}
      </div>

      {/* Clickable thumbnail images */}
      {galleryImages.length > 1 && (
        <div
          className="mt-4 flex gap-3 overflow-x-auto pb-2"
          role="group"
          aria-label="Choose a product image"
        >
          {galleryImages.map(
            (imageUrl, index) => {
              const isSelected =
                index === selectedIndex;

              return (
                <button
                  key={`${imageUrl}-${index}`}
                  type="button"
                  onClick={() =>
                    setSelectedIndex(index)
                  }
                  aria-label={`Show ${productName} image ${
                    index + 1
                  }`}
                  aria-pressed={isSelected}
                  className={`group relative aspect-square w-24 shrink-0 overflow-hidden border bg-white transition-all duration-200 sm:w-28 ${
                    isSelected
                      ? "border-[var(--black)] shadow-[0_8px_20px_rgba(23,23,23,0.10)]"
                      : "border-[var(--border)] hover:-translate-y-0.5 hover:border-[var(--black)]"
                  }`}
                >
                  <Image
                    src={imageUrl}
                    alt={`${productName} thumbnail ${
                      index + 1
                    }`}
                    fill
                    sizes="112px"
                    className={`object-contain p-2 transition duration-200 ${
                      isSelected
                        ? "opacity-100"
                        : "opacity-65 group-hover:opacity-100"
                    }`}
                  />

                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-[3px] bg-[var(--black)]"
                    />
                  )}
                </button>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}
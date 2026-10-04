"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { editorialFont } from "@/lib/fonts";
import { getProductPath } from "@/lib/products/product-url";
import type { Product } from "@/types/product";
import styles from "./latest-products-section.module.css";

interface LatestProductsSectionProps {
  products: Product[];
}

const priceFormatter = new Intl.NumberFormat("en-LK", {
  maximumFractionDigits: 0,
});

function formatPrice(price: number) {
  return `Rs ${priceFormatter.format(price)}`;
}

export default function LatestProductsSection({
  products,
}: Readonly<LatestProductsSectionProps>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    first: 1,
    last: Math.min(4, products.length),
    canPrevious: false,
    canNext: false,
    progress: 0,
  });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;

    function measure() {
      if (!track) return;
      const cards = Array.from(track.children) as HTMLElement[];
      const left = track.scrollLeft;
      const right = left + track.clientWidth;
      // Exclude cards that only peek into view from the visible range.
      const visible = cards.flatMap((card, index) => {
        const overlap = Math.min(right, card.offsetLeft + card.offsetWidth)
          - Math.max(left, card.offsetLeft);
        return overlap >= card.offsetWidth / 2 ? [index + 1] : [];
      });
      setPosition({
        first: visible[0] ?? 1,
        last: visible.at(-1) ?? 1,
        canPrevious: left > 2,
        canNext: right < track.scrollWidth - 2,
        progress: Math.min(1, right / Math.max(track.scrollWidth, 1)),
      });
    }

    function queueMeasure() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }

    queueMeasure();
    const observer = new ResizeObserver(queueMeasure);
    observer.observe(track);
    track.addEventListener("scroll", queueMeasure, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      track.removeEventListener("scroll", queueMeasure);
    };
  }, [products]);

  function move(direction: number) {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const current = Math.max(0, cards.findIndex((card) => card.offsetLeft >= track.scrollLeft - 2));
    const step = Math.max(1, position.last - position.first + 1);
    const target = Math.max(0, Math.min(cards.length - 1, current + direction * step));
    track.scrollTo({
      left: (cards[target]?.offsetLeft ?? 8) - 8,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  if (products.length === 0) return null;

  return (
    <section
      id="latest-products"
      aria-labelledby="latest-products-heading"
      className={`${styles.section} ${editorialFont.variable}`}
    >
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              <span aria-hidden="true" className={styles.statusDot} />
              Recently Added
            </p>
            <h2 id="latest-products-heading" className={styles.heading}>
              Latest <em>Products</em><span className={styles.headingDot}>.</span>
            </h2>
            <p className={styles.subtitle}>
              Fresh finds. Everyday favourites. Your next discovery.
            </p>
          </div>
          <Link href="/shop" className={styles.browseLink}>
            Browse all products
            <span className={styles.browseIcon}>
              <ArrowUpRight size={18} aria-hidden="true" />
            </span>
          </Link>
        </header>

        <div
          ref={trackRef}
          id="latest-products-track"
          className={styles.track}
          role="group"
          aria-label="Latest products carousel"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              move(event.key === "ArrowLeft" ? -1 : 1);
            }
          }}
        >
          {products.map((product, index) => {
            const price = product.prices.LKR;
            const originalPrice = product.originalPrices.LKR;
            const hasDiscount = price > 0 && originalPrice > price
              && product.discountPercent > 0;

            return (
              <article key={product.id} className={styles.card} data-home-reveal>
                <Link href={getProductPath(product)} className={styles.productLink}>
                  <div className={styles.imageStage} data-tone={index % 4}>
                    <div className={styles.badges}>
                      <span className={styles.newBadge}>New in</span>
                      {hasDiscount && (
                        <span className={styles.discountBadge}>−{product.discountPercent}%</span>
                      )}
                    </div>
                    <span className={styles.cardNumber} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {product.imageUrls[0] ? (
                      <Image
                        src={product.imageUrls[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 639px) 85vw, (max-width: 1023px) 47vw, (max-width: 1904px) 21vw, 400px"
                        className={styles.image}
                      />
                    ) : (
                      <div className={styles.placeholder}>
                        <span aria-hidden="true">{product.emoji || "🛍️"}</span>
                        <span className="sr-only">No product image available</span>
                      </div>
                    )}
                    <span className={styles.imageCta} aria-hidden="true">
                      Take a closer look <ArrowUpRight size={16} />
                    </span>
                  </div>
                  <div className={styles.details}>
                    <p className={styles.category}>{product.subCategory || product.category}</p>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <div className={styles.cardFooter}>
                      <div>
                        <div className={styles.priceRow}>
                          <span className={styles.price}>
                            {price > 0 ? formatPrice(price) : "Price unavailable"}
                          </span>
                          {hasDiscount && (
                            <span className={styles.originalPrice}>
                              <span className="sr-only">Original price </span>
                              <s>{formatPrice(originalPrice)}</s>
                            </span>
                          )}
                        </div>
                        {product.stock <= 0 && (
                          <span className={styles.unavailable}>Out of stock</span>
                        )}
                      </div>
                      <span className={styles.productArrow} aria-hidden="true">
                        <ArrowUpRight size={18} />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>

        <footer className={styles.navigation}>
          <div className={styles.counter} aria-live="polite" aria-atomic="true">
            <span className="sr-only">Showing products </span>
            <span>{String(position.first).padStart(2, "0")}</span>
            <span className={styles.counterDash}>—</span>
            <span>{String(position.last).padStart(2, "0")}</span>
            <span className={styles.counterTotal}>
              <span aria-hidden="true">/ </span>
              <span className="sr-only"> of </span>
              {String(products.length).padStart(2, "0")}
            </span>
          </div>
          <div className={styles.progress} aria-hidden="true">
            <span style={{ transform: `scaleX(${position.progress})` }} />
          </div>
          <div className={styles.controls}>
            {(position.canPrevious || position.canNext) && (
              <span className={styles.scrollHint}>A little more to love</span>
            )}
            <button
              type="button"
              className={styles.previousButton}
              aria-label="Previous latest products"
              aria-controls="latest-products-track"
              disabled={!position.canPrevious}
              onClick={() => move(-1)}
            >
              <ArrowLeft size={19} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.nextButton}
              aria-label="Next latest products"
              aria-controls="latest-products-track"
              disabled={!position.canNext}
              onClick={() => move(1)}
            >
              <ArrowRight size={19} aria-hidden="true" />
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}

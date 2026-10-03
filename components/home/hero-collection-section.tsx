"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  ArrowDown,
  ArrowRight,
} from "lucide-react";

import type { Product } from "@/types/product";
import { getProductPath } from "@/lib/products/product-url";

interface Props {
  featuredProducts: Product[];
}

function formatPrice(value: number) {
  return `Rs ${new Intl.NumberFormat("en-LK", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

export default function HeroCollectionSection({
  featuredProducts,
}: Props) {
  const [productIndex, setProductIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (featuredProducts.length <= 1 || shouldReduceMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setProductIndex((current) => (
        current === featuredProducts.length - 1
          ? 0
          : current + 1
      ));
    }, 5200);

    return () => window.clearInterval(timer);
  }, [featuredProducts.length, shouldReduceMotion]);

  const product = featuredProducts[productIndex];
  const imageSrc = product?.imageUrls?.[0];

  return (
    <section
      className="
        relative
        isolate
        min-h-[760px]
        overflow-hidden
        border-b
        border-black/10
        bg-[#d9dee1]
        text-[#101214]
        md:min-h-[calc(100svh-5rem)]
      "
    >
      {/* Soft studio-light background */}
      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          -z-30
          bg-[radial-gradient(circle_at_50%_39%,rgba(255,255,255,0.98)_0%,rgba(238,242,244,0.9)_24%,rgba(205,213,218,0.88)_58%,rgba(178,189,196,0.92)_100%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute
          left-1/2
          top-[39%]
          -z-20
          h-[45vw]
          min-h-[360px]
          w-[45vw]
          min-w-[360px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          border
          border-white/55
          shadow-[0_0_120px_rgba(255,255,255,0.45)]
        "
      />

      {/* Top editorial details */}
      <div
        className="
          athimart-container
          relative
          z-40
          flex
          items-start
          justify-between
          pt-7
          text-[10px]
          font-medium
          uppercase
          tracking-[0.28em]
          text-black/55
          sm:pt-9
          sm:text-xs
        "
      >
        <p>AthiMart</p>

        <div className="hidden items-center gap-4 sm:flex">
          <span className="h-px w-24 bg-black/20 lg:w-40" />
          <span>Connected Marketplace</span>
          <span className="h-px w-24 bg-black/20 lg:w-40" />
        </div>

        <p>Est. 2026</p>
      </div>

      {/* Oversized reference-style typography */}
      <motion.div
        aria-hidden="true"
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[39%]
          z-0
          -translate-x-1/2
          -translate-y-1/2
          whitespace-nowrap
          font-[var(--font-oswald)]
          text-[clamp(9rem,31vw,31rem)]
          font-medium
          leading-[0.72]
          tracking-[-0.085em]
          text-white
          select-none
        "
      >
        ATHI
      </motion.div>

      {/* Product stage */}
      <div
        className="
          athimart-container
          relative
          z-20
          flex
          min-h-[610px]
          items-center
          justify-center
          pt-2
          sm:min-h-[650px]
          md:min-h-[calc(100svh-9rem)]
        "
      >
        <div
          aria-hidden="true"
          className="
            absolute
            left-1/2
            top-[69%]
            -z-10
            h-[17vw]
            min-h-[120px]
            w-[72vw]
            max-w-[980px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-[50%]
            bg-white/95
            shadow-[0_-20px_80px_rgba(255,255,255,0.65),0_35px_80px_rgba(44,56,65,0.16)]
          "
        />

        <AnimatePresence mode="wait" initial={false}>
          {product ? (
            <motion.div
              key={product.id}
              initial={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { opacity: 0, y: 28, scale: 0.94, rotate: -2 }
              }
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : {
                      opacity: 1,
                      y: [0, -10, 0],
                      scale: 1,
                      rotate: [-0.8, 0.8, -0.8],
                    }
              }
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -22, scale: 0.97 }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0.2 }
                  : {
                      opacity: { duration: 0.55 },
                      scale: { duration: 0.7 },
                      y: {
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                      rotate: {
                        duration: 6.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }
              }
              className="
                relative
                z-20
                mt-5
                aspect-square
                w-[min(78vw,520px)]
                sm:w-[min(62vw,560px)]
                lg:w-[min(46vw,620px)]
              "
            >
              <Link
                href={getProductPath(product)}
                aria-label={`View ${product.name}`}
                className="group block h-full w-full"
              >
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 640px) 78vw, (max-width: 1024px) 62vw, 46vw"
                    className="
                      object-contain
                      drop-shadow-[0_30px_35px_rgba(31,42,49,0.22)]
                      transition-transform
                      duration-700
                      group-hover:scale-[1.035]
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-full
                      w-full
                      items-center
                      justify-center
                      text-[9rem]
                      drop-shadow-[0_30px_35px_rgba(31,42,49,0.18)]
                    "
                  >
                    {product.emoji ?? "A"}
                  </div>
                )}
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="
                relative
                z-20
                flex
                aspect-square
                w-[min(72vw,500px)]
                items-center
                justify-center
                rounded-full
                border
                border-white/70
                bg-white/25
                font-[var(--font-oswald)]
                text-[9rem]
                font-medium
                text-white
                backdrop-blur-sm
              "
            >
              A
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom content */}
      <div
        className="
          athimart-container
          relative
          z-40
          -mt-20
          grid
          gap-7
          pb-8
          sm:-mt-24
          sm:pb-10
          lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
          lg:items-end
        "
      >
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="max-w-sm"
        >
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.28em]
              text-[#123f9e]
            "
          >
            Shop beyond ordinary
          </p>

          <p className="mt-3 text-sm leading-6 text-black/60 sm:text-base">
            Technology, fashion, natural products and digital services,
            connected in one marketplace.
          </p>

          <Link
            href="/shop"
            className="
              group
              mt-5
              inline-flex
              items-center
              gap-3
              border-b
              border-black/35
              pb-2
              text-sm
              font-semibold
              uppercase
              tracking-[0.16em]
              transition-colors
              hover:border-[#ff7900]
              hover:text-[#ff7900]
            "
          >
            Start shopping
            <ArrowRight
              className="
                h-4
                w-4
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </Link>
        </motion.div>

        <a
          href="#categories"
          aria-label="Scroll to shop categories"
          className="
            hidden
            flex-col
            items-center
            gap-3
            text-[10px]
            font-medium
            uppercase
            tracking-[0.3em]
            text-black/45
            lg:flex
          "
        >
          <span>Scroll</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </a>

        <AnimatePresence mode="wait" initial={false}>
          {product ? (
            <motion.div
              key={`meta-${product.id}`}
              initial={shouldReduceMotion ? false : { opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.45 }}
              className="
                border-t
                border-black/15
                pt-4
                lg:justify-self-end
                lg:border-l
                lg:border-t-0
                lg:pl-6
                lg:pt-0
                lg:text-right
              "
            >
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.28em]
                  text-black/45
                "
              >
                Featured now
              </p>

              <Link
                href={getProductPath(product)}
                className="
                  mt-2
                  block
                  max-w-sm
                  font-[var(--font-oswald)]
                  text-2xl
                  font-light
                  leading-tight
                  transition-colors
                  hover:text-[#123f9e]
                  sm:text-3xl
                "
              >
                {product.name}
              </Link>

              <div
                className="
                  mt-2
                  flex
                  flex-wrap
                  gap-x-3
                  gap-y-1
                  text-xs
                  uppercase
                  tracking-[0.16em]
                  text-black/55
                  lg:justify-end
                "
              >
                {product.subCategory ? <span>{product.subCategory}</span> : null}
                <span>{formatPrice(product.prices.LKR)}</span>
              </div>
            </motion.div>
          ) : (
            <div className="lg:justify-self-end lg:text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-black/45">
                One connected marketplace
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Product pagination */}
      {featuredProducts.length > 1 ? (
        <div
          className="
            absolute
            bottom-7
            right-5
            z-50
            hidden
            items-center
            gap-2
            sm:right-8
            md:flex
            lg:right-12
          "
        >
          {featuredProducts.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show ${item.name}`}
              aria-current={productIndex === index ? "true" : undefined}
              onClick={() => setProductIndex(index)}
              className={`
                h-1.5
                rounded-full
                transition-all
                duration-300
                ${productIndex === index
                  ? "w-8 bg-[#ff7900]"
                  : "w-1.5 bg-black/25 hover:bg-black/45"
                }
              `}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

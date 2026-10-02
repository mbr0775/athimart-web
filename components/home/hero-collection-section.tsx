"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowRight, MoveRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { getProductPath } from "@/lib/products/product-url";
import type { Product } from "@/types/product";

interface Props {
  featuredProducts: Product[];
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30";

const marketLabels = [
  "TECHNOLOGY",
  "FASHION",
  "WELLNESS",
  "DIGITAL SERVICES",
];

export default function HeroCollectionSection({
  featuredProducts,
}: Props) {
  const [productIndex, setProductIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const displayProducts = featuredProducts.slice(0, 5);
  const productCount = displayProducts.length;

  useEffect(() => {
    setProductIndex(0);

    if (productCount <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setProductIndex((previous) => (previous + 1) % productCount);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [productCount]);

  const product = displayProducts[productIndex] ?? null;
  const productKey = product?.id ?? "athimart-preview";
  const productImage = product?.imageUrls?.[0] ?? FALLBACK_IMAGE;
  const productHref = product ? getProductPath(product) : "/shop";
  const productName = product?.name ?? "Discover what is next";
  const productCompany = product?.companyName ?? "AthiMart";
  const productPrice = product
    ? `Rs ${new Intl.NumberFormat("en-LK").format(product.prices.LKR)}`
    : "Curated marketplace";

  return (
    <section className="relative isolate overflow-hidden border-b border-black/10 bg-[#e9e8e3] text-[#111111]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-8 h-80 w-80 rounded-full border border-black/10 md:h-[30rem] md:w-[30rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-36 top-36 h-[28rem] w-[28rem] rounded-full border border-[#ff7900]/30 lg:h-[38rem] lg:w-[38rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-[63%] hidden w-px bg-black/10 lg:block"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[31%] z-0 hidden select-none overflow-hidden lg:block"
      >
        <p
          className="whitespace-nowrap font-[var(--font-display)] text-[clamp(12rem,24vw,24rem)] font-light leading-[0.72] tracking-[-0.08em]"
          style={{
            color: "transparent",
            WebkitTextStroke: "1px rgba(17, 17, 17, 0.12)",
          }}
        >
          ATHIMART
        </p>
      </div>

      <div className="athimart-container relative z-10 flex min-h-[760px] flex-col py-5 sm:min-h-[820px] sm:py-7 lg:min-h-[calc(100svh-92px)] lg:py-8">
        <div className="flex items-center justify-between gap-5 border-b border-black/15 pb-4 text-[10px] font-semibold uppercase tracking-[0.22em] sm:text-[11px]">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#ff7900]" />
            <span>AthiMart / Connected Marketplace</span>
          </div>

          <div className="hidden items-center gap-8 text-black/55 md:flex">
            <span>Colombo → Everywhere</span>
            <span>Edition 01 / 2026</span>
          </div>
        </div>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-14 lg:py-12">
          <div className="relative min-w-0">
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.45 }}
              className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-black/55"
            >
              <span>01</span>
              <span className="h-px w-12 bg-black/30" />
              <span>Curated for everyday discovery</span>
            </motion.p>

            <motion.h1
              initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.65,
                delay: prefersReducedMotion ? 0 : 0.08,
                ease: "easeOut",
              }}
              className="font-[var(--font-display)] text-[clamp(5.4rem,20vw,13rem)] font-light uppercase leading-[0.72] tracking-[-0.065em] text-[#111111]"
            >
              SHOP
              <br />
              WHAT&apos;S
              <br />
              <span className="text-[#ff7900]">NEXT.</span>
            </motion.h1>

            <div className="mt-9 grid gap-7 sm:mt-12 sm:grid-cols-[minmax(0,34rem)_auto] sm:items-end">
              <p className="max-w-xl text-sm leading-7 text-black/65 sm:text-base sm:leading-8">
                Technology, fashion, wellness and digital services — brought
                together in one marketplace designed for useful discovery.
              </p>

              <div className="hidden justify-self-end text-right lg:block">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-black/40">
                  Scroll to discover
                </p>
                <ArrowDownRight className="ml-auto mt-3 h-7 w-7" />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="group inline-flex min-h-14 items-center justify-center gap-4 bg-[#111111] px-7 text-xs font-semibold uppercase tracking-[0.17em] !text-white transition-transform duration-300 hover:-translate-y-1 active:translate-y-0"
              >
                Explore marketplace
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href="#categories"
                className="group inline-flex min-h-14 items-center justify-center gap-4 border border-black/25 bg-white/35 px-7 text-xs font-semibold uppercase tracking-[0.17em] text-[#111111] backdrop-blur-sm transition-colors duration-300 hover:bg-white/70"
              >
                Browse categories
                <MoveRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px] lg:mx-0 lg:justify-self-end">
            <div
              aria-hidden="true"
              className="absolute -left-5 top-14 hidden h-[72%] w-[78%] border border-black/15 sm:block"
            />
            <div
              aria-hidden="true"
              className="absolute -right-5 -top-5 hidden h-28 w-28 bg-[#ff7900] sm:block"
            />

            <motion.div
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      y: [0, -10, 0],
                      rotate: [-1.1, 0.35, -1.1],
                    }
              }
              transition={
                prefersReducedMotion
                  ? undefined
                  : {
                      duration: 7,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
              className="relative border border-black/20 bg-[#f8f7f2] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.14)] sm:p-5"
            >
              <div className="flex items-center justify-between border-b border-black/15 pb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-black/55">
                <span>Now showing</span>
                <span>
                  {String(productIndex + 1).padStart(2, "0")} /{" "}
                  {String(Math.max(productCount, 1)).padStart(2, "0")}
                </span>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={productKey}
                  initial={
                    prefersReducedMotion
                      ? false
                      : { opacity: 0, x: 30, scale: 0.98 }
                  }
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={
                    prefersReducedMotion
                      ? undefined
                      : { opacity: 0, x: -24, scale: 0.98 }
                  }
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.5,
                    ease: "easeOut",
                  }}
                >
                  <Link
                    href={productHref}
                    className="group block"
                    aria-label={`View ${productName}`}
                  >
                    <div className="relative mt-4 aspect-[4/4.6] overflow-hidden bg-[#ece9e1]">
                      <Image
                        src={productImage}
                        alt={productName}
                        fill
                        sizes="(max-width: 1023px) calc(100vw - 64px), 500px"
                        className="object-contain p-7 transition-transform duration-700 group-hover:scale-[1.045]"
                      />

                      <div className="absolute left-3 top-3 border border-black/15 bg-[#f8f7f2]/90 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] backdrop-blur">
                        Selected by AthiMart
                      </div>
                    </div>

                    <div className="grid gap-5 pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/45">
                          {productCompany}
                        </p>
                        <h2 className="mt-2 line-clamp-2 text-xl font-semibold leading-tight sm:text-2xl">
                          {productName}
                        </h2>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-sm font-semibold text-[#123f9e]">
                          {productPrice}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff7900]">
                          View product
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <div className="absolute -bottom-7 -left-4 hidden border border-black/20 bg-[#111111] px-5 py-4 !text-white shadow-xl sm:block">
              <p className="text-[9px] uppercase tracking-[0.22em] !text-white/55">
                One marketplace
              </p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.08em] !text-white">
                Endless discovery
              </p>
            </div>
          </div>
        </div>

        <div className="grid border-t border-black/15 pt-4 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-black/45 sm:mb-0">
            Explore the mix
          </p>

          <div className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-4">
            {marketLabels.map((label, index) => (
              <div
                key={label}
                className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/70"
              >
                <span className="text-[#ff7900]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { AnimatePresence, m, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";

import styles from "./search-category-grid.module.css";

const COLLECTION_INTERVAL = 4000;
const SOFT_EASE = [0.22, 1, 0.36, 1] as const;
const MAIN_IMAGE_SIZES = "(max-width: 639px) 85vw, (max-width: 1023px) 60vw, 45vw";

function subscribeToVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function getPageVisible() { return document.visibilityState !== "hidden"; }
function getServerPageVisible() { return true; }

interface DiscoveryCategory {
  name: string;
  slug: string;
  href: string;
  description: string;
  image: string;
  typeCount: number;
}

export default function SearchCategoryGrid({ categories }: { categories: DiscoveryCategory[] }) {
  const [selected, setSelected] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [rotationVersion, setRotationVersion] = useState(0);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const id = useId();
  const explorerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(explorerRef, { amount: 0.2 });
  const isPageVisible = useSyncExternalStore(subscribeToVisibility, getPageVisible, getServerPageVisible);
  const { scrollYProgress } = useScroll({ target: explorerRef, offset: ["start end", "end start"] });
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 150, damping: 26 });
  const smoothY = useSpring(pointerY, { stiffness: 150, damping: 26 });
  const rotateX = useTransform(smoothY, [-1, 1], [3, -3]);
  const rotateY = useTransform(smoothX, [-1, 1], [-4, 4]);
  const imageX = useTransform(smoothX, [-1, 1], [10, -10]);
  const imageY = useTransform(() => reduceMotion ? 0 : (scrollYProgress.get() - 0.5) * 64 - smoothY.get() * 9);
  const previewY = useTransform(() => reduceMotion ? 0 : (scrollYProgress.get() - 0.5) * -44 + smoothY.get() * 6);
  const category = categories[selected] ?? categories[0];
  const nextCategory = categories[(selected + 1) % categories.length];
  const shouldRotate = categories.length > 1 && !isPaused && !isHovered && !hasFocus
    && !reduceMotion && isInView && isPageVisible;
  const isAutoPlaying = shouldRotate
    && loadedImages.includes(category?.slug) && loadedImages.includes(nextCategory?.slug);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = window.setTimeout(() => {
      setSelected((current) => (current + 1) % categories.length);
    }, COLLECTION_INTERVAL);
    return () => window.clearTimeout(timer);
  }, [isAutoPlaying, selected, rotationVersion, categories.length]);

  if (!category) return null;

  function select(index: number) {
    setSelected((index + categories.length) % categories.length);
    setRotationVersion((version) => version + 1);
    pointerX.set(0);
    pointerY.set(0);
  }

  function markImageLoaded(slug: string) {
    setLoadedImages((loaded) => loaded.includes(slug) ? loaded : [...loaded, slug]);
  }

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let target: number;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") target = (index + 1) % categories.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") target = (index - 1 + categories.length) % categories.length;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = categories.length - 1;
    else return;
    event.preventDefault();
    select(target);
    tabRefs.current[target]?.focus({ preventScroll: true });
    tabRefs.current[target]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  }

  return (
    <div
      ref={explorerRef}
      className={styles.explorer}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setIsHovered(true); }}
      onPointerLeave={() => setIsHovered(false)}
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false);
      }}
    >
      <div className={styles.index}>
        <div className={styles.indexHeader}>
          <span>The collection index</span><ArrowDown size={14} aria-hidden="true" />
        </div>
        <div role="tablist" aria-label="Explore product collections" aria-orientation="vertical" className={styles.tabs}>
          {categories.map((item, index) => (
            <button
              key={item.slug}
              ref={(element) => { tabRefs.current[index] = element; }}
              id={`${id}-tab-${item.slug}`}
              type="button"
              role="tab"
              aria-selected={selected === index}
              aria-controls={`${id}-panel`}
              tabIndex={selected === index ? 0 : -1}
              className={styles.tab}
              onClick={() => select(index)}
              onKeyDown={(event) => handleTabKey(event, index)}
            >
              <span className={styles.tabNumber}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.tabName}>{item.name}</span>
              <ArrowUpRight size={17} aria-hidden="true" className={styles.tabArrow} />
            </button>
          ))}
        </div>
        <p className={styles.indexNote}>Different worlds.<br />One place to find yours.</p>
      </div>

      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${category.slug}`}
        tabIndex={0}
        className={styles.feature}
        onPointerMove={(event) => {
          if (reduceMotion || event.pointerType !== "mouse"
            || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          pointerX.set(Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2)));
          pointerY.set(Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2)));
        }}
        onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}
        onPointerCancel={() => { pointerX.set(0); pointerY.set(0); }}
      >
        <div className={styles.featureMeta}>
          <span>AthiMart / Selected collections</span>
          <span className={styles.counter}>{String(selected + 1).padStart(2, "0")} <span>/ {String(categories.length).padStart(2, "0")}</span></span>
        </div>

        <m.div className={styles.visual} style={{ rotateX: reduceMotion ? 0 : rotateX, rotateY: reduceMotion ? 0 : rotateY }}>
          <div className={styles.photoFrame}>
            <m.div className={styles.imageLayer} style={{ x: reduceMotion ? 0 : imageX, y: imageY }}>
              <AnimatePresence initial={false}>
                <m.div
                  key={category.slug}
                  className={styles.imageSlide}
                  initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 1.035 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.9, ease: SOFT_EASE }}
                >
                  <Image src={category.image} alt={`${category.name} collection`} fill sizes={MAIN_IMAGE_SIZES} className={styles.image} onLoad={() => markImageLoaded(category.slug)} />
                </m.div>
              </AnimatePresence>
              {/* Warm the exact responsive image used by the next full-size slide. */}
              {nextCategory && nextCategory.slug !== category.slug && (
                <Image
                  src={nextCategory.image}
                  alt=""
                  fill
                  sizes={MAIN_IMAGE_SIZES}
                  loading="eager"
                  className={styles.preloadImage}
                  aria-hidden="true"
                  onLoad={() => markImageLoaded(nextCategory.slug)}
                />
              )}
            </m.div>
          </div>
          <span className={styles.verticalNote} aria-hidden="true">Objects. Ideas. Possibilities.</span>
          <m.div className={styles.preview} style={{ y: previewY }}>
            <div className={styles.previewPhoto}>
              <AnimatePresence initial={false}>
                <m.div key={nextCategory.slug} className={styles.imageSlide} initial={{ opacity: reduceMotion ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.6, ease: SOFT_EASE }}>
                  <Image src={nextCategory.image} alt="" fill sizes="(max-width: 639px) 120px, 190px" className={styles.image} />
                </m.div>
              </AnimatePresence>
            </div>
            <span>Up next <ArrowUpRight size={12} aria-hidden="true" /></span>
            <m.p key={nextCategory.slug} initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.45, ease: SOFT_EASE }}>{nextCategory.name}</m.p>
          </m.div>
        </m.div>

        <div className={styles.copy}>
          <div className={styles.textStage} aria-live={shouldRotate ? "off" : "polite"} aria-atomic="true">
            <AnimatePresence initial={false}>
              <m.div
                key={category.slug}
                className={styles.textSlide}
                initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -8, transition: { duration: reduceMotion ? 0 : 0.2 } }}
                transition={{ duration: reduceMotion ? 0 : 0.65, ease: SOFT_EASE }}
              >
                <p className={styles.eyebrow}>Collection {String(selected + 1).padStart(2, "0")} &nbsp; / &nbsp; {category.typeCount} product types</p>
                <h3 className={styles.title}>{category.name}<span>.</span></h3>
                <p className={styles.description}>{category.description}</p>
              </m.div>
            </AnimatePresence>
          </div>
          <Link href={category.href} className={styles.exploreLink}>
            Explore collection <span><ArrowUpRight size={19} aria-hidden="true" /></span>
          </Link>
        </div>

        <div className={styles.featureFooter}>
          <span className={styles.footerNote}>A new perspective on the everyday.</span>
          <div className={styles.controls}>
            <button type="button" onClick={() => select(selected - 1)} aria-label="Previous collection"><ArrowLeft size={18} aria-hidden="true" /></button>
            {!reduceMotion && (
              <button type="button" onClick={() => setIsPaused((paused) => !paused)} aria-label={isPaused ? "Play collection slideshow" : "Pause collection slideshow"} aria-pressed={isPaused}>
                {isPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
              </button>
            )}
            <button type="button" onClick={() => select(selected + 1)} aria-label="Next collection"><ArrowRight size={18} aria-hidden="true" /></button>
          </div>
        </div>
        <div className={styles.progress} aria-hidden="true">
          <m.span
            key={`${selected}-${rotationVersion}-${isAutoPlaying}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isAutoPlaying ? 1 : 0 }}
            transition={{ duration: isAutoPlaying ? COLLECTION_INTERVAL / 1000 : 0, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import {
  AnimatePresence,
  m,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Expand,
  LoaderCircle,
  MousePointer2,
  Pause,
  Play,
  ShoppingBag,
  X,
} from "lucide-react";
import { useReducedMotionPreference } from "@/lib/hooks/use-reduced-motion-preference";
import styles from "./product-gallery.module.css";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  companyName: string;
  fallbackEmoji: string;
  discountPercent: number;
}

const IMAGE_SIZES = "(max-width: 767px) 90vw, (max-width: 1023px) 85vw, 46vw";
const SOFT_EASE = [0.22, 1, 0.36, 1] as const;

export function ProductGallery({
  images,
  productName,
  companyName,
  fallbackEmoji,
  discountPercent,
}: Readonly<ProductGalleryProps>) {
  const galleryImages = useMemo(
    () =>
      Array.from(new Set(images.map((image) => image.trim()).filter(Boolean))),
    [images],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [displayedImage, setDisplayedImage] = useState<string | null>(
    galleryImages[0] ?? null,
  );
  const [readyImages, setReadyImages] = useState<string[]>([]);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [isMotionPaused, setIsMotionPaused] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const galleryRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const requestedImage = useRef(galleryImages[0] ?? null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const helpId = useId();
  const reduceMotion = useReducedMotionPreference();
  const motionEnabled = !reduceMotion && !isMotionPaused;
  const { scrollYProgress } = useScroll({
    target: galleryRef,
    offset: ["start end", "end start"],
  });
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 135, damping: 25 });
  const smoothY = useSpring(pointerY, { stiffness: 135, damping: 25 });
  const rotateX = useTransform(smoothY, [-1, 1], [6, -6]);
  const rotateY = useTransform(smoothX, [-1, 1], [-9, 9]);
  const imageX = useTransform(smoothX, [-1, 1], [12, -12]);
  const imageY = useTransform(() =>
    motionEnabled
      ? (scrollYProgress.get() - 0.5) * -44 - smoothY.get() * 10
      : 0,
  );
  const orbitRotate = useTransform(scrollYProgress, [0, 1], [-9, 9]);
  const shadowX = useTransform(smoothX, [-1, 1], [-14, 14]);
  const shineX = useTransform(smoothX, [-1, 1], [10, 90]);
  const shineY = useTransform(smoothY, [-1, 1], [10, 90]);
  const shine = useMotionTemplate`radial-gradient(440px circle at ${shineX}% ${shineY}%, #ffffff70, transparent 65%)`;
  const activeIndex = Math.min(
    selectedIndex,
    Math.max(0, galleryImages.length - 1),
  );
  const selectedImage = galleryImages[activeIndex] ?? null;
  const isLoading = Boolean(
    selectedImage &&
    selectedImage !== displayedImage &&
    !failedImages.includes(selectedImage),
  );
  const hasDisplayImage = Boolean(
    displayedImage && !failedImages.includes(displayedImage),
  );
  const preloadImage = isLoading
    ? selectedImage
    : galleryImages[(activeIndex + 1) % galleryImages.length];

  useEffect(() => {
    if (!isZoomOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isZoomOpen]);

  function resetPointer() {
    pointerX.set(0);
    pointerY.set(0);
  }

  function chooseImage(index: number) {
    if (galleryImages.length === 0) return;
    const next = (index + galleryImages.length) % galleryImages.length;
    const source = galleryImages[next];
    requestedImage.current = source;
    setSelectedIndex(next);
    if (readyImages.includes(source) || failedImages.includes(source))
      setDisplayedImage(source);
    resetPointer();
  }

  function markReady(source: string) {
    setReadyImages((current) =>
      current.includes(source) ? current : [...current, source],
    );
    if (requestedImage.current === source) setDisplayedImage(source);
  }

  function markFailed(source: string) {
    setFailedImages((current) =>
      current.includes(source) ? current : [...current, source],
    );
    if (requestedImage.current === source) setDisplayedImage(source);
  }

  function openZoom() {
    if (!hasDisplayImage || isLoading || !dialogRef.current) return;
    resetPointer();
    dialogRef.current.showModal();
    setIsZoomOpen(true);
  }

  return (
    <section
      ref={galleryRef}
      className={styles.gallery}
      aria-label={`${productName} image gallery`}
    >
      <div className={styles.sticky}>
        <div
          className={styles.stage}
          data-motion={motionEnabled}
          role="group"
          aria-label="Product image viewer"
          aria-describedby={helpId}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              chooseImage(activeIndex + (event.key === "ArrowRight" ? 1 : -1));
            }
          }}
          onPointerMove={(event) => {
            if (
              !motionEnabled ||
              event.pointerType !== "mouse" ||
              !window.matchMedia("(hover: hover) and (pointer: fine)").matches
            )
              return;
            const bounds = event.currentTarget.getBoundingClientRect();
            pointerX.set(
              Math.max(
                -1,
                Math.min(
                  1,
                  ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
                ),
              ),
            );
            pointerY.set(
              Math.max(
                -1,
                Math.min(
                  1,
                  ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
                ),
              ),
            );
          }}
          onPointerLeave={resetPointer}
          onPointerDown={(event) => {
            if (event.pointerType === "touch")
              touchStart.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerUp={(event) => {
            if (event.pointerType !== "touch" || !touchStart.current) return;
            const dx = event.clientX - touchStart.current.x;
            const dy = event.clientY - touchStart.current.y;
            touchStart.current = null;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.25)
              chooseImage(activeIndex + (dx < 0 ? 1 : -1));
          }}
          onPointerCancel={() => {
            touchStart.current = null;
            resetPointer();
          }}
        >
          <p id={helpId} className="sr-only">
            Use the left and right arrow keys, the image buttons, or swipe
            horizontally to choose a view. Open the enlarged image for a closer
            look.
          </p>
          <div className={styles.stageHeader}>
            <p>A closer look</p>
            {discountPercent > 0 && (
              <span className={styles.discount}>{discountPercent}% off</span>
            )}
          </div>
          <span className={styles.backdropWord} aria-hidden="true">
            {companyName}
          </span>
          <m.div
            className={styles.orbit}
            style={{ rotate: motionEnabled ? orbitRotate : 0 }}
            aria-hidden="true"
          />
          <m.div
            className={styles.groundShadow}
            style={{ x: motionEnabled ? shadowX : 0 }}
            aria-hidden="true"
          />
          <m.div
            className={styles.photoPlane}
            style={{
              rotateX: motionEnabled ? rotateX : 0,
              rotateY: motionEnabled ? rotateY : 0,
              x: motionEnabled ? imageX : 0,
              y: imageY,
            }}
          >
            <AnimatePresence initial={false}>
              {hasDisplayImage ? (
                <m.div
                  key={displayedImage}
                  className={styles.imageSlide}
                  initial={{
                    opacity: reduceMotion ? 1 : 0,
                    scale: reduceMotion ? 1 : 0.95,
                  }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.65,
                    ease: SOFT_EASE,
                  }}
                >
                  <Image
                    src={displayedImage!}
                    alt={`${productName} by ${companyName} — image ${Math.max(0, galleryImages.indexOf(displayedImage!)) + 1}`}
                    fill
                    loading="eager"
                    fetchPriority={
                      displayedImage === galleryImages[0] ? "high" : "auto"
                    }
                    sizes={IMAGE_SIZES}
                    className={styles.productImage}
                    onLoad={() => markReady(displayedImage!)}
                    onError={() => markFailed(displayedImage!)}
                  />
                </m.div>
              ) : (
                <div key="fallback" className={styles.fallback}>
                  <span aria-hidden="true">
                    {fallbackEmoji || <ShoppingBag size={65} strokeWidth={1} />}
                  </span>
                  <p>Product image unavailable</p>
                </div>
              )}
            </AnimatePresence>
          </m.div>
          {preloadImage &&
            preloadImage !== displayedImage &&
            !failedImages.includes(preloadImage) && (
              <Image
                src={preloadImage}
                alt=""
                fill
                sizes={IMAGE_SIZES}
                loading="eager"
                className={styles.preloadImage}
                aria-hidden="true"
                onLoad={() => markReady(preloadImage)}
                onError={() => markFailed(preloadImage)}
              />
            )}
          <m.div
            className={styles.shine}
            style={{ background: motionEnabled ? shine : "none" }}
            aria-hidden="true"
          />
          <button
            type="button"
            className={styles.zoomButton}
            onClick={openZoom}
            disabled={!hasDisplayImage || isLoading}
            aria-label={`Enlarge ${productName} image`}
          >
            <Expand size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <div className={styles.stageFooter}>
            <span className={styles.hint}>
              <MousePointer2 size={13} aria-hidden="true" />
              <span>
                {reduceMotion
                  ? "Explore every detail"
                  : isMotionPaused
                    ? "Motion paused"
                    : "Move to explore"}
              </span>
            </span>
            <span className={styles.counter} aria-live="polite">
              {isLoading ? (
                <span className={styles.loadingView}>
                  <LoaderCircle
                    size={13}
                    className={styles.spinner}
                    aria-hidden="true"
                  />
                  Loading view
                </span>
              ) : galleryImages.length > 0 ? (
                <>
                  {String(activeIndex + 1).padStart(2, "0")}
                  <span>
                    {" "}
                    / {String(galleryImages.length).padStart(2, "0")}
                  </span>
                </>
              ) : (
                "Product preview"
              )}
            </span>
            {!reduceMotion && (
              <button
                type="button"
                className={styles.motionButton}
                onClick={() => {
                  resetPointer();
                  setIsMotionPaused((paused) => !paused);
                }}
                aria-label={
                  isMotionPaused ? "Enable 3D motion" : "Pause 3D motion"
                }
                aria-pressed={isMotionPaused}
              >
                {isMotionPaused ? (
                  <Play size={15} aria-hidden="true" />
                ) : (
                  <Pause size={15} aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>
        <div className={styles.galleryFooter}>
          <div
            className={styles.thumbnails}
            role="group"
            aria-label="Choose a product image"
          >
            {galleryImages.map((source, index) => (
              <button
                key={source}
                type="button"
                onClick={() => chooseImage(index)}
                aria-label={`Show ${productName} image ${index + 1}`}
                aria-pressed={activeIndex === index}
                className={styles.thumbnail}
              >
                {failedImages.includes(source) ? (
                  <ShoppingBag size={22} strokeWidth={1.3} aria-hidden="true" />
                ) : (
                  <Image
                    src={source}
                    alt=""
                    fill
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="80px"
                    className={styles.thumbnailImage}
                  />
                )}
                <span aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </button>
            ))}
          </div>
          {galleryImages.length > 1 && (
            <div className={styles.navigation}>
              <button
                type="button"
                onClick={() => chooseImage(activeIndex - 1)}
                aria-label="Previous product image"
              >
                <ArrowLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => chooseImage(activeIndex + 1)}
                aria-label="Next product image"
              >
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.zoomDialog}
        aria-label={`${productName} enlarged image`}
        onClose={() => setIsZoomOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
      >
        <div className={styles.zoomContent}>
          <div className={styles.zoomHeader}>
            <span>{productName}</span>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close enlarged image"
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>
          <div className={styles.zoomImage}>
            {isZoomOpen && displayedImage && hasDisplayImage && (
              <Image
                src={displayedImage}
                alt={`${productName} by ${companyName}, enlarged`}
                fill
                sizes="95vw"
                className={styles.fullImage}
              />
            )}
          </div>
          <p className={styles.zoomCaption}>
            Image {activeIndex + 1} of {galleryImages.length} · Press Escape to
            close
          </p>
        </div>
      </dialog>
    </section>
  );
}

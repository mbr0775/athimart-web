"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

import { useReducedMotionPreference } from "@/lib/hooks/use-reduced-motion-preference";
import styles from "./hero-collection.module.css";

const slides = [
  { id: "shoes", label: "Shoes", photo: "photo-1542291026-7eec264c27ff", position: "center 52%" },
  { id: "devices", label: "Digital devices", photo: "photo-1496181133206-80ce9b88a853", position: "center 55%" },
  { id: "headphones", label: "Headphones", photo: "photo-1505740420928-5e560c06d30e", position: "60% center" },
  { id: "watches", label: "Watches and accessories", photo: "photo-1523275335684-37898b6baf30", position: "center center" },
];

const SLIDE_INTERVAL = 4000;

export default function HeroBackgroundSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loadedSlides, setLoadedSlides] = useState(() => slides.map(() => false));
  const loadedSlidesRef = useRef(slides.map(() => false));
  const backgroundRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotionPreference();

  useEffect(() => {
    if (isPaused || reduceMotion) return;

    const timer = window.setInterval(() => {
      const bounds = backgroundRef.current?.getBoundingClientRect();
      if (document.hidden || !bounds || bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;

      setActiveIndex((current) => {
        // Keep the current photo visible until another background has loaded.
        for (let offset = 1; offset < slides.length; offset++) {
          const next = (current + offset) % slides.length;
          if (loadedSlidesRef.current[next]) return next;
        }
        return current;
      });
    }, SLIDE_INTERVAL);

    return () => window.clearInterval(timer);
  }, [isPaused, reduceMotion]);

  return (
    <>
      <div
        ref={backgroundRef}
        className={styles.backgrounds}
        data-active-background={slides[activeIndex].id}
        data-paused={isPaused || Boolean(reduceMotion)}
        aria-hidden="true"
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.slide} ${index === activeIndex ? styles.activeSlide : ""}`}
          >
            <Image
              src={`https://images.unsplash.com/${slide.photo}?auto=format&fit=crop&w=2400&q=85`}
              alt=""
              fill
              preload={index === 0}
              loading={index === 0 ? undefined : "eager"}
              sizes="100vw"
              className={styles.backgroundImage}
              style={{ objectPosition: slide.position }}
              onLoad={() => {
                loadedSlidesRef.current[index] = true;
                setLoadedSlides((loaded) => loaded.map((value, item) => item === index || value));
              }}
            />
          </div>
        ))}
      </div>

      <div className={styles.slideshowControls} role="group" aria-label="Hero background slideshow controls">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            className={styles.dotButton}
            aria-label={`Show ${slide.label.toLowerCase()} background`}
            aria-pressed={index === activeIndex}
            disabled={!loadedSlides[index]}
            onClick={() => setActiveIndex(index)}
          >
            <span className={styles.dot} aria-hidden="true" />
          </button>
        ))}
        {!reduceMotion && (
          <button
            type="button"
            className={styles.pauseButton}
            aria-label={isPaused ? "Play hero slideshow" : "Pause hero slideshow"}
            onClick={() => setIsPaused((paused) => !paused)}
          >
            {isPaused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
          </button>
        )}
      </div>
    </>
  );
}

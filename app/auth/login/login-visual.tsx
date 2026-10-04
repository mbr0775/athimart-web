"use client";

import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import { Pause, Play, Sparkles } from "lucide-react";
import { useReducedMotionPreference } from "@/lib/hooks/use-reduced-motion-preference";
import { LoginMotionContext } from "./login-experience";
import styles from "./login-slideshow.module.css";

// The same product photographs used by the home page slideshow.
const slides = [
  { id: "headphones", label: "Headphones", photo: "photo-1505740420928-5e560c06d30e", position: "center 55%" },
  { id: "shoes", label: "Shoes", photo: "photo-1542291026-7eec264c27ff", position: "center 52%" },
  { id: "devices", label: "Digital devices", photo: "photo-1496181133206-80ce9b88a853", position: "center 55%" },
  { id: "watches", label: "Watches & accessories", photo: "photo-1523275335684-37898b6baf30", position: "center 55%" },
];

const SLIDE_INTERVAL = 5500;

export default function LoginVisual() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loadedSlides, setLoadedSlides] = useState(() => slides.map(() => false));
  const loadedSlidesRef = useRef(slides.map(() => false));
  const slideshowRef = useRef<HTMLDivElement>(null);
  const pagePaused = useContext(LoginMotionContext);
  const reducedMotion = useReducedMotionPreference();
  const paused = isPaused || pagePaused || reducedMotion;

  useEffect(() => {
    if (paused) return;

    const timer = window.setInterval(() => {
      const bounds = slideshowRef.current?.getBoundingClientRect();
      if (document.hidden || !bounds || bounds.width === 0 || bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;

      setActiveIndex((current) => {
        for (let offset = 1; offset < slides.length; offset++) {
          const next = (current + offset) % slides.length;
          if (loadedSlidesRef.current[next]) return next;
        }
        return current;
      });
    }, SLIDE_INTERVAL);

    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <>
      <div ref={slideshowRef} className={styles.backgrounds} data-login-slideshow data-active-slide={slides[activeIndex].id} data-paused={paused} aria-hidden="true">
        {slides.map((slide, index) => (
          <div key={slide.id} className={`${styles.slide} ${activeIndex === index && loadedSlides[index] ? styles.activeSlide : ""}`}>
            <Image
              src={`https://images.unsplash.com/${slide.photo}?auto=format&fit=crop&w=1200&q=85`}
              alt=""
              fill
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              sizes="(max-width: 900px) 1px, (max-width: 1400px) 45vw, 620px"
              className={styles.photo}
              style={{ objectPosition: slide.position }}
              onLoad={() => {
                loadedSlidesRef.current[index] = true;
                setLoadedSlides((loaded) => loaded.map((value, item) => item === index || value));
                setActiveIndex((current) => loadedSlidesRef.current[current] ? current : index);
              }}
            />
          </div>
        ))}
        <div className={styles.overlay} />
      </div>
      <div className={styles.visual}>
        <div className={styles.toolbar}>
          <span className={styles.category}><Sparkles size={14} strokeWidth={1.6} aria-hidden="true" /><span>{slides[activeIndex].label}</span></span>
          <div className={styles.controls} role="group" aria-label="Product slideshow controls">
            {slides.map((slide, index) => (
              <button key={slide.id} type="button" className={styles.dotButton} aria-label={`Show ${slide.label.toLowerCase()} photo`} aria-pressed={index === activeIndex} disabled={!loadedSlides[index]} onClick={() => { setActiveIndex(index); setIsPaused(true); }}>
                <span className={styles.dot} aria-hidden="true" />
              </button>
            ))}
            {!reducedMotion && (
              <button type="button" className={styles.pauseButton} aria-label={isPaused ? "Play product slideshow" : "Pause product slideshow"} aria-pressed={isPaused} disabled={pagePaused} onClick={() => setIsPaused((value) => !value)}>
                {isPaused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

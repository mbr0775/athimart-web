"use client";

import { createContext, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./login.module.css";

export const LoginMotionContext = createContext(false);

export default function LoginExperience({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);
  const reducedMotionRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);

  function resetCard() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    const card = rootRef.current?.querySelector<HTMLElement>("[data-login-card]");
    card?.style.removeProperty("--card-rx");
    card?.style.removeProperty("--card-ry");
    card?.style.removeProperty("--light-x");
    card?.style.removeProperty("--light-y");
  }

  useEffect(() => {
    const root = rootRef.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      reducedMotionRef.current = preference.matches;
      if (preference.matches) resetCard();
    };
    const updateVisibility = () => {
      if (root) root.dataset.hidden = String(document.hidden);
    };

    updatePreference();
    updateVisibility();
    preference.addEventListener("change", updatePreference);
    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      preference.removeEventListener("change", updatePreference);
      document.removeEventListener("visibilitychange", updateVisibility);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  function moveCard(event: PointerEvent<HTMLElement>) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const card = target.closest<HTMLElement>("[data-login-card]");
    if (!card || paused || reducedMotionRef.current || event.pointerType !== "mouse" || card.contains(document.activeElement)) {
      resetCard();
      return;
    }

    const bounds = card.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      card.style.setProperty("--card-rx", `${(0.5 - y) * 3}deg`);
      card.style.setProperty("--card-ry", `${(x - 0.5) * 4}deg`);
      card.style.setProperty("--light-x", `${x * 100}%`);
      card.style.setProperty("--light-y", `${y * 100}%`);
      frameRef.current = null;
    });
  }

  return (
    <main ref={rootRef} className={styles.page} data-paused={paused} onPointerMove={moveCard} onPointerLeave={resetCard} onPointerCancel={resetCard} onFocusCapture={resetCard}>
      <div className={styles.atmosphere} aria-hidden="true"><span /><span /><span /></div>
      <LoginMotionContext.Provider value={paused}>{children}</LoginMotionContext.Provider>
      <div className={styles.animationControls}>
        <button type="button" className={styles.motionToggle} aria-pressed={paused} onClick={() => { resetCard(); setPaused((value) => !value); }}>
          {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}<span>{paused ? "Play animation" : "Pause animation"}</span>
        </button>
      </div>
    </main>
  );
}

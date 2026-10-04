"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./sign-up.module.css";

export default function SignUpExperience({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);
  const [paused, setPaused] = useState(false);

  function resetScene() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    const scene = rootRef.current?.querySelector<HTMLElement>("[data-signup-scene]");
    scene?.style.removeProperty("--scene-rx");
    scene?.style.removeProperty("--scene-ry");
  }

  useEffect(() => {
    const root = rootRef.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      reducedMotionRef.current = preference.matches;
      if (preference.matches) resetScene();
    };
    const updateVisibility = () => {
      if (root) root.dataset.hidden = String(document.hidden);
      if (document.hidden) resetScene();
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

  function moveScene(event: PointerEvent<HTMLElement>) {
    if (!(event.target instanceof Element)) return;
    const stage = event.target.closest<HTMLElement>("[data-scene-stage]");
    if (!stage || paused || reducedMotionRef.current || event.pointerType !== "mouse") {
      resetScene();
      return;
    }
    const scene = stage.querySelector<HTMLElement>("[data-signup-scene]");
    if (!scene) return;
    const bounds = stage.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      scene.style.setProperty("--scene-rx", `${(0.5 - y) * 8}deg`);
      scene.style.setProperty("--scene-ry", `${(x - 0.5) * 12}deg`);
      frameRef.current = null;
    });
  }

  return (
    <main ref={rootRef} className={styles.page} data-paused={paused} onPointerMove={moveScene} onPointerLeave={resetScene} onPointerCancel={resetScene}>
      <div className={styles.atmosphere} aria-hidden="true"><span /><span /></div>
      {children}
      <div className={styles.animationControls}>
        <button type="button" className={styles.motionToggle} aria-pressed={paused} onClick={() => { resetScene(); setPaused((value) => !value); }}>
          {paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}{paused ? "Play animation" : "Pause animation"}
        </button>
      </div>
    </main>
  );
}

"use client";

import { useSyncExternalStore } from "react";

const mediaQuery = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const preference = window.matchMedia(mediaQuery);
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(mediaQuery).matches;
}

function getServerSnapshot() {
  return false;
}

/** Match server HTML during hydration, then subscribe to the browser preference. */
export function useReducedMotionPreference() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

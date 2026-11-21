"use client";

import { createContext, useContext, useMemo, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import styles from "./navigation-feedback.module.css";

const NavigationContext = createContext<{
  startNavigation: (action: () => void) => void;
} | null>(null);

export function NavigationFeedbackProvider({ children }: { children: ReactNode }) {
  const [pending, startNavigation] = useTransition();
  const value = useMemo(() => ({ startNavigation }), [startNavigation]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
      <div className={styles.progress} data-navigation-progress hidden={!pending} aria-hidden="true"><span /></div>
      <span className="sr-only" role="status" aria-live="polite">{pending ? "Opening page…" : ""}</span>
    </NavigationContext.Provider>
  );
}

export function useNavigationFeedback() {
  return useContext(NavigationContext);
}

// Keep Next's routing behavior, including scroll options and redirects. React
// owns completion/cancellation; there are no estimated progress timers.
export function useNavigationRouter() {
  const router = useRouter();
  const feedback = useNavigationFeedback();
  return useMemo(() => ({
    ...router,
    push: (...args: Parameters<typeof router.push>) => {
      if (feedback) feedback.startNavigation(() => router.push(...args));
      else router.push(...args);
    },
    replace: (...args: Parameters<typeof router.replace>) => {
      if (feedback) feedback.startNavigation(() => router.replace(...args));
      else router.replace(...args);
    },
  }), [router, feedback]);
}

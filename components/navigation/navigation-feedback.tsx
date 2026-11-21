"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import LoadingMark from "./loading-mark";
import styles from "./navigation-feedback.module.css";

const NavigationContext = createContext<{
  startNavigation: (action: () => void, controlId?: string) => void;
  pending: boolean;
  activeControl: string | null;
} | null>(null);

export function NavigationFeedbackProvider({ children }: { children: ReactNode }) {
  const [pending, startTransition] = useTransition();
  const [activeControl, setActiveControl] = useState<string | null>(null);
  const startNavigation = useCallback((action: () => void, controlId?: string) => {
    setActiveControl(controlId ?? null);
    startTransition(action);
  }, [startTransition]);
  const value = useMemo(() => ({ startNavigation, pending, activeControl }), [startNavigation, pending, activeControl]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
      <div className={styles.progress} data-navigation-progress hidden={!pending} aria-hidden="true"><span /></div>
      <div className={styles.notice} hidden={!pending} aria-hidden="true">
        <LoadingMark compact />
        <div className={styles.copy}><p>Opening your page<span className={styles.dots}><i /><i /><i /></span></p><span>Something good is on its way.</span></div>
      </div>
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

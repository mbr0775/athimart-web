"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Adds entrances without hiding server-rendered content before hydration. */
export default function HomeScrollReveal({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    const selector = "[data-home-reveal], h1, h2, h3, p";
    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
      (element) => !element.closest("[data-home-scroll-scene], [data-home-static]") && !element.parentElement?.closest(selector),
    );
    const order = new Map(targets.map((element, index) => [element, index]));

    const observer = new IntersectionObserver(
      (entries) => {
        const entering = entries.filter((entry) => entry.isIntersecting)
          .sort((a, b) => (order.get(a.target as HTMLElement) ?? 0) - (order.get(b.target as HTMLElement) ?? 0));

        entering.forEach((entry, index) => {
          observer.unobserve(entry.target);
          if (preference.matches) return;

          const isCard = entry.target.hasAttribute("data-home-reveal");
          const animation = entry.target.animate(
            [
              {
                opacity: 0,
                transform: `perspective(1100px) translate3d(0, ${isCard ? 48 : 28}px, -40px) rotateX(${isCard ? 8 : 5}deg) scale(0.97)`,
              },
              { opacity: 1, transform: "perspective(1100px) translate3d(0, 0, 0) rotateX(0deg) scale(1)" },
            ],
            {
              duration: isCard ? 850 : 700,
              delay: Math.min(index * 65, 260),
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              fill: "backwards",
            },
          );
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -24px 0px" },
    );

    targets.forEach((target) => observer.observe(target));
    const stopMotion = () => {
      if (preference.matches) {
        animations.forEach((animation) => animation.cancel());
        animations.clear();
      }
    };
    preference.addEventListener("change", stopMotion);

    return () => {
      observer.disconnect();
      preference.removeEventListener("change", stopMotion);
      animations.forEach((animation) => animation.cancel());
    };
  }, []);

  return <div ref={rootRef}>{children}</div>;
}

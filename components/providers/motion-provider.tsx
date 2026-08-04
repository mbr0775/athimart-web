// components/providers/motion-provider.tsx

"use client";

import {
  LazyMotion,
  MotionConfig,
  domAnimation,
} from "motion/react";

interface MotionProviderProps {
  children: React.ReactNode;
}

export function MotionProvider({
  children,
}: Readonly<MotionProviderProps>) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <LazyMotion features={domAnimation}>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
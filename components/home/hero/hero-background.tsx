"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "motion/react";

export default function HeroBackground() {

  const shouldReduceMotion = useReducedMotion();


  return (
    <>

      {/* Background */}
      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          -z-30
          bg-[radial-gradient(circle_at_50%_39%,rgba(255,255,255,0.98)_0%,rgba(238,242,244,0.9)_24%,rgba(205,213,218,0.88)_58%,rgba(178,189,196,0.92)_100%)]
        "
      />


      {/* Circle light */}
      <div
        aria-hidden="true"
        className="
          absolute
          left-1/2
          top-[39%]
          -z-20
          h-[45vw]
          min-h-[360px]
          w-[45vw]
          min-w-[360px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          border
          border-white/55
          shadow-[0_0_120px_rgba(255,255,255,0.45)]
        "
      />


      {/* ATHI Typography */}

      <motion.div

        aria-hidden="true"

        initial={
          shouldReduceMotion
          ? false
          : {
              opacity:0,
              scale:0.96
            }
        }

        animate={{
          opacity:1,
          scale:1
        }}

        transition={{
          duration:1.1,
          ease:[0.22,1,0.36,1]
        }}

        className="
          pointer-events-none
          absolute
          left-1/2
          top-[39%]
          z-0
          -translate-x-1/2
          -translate-y-1/2
          whitespace-nowrap
          font-[var(--font-oswald)]
          text-[clamp(9rem,31vw,31rem)]
          font-medium
          leading-[0.72]
          tracking-[-0.085em]
          text-white
          select-none
        "

      >

        ATHI

      </motion.div>

    </>
  );
}
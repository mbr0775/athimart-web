"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { editorialFont } from "@/lib/fonts";
import { useReducedMotionPreference } from "@/lib/hooks/use-reduced-motion-preference";
import styles from "./marketplace-hero.module.css";

const panels = [
  { name: "Technology", href: "/category/digital-products", image: "/home/technology.webp", depth: 1, angle: 0, kind: "technology" },
  { name: "Grocery", href: "/category/grocery", image: "/home/grocery.webp", depth: 0.65, angle: 13, kind: "grocery" },
  { name: "Fashion", href: "/category/fashion", image: "/home/fashion.webp", depth: 0.52, angle: -13, kind: "fashion" },
] as const;

function HeroPanel({ panel, pointerX, pointerY, scroll, reduced }: {
  panel: (typeof panels)[number];
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  scroll: MotionValue<number>;
  reduced: boolean;
}) {
  const centre = panel.kind === "technology";
  const x = useTransform(() => pointerX.get() * 20 * panel.depth);
  const y = useTransform(() => pointerY.get() * 13 * panel.depth - scroll.get() * 52 * panel.depth);
  const rotateY = useTransform(() => panel.angle + pointerX.get() * 8);
  const rotateX = useTransform(() => -pointerY.get() * 7 + scroll.get() * 6);

  return (
    <motion.div className={styles.panel} data-panel={panel.kind}
      style={reduced ? undefined : { x, y, rotateX, rotateY }}>
      <Link href={panel.href} className={styles.panelLink}>
        <Image src={panel.image} alt="" fill className={styles.photo}
          preload={centre} loading={centre ? undefined : "eager"}
          sizes={centre ? "(max-width: 680px) 89vw, (max-width: 1450px) 47vw, 650px" : "(max-width: 680px) 44vw, (max-width: 1450px) 25vw, 340px"} />
        <span className={styles.panelLabel}>{panel.name}<ArrowUpRight size={17} aria-hidden="true" /></span>
      </Link>
    </motion.div>
  );
}

export default function HeroCollectionSection() {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotionPreference();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const pointerX = useSpring(rawX, { stiffness: 125, damping: 25 });
  const pointerY = useSpring(rawY, { stiffness: 125, damping: 25 });
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const scroll = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const titleY = useTransform(scroll, [0, 1], [0, -18]);

  return (
    <section ref={section} data-home-scroll-scene aria-labelledby="hero-heading"
      className={`${styles.hero} ${editorialFont.variable}`}>
      <motion.h1 id="hero-heading" className={styles.title} style={reduced ? undefined : { y: titleY }}>
        AthiMart
      </motion.h1>

      <div className={styles.stage}
        onPointerMove={(event) => {
          if (reduced || event.pointerType !== "mouse") return;
          const rect = event.currentTarget.getBoundingClientRect();
          rawX.set((event.clientX - rect.left) / rect.width * 2 - 1);
          rawY.set((event.clientY - rect.top) / rect.height * 2 - 1);
        }}
        onPointerLeave={() => {
          rawX.set(0);
          rawY.set(0);
        }}>
        {panels.map((panel) => <HeroPanel key={panel.kind} panel={panel}
          pointerX={pointerX} pointerY={pointerY} scroll={scroll} reduced={reduced} />)}
      </div>

      <div className={styles.actions}>
        <Link href="/shop" className={styles.primary}>Shop products <ArrowRight size={17} aria-hidden="true" /></Link>
        <Link href="/shops" className={styles.secondary}>Explore sellers <ArrowUpRight size={17} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}

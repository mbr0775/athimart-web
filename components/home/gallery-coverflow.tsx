"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useReducedMotionPreference } from "@/lib/hooks/use-reduced-motion-preference";
import styles from "./scroll-scenes.module.css";

const galleryImages = [
  { src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=900&auto=format&fit=crop", alt: "Fashion marketplace", label: "Everyday style" },
  { src: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=900&auto=format&fit=crop", alt: "Online shopping experience", label: "Little discoveries" },
  { src: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=900&auto=format&fit=crop", alt: "Fashion products", label: "Made for you" },
  { src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=900&auto=format&fit=crop", alt: "Shoes collection", label: "Go somewhere new" },
  { src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=900&auto=format&fit=crop", alt: "Technology products", label: "A smarter everyday" },
];

export default function GalleryCoverflow() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotionPreference();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 28, restDelta: 0.001 });
  const rotateY = useTransform(progress, [0, 1], [20, -268]);
  const rotateX = useTransform(progress, [0, 0.5, 1], [-8, 5, -4]);
  const foregroundY = useTransform(progress, [0, 1], [90, -180]);
  const foregroundRotate = useTransform(progress, [0, 1], [-25, 85]);

  return (
    <section ref={ref} data-home-scroll-scene className={styles.gallery} aria-labelledby="gallery-title">
      <div className={styles.gallerySticky}>
        <div className={styles.galleryHeading}>
          <p className={styles.eyebrow}>EXPLORE ATHIMART</p>
          <h2 id="gallery-title">A world of discoveries.</h2>
          <p className={styles.subtitle}>Different worlds. One marketplace.</p>
        </div>
        <div className={styles.perspective}>
          <motion.div className={styles.ring} style={reduced ? undefined : { rotateY, rotateX }}>
            {galleryImages.map((image, index) => (
              <figure key={image.src} className={styles.galleryCard} style={{ transform: `rotateY(${index * 72}deg) translateZ(var(--gallery-radius))` }}>
                <Image src={image.src} alt={image.alt} fill sizes="(max-width: 640px) 160px, 230px" className={styles.galleryImage} />
                <figcaption><span>0{index + 1}</span>{image.label}</figcaption>
              </figure>
            ))}
          </motion.div>
        </div>
        <motion.div aria-hidden="true" className={styles.foreground} style={reduced ? undefined : { y: foregroundY, rotate: foregroundRotate }}>
          <div className={styles.floatingOrb} />
        </motion.div>
        <motion.div aria-hidden="true" className={styles.foregroundTwo} style={reduced ? undefined : { y: foregroundY, rotate: foregroundRotate }}>
          <div className={styles.floatingLoop} />
        </motion.div>
        <p className={styles.scrollHint}>SCROLL TO DISCOVER <span aria-hidden="true">↓</span></p>
      </div>
    </section>
  );
}

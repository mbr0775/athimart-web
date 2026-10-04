import Link from "next/link";

import { editorialFont } from "@/lib/fonts";
import HeroBackgroundSlideshow from "./hero-background-slideshow";
import styles from "./hero-collection.module.css";

export default function HeroCollectionSection() {
  return (
    <section aria-labelledby="hero-heading" className={`${styles.hero} ${editorialFont.variable}`}>
      <HeroBackgroundSlideshow />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.content}>
        <h1 id="hero-heading" className={styles.heading}>AthiMart</h1>
        <p className={styles.subtitle}>Everyday Essentials for Extraordinary Living</p>
        <Link href="/shop" className={styles.shopButton}>Shop Now</Link>
      </div>
    </section>
  );
}

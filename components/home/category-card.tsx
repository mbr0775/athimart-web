"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowUpRight, Bot, Car, Code2, Dumbbell, House, Laptop, Leaf, Shirt, ShoppingBag } from "lucide-react";

import styles from "./shop-category-section.module.css";

const icons = {
  "digital-products": Laptop,
  "it-solutions": Code2,
  "ai-gadgets": Bot,
  "fitness-tech": Dumbbell,
  "natural-essences": Leaf,
  fashion: Shirt,
  vehicles: Car,
  "real-estate": House,
};

interface CategoryCardProps {
  name: string;
  slug: string;
  href: string;
  description: string;
  typeCount: number;
  image: string;
  imageAlt: string;
  isProductImage: boolean;
  index: number;
}

export default function CategoryCard({
  name, slug, href, description, typeCount, image, imageAlt, isProductImage, index,
}: CategoryCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const reduceMotion = useReducedMotion();
  const Icon = icons[slug as keyof typeof icons] ?? ShoppingBag;

  return (
    <Link
      ref={cardRef}
      href={href}
      aria-label={`Shop ${name}`}
      data-home-reveal
      data-product-cover={isProductImage}
      className={`${styles.card} ${index < 2 ? styles.featuredCard : ""}`}
      onPointerMove={(event) => {
        if (reduceMotion || event.pointerType !== "mouse") return;
        const card = cardRef.current;
        if (!card) return;
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        card.style.setProperty("--tilt-x", `${(0.5 - y) * 5}deg`);
        card.style.setProperty("--tilt-y", `${(x - 0.5) * 5}deg`);
        card.style.setProperty("--pointer-x", `${x * 100}%`);
        card.style.setProperty("--pointer-y", `${y * 100}%`);
      }}
      onPointerLeave={() => {
        cardRef.current?.style.removeProperty("--tilt-x");
        cardRef.current?.style.removeProperty("--tilt-y");
      }}
    >
      <div className={styles.imageLayer}>
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes={index < 2 ? "(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 45vw, 50vw" : "(max-width: 767px) 45vw, (max-width: 1023px) 45vw, 30vw"}
          className={styles.image}
        />
      </div>
      <div className={styles.gradient} aria-hidden="true" />
      <div className={styles.cardTop}>
        <span className={styles.categoryIcon}><Icon size={21} strokeWidth={1.5} aria-hidden="true" /></span>
        <span className={styles.typeCount}>{typeCount} product types</span>
      </div>
      <div className={styles.cardCopy}>
        <p className={styles.cardNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")} / EXPLORE</p>
        <h3 className={styles.cardTitle}>{name}</h3>
        <p className={styles.cardDescription}>{description}</p>
        <div className={styles.cardFooter}>
          <span>Explore category</span>
          <span className={styles.cardArrow}><ArrowUpRight size={20} aria-hidden="true" /></span>
        </div>
      </div>
    </Link>
  );
}

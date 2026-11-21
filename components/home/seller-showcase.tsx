"use client";

import Link from "@/components/navigation/navigation-link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import ProfileAvatar from "@/components/account/profile-avatar";
import { useProfileIdentity } from "@/components/account/profile-provider";
import { homeSellerProfile } from "@/lib/shops/home-seller-profile";
import { editorialFont } from "@/lib/fonts";
import { useReducedMotionPreference } from "@/lib/hooks/use-reduced-motion-preference";
import { getShopPath, OFFICIAL_SHOP_ID } from "@/lib/shops/shop-identity";
import type { HomeShop } from "@/lib/shops/shop-service";
import styles from "./seller-showcase.module.css";

function SellerCard({ shop, index, drift, reduced }: {
  shop: HomeShop;
  index: number;
  drift: MotionValue<number>;
  reduced: boolean;
}) {
  const profile = homeSellerProfile(shop, useProfileIdentity());
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(y, { stiffness: 170, damping: 25 });
  const rotateY = useSpring(x, { stiffness: 170, damping: 25 });

  return (
    <li className={styles.item}>
      <motion.div className={styles.plane} style={reduced ? undefined : { rotateX, rotateY }}>
        <Link className={styles.card} href={getShopPath(shop.id)} data-tone={index % 4}
          onPointerMove={(event) => {
            if (reduced || event.pointerType !== "mouse") return;
            const bounds = event.currentTarget.getBoundingClientRect();
            x.set((event.clientX - bounds.left) / bounds.width * 18 - 9);
            y.set(8 - (event.clientY - bounds.top) / bounds.height * 16);
          }}
          onPointerLeave={() => { x.set(0); y.set(0); }}>
          <div className={styles.art} aria-hidden="true">
            <motion.div className={styles.rings} style={reduced ? undefined : { y: drift }} />
            <div className={styles.portrait}>
              {shop.id === OFFICIAL_SHOP_ID
                ? <span className={styles.wordmark}>AthiMart</span>
                : <ProfileAvatar name={profile.name} avatarUrl={profile.avatarUrl} size={112} loading="lazy" />}
            </div>
          </div>
          <div className={styles.caption}>
            <h3>{profile.name}</h3>
            <span className={styles.arrow}><ArrowUpRight size={20} aria-hidden="true" /></span>
          </div>
        </Link>
      </motion.div>
    </li>
  );
}

export default function SellerShowcase({ shops }: { shops: HomeShop[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotionPreference();
  const { scrollYProgress } = useScroll({ target: section, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], [26, -26]);
  const [edges, setEdges] = useState({ previous: false, next: false });

  useEffect(() => {
    const list = track.current;
    if (!list) return;
    const update = () => {
      const previous = list.scrollLeft > 2;
      const next = list.scrollLeft + list.clientWidth < list.scrollWidth - 2;
      setEdges((old) => old.previous === previous && old.next === next ? old : { previous, next });
    };
    update();
    list.addEventListener("scroll", update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(list);
    return () => { list.removeEventListener("scroll", update); resize.disconnect(); };
  }, [shops.length]);

  function move(direction: number) {
    const list = track.current;
    const card = list?.firstElementChild?.getBoundingClientRect();
    if (!list || !card) return;
    const gap = Number.parseFloat(getComputedStyle(list).columnGap) || 0;
    list.scrollBy({ left: direction * (card.width + gap), behavior: reduced ? "instant" : "smooth" });
  }

  return (
    <section ref={section} className={`${styles.section} ${editorialFont.variable}`}
      aria-labelledby="home-seller-heading" data-home-scroll-scene>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 id="home-seller-heading">Shop by seller</h2>
          <div className={styles.actions}>
            <Link href="/shops" className={styles.browse}>Browse all shops <ArrowUpRight size={17} aria-hidden="true" /></Link>
            {shops.length > 1 && (
              <div className={styles.controls} role="group" aria-label="Seller cards">
                <button type="button" aria-label="Previous sellers" aria-controls="home-seller-track"
                  disabled={!edges.previous} onClick={() => move(-1)}><ArrowLeft size={19} aria-hidden="true" /></button>
                <button type="button" aria-label="Next sellers" aria-controls="home-seller-track"
                  disabled={!edges.next} onClick={() => move(1)}><ArrowRight size={19} aria-hidden="true" /></button>
              </div>
            )}
          </div>
        </header>
        {shops.length > 0 && (
          <ul className={styles.track} ref={track} id="home-seller-track" aria-label="Marketplace sellers">
            {shops.map((shop, index) => <SellerCard key={shop.id} shop={shop} index={index} drift={drift} reduced={reduced} />)}
          </ul>
        )}
      </div>
    </section>
  );
}

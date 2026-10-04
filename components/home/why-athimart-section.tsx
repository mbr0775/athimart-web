"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  ArrowRight, ArrowUpRight, Check, Headphones, Laptop, Monitor,
  Pause, Play, Shirt, ShoppingBag, Smartphone, Sparkles,
} from "lucide-react";
import styles from "./why-athimart-section.module.css";

const features = [
  {
    number: "01",
    label: "FIND YOUR FAVOURITES",
    title: "Easy discovery",
    description: "From everyday essentials to your next obsession. Explore organised categories and find more of what you love.",
    scene: "discovery",
  },
  {
    number: "02",
    label: "EVERYTHING, CONNECTED",
    title: "Shared platform",
    description: "Your marketplace, wherever you are. Customers, sellers and products come together across mobile and web.",
    scene: "connected",
  },
  {
    number: "03",
    label: "STAY IN THE KNOW",
    title: "Live information",
    description: "Make your next move with confidence. See current prices, product details and marketplace availability in one place.",
    scene: "live",
  },
] as const;

function DiscoveryScene() {
  return (
    <div className={styles.discoveryScene}>
      <div className={`${styles.productTile} ${styles.tileBack}`}><Shirt /></div>
      <div className={`${styles.productTile} ${styles.tileFront}`}>
        <Headphones /><span className={styles.tileLine} /><span className={styles.tileLineShort} />
      </div>
      <div className={`${styles.productTile} ${styles.tileSide}`}><Laptop /></div>
      <div className={styles.magnifier}><span className={styles.lens} /><span className={styles.handle} /></div>
      <span className={`${styles.sceneChip} ${styles.discoveryChip}`}><Sparkles size={12} /> Find your next favourite</span>
      <span className={styles.smallOrb} />
    </div>
  );
}

function ConnectedScene() {
  return (
    <div className={styles.connectedScene}>
      <span className={styles.orbit} /><span className={styles.orbitTwo} />
      <div className={styles.hub}><ShoppingBag size={43} strokeWidth={1.5} /></div>
      <div className={`${styles.device} ${styles.desktop}`}><Monitor size={34} strokeWidth={1.5} /></div>
      <div className={`${styles.device} ${styles.phone}`}><Smartphone size={29} strokeWidth={1.5} /></div>
      <div className={`${styles.device} ${styles.bag}`}><ShoppingBag size={24} strokeWidth={1.5} /></div>
      <span className={`${styles.sceneChip} ${styles.connectedChip}`}><span className={styles.statusDot} /> One connected marketplace</span>
      <span className={styles.satellite} />
    </div>
  );
}

function LiveScene() {
  return (
    <div className={styles.liveScene}>
      <div className={styles.dashboardBack} />
      <div className={styles.dashboard}>
        <div className={styles.dashboardTop}><span /><span /><span /><i /></div>
        <div className={styles.dashboardBody}>
          <span className={styles.dashboardLabel}>MARKETPLACE AT A GLANCE</span>
          <div className={styles.dashboardHeading}>All in view.<span><ArrowUpRight size={18} /></span></div>
          <div className={styles.chart}>{[30, 48, 38, 66, 56, 85, 100].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div>
          <div className={styles.dashboardBottom}><span>Prices & availability</span><Check size={13} /></div>
        </div>
      </div>
      <span className={`${styles.sceneChip} ${styles.liveChip}`}><span className={styles.statusDot} /> Live information</span>
      <div className={styles.checkBadge}><Check size={26} strokeWidth={2.5} /></div>
      <span className={styles.liveOrb} />
    </div>
  );
}

const scenes = { discovery: DiscoveryScene, connected: ConnectedScene, live: LiveScene };

export default function WhyAthiMartSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotionRef = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      reducedMotionRef.current = preference.matches;
      if (preference.matches) {
        section.querySelectorAll<HTMLElement>("[data-tilt-card]").forEach((card) => {
          card.style.removeProperty("--tilt-x");
          card.style.removeProperty("--tilt-y");
        });
      }
    };
    updatePreference();
    preference.addEventListener("change", updatePreference);

    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => {
          section.dataset.visible = String(entry.isIntersecting);
        }, { threshold: 0 })
      : null;
    observer?.observe(section);

    return () => {
      preference.removeEventListener("change", updatePreference);
      observer?.disconnect();
    };
  }, []);

  function tiltCard(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || reducedMotionRef.current || paused) return;
    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.setProperty("--tilt-x", `${-y * 7}deg`);
    card.style.setProperty("--tilt-y", `${x * 9}deg`);
  }

  function resetCard(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.removeProperty("--tilt-x");
    event.currentTarget.style.removeProperty("--tilt-y");
  }

  return (
    <section id="why-athimart" ref={sectionRef} className={styles.section} aria-labelledby="why-athimart-heading" data-paused={paused}>
      <div className={styles.container}>
        <div className={styles.headingBlock}>
          <p className={styles.eyebrow}><span /> CONNECTED COMMERCE</p>
          <h2 id="why-athimart-heading" className={styles.heading}>Why <span>AthiMart</span><span className={styles.headingDot}>.</span></h2>
          <p className={styles.intro}>More discovery. More connection. More possibility.<br className={styles.desktopBreak} /> One marketplace that brings it all together.</p>
          <span className={styles.headingSparkle} aria-hidden="true"><Sparkles size={31} strokeWidth={1.2} /></span>
        </div>

        <div className={styles.grid}>
          {features.map((feature) => {
            const Scene = scenes[feature.scene];
            return (
              <article key={feature.number} className={styles.cardWrapper} data-home-reveal>
                <div className={styles.card} data-theme={feature.scene} data-tilt-card onPointerMove={tiltCard} onPointerLeave={resetCard} onPointerCancel={resetCard}>
                  <div className={styles.cardTop}><span className={styles.number}>{feature.number}</span><span className={styles.cardCategory}>{feature.label}</span></div>
                  <div className={styles.scene} aria-hidden="true"><div className={styles.sceneHalo} /><div className={styles.sceneFloor} /><Scene /></div>
                  <div className={styles.cardCopy}><h3>{feature.title}</h3><p>{feature.description}</p></div>
                </div>
              </article>
            );
          })}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerCopy}><span className={styles.footerMark} aria-hidden="true"><ShoppingBag size={19} /></span><p>A little less searching.<br /><strong>A lot more discovering.</strong></p></div>
          <Link href="/shop" className={styles.shopLink}><span>Start shopping</span><span className={styles.linkArrow}><ArrowRight size={19} aria-hidden="true" /></span></Link>
          <button type="button" className={styles.motionToggle} aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
            {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}<span>{paused ? "Play animation" : "Pause animation"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowUp, ArrowUpRight, Globe2 } from "lucide-react";

import { siteConfig } from "@/config/site";
import { editorialFont } from "@/lib/fonts";
import styles from "./site-footer.module.css";

const footerNavigation = [
  {
    title: "Discover",
    links: [
      { href: "/shop", label: "Shop all products" },
      { href: "/search", label: "Find your favourite" },
      { href: "/#categories", label: "Explore categories" },
      { href: "/#markets", label: "Our markets" },
    ],
  },
  {
    title: "Your AthiMart",
    links: [
      { href: "/account", label: "My account" },
      { href: "/orders", label: "My orders" },
      { href: "/cart", label: "Shopping bag" },
      { href: "/returns", label: "Returns & support" },
    ],
  },
  {
    title: "The marketplace",
    links: [
      { href: "/#why-athimart", label: "Our story" },
      { href: "/delivery-partner", label: "Deliver with AthiMart" },
      { href: "/auth/sign-up", label: "Join the community" },
    ],
  },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="site-footer" className={`${styles.footer} ${editorialFont.variable}`}>
      <div className={styles.container}>
        <div className={styles.main}>
          <section aria-labelledby="footer-about-heading" className={styles.intro}>
            <p className={styles.eyebrow}><span aria-hidden="true" /> A little more extraordinary</p>
            <h2 id="footer-about-heading" className={styles.heading}>
              Good finds.<br /><em>Great possibilities.</em>
            </h2>
            <p className={styles.description}>{siteConfig.tagline}</p>
            <Link href="/shop" className={styles.shopLink}>
              Find something you love <span><ArrowUpRight size={18} aria-hidden="true" /></span>
            </Link>
          </section>

          <div className={styles.navigation}>
            {footerNavigation.map((group) => (
              <nav key={group.title} aria-label={`Footer: ${group.title}`} className={styles.linkGroup}>
                <h2 className={styles.groupTitle}>{group.title}</h2>
                <ul className={styles.links}>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>{link.label}<ArrowUpRight size={13} aria-hidden="true" /></Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className={styles.brandMeta}>
          <span className={styles.markets}><Globe2 size={14} strokeWidth={1.5} aria-hidden="true" />{siteConfig.markets.join(" · ")}</span>
          <span className={styles.brandNote}>Everyday essentials. Endless discovery.</span>
          <a href="#main-content" className={styles.backToTop}>Back to top <ArrowUp size={15} aria-hidden="true" /></a>
        </div>

        <Link href="/" aria-label={`${siteConfig.name} home`} className={styles.wordmark}>
          {siteConfig.name}<span aria-hidden="true">.</span>
        </Link>

        <div className={styles.bottom}>
          <p>© {currentYear} {siteConfig.name}. All rights reserved.</p>
          <p>Made for everyday discoveries.</p>
          <p className={styles.credit}>Powered by <span>{siteConfig.creator}</span><ArrowUpRight size={12} aria-hidden="true" /></p>
        </div>
      </div>
    </footer>
  );
}

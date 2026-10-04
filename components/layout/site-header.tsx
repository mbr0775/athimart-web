"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, CircleUserRound, Menu, Search, ShoppingBag, X } from "lucide-react";

import { CART_STORAGE_KEY, getCartItemCount, readCart } from "@/lib/cart/cart-storage";
import { editorialFont } from "@/lib/fonts";
import styles from "./site-header.module.css";

const navigationItems = [
  { href: "/shop", label: "Shop" },
  { href: "/#categories", label: "Categories" },
  { href: "/#markets", label: "Markets" },
  { href: "/#why-athimart", label: "Why AthiMart" },
];

const menuItems = [
  { href: "/search", label: "Search", description: "Find something extraordinary", icon: Search },
  { href: "/account", label: "Account", description: "Your personal space", icon: CircleUserRound },
  { href: "/cart", label: "Cart", description: "Your picks, all in one place", icon: ShoppingBag },
];

function subscribeToCart(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY || event.key === null) onChange();
  };
  window.addEventListener("athimart-cart-updated", onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("athimart-cart-updated", onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getCartCount() { return getCartItemCount(readCart()); }
function getServerCartCount() { return 0; }

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const cartCount = useSyncExternalStore(subscribeToCart, getCartCount, getServerCartCount);

  useEffect(() => {
    if (!isMenuOpen) return;
    const dismissOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !navigationRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismissOnOutsideClick);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOnOutsideClick);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [isMenuOpen]);

  return (
    <header className={`${styles.header} ${editorialFont.variable}`}>
      <div className={styles.announcement}>
        <span>Discover something extraordinary.</span>
        <Link href="/shop">Shop Now</Link>
        <span aria-hidden="true">📦</span>
      </div>
      <nav ref={navigationRef} aria-label="Main navigation" className={styles.navigation}>
        <button
          ref={menuButtonRef}
          type="button"
          className={styles.menuButton}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="site-header-menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span>{isMenuOpen ? "Close" : "Menu"}</span>
          {isMenuOpen ? (
            <X size={22} aria-hidden="true" />
          ) : (
            <Menu size={22} aria-hidden="true" />
          )}
        </button>
        <Link href="/" aria-label="AthiMart home" className={styles.brand}>AthiMart</Link>
        <div className={styles.actions}>
          <Link href="/search" aria-label="Search products" title="Search" className={styles.iconLink}>
            <Search size={23} strokeWidth={1.5} aria-hidden="true" />
          </Link>
          <Link href="/cart" aria-label={`Open shopping cart, ${cartCount} items`} className={styles.cartLink}>
            <ShoppingBag size={22} strokeWidth={1.5} aria-hidden="true" className={styles.cartIcon} />
            <span className={styles.cartLabel}>Cart ({cartCount})</span>
            <span className={styles.mobileCartCount} aria-hidden="true">{cartCount}</span>
          </Link>
          <Link href="/account" aria-label="Open account" title="Account" className={styles.accountLink}>
            <CircleUserRound size={32} strokeWidth={1.4} aria-hidden="true" />
            <span className={styles.accountLabel}>Account</span>
          </Link>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="site-header-menu"
              className={styles.dropdown}
              initial={reduceMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.18 }}
            >
              <p className={styles.menuHeading}>EXPLORE ATHIMART</p>
              <div className={styles.navigationItems}>
                {navigationItems.map(({ href, label }) => (
                  <Link key={href} href={href} onClick={() => setIsMenuOpen(false)} className={styles.navigationItem}>
                    {label}<ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <div className={styles.utilityItems}>
                {menuItems.map(({ href, label, description, icon: Icon }) => (
                  <Link key={href} href={href} onClick={() => setIsMenuOpen(false)} className={styles.menuItem}>
                    <span className={styles.icon}><Icon size={20} aria-hidden="true" /></span>
                    <span className={styles.itemText}>
                      <span className={styles.label}>{label}</span>
                      <span className={styles.description}>{description}</span>
                    </span>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

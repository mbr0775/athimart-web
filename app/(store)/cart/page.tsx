"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "@/components/navigation/navigation-link";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronRight, LockKeyhole, Minus, Plus, RotateCcw, ShoppingBag, Trash2 } from "lucide-react";

import { CART_STORAGE_KEY, clearStoredCart, getCartSubtotal, readCart, writeCart } from "@/lib/cart/cart-storage";
import { loadCartVariants } from "./actions";
import { switchCartVariant } from "@/lib/cart/switch-cart-variant";
import type { VariantOption } from "@/lib/products/product-variant-service";
import CartProductImage from "@/components/cart/cart-product-image";
import { editorialFont } from "@/lib/fonts";
import { getProductPath } from "@/lib/products/product-url";
import type { ShoppingCart } from "@/types/cart";
import styles from "./cart.module.css";

const CART_UPDATED_EVENT = "athimart-cart-updated";

function createEmptyCart(): ShoppingCart {
  return { items: [], updatedAt: new Date().toISOString() };
}

function formatCurrency(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-LK", { style: "currency", currency: currencyCode, maximumFractionDigits: 0 }).format(amount);
}

export default function CartPage() {
  const [cart, setCart] = useState<ShoppingCart>(createEmptyCart);
  const [isLoaded, setIsLoaded] = useState(false);
  const [undoCart, setUndoCart] = useState<ShoppingCart | null>(null);
  const [notice, setNotice] = useState("");
  const [variants, setVariants] = useState<Record<string, VariantOption[]>>({});
  const variantLookupKey = cart.items.filter((item) => item.currencyCode === "LKR").map((item) => item.productId).sort().join(",");
  const reduceMotion = useReducedMotion();
  const refreshCart = useCallback(() => { setCart(readCart()); setIsLoaded(true); }, []);

  useEffect(() => {
    const timer = window.setTimeout(refreshCart, 0);
    function handleStorageChange(event: StorageEvent) {
      if (event.key === CART_STORAGE_KEY || event.key === null) {
        setUndoCart(null);
        setNotice("");
        refreshCart();
      }
    }
    window.addEventListener(CART_UPDATED_EVENT, refreshCart);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(CART_UPDATED_EVENT, refreshCart);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshCart]);

  useEffect(() => {
    if (!variantLookupKey) return;
    let active = true;
    loadCartVariants(variantLookupKey.split(",")).then((groups) => {
      if (!active) return;
      const byId: Record<string, VariantOption[]> = {};
      for (const options of Object.values(groups)) {
        for (const option of options) byId[option.product.productId] = options;
      }
      setVariants(byId);
    }).catch(() => { if (active) setVariants({}); });
    return () => { active = false; };
  }, [variantLookupKey]);

  const subtotal = useMemo(() => getCartSubtotal(cart), [cart]);
  const itemCount = useMemo(() => cart.items.reduce((total, item) => total + item.quantity, 0), [cart.items]);
  const currencyCode = cart.items[0]?.currencyCode ?? "LKR";

  function saveUpdatedCart(updatedCart: ShoppingCart) {
    setCart(writeCart(updatedCart));
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
  }

  function changeVariant(currentId: string, nextId: string) {
    const target = variants[currentId]?.find((option) => option.product.productId === nextId);
    if (!target) return;
    const result = switchCartVariant(readCart(), currentId, target);
    if (!result) return;
    setUndoCart(null);
    if (result.cart) saveUpdatedCart(result.cart);
    setNotice(result.notice);
  }

  function changeQuantity(productId: string, change: number) {
    const item = cart.items.find((item) => item.productId === productId);
    if (!item) return;
    const quantity = Math.min(Math.max(1, item.stock), Math.max(1, item.quantity + change));
    setUndoCart(null);
    saveUpdatedCart({ items: cart.items.map((current) => current.productId === productId ? { ...current, quantity } : current), updatedAt: new Date().toISOString() });
    setNotice(`${item.name}: quantity updated to ${quantity}.`);
  }

  function removeItem(productId: string) {
    const item = cart.items.find((item) => item.productId === productId);
    setUndoCart(cart);
    saveUpdatedCart({ items: cart.items.filter((item) => item.productId !== productId), updatedAt: new Date().toISOString() });
    setNotice(`${item?.name ?? "Item"} removed from your bag.`);
  }

  function clearCart() {
    setUndoCart(cart);
    setCart(clearStoredCart());
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
    setNotice("Your shopping bag has been cleared.");
  }

  function undoLastRemoval() {
    if (!undoCart) return;
    saveUpdatedCart(undoCart);
    setUndoCart(null);
    setNotice("Your items are back in your bag.");
  }

  return (
    <div className={`${styles.page} ${editorialFont.variable}`}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link><ChevronRight size={12} aria-hidden="true" /><span aria-current="page">Shopping bag</span>
        </nav>

        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}><span aria-hidden="true" /> A few good finds</p>
            <h1 className={styles.heading}>Your shopping <em>bag.</em></h1>
            <p className={styles.subtitle}>
              {isLoaded ? <><span className={styles.itemCount}>{itemCount}</span> {itemCount === 1 ? "item" : "items"} picked by you. Ready for what&apos;s next.</> : "Gathering your good finds…"}
            </p>
          </div>
          <ol className={styles.steps} aria-label="Checkout progress">
            <li aria-current="step"><span>01</span> Your bag</li>
            <li><span>02</span> Checkout</li>
            <li><span>03</span> All yours</li>
          </ol>
        </header>

        {notice && (
          <div className={styles.notice}>
            <Check size={16} aria-hidden="true" /><p role="status">{notice}</p>
            {undoCart && <button type="button" onClick={undoLastRemoval}><RotateCcw size={14} aria-hidden="true" />Undo</button>}
          </div>
        )}

        {!isLoaded ? (
          <div className={styles.loading} role="status" aria-label="Loading your shopping bag" aria-busy="true">
            <div className={styles.loadingItems}><div /><div /></div><div className={styles.loadingSummary} />
            <span className="sr-only">Loading your shopping bag…</span>
          </div>
        ) : cart.items.length === 0 ? (
          <section className={styles.empty} aria-labelledby="empty-bag-heading">
            <div className={styles.emptyCopy}>
              <p className={styles.eyebrow}>Room for something lovely</p>
              <h2 id="empty-bag-heading">Your next favourite<br />is waiting.</h2>
              <p>Your bag is empty for now. Explore the marketplace and bring a little more of what you love into your everyday.</p>
              <Link href="/shop" className={styles.primaryLink}>Discover the collection<ArrowUpRight size={18} aria-hidden="true" /></Link>
              <Link href="/search" className={styles.emptySearch}>Have something in mind? Search the store <ArrowRight size={14} aria-hidden="true" /></Link>
            </div>
            <div className={styles.emptyVisual} aria-hidden="true">
              <div className={styles.bagIllustration}><ShoppingBag size={76} strokeWidth={0.9} /><span>AthiMart</span></div>
              <span className={styles.emptyNote}>Good things are on the way.</span>
            </div>
          </section>
        ) : (
          <div className={styles.layout}>
            <section className={styles.items} aria-labelledby="cart-items-heading">
              <div className={styles.listHeader}>
                <h2 id="cart-items-heading">Your selection <span>({cart.items.length})</span></h2>
                <Link href="/shop"><ArrowLeft size={15} aria-hidden="true" />Keep exploring</Link>
              </div>
              <AnimatePresence initial={false}>
                {cart.items.map((item) => (
                  <m.article
                    key={item.productId}
                    className={styles.item}
                    initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link href={getProductPath(item)} className={styles.imageLink} aria-label={`View ${item.name}`}><CartProductImage item={item} className={styles.productImage} fallbackClassName={styles.imageFallback} /></Link>
                    <div className={styles.itemDetails}>
                      <div className={styles.itemTop}>
                        <div className={styles.productCopy}>
                          <p className={styles.brand}>{item.companyName}</p>
                          <h3 className={styles.productName}><Link href={getProductPath(item)}>{item.name}</Link></h3>
                          <p className={styles.category}>{item.category}<span aria-hidden="true"> / </span>{item.subCategory}</p>
                          <p className={styles.availability} data-unavailable={item.stock <= 0}><span aria-hidden="true" />{item.stock > 0 ? `${item.stock} available` : "Currently unavailable"}</p>
                        </div>
                        <button type="button" onClick={() => removeItem(item.productId)} className={styles.removeButton} aria-label={`Remove ${item.name} from cart`} title="Remove item"><Trash2 size={16} strokeWidth={1.6} aria-hidden="true" /></button>
                      </div>
                      {item.currencyCode === "LKR" && (variants[item.productId]?.length ?? 0) > 1 && (
                        <label className={styles.packSelector}>
                          <span>{variants[item.productId].every(({ values }) => values.packSize && Object.keys(values).length === 1) ? "Pack size" : "Product option"}</span>
                          <select aria-label={`Product option for ${item.name}`} value={item.productId}
                            onChange={(event) => changeVariant(item.productId, event.target.value)}>
                            {variants[item.productId].map(({ label, product }) => (
                              <option key={product.productId} value={product.productId}
                                disabled={product.productId !== item.productId && (product.stock <= 0 || product.unitPrice <= 0)}>
                                {label} · {product.stock > 0 && product.unitPrice > 0 ? formatCurrency(product.unitPrice, product.currencyCode) : "Unavailable"}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      <div className={styles.itemBottom}>
                        <div className={styles.quantity} role="group" aria-label={`Quantity for ${item.name}`}>
                          <button type="button" disabled={item.quantity <= 1} onClick={() => changeQuantity(item.productId, -1)} aria-label={`Reduce ${item.name} quantity`}><Minus size={15} aria-hidden="true" /></button>
                          <span aria-label={`${item.quantity} selected`}>{item.quantity}</span>
                          <button type="button" disabled={item.quantity >= item.stock} onClick={() => changeQuantity(item.productId, 1)} aria-label={`Increase ${item.name} quantity`}><Plus size={15} aria-hidden="true" /></button>
                        </div>
                        <div className={styles.itemPrice}>
                          <span>{formatCurrency(item.unitPrice, item.currencyCode)} each</span>
                          <m.p key={item.quantity} initial={{ opacity: reduceMotion ? 1 : 0.5, y: reduceMotion ? 0 : 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.2 }}>{formatCurrency(item.unitPrice * item.quantity, item.currencyCode)}</m.p>
                        </div>
                      </div>
                    </div>
                  </m.article>
                ))}
              </AnimatePresence>
              <div className={styles.listFooter}>
                <p><ShoppingBag size={15} aria-hidden="true" />A few favourites, all in one place.</p>
                <button type="button" onClick={clearCart}><Trash2 size={14} aria-hidden="true" />Clear bag</button>
              </div>
            </section>

            <aside className={styles.summary} aria-labelledby="order-summary-heading">
              <div className={styles.summaryHeading}><span className={styles.summaryIcon}><ShoppingBag size={20} strokeWidth={1.4} aria-hidden="true" /></span><p className={styles.eyebrow}>The lovely details</p></div>
              <h2 id="order-summary-heading">Order summary<span>.</span></h2>
              <dl className={styles.breakdown}>
                <div><dt>Items in your bag</dt><dd>{itemCount}</dd></div>
                <div><dt>Subtotal</dt><dd>{formatCurrency(subtotal, currencyCode)}</dd></div>
                <div><dt>Delivery</dt><dd className={styles.delivery}>At checkout</dd></div>
              </dl>
              <div className={styles.total}>
                <span>Estimated total</span>
                <m.p key={subtotal} initial={{ opacity: reduceMotion ? 1 : 0.5 }} animate={{ opacity: 1 }} transition={{ duration: reduceMotion ? 0 : 0.25 }}>{formatCurrency(subtotal, currencyCode)}</m.p>
                <p>Delivery costs are calculated at checkout.</p>
              </div>
              <Link href="/checkout" className={styles.checkoutLink}><LockKeyhole size={16} strokeWidth={1.7} aria-hidden="true" /><span>Continue to checkout</span><ArrowRight size={18} aria-hidden="true" /></Link>
              <p className={styles.checkoutNote}><Check size={14} aria-hidden="true" />Current prices and stock confirmed at checkout.</p>
              <Link href="/returns" className={styles.returnsLink}><RotateCcw size={14} aria-hidden="true" />Returns information<ArrowUpRight size={14} aria-hidden="true" /></Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

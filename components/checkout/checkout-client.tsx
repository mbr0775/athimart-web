"use client";

import { useEffect, useMemo, useRef, useState, type FocusEvent, type FormEvent } from "react";
import Link from "@/components/navigation/navigation-link";
import { useReducedMotion } from "motion/react";
import { AlertCircle, ArrowLeft, ArrowRight, ArrowUpRight, Banknote, Check, CheckCircle2, ChevronRight, LoaderCircle, LockKeyhole, MapPin, PackageCheck, Phone, ShoppingBag, UserRound } from "lucide-react";

import { createCheckoutOrder, type CheckoutOrderResult } from "@/app/(store)/checkout/actions";
import CartProductImage from "@/components/cart/cart-product-image";
import { CART_STORAGE_KEY, clearStoredCart, getCartSubtotal, readCart } from "@/lib/cart/cart-storage";
import { editorialFont } from "@/lib/fonts";
import type { ShoppingCart } from "@/types/cart";
import { deliveryDetailsFromForm, validateDeliveryDetails } from "@/lib/account/delivery-details";
import { useDeliveryProfileSave } from "@/lib/hooks/use-delivery-profile-save";
import type { DeliveryDetails } from "@/types/delivery-details";
import styles from "@/app/(store)/checkout/checkout.module.css";

const CART_UPDATED_EVENT = "athimart-cart-updated";

function createEmptyCart(): ShoppingCart {
  return { items: [], updatedAt: new Date().toISOString() };
}

function getFormText(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value.trim() : "";
}

function formatLkr(amount: number): string {
  return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(amount);
}

export default function CheckoutClient({ initialDeliveryDetails, isSignedIn, profileError }: { initialDeliveryDetails: DeliveryDetails; isSignedIn: boolean; profileError: string }) {
  const [cart, setCart] = useState<ShoppingCart>(createEmptyCart);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [completedOrder, setCompletedOrder] = useState<CheckoutOrderResult | null>(null);
  const reduceMotion = useReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);
  const profileSave = useDeliveryProfileSave(initialDeliveryDetails);

  function saveProfileDetails() {
    if (!formRef.current || !formRef.current.reportValidity()) return;
    void profileSave.save(deliveryDetailsFromForm(new FormData(formRef.current)));
  }

  function saveValidDetailsOnBlur(event: FocusEvent<HTMLFormElement>) {
    const inputName = event.target.getAttribute("name");
    if (!isSignedIn || isSubmitting || !inputName?.startsWith("shipping") || !formRef.current) return;
    const details = deliveryDetailsFromForm(new FormData(formRef.current));
    if (validateDeliveryDetails(details).valid) void profileSave.save(details);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { setCart(readCart()); setIsLoaded(true); }, 0);
    function handleCartUpdated() { setCart(readCart()); }
    function handleStorageChange(event: StorageEvent) {
      if (event.key === CART_STORAGE_KEY || event.key === null) setCart(readCart());
    }
    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const itemCount = useMemo(() => cart.items.reduce((total, item) => total + item.quantity, 0), [cart.items]);
  const browserSubtotal = useMemo(() => getCartSubtotal(cart), [cart]);

  function scrollToFeedback() {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || cart.items.length === 0) return;
    setErrorMessage("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      // Finish earlier autosaves before the final order saves this exact address.
      await profileSave.waitForPendingSaves();
      const result = await createCheckoutOrder({
        items: cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingName: getFormText(formData, "shippingName"),
        shippingPhone: getFormText(formData, "shippingPhone"),
        shippingAddressLine1: getFormText(formData, "shippingAddressLine1"),
        shippingAddressLine2: getFormText(formData, "shippingAddressLine2"),
        shippingCity: getFormText(formData, "shippingCity"),
        shippingState: getFormText(formData, "shippingState"),
        shippingPostalCode: getFormText(formData, "shippingPostalCode"),
        shippingCountry: "Sri Lanka",
        paymentMethod: "Cash on Delivery",
      });
      if (!result.success) {
        if (result.code === "UNAUTHENTICATED") {
          window.location.assign(`/auth/login?next=${encodeURIComponent("/checkout")}`);
          return;
        }
        setErrorMessage(result.message);
        scrollToFeedback();
        return;
      }
      setCart(clearStoredCart());
      setCompletedOrder(result.order);
      window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
      scrollToFeedback();
    } catch (error) {
      console.error("Checkout submission failed:", error);
      setErrorMessage("Something went wrong while placing your order. Please try again.");
      scrollToFeedback();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={`${styles.page} ${editorialFont.variable}`}>
      <div className={styles.container}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link href="/">Home</Link><ChevronRight size={12} aria-hidden="true" /><Link href="/cart">Shopping bag</Link><ChevronRight size={12} aria-hidden="true" /><span aria-current="page">{completedOrder ? "Confirmation" : "Checkout"}</span>
        </nav>

        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}><LockKeyhole size={13} strokeWidth={1.6} aria-hidden="true" />{completedOrder ? "Order confirmed" : "A little closer to yours"}</p>
            <h1 className={styles.heading}>{completedOrder ? <>All <em>yours.</em></> : <>Make it <em>yours.</em></>}</h1>
            <p className={styles.subtitle}>{completedOrder ? "Thank you for making AthiMart part of your everyday." : "Add your delivery details, review your bag, and place your order."}</p>
          </div>
          <ol className={styles.steps} aria-label="Checkout progress">
            <li data-complete="true"><Link href="/cart"><span><Check size={12} aria-hidden="true" /></span>Your bag</Link></li>
            <li aria-current={completedOrder ? undefined : "step"} data-complete={Boolean(completedOrder)}><span>{completedOrder ? <Check size={12} aria-hidden="true" /> : "02"}</span>Checkout</li>
            <li aria-current={completedOrder ? "step" : undefined}><span>03</span>All yours</li>
          </ol>
        </header>

        {!isLoaded ? (
          <div className={styles.loading} role="status" aria-label="Loading secure checkout" aria-busy="true"><div className={styles.loadingForm}><div /><div /></div><div className={styles.loadingSummary} /><span className="sr-only">Loading secure checkout…</span></div>
        ) : completedOrder ? (
          <section className={styles.confirmation} aria-labelledby="confirmation-heading">
            <div className={styles.confirmationIntro}>
              <span className={styles.confirmationIcon}><CheckCircle2 size={38} strokeWidth={1.3} aria-hidden="true" /></span>
              <p className={styles.eyebrow}>A few good finds, now yours</p>
              <h2 id="confirmation-heading">Thanks for shopping<br /><em>with us.</em></h2>
              <p>Your order has been placed with Cash on Delivery. Keep your order number handy for future reference.</p>
              <div className={styles.orderNumber}><span>Your order number</span><strong>{completedOrder.orderNumber}</strong></div>
            </div>
            <div className={styles.confirmationDetails}>
              <p className={styles.eyebrow}>The order details</p>
              <dl className={styles.receipt}>
                <div><dt>Order status</dt><dd>{completedOrder.status}</dd></div>
                <div><dt>Items</dt><dd>{completedOrder.itemsCount}</dd></div>
                <div><dt>Payment</dt><dd>Cash on Delivery</dd></div>
                <div><dt>Subtotal</dt><dd>{formatLkr(completedOrder.subtotal)}</dd></div>
                <div><dt>Delivery</dt><dd>{formatLkr(completedOrder.deliveryFee)}</dd></div>
                <div className={styles.receiptTotal}><dt>Order total</dt><dd>{formatLkr(completedOrder.total)}</dd></div>
              </dl>
              <Link href="/orders" className={styles.primaryLink}>View your orders<ArrowRight size={17} aria-hidden="true" /></Link>
              <Link href="/shop" className={styles.secondaryLink}>Keep exploring<ArrowUpRight size={16} aria-hidden="true" /></Link>
              <Link href="/account" className={styles.accountLink}>Your order information is saved in your account.</Link>
            </div>
          </section>
        ) : cart.items.length === 0 ? (
          <section className={styles.empty} aria-labelledby="empty-checkout-heading">
            <span className={styles.emptyIcon}><ShoppingBag size={38} strokeWidth={1.2} aria-hidden="true" /></span>
            <p className={styles.eyebrow}>First, a few good finds</p>
            <h2 id="empty-checkout-heading">Your bag is waiting<br />for something lovely.</h2>
            <p>Add a product to your shopping bag, then come back to make it yours.</p>
            <Link href="/shop" className={styles.primaryLink}>Explore the collection<ArrowUpRight size={17} aria-hidden="true" /></Link>
          </section>
        ) : (
          <>
            {errorMessage && <div className={styles.error} role="alert"><AlertCircle size={19} aria-hidden="true" /><div><h2>Let&apos;s check a few details.</h2><p>{errorMessage}</p></div></div>}
            <form ref={formRef} onSubmit={handleSubmit} onBlurCapture={saveValidDetailsOnBlur} aria-busy={isSubmitting} className={styles.layout}>
              <div className={styles.formSections}>
                <fieldset className={styles.section} disabled={isSubmitting}>
                  <legend className="sr-only">Contact details</legend>
                  <div className={styles.sectionHeader}><span className={styles.sectionNumber}>01</span><div><p className={styles.eyebrow}>The essentials</p><h2>Contact details</h2></div><UserRound size={21} strokeWidth={1.3} aria-hidden="true" className={styles.sectionIcon} /></div>
                  <p className={styles.sectionDescription}>Who should we contact about this order?</p>
                  <div className={styles.fields}>
                    <label className={styles.field} htmlFor="shipping-name"><span>Full name <span className={styles.required}>*</span></span><div className={styles.inputWrap}><UserRound size={17} strokeWidth={1.5} aria-hidden="true" /><input id="shipping-name" type="text" name="shippingName" defaultValue={initialDeliveryDetails.shippingName} required minLength={2} maxLength={120} autoComplete="name" placeholder="Enter your full name" /></div></label>
                    <label className={styles.field} htmlFor="shipping-phone"><span>Phone number <span className={styles.required}>*</span></span><div className={styles.inputWrap}><Phone size={17} strokeWidth={1.5} aria-hidden="true" /><input id="shipping-phone" type="tel" name="shippingPhone" defaultValue={initialDeliveryDetails.shippingPhone} required minLength={7} maxLength={30} autoComplete="tel" inputMode="tel" placeholder="+94 77 123 4567" /></div></label>
                  </div>
                </fieldset>

                <fieldset className={styles.section} disabled={isSubmitting}>
                  <legend className="sr-only">Delivery address</legend>
                  <div className={styles.sectionHeader}><span className={styles.sectionNumber}>02</span><div><p className={styles.eyebrow}>A place to call home</p><h2>Where should we deliver?</h2></div><MapPin size={21} strokeWidth={1.3} aria-hidden="true" className={styles.sectionIcon} /></div>
                  <p className={styles.sectionDescription}>Fields marked <span className={styles.required}>*</span> are required. Add a landmark if it helps us find you.</p>
                  <div className={styles.fields}>
                    <label className={`${styles.field} ${styles.fullWidth}`} htmlFor="shipping-address1"><span>Street address <span className={styles.required}>*</span></span><input className={styles.input} id="shipping-address1" type="text" name="shippingAddressLine1" defaultValue={initialDeliveryDetails.shippingAddressLine1} required minLength={5} maxLength={200} autoComplete="address-line1" placeholder="House number, street, and area" /></label>
                    <label className={`${styles.field} ${styles.fullWidth}`} htmlFor="shipping-address2"><span>Apartment, building, or landmark <span className={styles.optional}>optional</span></span><input className={styles.input} id="shipping-address2" type="text" name="shippingAddressLine2" defaultValue={initialDeliveryDetails.shippingAddressLine2} maxLength={200} autoComplete="address-line2" placeholder="Anything that makes your address easier to find" /></label>
                    <label className={styles.field} htmlFor="shipping-city"><span>City <span className={styles.required}>*</span></span><input className={styles.input} id="shipping-city" type="text" name="shippingCity" defaultValue={initialDeliveryDetails.shippingCity} required minLength={2} maxLength={100} autoComplete="address-level2" placeholder="Your city" /></label>
                    <label className={styles.field} htmlFor="shipping-state"><span>Province or district <span className={styles.optional}>optional</span></span><input className={styles.input} id="shipping-state" type="text" name="shippingState" defaultValue={initialDeliveryDetails.shippingState} maxLength={100} autoComplete="address-level1" placeholder="Province or district" /></label>
                    <label className={styles.field} htmlFor="shipping-postal"><span>Postal code <span className={styles.optional}>optional</span></span><input className={styles.input} id="shipping-postal" type="text" name="shippingPostalCode" defaultValue={initialDeliveryDetails.shippingPostalCode} maxLength={30} autoComplete="postal-code" inputMode="numeric" placeholder="Postal code" /></label>
                    <label className={styles.field} htmlFor="shipping-country"><span>Country</span><input className={styles.input} id="shipping-country" type="text" name="shippingCountry" value="Sri Lanka" readOnly autoComplete="country-name" /></label>
                  </div>
                </fieldset>

                <div className={styles.profileSave}>
                  <div>
                    <p className={styles.profileSaveTitle}>{profileSave.status === "saved" ? "Saved for next time" : "Keep your details for next time"}</p>
                    <p role="status" className={styles.profileSaveMessage} data-error={profileSave.status === "error"}>
                      {profileSave.message || profileError || (isSignedIn ? "Complete details save to your profile when you leave a field. You can also save them here." : "Sign in to save your contact and delivery details to your profile.")}
                    </p>
                  </div>
                  {isSignedIn ? <button type="button" onClick={saveProfileDetails} disabled={isSubmitting || profileSave.status === "saving"}>{profileSave.status === "saving" ? <LoaderCircle size={15} className={styles.spinner} aria-hidden="true" /> : <Check size={15} aria-hidden="true" />}Save details</button> : <Link href="/auth/login?next=%2Fcheckout">Sign in<ArrowRight size={15} aria-hidden="true" /></Link>}
                </div>

                <fieldset className={styles.section} disabled={isSubmitting}>
                  <legend className="sr-only">Payment method</legend>
                  <div className={styles.sectionHeader}><span className={styles.sectionNumber}>03</span><div><p className={styles.eyebrow}>Simple and familiar</p><h2>Payment method</h2></div></div>
                  <label className={styles.paymentMethod}>
                    <span className={styles.paymentIcon}><Banknote size={27} strokeWidth={1.3} aria-hidden="true" /></span>
                    <span className={styles.paymentCopy}><strong>Cash on Delivery</strong><span>Pay when your order arrives at your door.</span></span>
                    <input type="radio" name="paymentMethod" value="Cash on Delivery" checked readOnly aria-label="Cash on Delivery" />
                  </label>
                </fieldset>
                <Link href="/cart" className={styles.backLink}><ArrowLeft size={15} aria-hidden="true" />Back to your bag</Link>
              </div>

              <aside className={styles.summary} aria-labelledby="checkout-summary-heading">
                <div className={styles.summaryHeader}><p className={styles.eyebrow}>One last look</p><Link href="/cart">Edit bag<ArrowUpRight size={13} aria-hidden="true" /></Link></div>
                <h2 id="checkout-summary-heading">Your good finds<span>.</span></h2>
                <p className={styles.summaryCaption}>{itemCount} {itemCount === 1 ? "item" : "items"}, chosen by you.</p>
                <ul className={styles.orderItems}>
                  {cart.items.map((item) => <li key={item.productId} className={styles.orderItem}><div className={styles.imageWrap}><CartProductImage item={item} className={styles.summaryImage} fallbackClassName={styles.imageFallback} compact /><span aria-label={`${item.quantity} selected`}>{item.quantity}</span></div><div className={styles.itemCopy}><h3>{item.name}</h3><div className={styles.itemMeta}><span>{item.quantity} × {formatLkr(item.unitPrice)}</span><strong>{formatLkr(item.unitPrice * item.quantity)}</strong></div></div></li>)}
                </ul>
                <dl className={styles.breakdown}><div><dt>Items</dt><dd>{itemCount}</dd></div><div><dt>Subtotal</dt><dd>{formatLkr(browserSubtotal)}</dd></div><div><dt>Delivery</dt><dd>Calculated on order</dd></div></dl>
                <div className={styles.total}><span>Subtotal before delivery</span><strong>{formatLkr(browserSubtotal)}</strong><p>Final prices and delivery fees are confirmed when you place your order.</p></div>
                <div className={styles.paymentNote}><Banknote size={16} strokeWidth={1.5} aria-hidden="true" /><span>Pay on delivery</span><Check size={14} aria-hidden="true" /></div>
                <button type="submit" disabled={isSubmitting} className={styles.submitButton}>{isSubmitting ? <LoaderCircle size={18} className={styles.spinner} aria-hidden="true" /> : <LockKeyhole size={17} strokeWidth={1.5} aria-hidden="true" />}<span>{isSubmitting ? "Placing your order…" : "Place order"}</span>{!isSubmitting && <ArrowRight size={18} aria-hidden="true" />}</button>
                <p className={styles.submitStatus} role="status">{isSubmitting ? "Please wait while we confirm your order." : "By placing your order, you confirm your delivery details are correct."}</p>
                <p className={styles.stockNote}><PackageCheck size={16} strokeWidth={1.4} aria-hidden="true" />Prices and stock are checked before your order is confirmed.</p>
              </aside>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

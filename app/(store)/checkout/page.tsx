"use client";

import type { FormEvent } from "react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  PackageCheck,
  Phone,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import {
  createCheckoutOrder,
  type CheckoutOrderResult,
} from "@/app/(store)/checkout/actions";
import {
  clearStoredCart,
  getCartSubtotal,
  readCart,
} from "@/lib/cart/cart-storage";
import type { ShoppingCart } from "@/types/cart";

const CART_UPDATED_EVENT =
  "athimart-cart-updated";

function createEmptyCart(): ShoppingCart {
  return {
    items: [],
    updatedAt:
      new Date().toISOString(),
  };
}

function getFormText(
  formData: FormData,
  fieldName: string
): string {
  const value =
    formData.get(fieldName);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function formatLkr(
  amount: number
): string {
  return new Intl.NumberFormat(
    "en-LK",
    {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }
  ).format(amount);
}

const textInputClassName =
  "mt-2 min-h-12 w-full border border-[var(--border)] bg-white px-4 font-[var(--font-body)] text-sm text-[var(--text)] outline-none ring-0 transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--brand-blue)] focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none";

const iconInputClassName =
  "min-h-12 w-full bg-transparent px-4 font-[var(--font-body)] text-sm text-[var(--text)] outline-none ring-0 placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none";

export default function CheckoutPage() {
  const [
    cart,
    setCart,
  ] = useState<ShoppingCart>(
    createEmptyCart
  );

  const [
    isLoaded,
    setIsLoaded,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    completedOrder,
    setCompletedOrder,
  ] =
    useState<CheckoutOrderResult | null>(
      null
    );

  /*
   * Read the browser cart only after
   * the Client Component has mounted.
   */
  useEffect(() => {
    const initialTimer =
      window.setTimeout(() => {
        setCart(
          readCart()
        );

        setIsLoaded(true);
      }, 0);

    function handleCartUpdated() {
      setCart(
        readCart()
      );
    }

    function handleStorageChange(
      event: StorageEvent
    ) {
      if (
        event.key ===
          "athimart-shopping-cart" ||
        event.key === null
      ) {
        setCart(
          readCart()
        );
      }
    }

    window.addEventListener(
      CART_UPDATED_EVENT,
      handleCartUpdated
    );

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.clearTimeout(
        initialTimer
      );

      window.removeEventListener(
        CART_UPDATED_EVENT,
        handleCartUpdated
      );

      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  const itemCount =
    useMemo(
      () =>
        cart.items.reduce(
          (
            total,
            item
          ) =>
            total +
            item.quantity,
          0
        ),
      [cart.items]
    );

  const browserSubtotal =
    useMemo(
      () =>
        getCartSubtotal(
          cart
        ),
      [cart]
    );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      isSubmitting ||
      cart.items.length === 0
    ) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    try {
      const result =
        await createCheckoutOrder({
          items:
            cart.items.map(
              (item) => ({
                productId:
                  item.productId,

                quantity:
                  item.quantity,
              })
            ),

          shippingName:
            getFormText(
              formData,
              "shippingName"
            ),

          shippingPhone:
            getFormText(
              formData,
              "shippingPhone"
            ),

          shippingAddressLine1:
            getFormText(
              formData,
              "shippingAddressLine1"
            ),

          shippingAddressLine2:
            getFormText(
              formData,
              "shippingAddressLine2"
            ),

          shippingCity:
            getFormText(
              formData,
              "shippingCity"
            ),

          shippingState:
            getFormText(
              formData,
              "shippingState"
            ),

          shippingPostalCode:
            getFormText(
              formData,
              "shippingPostalCode"
            ),

          shippingCountry:
            "Sri Lanka",

          paymentMethod:
            "Cash on Delivery",
        });

      if (!result.success) {
        if (
          result.code ===
          "UNAUTHENTICATED"
        ) {
          window.location.assign(
            `/auth/login?next=${encodeURIComponent(
              "/checkout"
            )}`
          );

          return;
        }

        setErrorMessage(
          result.message
        );

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      const emptyCart =
        clearStoredCart();

      setCart(
        emptyCart
      );

      setCompletedOrder(
        result.order
      );

      window.dispatchEvent(
        new CustomEvent(
          CART_UPDATED_EVENT
        )
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Checkout submission failed:",
        error
      );

      setErrorMessage(
        "Something went wrong while placing your order. Please try again."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
   * Initial browser-cart loading state.
   */
  if (!isLoaded) {
    return (
      <main className="athimart-container py-16">
        <div className="flex min-h-[360px] items-center justify-center">
          <div className="flex items-center gap-3 font-[var(--font-body)] text-sm text-[var(--text-muted)]">
            <LoaderCircle
              aria-hidden="true"
              className="h-5 w-5 animate-spin"
              strokeWidth={1.8}
            />

            Loading secure checkout...
          </div>
        </div>
      </main>
    );
  }

  /*
   * Successful order confirmation.
   */
  if (completedOrder) {
    return (
      <main className="athimart-container py-10 sm:py-14 lg:py-20">
        <section className="mx-auto max-w-3xl overflow-hidden border border-[var(--border)] bg-white">
          <div className="bg-[var(--brand-blue)] px-6 py-10 text-white sm:px-10 sm:py-14">
            <span className="flex h-16 w-16 items-center justify-center border border-white/30 bg-white/10">
              <CheckCircle2
                aria-hidden="true"
                className="h-8 w-8 text-[var(--brand-orange-light)]"
                strokeWidth={1.7}
              />
            </span>

            <p className="mt-7 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-orange-light)]">
              Order confirmed
            </p>

            <h1 className="mt-3 font-[var(--font-display)] text-5xl font-light uppercase leading-none tracking-[0.04em] sm:text-7xl">
              Thank You
            </h1>

            <p className="mt-5 max-w-xl font-[var(--font-body)] text-sm leading-7 text-white/75">
              Your AthiMart order has been placed
              successfully using Cash on Delivery.
            </p>
          </div>

          <div className="p-6 sm:p-10">
            <div className="border border-[var(--border)] bg-[var(--surface-soft)] p-5">
              <p className="athimart-label text-[var(--text-muted)]">
                Order number
              </p>

              <p className="mt-2 break-all font-[var(--font-body)] text-lg font-bold text-[var(--brand-blue)]">
                {
                  completedOrder.orderNumber
                }
              </p>
            </div>

            <dl className="mt-6 grid border-l border-t border-[var(--border)] sm:grid-cols-2">
              <div className="border-b border-r border-[var(--border)] p-5">
                <dt className="athimart-label text-[var(--text-muted)]">
                  Order status
                </dt>

                <dd className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--warning)]">
                  {
                    completedOrder.status
                  }
                </dd>
              </div>

              <div className="border-b border-r border-[var(--border)] p-5">
                <dt className="athimart-label text-[var(--text-muted)]">
                  Items
                </dt>

                <dd className="mt-2 font-[var(--font-body)] text-sm font-semibold">
                  {
                    completedOrder.itemsCount
                  }
                </dd>
              </div>

              <div className="border-b border-r border-[var(--border)] p-5">
                <dt className="athimart-label text-[var(--text-muted)]">
                  Payment method
                </dt>

                <dd className="mt-2 font-[var(--font-body)] text-sm font-semibold">
                  Cash on Delivery
                </dd>
              </div>

              <div className="border-b border-r border-[var(--border)] p-5">
                <dt className="athimart-label text-[var(--text-muted)]">
                  Order total
                </dt>

                <dd className="mt-2 font-[var(--font-body)] text-xl font-bold">
                  {formatLkr(
                    completedOrder.total
                  )}
                </dd>
              </div>

              <div className="border-b border-r border-[var(--border)] p-5">
                <dt className="athimart-label text-[var(--text-muted)]">
                  Subtotal
                </dt>

                <dd className="mt-2 font-[var(--font-body)] text-sm font-semibold">
                  {formatLkr(
                    completedOrder.subtotal
                  )}
                </dd>
              </div>

              <div className="border-b border-r border-[var(--border)] p-5">
                <dt className="athimart-label text-[var(--text-muted)]">
                  Delivery fee
                </dt>

                <dd className="mt-2 font-[var(--font-body)] text-sm font-semibold">
                  {formatLkr(
                    completedOrder.deliveryFee
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex items-start gap-3 border-l-4 border-[var(--success)] bg-green-50 p-4">
              <PackageCheck
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]"
                strokeWidth={1.8}
              />

              <p className="font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                Keep your order number for future
                reference. Your order information is
                securely stored in your AthiMart
                account.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/account"
                className="athimart-primary-button inline-flex flex-1 items-center justify-center"
              >
                <UserRound
                  aria-hidden="true"
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />

                View Account
              </Link>

              <Link
                href="/shop"
                className="inline-flex min-h-14 flex-1 items-center justify-center gap-3 border border-[var(--brand-blue)] bg-white px-6 text-center font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--brand-blue)] transition-colors hover:bg-[var(--brand-blue-soft)]"
              >
                <ShoppingBag
                  aria-hidden="true"
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />

                Continue Shopping
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /*
   * Empty-cart checkout state.
   */
  if (
    cart.items.length === 0
  ) {
    return (
      <main className="athimart-container py-10 sm:py-14 lg:py-20">
        <section className="mx-auto flex min-h-[440px] max-w-3xl items-center justify-center border border-[var(--border)] bg-white px-6 py-14">
          <div className="flex w-full max-w-xl flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
              <ShoppingBag
                aria-hidden="true"
                className="h-7 w-7"
                strokeWidth={1.7}
              />
            </span>

            <h1 className="athimart-title-large mt-6 text-center">
              Your Cart Is Empty
            </h1>

            <p className="mt-4 max-w-md text-center font-[var(--font-body)] text-sm leading-7 text-[var(--text-muted)]">
              Add at least one available AthiMart
              product before continuing to secure
              checkout.
            </p>

            <Link
              href="/shop"
              className="athimart-primary-button mt-8 inline-flex items-center justify-center"
            >
              <ShoppingBag
                aria-hidden="true"
                className="h-5 w-5"
                strokeWidth={1.8}
              />

              Browse Products
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="athimart-container py-10 sm:py-14 lg:py-20">
      {/* Checkout heading */}
      <section className="border-b border-[var(--black)] pb-8">
        <p className="athimart-label text-[var(--brand-orange-dark)]">
          Secure checkout
        </p>

        <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="athimart-display-medium">
              Complete Your Order
            </h1>

            <p className="mt-3 max-w-2xl font-[var(--font-body)] text-sm leading-6 text-[var(--text-muted)]">
              Enter your delivery information and
              review your order before placing it.
            </p>
          </div>

          <Link
            href="/cart"
            className="inline-flex min-h-11 w-fit items-center justify-center gap-2 border border-[var(--border)] bg-white px-5 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text)] transition-colors hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
          >
            <ArrowLeft
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={1.8}
            />

            Return to Cart
          </Link>
        </div>
      </section>

      <form
        onSubmit={
          handleSubmit
        }
        aria-busy={
          isSubmitting
        }
        className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"
      >
        {/* Delivery form */}
        <section className="border border-[var(--border)] bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4 border-b border-[var(--border)] pb-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
              <MapPin
                aria-hidden="true"
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            </span>

            <div>
              <p className="athimart-label text-[var(--brand-orange-dark)]">
                Delivery details
              </p>

              <h2 className="athimart-title-large mt-2">
                Shipping Information
              </h2>
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="mt-6 flex items-start gap-3 border-l-4 border-[var(--sale)] bg-red-50 p-4 text-[var(--sale)]"
            >
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0"
                strokeWidth={1.8}
              />

              <p className="font-[var(--font-body)] text-sm leading-6">
                {
                  errorMessage
                }
              </p>
            </div>
          )}

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {/* Full name */}
            <label className="sm:col-span-2">
              <span className="athimart-label text-[var(--text-muted)]">
                Full name *
              </span>

              <div className="mt-2 flex min-h-12 items-center border border-[var(--border)] bg-white transition-colors focus-within:border-[var(--brand-blue)]">
                <UserRound
                  aria-hidden="true"
                  className="ml-4 h-5 w-5 shrink-0 text-[var(--brand-blue)]"
                  strokeWidth={1.7}
                />

                <input
                  type="text"
                  name="shippingName"
                  required
                  minLength={2}
                  maxLength={120}
                  autoComplete="name"
                  placeholder="Enter your full name"
                  className={
                    iconInputClassName
                  }
                />
              </div>
            </label>

            {/* Phone */}
            <label className="sm:col-span-2">
              <span className="athimart-label text-[var(--text-muted)]">
                Phone number *
              </span>

              <div className="mt-2 flex min-h-12 items-center border border-[var(--border)] bg-white transition-colors focus-within:border-[var(--brand-blue)]">
                <Phone
                  aria-hidden="true"
                  className="ml-4 h-5 w-5 shrink-0 text-[var(--brand-blue)]"
                  strokeWidth={1.7}
                />

                <input
                  type="tel"
                  name="shippingPhone"
                  required
                  minLength={7}
                  maxLength={30}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+94 77 123 4567"
                  className={
                    iconInputClassName
                  }
                />
              </div>
            </label>

            {/* Address line 1 */}
            <label className="sm:col-span-2">
              <span className="athimart-label text-[var(--text-muted)]">
                Address line 1 *
              </span>

              <input
                type="text"
                name="shippingAddressLine1"
                required
                minLength={5}
                maxLength={200}
                autoComplete="address-line1"
                placeholder="House number, street and area"
                className={
                  textInputClassName
                }
              />
            </label>

            {/* Address line 2 */}
            <label className="sm:col-span-2">
              <span className="athimart-label text-[var(--text-muted)]">
                Address line 2
              </span>

              <input
                type="text"
                name="shippingAddressLine2"
                maxLength={200}
                autoComplete="address-line2"
                placeholder="Apartment, building or nearby landmark"
                className={
                  textInputClassName
                }
              />
            </label>

            {/* City */}
            <label>
              <span className="athimart-label text-[var(--text-muted)]">
                City *
              </span>

              <input
                type="text"
                name="shippingCity"
                required
                minLength={2}
                maxLength={100}
                autoComplete="address-level2"
                placeholder="City"
                className={
                  textInputClassName
                }
              />
            </label>

            {/* Province */}
            <label>
              <span className="athimart-label text-[var(--text-muted)]">
                Province or district
              </span>

              <input
                type="text"
                name="shippingState"
                maxLength={100}
                autoComplete="address-level1"
                placeholder="Province or district"
                className={
                  textInputClassName
                }
              />
            </label>

            {/* Postal code */}
            <label>
              <span className="athimart-label text-[var(--text-muted)]">
                Postal code
              </span>

              <input
                type="text"
                name="shippingPostalCode"
                maxLength={30}
                autoComplete="postal-code"
                inputMode="numeric"
                placeholder="Postal code"
                className={
                  textInputClassName
                }
              />
            </label>

            {/* Country */}
            <label>
              <span className="athimart-label text-[var(--text-muted)]">
                Country
              </span>

              <input
                type="text"
                value="Sri Lanka"
                readOnly
                autoComplete="country-name"
                className="mt-2 min-h-12 w-full cursor-not-allowed border border-[var(--border)] bg-[var(--surface-soft)] px-4 font-[var(--font-body)] text-sm text-[var(--text-muted)] outline-none"
              />
            </label>
          </div>

          {/* Payment method */}
          <div className="mt-8 border-t border-[var(--border)] pt-7">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--brand-orange-soft)] text-[var(--brand-orange-dark)]">
                <Banknote
                  aria-hidden="true"
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />
              </span>

              <div>
                <p className="athimart-label text-[var(--brand-orange-dark)]">
                  Payment method
                </p>

                <h2 className="athimart-title-large mt-2">
                  Cash on Delivery
                </h2>

                <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                  Pay when your AthiMart order is
                  delivered to your address.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final order summary */}
        <aside className="border border-[var(--border)] bg-white p-6 lg:sticky lg:top-32">
          <p className="athimart-label text-[var(--brand-orange-dark)]">
            Final review
          </p>

          <h2 className="athimart-title-large mt-3">
            Order Summary
          </h2>

          <div className="mt-6 max-h-80 space-y-4 overflow-y-auto border-y border-[var(--border)] py-5">
            {cart.items.map(
              (item) => (
                <div
                  key={
                    item.productId
                  }
                  className="flex gap-4"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-[var(--surface-soft)]">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          item.imageUrl
                        }
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="text-2xl"
                      >
                        {
                          item.emoji
                        }
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
                      {
                        item.name
                      }
                    </p>

                    <p className="mt-1 font-[var(--font-body)] text-xs text-[var(--text-muted)]">
                      Qty{" "}
                      {
                        item.quantity
                      }{" "}
                      ×{" "}
                      {formatLkr(
                        item.unitPrice
                      )}
                    </p>
                  </div>

                  <p className="shrink-0 font-[var(--font-body)] text-sm font-bold text-[var(--text)]">
                    {formatLkr(
                      item.unitPrice *
                        item.quantity
                    )}
                  </p>
                </div>
              )
            )}
          </div>

          <dl className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <dt className="font-[var(--font-body)] text-sm text-[var(--text-muted)]">
                Items
              </dt>

              <dd className="font-[var(--font-body)] text-sm font-semibold">
                {
                  itemCount
                }
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="font-[var(--font-body)] text-sm text-[var(--text-muted)]">
                Subtotal
              </dt>

              <dd className="font-[var(--font-body)] text-sm font-semibold">
                {formatLkr(
                  browserSubtotal
                )}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="font-[var(--font-body)] text-sm text-[var(--text-muted)]">
                Delivery
              </dt>

              <dd className="text-right font-[var(--font-body)] text-sm font-semibold">
                Calculated securely
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex items-start gap-3 border border-[var(--border)] bg-[var(--surface-soft)] p-4">
            <LockKeyhole
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]"
              strokeWidth={1.8}
            />

            <p className="font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              Final prices, stock and seller
              availability are checked securely when
              you place the order.
            </p>
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 bg-[var(--brand-blue)] px-6 text-center font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-all duration-200 hover:bg-[var(--brand-blue-dark)] disabled:cursor-not-allowed disabled:bg-neutral-400"
          >
            {isSubmitting ? (
              <LoaderCircle
                aria-hidden="true"
                className="h-5 w-5 animate-spin"
                strokeWidth={1.8}
              />
            ) : (
              <PackageCheck
                aria-hidden="true"
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            )}

            {isSubmitting
              ? "Placing Order..."
              : "Place Order"}
          </button>

          <p className="mt-3 text-center font-[var(--font-body)] text-[9px] leading-5 text-[var(--text-muted)]">
            By placing your order, you confirm that
            the delivery information provided is
            correct.
          </p>
        </aside>
      </form>
    </main>
  );
}
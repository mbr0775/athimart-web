"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  LockKeyhole,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import {
  clearStoredCart,
  getCartSubtotal,
  readCart,
  writeCart,
} from "@/lib/cart/cart-storage";
import type { ShoppingCart } from "@/types/cart";

const CART_UPDATED_EVENT =
  "athimart-cart-updated";

function createEmptyCart(): ShoppingCart {
  return {
    items: [],
    updatedAt: new Date().toISOString(),
  };
}

function formatCurrency(
  amount: number,
  currencyCode: string
): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CartPage() {
  const [cart, setCart] =
    useState<ShoppingCart>(
      createEmptyCart
    );

  const [isLoaded, setIsLoaded] =
    useState(false);

  const refreshCart =
    useCallback(() => {
      setCart(readCart());
      setIsLoaded(true);
    }, []);

  useEffect(() => {
    const initialTimer =
      window.setTimeout(
        refreshCart,
        0
      );

    function handleCartUpdated() {
      refreshCart();
    }

    function handleStorageChange(
      event: StorageEvent
    ) {
      if (
        event.key ===
          "athimart-shopping-cart" ||
        event.key === null
      ) {
        refreshCart();
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
  }, [refreshCart]);

  const subtotal = useMemo(
    () => getCartSubtotal(cart),
    [cart]
  );

  const itemCount = useMemo(
    () =>
      cart.items.reduce(
        (total, item) =>
          total + item.quantity,
        0
      ),
    [cart.items]
  );

  function saveUpdatedCart(
    updatedCart: ShoppingCart
  ) {
    const savedCart =
      writeCart(updatedCart);

    setCart(savedCart);

    window.dispatchEvent(
      new CustomEvent(
        CART_UPDATED_EVENT
      )
    );
  }

  function changeQuantity(
    productId: string,
    change: number
  ) {
    const updatedItems =
      cart.items.map((item) => {
        if (
          item.productId !==
          productId
        ) {
          return item;
        }

        const nextQuantity =
          Math.min(
            item.stock,
            Math.max(
              1,
              item.quantity + change
            )
          );

        return {
          ...item,
          quantity: nextQuantity,
        };
      });

    saveUpdatedCart({
      items: updatedItems,
      updatedAt:
        new Date().toISOString(),
    });
  }

  function removeItem(
    productId: string
  ) {
    const updatedItems =
      cart.items.filter(
        (item) =>
          item.productId !==
          productId
      );

    saveUpdatedCart({
      items: updatedItems,
      updatedAt:
        new Date().toISOString(),
    });
  }

  function clearCart() {
    const emptyCart =
      clearStoredCart();

    setCart(emptyCart);

    window.dispatchEvent(
      new CustomEvent(
        CART_UPDATED_EVENT
      )
    );
  }

  if (!isLoaded) {
    return (
      <main className="athimart-container py-16">
        <div className="flex min-h-[320px] items-center justify-center">
          <p className="font-[var(--font-body)] text-sm text-[var(--text-muted)]">
            Loading your cart...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="athimart-container py-10 sm:py-14 lg:py-20">
      {/* Cart page heading */}
      <section className="border-b border-[var(--black)] pb-8">
        <p className="athimart-label text-[var(--brand-orange-dark)]">
          Shopping bag
        </p>

        <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="athimart-display-medium">
              Your Cart
            </h1>

            <p className="mt-3 font-[var(--font-body)] text-sm text-[var(--text-muted)]">
              {itemCount}{" "}
              {itemCount === 1
                ? "item"
                : "items"}{" "}
              currently in your shopping cart.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex min-h-11 w-fit items-center justify-center gap-2 border border-[var(--border)] bg-white px-5 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text)] transition-colors hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
          >
            <ArrowLeft
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={1.8}
            />

            Continue Shopping
          </Link>
        </div>
      </section>

      {cart.items.length === 0 ? (
        /* Correctly centered empty-cart state */
        <section className="mt-10 flex min-h-[420px] items-center justify-center border border-[var(--border)] bg-white px-6 py-14 sm:min-h-[460px] sm:px-10">
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center text-center">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
              <ShoppingBag
                aria-hidden="true"
                className="h-7 w-7"
                strokeWidth={1.6}
              />
            </span>

            <h2 className="athimart-title-large mt-6 text-center">
              Your Cart Is Empty
            </h2>

            <p className="mt-4 max-w-lg text-center font-[var(--font-body)] text-sm leading-7 text-[var(--text-muted)]">
              Browse AthiMart products and add items
              to your cart before continuing to
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
      ) : (
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Cart products */}
          <section
            aria-label="Cart items"
            className="space-y-4"
          >
            {cart.items.map(
              (item) => (
                <article
                  key={item.productId}
                  className="grid gap-5 border border-[var(--border)] bg-white p-5 sm:grid-cols-[120px_minmax(0,1fr)]"
                >
                  {/* Product image */}
                  <div className="flex aspect-square items-center justify-center overflow-hidden bg-[var(--surface-soft)]">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="text-5xl"
                      >
                        {item.emoji}
                      </span>
                    )}
                  </div>

                  {/* Product details */}
                  <div className="flex min-w-0 flex-col justify-between gap-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="athimart-label text-[var(--text-muted)]">
                          {item.companyName}
                        </p>

                        <h2 className="mt-2 font-[var(--font-display)] text-2xl font-light uppercase tracking-[0.05em] text-[var(--text)]">
                          {item.name}
                        </h2>

                        <p className="mt-2 font-[var(--font-body)] text-xs text-[var(--text-muted)]">
                          {item.category}
                          <span
                            aria-hidden="true"
                            className="mx-2"
                          >
                            /
                          </span>
                          {item.subCategory}
                        </p>

                        <p className="mt-2 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--success)]">
                          {item.stock} available
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            item.productId
                          )
                        }
                        aria-label={`Remove ${item.name} from cart`}
                        title="Remove item"
                        className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--border)] text-[var(--sale)] transition-colors hover:border-[var(--sale)] hover:bg-red-50"
                      >
                        <Trash2
                          aria-hidden="true"
                          className="h-4 w-4"
                          strokeWidth={1.8}
                        />
                      </button>
                    </div>

                    {/* Quantity and price */}
                    <div className="flex flex-col justify-between gap-4 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center">
                      <div className="inline-flex w-fit items-center border border-[var(--border)]">
                        <button
                          type="button"
                          disabled={
                            item.quantity <= 1
                          }
                          onClick={() =>
                            changeQuantity(
                              item.productId,
                              -1
                            )
                          }
                          aria-label={`Reduce ${item.name} quantity`}
                          className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <Minus
                            aria-hidden="true"
                            className="h-4 w-4"
                            strokeWidth={1.8}
                          />
                        </button>

                        <span className="flex h-11 min-w-12 items-center justify-center border-x border-[var(--border)] font-[var(--font-body)] text-sm font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          disabled={
                            item.quantity >=
                            item.stock
                          }
                          onClick={() =>
                            changeQuantity(
                              item.productId,
                              1
                            )
                          }
                          aria-label={`Increase ${item.name} quantity`}
                          className="flex h-11 w-11 items-center justify-center transition-colors hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <Plus
                            aria-hidden="true"
                            className="h-4 w-4"
                            strokeWidth={1.8}
                          />
                        </button>
                      </div>

                      <div className="sm:text-right">
                        <p className="font-[var(--font-body)] text-xs text-[var(--text-muted)]">
                          {formatCurrency(
                            item.unitPrice,
                            item.currencyCode
                          )}{" "}
                          each
                        </p>

                        <p className="mt-1 font-[var(--font-body)] text-lg font-bold text-[var(--text)]">
                          {formatCurrency(
                            item.unitPrice *
                              item.quantity,
                            item.currencyCode
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              )
            )}

            <button
              type="button"
              onClick={clearCart}
              className="inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--sale)] px-5 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--sale)] transition-colors hover:bg-red-50"
            >
              <Trash2
                aria-hidden="true"
                className="h-4 w-4"
                strokeWidth={1.8}
              />

              Clear Cart
            </button>
          </section>

          {/* Order summary */}
          <aside className="border border-[var(--border)] bg-white p-6 lg:sticky lg:top-32">
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Order summary
            </p>

            <h2 className="athimart-title-large mt-3">
              Cart Total
            </h2>

            <div className="mt-7 space-y-4 border-y border-[var(--border)] py-5">
              <div className="flex items-center justify-between gap-4">
                <span className="font-[var(--font-body)] text-sm text-[var(--text-muted)]">
                  Items
                </span>

                <span className="font-[var(--font-body)] text-sm font-semibold">
                  {itemCount}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="font-[var(--font-body)] text-sm text-[var(--text-muted)]">
                  Subtotal
                </span>

                <span className="font-[var(--font-body)] text-xl font-bold">
                  {formatCurrency(
                    subtotal,
                    cart.items[0]
                      ?.currencyCode ?? "LKR"
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="font-[var(--font-body)] text-sm text-[var(--text-muted)]">
                  Delivery
                </span>

                <span className="text-right font-[var(--font-body)] text-sm font-semibold text-[var(--success)]">
                  Calculated at checkout
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 bg-[var(--brand-blue-soft)] p-4">
              <LockKeyhole
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-blue)]"
                strokeWidth={1.8}
              />

              <p className="font-[var(--font-body)] text-xs leading-5 text-[var(--text-muted)]">
                Product prices, seller availability,
                and stock will be securely verified
                before the order is created.
              </p>
            </div>

            <Link
              href="/checkout"
              className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 bg-[var(--brand-blue)] px-6 text-center font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-all duration-200 hover:bg-[var(--brand-blue-dark)]"
            >
              <LockKeyhole
                aria-hidden="true"
                className="h-5 w-5 shrink-0"
                strokeWidth={1.8}
              />

              Proceed to Secure Checkout
            </Link>

            <Link
              href="/shop"
              className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 border border-[var(--border)] bg-white px-5 text-center font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)] transition-colors hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
            >
              <ArrowLeft
                aria-hidden="true"
                className="h-4 w-4"
                strokeWidth={1.8}
              />

              Continue Shopping
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
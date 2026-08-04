"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Check,
  ShoppingBag,
} from "lucide-react";

import {
  readCart,
  writeCart,
} from "@/lib/cart/cart-storage";
import type { CartItem } from "@/types/cart";

interface AddToCartButtonProps {
  product: Omit<
    CartItem,
    "quantity"
  >;
}

export default function AddToCartButton({
  product,
}: Readonly<AddToCartButtonProps>) {
  const [
    quantityInCart,
    setQuantityInCart,
  ] = useState(0);

  const [
    recentlyAdded,
    setRecentlyAdded,
  ] = useState(false);

  const [
    isAdding,
    setIsAdding,
  ] = useState(false);

  const outOfStock =
    product.stock <= 0;

  const maximumStockAdded =
    product.stock > 0 &&
    quantityInCart >=
      product.stock;

  /**
   * Read this product's current quantity
   * from browser local storage.
   */
  const refreshQuantity =
    useCallback(() => {
      const cart =
        readCart();

      const cartItem =
        cart.items.find(
          (item) =>
            item.productId ===
            product.productId
        );

      setQuantityInCart(
        cartItem?.quantity ?? 0
      );
    }, [product.productId]);

  /**
   * Synchronize with browser cart storage.
   *
   * The initial refresh is scheduled after
   * the effect begins, avoiding a synchronous
   * setState call inside the effect body.
   */
  useEffect(() => {
    const initialRefreshTimer =
      window.setTimeout(
        refreshQuantity,
        0
      );

    function handleCartUpdated() {
      refreshQuantity();
    }

    function handleStorageChange(
      event: StorageEvent
    ) {
      if (
        event.key ===
          "athimart-shopping-cart" ||
        event.key === null
      ) {
        refreshQuantity();
      }
    }

    window.addEventListener(
      "athimart-cart-updated",
      handleCartUpdated
    );

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.clearTimeout(
        initialRefreshTimer
      );

      window.removeEventListener(
        "athimart-cart-updated",
        handleCartUpdated
      );

      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, [refreshQuantity]);

  function handleAddToCart() {
    if (
      outOfStock ||
      maximumStockAdded ||
      isAdding
    ) {
      return;
    }

    setIsAdding(true);

    try {
      const currentCart =
        readCart();

      const existingItemIndex =
        currentCart.items.findIndex(
          (item) =>
            item.productId ===
            product.productId
        );

      const updatedItems = [
        ...currentCart.items,
      ];

      let nextQuantity = 1;

      if (
        existingItemIndex >= 0
      ) {
        const existingItem =
          updatedItems[
            existingItemIndex
          ];

        nextQuantity =
          Math.min(
            existingItem.quantity +
              1,
            product.stock
          );

        updatedItems[
          existingItemIndex
        ] = {
          ...existingItem,
          ...product,
          quantity:
            nextQuantity,
        };
      } else {
        updatedItems.push({
          ...product,
          quantity: 1,
        });
      }

      writeCart({
        items:
          updatedItems,

        updatedAt:
          new Date().toISOString(),
      });

      setQuantityInCart(
        nextQuantity
      );

      setRecentlyAdded(true);

      window.dispatchEvent(
        new CustomEvent(
          "athimart-cart-updated"
        )
      );

      window.setTimeout(() => {
        setRecentlyAdded(false);
      }, 1800);
    } finally {
      setIsAdding(false);
    }
  }

  function getButtonText() {
    if (outOfStock) {
      return "Out of Stock";
    }

    if (isAdding) {
      return "Adding...";
    }

    if (maximumStockAdded) {
      return `Maximum Stock Added • Qty ${quantityInCart}`;
    }

    if (recentlyAdded) {
      return `Added to Cart • Qty ${quantityInCart}`;
    }

    if (quantityInCart > 0) {
      return `In Cart: ${quantityInCart} • Add Another`;
    }

    return "Add to Cart";
  }

  return (
    <button
      type="button"
      disabled={
        outOfStock ||
        maximumStockAdded ||
        isAdding
      }
      onClick={
        handleAddToCart
      }
      className="flex min-h-14 w-full items-center justify-center gap-3 bg-[var(--brand-blue)] px-6 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-all duration-200 hover:bg-[var(--brand-blue-dark)] disabled:cursor-not-allowed disabled:bg-neutral-400"
    >
      {recentlyAdded ? (
        <Check
          aria-hidden="true"
          className="h-5 w-5"
          strokeWidth={1.8}
        />
      ) : (
        <ShoppingBag
          aria-hidden="true"
          className="h-5 w-5"
          strokeWidth={1.8}
        />
      )}

      {getButtonText()}
    </button>
  );
}
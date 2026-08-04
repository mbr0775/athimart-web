// lib/cart/cart-storage.ts

import type {
  CartCurrencyCode,
  CartItem,
  ShoppingCart,
} from "@/types/cart";

export const CART_STORAGE_KEY =
  "athimart-shopping-cart";

const ALLOWED_CURRENCIES: CartCurrencyCode[] = [
  "LKR",
  "MVR",
  "USD",
];

function createEmptyCart(): ShoppingCart {
  return {
    items: [],
    updatedAt: new Date().toISOString(),
  };
}

function isCurrencyCode(
  value: unknown
): value is CartCurrencyCode {
  return (
    typeof value === "string" &&
    ALLOWED_CURRENCIES.includes(
      value as CartCurrencyCode
    )
  );
}

function normalizeCartItem(
  value: unknown
): CartItem | null {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }

  const item =
    value as Partial<CartItem>;

  if (
    typeof item.productId !== "string" ||
    !item.productId.trim() ||
    typeof item.slug !== "string" ||
    !item.slug.trim() ||
    typeof item.name !== "string" ||
    !item.name.trim() ||
    typeof item.companyName !== "string" ||
    typeof item.category !== "string" ||
    typeof item.subCategory !== "string" ||
    typeof item.emoji !== "string" ||
    typeof item.unitPrice !== "number" ||
    !Number.isFinite(item.unitPrice) ||
    item.unitPrice < 0 ||
    typeof item.quantity !== "number" ||
    !Number.isInteger(item.quantity) ||
    item.quantity < 1 ||
    typeof item.stock !== "number" ||
    !Number.isInteger(item.stock) ||
    item.stock < 0 ||
    !isCurrencyCode(item.currencyCode)
  ) {
    return null;
  }

  return {
    productId:
      item.productId.trim(),

    slug:
      item.slug.trim(),

    name:
      item.name.trim(),

    companyName:
      item.companyName.trim() ||
      "AthiMart",

    category:
      item.category.trim(),

    subCategory:
      item.subCategory.trim(),

    imageUrl:
      typeof item.imageUrl === "string" &&
      item.imageUrl.trim()
        ? item.imageUrl.trim()
        : null,

    emoji:
      item.emoji.trim() ||
      "📦",

    unitPrice:
      item.unitPrice,

    quantity:
      Math.min(
        item.quantity,
        Math.max(item.stock, 1)
      ),

    stock:
      item.stock,

    currencyCode:
      item.currencyCode,
  };
}

function normalizeCart(
  value: unknown
): ShoppingCart {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return createEmptyCart();
  }

  const cart =
    value as Partial<ShoppingCart>;

  const items = Array.isArray(cart.items)
    ? cart.items
        .map(normalizeCartItem)
        .filter(
          (
            item
          ): item is CartItem =>
            item !== null
        )
    : [];

  return {
    items,
    updatedAt:
      typeof cart.updatedAt === "string"
        ? cart.updatedAt
        : new Date().toISOString(),
  };
}

export function readCart(): ShoppingCart {
  if (
    typeof window === "undefined"
  ) {
    return createEmptyCart();
  }

  try {
    const storedValue =
      window.localStorage.getItem(
        CART_STORAGE_KEY
      );

    if (!storedValue) {
      return createEmptyCart();
    }

    return normalizeCart(
      JSON.parse(storedValue)
    );
  } catch {
    return createEmptyCart();
  }
}

export function writeCart(
  cart: ShoppingCart
): ShoppingCart {
  const normalizedCart =
    normalizeCart({
      ...cart,
      updatedAt:
        new Date().toISOString(),
    });

  if (
    typeof window !== "undefined"
  ) {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(
        normalizedCart
      )
    );
  }

  return normalizedCart;
}

export function clearStoredCart(): ShoppingCart {
  const emptyCart =
    createEmptyCart();

  if (
    typeof window !== "undefined"
  ) {
    window.localStorage.removeItem(
      CART_STORAGE_KEY
    );
  }

  return emptyCart;
}

export function getCartItemCount(
  cart: ShoppingCart
): number {
  return cart.items.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );
}

export function getCartSubtotal(
  cart: ShoppingCart
): number {
  return cart.items.reduce(
    (total, item) =>
      total +
      item.unitPrice *
        item.quantity,
    0
  );
}
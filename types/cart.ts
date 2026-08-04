// types/cart.ts

export type CartCurrencyCode =
  | "LKR"
  | "MVR"
  | "USD";

/**
 * Product information stored inside the browser cart.
 *
 * Prices will be checked again from Supabase
 * before the final order is created.
 */
export interface CartItem {
  productId: string;

  slug: string;
  name: string;
  companyName: string;

  category: string;
  subCategory: string;

  imageUrl: string | null;
  emoji: string;

  unitPrice: number;
  quantity: number;
  stock: number;

  currencyCode: CartCurrencyCode;
}

/**
 * Complete browser-cart structure.
 */
export interface ShoppingCart {
  items: CartItem[];
  updatedAt: string;
}
// types/product.ts

export type CurrencyCode =
  | "LKR"
  | "MVR"
  | "USD";

export interface ProductPrices {
  LKR: number;
  MVR: number;
  USD: number;
}

export interface Product {
  id: string;

  /**
   * Permanent SEO-friendly identifier.
   * Example: honor-watch-5-ultra
   */
  slug: string;

  name: string;
  companyName: string;

  brand: string | null;
  model: string | null;
  sku: string | null;

  category: string;
  subCategory: string;

  description: string;

  seoTitle: string | null;
  seoDescription: string | null;

  emoji: string;

  prices: ProductPrices;
  originalPrices: ProductPrices;

  stock: number;
  discountPercent: number;

  isActive: boolean;
  isFeatured: boolean;

  imageUrls: string[];

  attributes: Record<string, unknown>;

  countryCode: string;

  createdAt: string;
  updatedAt: string | null;
}

export interface ProductRouteRecord {
  slug: string;
  category: string;
  subCategory: string;
}
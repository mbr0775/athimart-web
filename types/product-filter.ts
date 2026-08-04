// types/product-filter.ts

export type ProductStockFilter =
  | "all"
  | "in-stock"
  | "out-of-stock";

export type ProductSortOption =
  | "newest"
  | "oldest"
  | "price-low"
  | "price-high"
  | "name-az"
  | "name-za";

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  brand?: string;

  stock: ProductStockFilter;
  sort: ProductSortOption;

  minPrice?: number;
  maxPrice?: number;

  countryCode: string;
  limit: number;
}

export interface ProductFilterOptions {
  categories: string[];
  subcategories: string[];
  brands: string[];
}
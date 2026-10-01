import type { Product } from "@/types/product";


export interface SubcategoryOption {
  name: string;
  slug: string;
}


export interface CategoryOption {
  name: string;
  slug: string;
  subcategories: SubcategoryOption[];
}


export interface ProductFormProps {
  categories: CategoryOption[];
}


export interface EditProductFormProps {
  product: Product;
  categories: CategoryOption[];
}


export type FieldErrors = Record<string,string>;
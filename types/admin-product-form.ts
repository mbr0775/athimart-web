// types/admin-product-form.ts

export interface AdminProductFormState {
  message: string;

  fieldErrors: Record<
    string,
    string
  >;
}
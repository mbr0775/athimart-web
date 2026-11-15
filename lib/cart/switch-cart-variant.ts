import type { ShoppingCart } from "@/types/cart";
import type { VariantOption } from "@/lib/products/product-variant-service";

export function switchCartVariant(cart: ShoppingCart, currentId: string, target: VariantOption) {
  const current = cart.items.find((item) => item.productId === currentId);
  if (!current || target.product.productId === currentId) return null;

  const replacement = target.product;
  const existing = cart.items.find((item) => item.productId === replacement.productId);
  const quantity = current.quantity + (existing?.quantity ?? 0);
  if (replacement.stock <= 0 || replacement.unitPrice <= 0) {
    return { notice: `${target.label} is currently unavailable.` };
  }
  if (quantity > replacement.stock) {
    return { notice: `Only ${replacement.stock} of the ${target.label} option are available. Reduce the quantity before switching.` };
  }

  const items = cart.items.flatMap((item) => {
    if (item.productId === currentId) return [{ ...replacement, quantity }];
    return item.productId === replacement.productId ? [] : [item];
  });
  return { cart: { ...cart, items }, notice: `Option changed to ${target.label}.` };
}

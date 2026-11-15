import type { ShoppingCart } from "@/types/cart";
import type { PackOption } from "@/lib/products/product-pack-service";

export function switchCartPack(cart: ShoppingCart, currentId: string, target: PackOption) {
  const current = cart.items.find((item) => item.productId === currentId);
  if (!current || target.product.productId === currentId) return null;

  const replacement = target.product;
  const existing = cart.items.find((item) => item.productId === replacement.productId);
  const quantity = current.quantity + (existing?.quantity ?? 0);
  if (replacement.stock <= 0 || replacement.unitPrice <= 0) {
    return { notice: `${target.size} is currently unavailable.` };
  }
  if (quantity > replacement.stock) {
    return { notice: `Only ${replacement.stock} of the ${target.size} pack are available. Reduce the quantity before switching.` };
  }

  const items = cart.items.flatMap((item) => {
    if (item.productId === currentId) return [{ ...replacement, quantity }];
    return item.productId === replacement.productId ? [] : [item];
  });
  return { cart: { ...cart, items }, notice: `Pack changed to ${target.size}.` };
}

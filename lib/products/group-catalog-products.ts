import type { Product } from "@/types/product";
import { nameWithoutOptions, readVariant, variantSummary } from "./product-variants";

export function groupCatalogProducts(products: Product[]) {
  const groups = new Set<string>();
  return products.flatMap((product) => {
    const { group, values } = readVariant(product.attributes);
    if (!product.shopId || !group || !variantSummary(values)) return [product];
    const key = JSON.stringify([product.countryCode, product.shopId, group]);
    if (groups.has(key)) return [];
    groups.add(key);
    return [{ ...product, name: nameWithoutOptions(product.name, values) }];
  });
}

export function productListingSlug(name: string, token: string) {
  const words = listingWords(name).slice(0, 120).replace(/-$/, "");
  return `${words || "product"}-${token}`;
}

export function productListingSku(name: string, token: string, option = "", seller = "") {
  const shopCode = listingWords(seller).split("-").map((word) => word.length <= 3 ? word : word[0]).join("").slice(0, 5).toUpperCase();
  const nameCode = listingWords(name).slice(0, 24).replace(/-$/, "").toUpperCase();
  const optionCode = listingWords(option).slice(0, 20).replace(/-$/, "").toUpperCase();
  return [shopCode || "AM", nameCode || "ITEM", optionCode, token.toUpperCase()].filter(Boolean).join("-");
}

export function productVariantSku(base: string, label: string, optionKey: string) {
  const option = listingWords(label).slice(0, 20).replace(/-$/, "").toUpperCase();
  let hash = 2166136261;
  for (const character of optionKey) hash = Math.imul(hash ^ character.codePointAt(0)!, 16777619);
  const suffix = (hash >>> 0).toString(36).toUpperCase();
  return [base.slice(0, 70), option, suffix].filter(Boolean).join("-");
}

export function productListingEmoji(category: string, subCategory: string) {
  const labels: Record<string, string> = {
    "Bath & Body": "🧼", "Oral Care": "🪥", "Dairy & Eggs": "🥛", "Fresh Fruit & Vegetables": "🥬",
    Grocery: "🛒", Fashion: "👕", "Digital Products": "📱",
  };
  return labels[subCategory] ?? labels[category] ?? "📦";
}

function listingWords(value: string) {
  return value.normalize("NFKD").replace(/\p{Mark}/gu, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

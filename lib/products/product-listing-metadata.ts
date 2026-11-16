import { withoutVariantFields } from "./product-variants";

export type ListingMetadataSource = {
  name?: string;
  category?: string;
  subCategory?: string;
  description?: string;
  brand?: string | null;
};

const specificationLabels: Record<string, string> = {
  "country of origin": "Country of origin",
  "condition": "Condition",
  "ingredients": "Ingredients",
  "care instructions": "Care instructions",
  "storage instructions": "Storage instructions",
};

function clean(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function fit(value: string, limit: number) {
  if (value.length <= limit) return value;
  const excerpt = value.slice(0, limit - 1);
  const end = excerpt.lastIndexOf(" ");
  const trimmed = end >= limit * 0.75 && value[limit - 1] !== " " ? excerpt.slice(0, end) : excerpt;
  return trimmed.replace(/[\s\uD800-\uDBFF]+$/, "") + "…";
}

export function generateListingMetadata(source: ListingMetadataSource) {
  const name = clean(source.name);
  const category = clean(source.category);
  const type = clean(source.subCategory);
  const brand = clean(source.brand ?? "");
  const description = clean(source.description);
  const attributes: Record<string, string> = {};
  if (brand) attributes.Brand = brand;
  if (type) attributes["Product type"] = type;
  if (category) attributes.Category = category;

  for (const line of (source.description ?? "").split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = clean(line.slice(0, separator)).toLowerCase();
    if (!Object.hasOwn(specificationLabels, key)) continue;
    const label = specificationLabels[key];
    const value = clean(line.slice(separator + 1));
    if (label && value && !(label in attributes)) attributes[label] = fit(value, 240);
  }

  const context = [type, category].filter(Boolean).join(" · ");
  return {
    title: fit(name, 70),
    description: fit(description || [name, context].filter(Boolean).join(" · "), 160),
    attributes,
  };
}

export function customListingAttributes(source: ListingMetadataSource, saved: Record<string, unknown>) {
  const generated = generateListingMetadata(source).attributes;
  return Object.fromEntries(Object.entries(withoutVariantFields(saved)).filter(([key, value]) =>
    !Object.hasOwn(generated, key) || generated[key] !== value));
}

export function mergeListingAttributes(source: ListingMetadataSource, custom: Record<string, unknown>) {
  return { ...generateListingMetadata(source).attributes, ...withoutVariantFields(custom) };
}

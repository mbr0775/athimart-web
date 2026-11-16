// Keep the stored pack_group key so existing grocery groups still resolve.
export const VARIANT_GROUP_KEY = "pack_group";
const legacyPackSizeKey = "pack_size";
const optionsKey = "variant_options";
const groupPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const productVariantFields = [
  { key: "colour", label: "Colour", examples: ["Black", "White", "Navy", "Red", "Beige"] },
  { key: "size", label: "Size", examples: ["XS", "S", "M", "L", "XL", "XXL", "EU 42"] },
  { key: "style", label: "Style", examples: ["Classic", "Slim fit", "Relaxed fit"] },
  { key: "design", label: "Design or pattern", examples: ["Plain", "Striped", "Floral", "Printed"] },
  { key: "storage", label: "Storage", examples: ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"] },
  { key: "ram", label: "RAM", examples: ["4 GB", "6 GB", "8 GB", "12 GB", "16 GB"] },
  { key: "packSize", label: "Pack size", examples: ["75 g", "120 g", "350 g", "400 g", "1 kg", "500 ml", "1 L", "6 pack"] },
  { key: "material", label: "Material", examples: ["Cotton", "Linen", "Leather", "Stainless steel"] },
  { key: "flavour", label: "Flavour", examples: ["Original", "Vanilla", "Chocolate", "Strawberry"] },
  { key: "finish", label: "Finish", examples: ["Matte", "Glossy", "Satin"] },
  { key: "custom", label: "Other option", examples: [] },
] as const;

export type VariantKey = (typeof productVariantFields)[number]["key"];
export type VariantValues = Partial<Record<VariantKey, string>>;

export function readVariant(attributes: Record<string, unknown>) {
  const rawGroup = attributes[VARIANT_GROUP_KEY];
  const group = typeof rawGroup === "string" && rawGroup.length <= 72 && groupPattern.test(rawGroup) ? rawGroup : "";
  const raw = attributes[optionsKey];
  const values: VariantValues = {};
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const { key } of productVariantFields) {
      const value: unknown = (raw as Record<string, unknown>)[key];
      if (typeof value === "string" && value.trim() && value.length <= 48) values[key] = value.trim();
    }
  }
  const legacySize = attributes[legacyPackSizeKey];
  if (!values.packSize && typeof legacySize === "string" && legacySize.trim() && legacySize.length <= 48) {
    values.packSize = legacySize.trim();
  }
  return { group, values };
}

export function variantSummary(values: VariantValues) {
  return productVariantFields
    .flatMap(({ key }) => values[key] ? [values[key]] : [])
    .join(" / ");
}

export function withoutVariantFields(attributes: Record<string, unknown>) {
  const specs = { ...attributes };
  delete specs[VARIANT_GROUP_KEY];
  delete specs[legacyPackSizeKey];
  delete specs[optionsKey];
  delete specs[sharedImagesKey];
  return specs;
}

export function productSpecifications(attributes: Record<string, unknown>) {
  const { values } = readVariant(attributes);
  const specs = withoutVariantFields(attributes);
  const normalize = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/^color$/, "colour");
  for (const { key, label } of productVariantFields) {
    const value = values[key];
    if (!value) continue;
    for (const specKey of Object.keys(specs)) {
      if (normalize(specKey) === normalize(key) || normalize(specKey) === normalize(label)) delete specs[specKey];
    }
    specs[label] = value;
  }
  return specs;
}

export const MAX_PRODUCT_VARIANTS = 100;
export function generateVariantCombinations(options: Partial<Record<VariantKey, string[]>>) {
  const groups = productVariantFields.flatMap(({ key }) => {
    const values = options[key];
    return values?.length ? [{ key, values }] : [];
  });
  if (!groups.length) return [];
  if (groups.reduce((total, { values }) => total * values.length, 1) > MAX_PRODUCT_VARIANTS) return null;
  return groups.reduce<VariantValues[]>((combinations, { key, values }) =>
    combinations.flatMap((combination) => values.map((value) => ({ ...combination, [key]: value }))), [{}]);
}

const sharedImagesKey = "shared_variant_images";

export interface VariantRow {
  values: VariantValues;
  price: string;
  originalPrice: string;
  stock: string;
}

export function variantKey(values: VariantValues) {
  return JSON.stringify(productVariantFields.flatMap(({ key }) => {
    const value = values[key];
    return value ? [[key, value.toLowerCase().replace(/\s+/g, "")]] : [];
  }));
}

export function hasSharedVariantImages(attributes: Record<string, unknown> | null | undefined) {
  return attributes?.[sharedImagesKey] === true;
}

export function variantAttributes(group: string, values: VariantValues, sharedImages = false) {
  return {
    ...(group ? { [VARIANT_GROUP_KEY]: group } : {}),
    ...(variantSummary(values) ? { [optionsKey]: values } : {}),
    ...(values.packSize ? { [legacyPackSizeKey]: values.packSize } : {}),
    ...(sharedImages ? { [sharedImagesKey]: true } : {}),
  };
}

type ParsedRow = { values: VariantValues; price: number; originalPrice: number; stock: number };
type VariantSubmission =
  | { valid: true; rows: ParsedRow[] }
  | { valid: false; error: string };

export function parseVariantRows(form: FormData): VariantSubmission {
  const invalid = (error: string): VariantSubmission => ({ valid: false, error });
  if (form.get("variantDraftPending") === "true") return invalid("Add the option you entered, or cancel the entry before saving.");
  const raw = form.get("variantRows");
  if (typeof raw !== "string" || !raw) return { valid: true, rows: [] };
  let input: unknown;
  try { input = JSON.parse(raw); } catch { return invalid("The variant list could not be read."); }
  if (!Array.isArray(input) || input.length > MAX_PRODUCT_VARIANTS) return invalid("Save up to 100 variants per product.");
  if (!input.length && form.get("variantMode") === "multiple") return invalid("Add one size or option, or choose Single product.");
  const rows: ParsedRow[] = [];
  const combinations = new Set<string>();
  for (const [index, row] of input.entries()) {
    const source = row?.values;
    if (!source || typeof source !== "object" || Array.isArray(source)) return invalid("Enter options for each variant.");
    const values = readVariant({ [optionsKey]: source }).values;
    const label = variantSummary(values);
    if (!label || Object.keys(values).length !== Object.keys(source).length) return invalid("Check the selected variant options.");
    const key = variantKey(values);
    if (combinations.has(key)) return invalid(`The ${label} combination was added twice.`);
    combinations.add(key);

    const price = Number(row.price);
    const originalPrice = Number(row.originalPrice ?? "");
    const stock = Number(row.stock);
    if (index > 0 && (typeof row.price !== "string" || !row.price.trim() || !Number.isFinite(price) || price < 0
      || typeof row.stock !== "string" || !row.stock.trim() || !Number.isSafeInteger(stock) || stock < 0 || stock > 2147483647)) {
      return invalid(`Enter a valid price and whole-number stock for ${label}.`);
    }
    if (index > 0 && row.originalPrice !== undefined && (typeof row.originalPrice !== "string"
      || !Number.isFinite(originalPrice) || originalPrice < 0)) {
      return invalid(`Enter a valid original price for ${label}.`);
    }
    rows.push({ values, price, originalPrice: Math.max(price, originalPrice), stock });
  }
  return { valid: true, rows };
}

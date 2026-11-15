// Keep the stored pack_group key so existing grocery groups still resolve.
export const VARIANT_GROUP_KEY = "pack_group";
const legacyPackSizeKey = "pack_size";
const optionsKey = "variant_options";
const groupPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const productVariantFields = [
  { key: "colour", label: "Colour", examples: ["Black", "White", "Navy", "Red", "Beige"] },
  { key: "size", label: "Size", examples: ["XS", "S", "M", "L", "XL", "XXL", "EU 42"] },
  { key: "design", label: "Design or pattern", examples: ["Plain", "Striped", "Floral", "Printed"] },
  { key: "storage", label: "Storage", examples: ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"] },
  { key: "ram", label: "RAM", examples: ["4 GB", "6 GB", "8 GB", "12 GB", "16 GB"] },
  { key: "packSize", label: "Pack size", examples: ["250 g", "400 g", "1 kg", "500 ml", "1 L", "6 pack"] },
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

export function validateVariantFields(form: FormData, productName: string) {
  const group = String(form.get("variantGroup") ?? "").trim().toLowerCase().replace(/\s+/g, "-");
  const values: VariantValues = {};
  if (group && (group.length > 72 || !groupPattern.test(group))) {
    return { attributes: {}, error: "Enter a variant group using letters, numbers, spaces or hyphens." };
  }
  for (const { key, label } of productVariantFields) {
    if (!form.has(`variantEnabled-${key}`)) continue;
    const value = String(form.get(`variantValue-${key}`) ?? "").trim();
    if (!value || value.length > 48) return { attributes: {}, error: `Enter a value for ${label.toLowerCase()}.` };
    values[key] = value;
  }
  if (!variantSummary(values)) {
    return { attributes: {}, error: group ? "Tick at least one option and enter its value for this listing." : "" };
  }
  const compact = (value: string) => value.toLowerCase().replace(/\s+/g, "");
  if (group && Object.values(values).some((value) => !compact(productName).includes(compact(value)))) {
    return { attributes: {}, error: "Include the selected variant values in the product name so they appear on orders." };
  }
  return {
    attributes: {
      [optionsKey]: values,
      ...(group ? { [VARIANT_GROUP_KEY]: group } : {}),
      ...(values.packSize ? { [legacyPackSizeKey]: values.packSize } : {}),
    },
    error: "",
  };
}

export const PACK_GROUP_KEY = "pack_group";
export const PACK_SIZE_KEY = "pack_size";

const groupPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function readPack(attributes: Record<string, unknown>) {
  const group = attributes[PACK_GROUP_KEY];
  const size = attributes[PACK_SIZE_KEY];
  return typeof group === "string" && group.length <= 72 && groupPattern.test(group)
    && typeof size === "string" && size.trim() && size.length <= 40
    ? { group, size: size.trim() }
    : null;
}

export function withoutPackFields(attributes: Record<string, unknown>) {
  const specs = { ...attributes };
  delete specs[PACK_GROUP_KEY];
  delete specs[PACK_SIZE_KEY];
  return specs;
}

export function validatePackFields(form: FormData, productName: string) {
  const rawGroup = String(form.get("packGroup") ?? "").trim();
  const group = rawGroup.toLowerCase().replace(/\s+/g, "-");
  const size = String(form.get("packSize") ?? "").trim();
  if (!group && !size) return { attributes: {}, error: "" };
  if (!group || group.length > 72 || !groupPattern.test(group)) {
    return { attributes: {}, error: "Enter a pack group using letters, numbers, spaces or hyphens." };
  }
  if (!size || size.length > 40) {
    return { attributes: {}, error: "Enter the size of this listing, for example 400 g." };
  }
  const compact = (value: string) => value.toLowerCase().replace(/\s+/g, "");
  if (!compact(productName).includes(compact(size))) {
    return { attributes: {}, error: "Include the pack size in the product name so it appears on the order." };
  }
  return { attributes: { [PACK_GROUP_KEY]: group, [PACK_SIZE_KEY]: size }, error: "" };
}

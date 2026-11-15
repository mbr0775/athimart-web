export const OFFICIAL_SHOP_ID = "athimart-official";
export const OFFICIAL_SHOP_NAME = "AthiMart Official Store";

export function isReservedShopName(value: string) {
  const name = value.trim().toLowerCase();
  return name === "athimart" || name === OFFICIAL_SHOP_NAME.toLowerCase();
}

export function isShopId(value: string) {
  return value === OFFICIAL_SHOP_ID ||
    /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value);
}

export function getShopPath(id: string) {
  return `/shops/${encodeURIComponent(id)}`;
}

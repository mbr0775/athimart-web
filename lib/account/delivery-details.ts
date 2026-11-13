import type { DeliveryDetails } from "@/types/delivery-details";

export const DELIVERY_PROFILE_COLUMNS = "full_name,phone,address_line1,address_line2,city,state,postal_code,country";

export function emptyDeliveryDetails(): DeliveryDetails {
  return { shippingName: "", shippingPhone: "", shippingAddressLine1: "", shippingAddressLine2: "", shippingCity: "", shippingState: "", shippingPostalCode: "", shippingCountry: "Sri Lanka" };
}

function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }

export function deliveryDetailsFromProfile(profile: Record<string, unknown> | null): DeliveryDetails {
  return {
    shippingName: text(profile?.full_name),
    shippingPhone: text(profile?.phone),
    shippingAddressLine1: text(profile?.address_line1),
    shippingAddressLine2: text(profile?.address_line2),
    shippingCity: text(profile?.city),
    shippingState: text(profile?.state),
    shippingPostalCode: text(profile?.postal_code),
    shippingCountry: text(profile?.country) || "Sri Lanka",
  };
}

export function deliveryDetailsFromForm(form: FormData): DeliveryDetails {
  return {
    shippingName: text(form.get("shippingName")),
    shippingPhone: text(form.get("shippingPhone")),
    shippingAddressLine1: text(form.get("shippingAddressLine1")),
    shippingAddressLine2: text(form.get("shippingAddressLine2")),
    shippingCity: text(form.get("shippingCity")),
    shippingState: text(form.get("shippingState")),
    shippingPostalCode: text(form.get("shippingPostalCode")),
    shippingCountry: text(form.get("shippingCountry")) || "Sri Lanka",
  };
}

export function validateDeliveryDetails(input: unknown):
  | { valid: true; details: DeliveryDetails }
  | { valid: false; message: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { valid: false, message: "Please enter your contact and delivery details." };
  const source = input as Record<string, unknown>;
  const details = Object.fromEntries(Object.keys(emptyDeliveryDetails()).map((key) => [key, text(source[key])])) as unknown as DeliveryDetails;
  const checks: [keyof DeliveryDetails, number, number, string][] = [
    ["shippingName", 2, 120, "Enter your full name (2–120 characters)."],
    ["shippingPhone", 7, 30, "Enter a phone number (7–30 characters)."],
    ["shippingAddressLine1", 5, 200, "Enter a street address (5–200 characters)."],
    ["shippingAddressLine2", 0, 200, "Keep the second address line under 201 characters."],
    ["shippingCity", 2, 100, "Enter a city (2–100 characters)."],
    ["shippingState", 0, 100, "Keep the province or district under 101 characters."],
    ["shippingPostalCode", 0, 30, "Keep the postal code under 31 characters."],
    ["shippingCountry", 2, 100, "Enter your delivery country (2–100 characters)."],
  ];
  for (const [key, min, max, message] of checks) {
    if (details[key].length < min || details[key].length > max) return { valid: false, message };
  }
  return { valid: true, details };
}

export interface DeliveryDetails {
  shippingName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
}

export type DeliveryDetailsResult =
  | { success: true; details: DeliveryDetails }
  | { success: false; code: "VALIDATION_ERROR" | "UNAUTHENTICATED" | "SAVE_ERROR"; message: string };

// app/(store)/delivery-partner/dashboard/delivery-availability-state.ts

import type {
  DeliveryPartnerAvailabilityStatus,
} from "@/lib/auth/delivery-partner";

export interface DeliveryAvailabilityActionState {
  success: boolean;
  message: string;

  availabilityStatus:
    | DeliveryPartnerAvailabilityStatus
    | null;

  updatedAt:
    | string
    | null;
}

export const initialDeliveryAvailabilityActionState:
  DeliveryAvailabilityActionState = {
    success: false,
    message: "",
    availabilityStatus: null,
    updatedAt: null,
  };
"use server";

import { revalidatePath } from "next/cache";

import {
  getCurrentDeliveryPartner,
} from "@/lib/auth/delivery-partner";
import { createClient } from "@/lib/supabase/server";

import type {
  DeliveryAvailabilityActionState,
} from "./delivery-availability-state";

type ManualDeliveryAvailabilityStatus =
  | "online"
  | "offline";

interface AvailabilityRpcResponse {
  updated: boolean;

  userId: string;
  applicationStatus: string;

  availabilityStatus:
    ManualDeliveryAvailabilityStatus;

  vehicleId: string;
  vehicleStatus: string;

  vehicleAvailable: boolean;
  liveLocationStored: boolean;

  changedAt: string;
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function normalizeText(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isManualAvailabilityStatus(
  value: unknown
): value is ManualDeliveryAvailabilityStatus {
  return (
    value === "online" ||
    value === "offline"
  );
}

function parseOptionalNumber(
  value: FormDataEntryValue | null
): number | null {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return null;
  }

  const parsedValue =
    Number(value);

  return Number.isFinite(
    parsedValue
  )
    ? parsedValue
    : null;
}

function parseCapturedAt(
  value: FormDataEntryValue | null
): string | null {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return null;
  }

  const timestamp =
    Date.parse(value);

  if (
    !Number.isFinite(timestamp)
  ) {
    return null;
  }

  return new Date(
    timestamp
  ).toISOString();
}

function getSafeAvailabilityError(
  message: string
): string {
  const normalizedMessage =
    message
      .trim()
      .toLowerCase();

  if (
    normalizedMessage.includes(
      "you must sign in"
    )
  ) {
    return "Please sign in before changing your delivery availability.";
  }

  if (
    normalizedMessage.includes(
      "requested delivery availability status is invalid"
    )
  ) {
    return "The selected availability option is invalid.";
  }

  if (
    normalizedMessage.includes(
      "athimart account cannot currently change"
    )
  ) {
    return "This account cannot currently change delivery availability.";
  }

  if (
    normalizedMessage.includes(
      "delivery-partner profile could not be found"
    )
  ) {
    return "Your delivery-partner profile could not be found.";
  }

  if (
    normalizedMessage.includes(
      "only an approved delivery partner"
    )
  ) {
    return "Only approved delivery partners can change availability.";
  }

  if (
    normalizedMessage.includes(
      "active assignment"
    )
  ) {
    return "You cannot change availability while a delivery is active or awaiting your response.";
  }

  if (
    normalizedMessage.includes(
      "verification or location consent is incomplete"
    )
  ) {
    return "Your identity verification, driving licence verification, or location consent is incomplete.";
  }

  if (
    normalizedMessage.includes(
      "approved primary delivery vehicle could not be found"
    )
  ) {
    return "An approved primary delivery vehicle is required before going online.";
  }

  if (
    normalizedMessage.includes(
      "primary delivery vehicle is not approved"
    )
  ) {
    return "Your primary delivery vehicle has not been approved.";
  }

  if (
    normalizedMessage.includes(
      "valid latitude is required"
    ) ||
    normalizedMessage.includes(
      "valid longitude is required"
    )
  ) {
    return "A valid browser location is required before going online.";
  }

  if (
    normalizedMessage.includes(
      "gps accuracy must be"
    )
  ) {
    return "Your current location is not accurate enough. Move to an open area and try again.";
  }

  if (
    normalizedMessage.includes(
      "fresh gps location is required"
    )
  ) {
    return "Your location reading is outdated. Please request your location again.";
  }

  if (
    normalizedMessage.includes(
      "mobile gps or network location is required"
    )
  ) {
    return "A device GPS or network location is required before going online.";
  }

  if (
    normalizedMessage.includes(
      "mock locations cannot be used"
    )
  ) {
    return "Mock locations cannot be used for delivery availability.";
  }

  if (
    normalizedMessage.includes(
      "reported altitude is invalid"
    )
  ) {
    return "The reported location altitude is invalid.";
  }

  if (
    normalizedMessage.includes(
      "reported speed is invalid"
    )
  ) {
    return "The reported movement speed is invalid.";
  }

  if (
    normalizedMessage.includes(
      "reported heading is invalid"
    )
  ) {
    return "The reported movement direction is invalid.";
  }

  if (
    normalizedMessage.includes(
      "reported battery percentage is invalid"
    )
  ) {
    return "The reported device battery percentage is invalid.";
  }

  return "We could not change your delivery availability. Please try again.";
}

function parseAvailabilityRpcResponse(
  value: unknown
): AvailabilityRpcResponse | null {
  if (!isRecord(value)) {
    return null;
  }

  const userId =
    normalizeText(
      value.userId
    );

  const applicationStatus =
    normalizeText(
      value.applicationStatus
    );

  const availabilityStatus =
    normalizeText(
      value.availabilityStatus
    );

  const vehicleId =
    normalizeText(
      value.vehicleId
    );

  const vehicleStatus =
    normalizeText(
      value.vehicleStatus
    );

  const changedAt =
    normalizeText(
      value.changedAt
    );

  if (
    value.updated !== true ||
    !userId ||
    !applicationStatus ||
    !isManualAvailabilityStatus(
      availabilityStatus
    ) ||
    !vehicleId ||
    !vehicleStatus ||
    typeof value.vehicleAvailable !==
      "boolean" ||
    typeof value.liveLocationStored !==
      "boolean" ||
    !changedAt
  ) {
    return null;
  }

  return {
    updated: true,
    userId,
    applicationStatus,
    availabilityStatus,
    vehicleId,
    vehicleStatus,

    vehicleAvailable:
      value.vehicleAvailable,

    liveLocationStored:
      value.liveLocationStored,

    changedAt,
  };
}

export async function setDeliveryPartnerManualAvailability(
  _previousState:
    DeliveryAvailabilityActionState,

  formData:
    FormData
): Promise<DeliveryAvailabilityActionState> {
  const {
    user,
  } =
    await getCurrentDeliveryPartner();

  const requestedStatus =
    normalizeText(
      formData.get(
        "availabilityStatus"
      )
    ).toLowerCase();

  if (
    !isManualAvailabilityStatus(
      requestedStatus
    )
  ) {
    return {
      success: false,
      message:
        "The selected availability option is invalid.",
      availabilityStatus: null,
      updatedAt: null,
    };
  }

  const latitude =
    parseOptionalNumber(
      formData.get(
        "latitude"
      )
    );

  const longitude =
    parseOptionalNumber(
      formData.get(
        "longitude"
      )
    );

  const accuracyMeters =
    parseOptionalNumber(
      formData.get(
        "accuracyMeters"
      )
    );

  const altitudeMeters =
    parseOptionalNumber(
      formData.get(
        "altitudeMeters"
      )
    );

  const speedKph =
    parseOptionalNumber(
      formData.get(
        "speedKph"
      )
    );

  const headingDegrees =
    parseOptionalNumber(
      formData.get(
        "headingDegrees"
      )
    );

  const batteryPercent =
    parseOptionalNumber(
      formData.get(
        "batteryPercent"
      )
    );

  const capturedAt =
    parseCapturedAt(
      formData.get(
        "capturedAt"
      )
    );

  /*
   * Going online requires a fresh browser
   * geolocation reading.
   */
  if (
    requestedStatus === "online" &&
    (
      latitude === null ||
      longitude === null ||
      accuracyMeters === null ||
      capturedAt === null
    )
  ) {
    return {
      success: false,

      message:
        "Allow location access and wait for a valid location before going online.",

      availabilityStatus:
        null,

      updatedAt:
        null,
    };
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase.rpc(
    "set_delivery_partner_availability",
    {
      p_availability_status:
        requestedStatus,

      p_latitude:
        requestedStatus === "online"
          ? latitude
          : null,

      p_longitude:
        requestedStatus === "online"
          ? longitude
          : null,

      p_accuracy_meters:
        requestedStatus === "online"
          ? accuracyMeters
          : null,

      p_altitude_meters:
        requestedStatus === "online"
          ? altitudeMeters
          : null,

      p_speed_kph:
        requestedStatus === "online"
          ? speedKph
          : null,

      p_heading_degrees:
        requestedStatus === "online"
          ? headingDegrees
          : null,

      p_battery_percent:
        requestedStatus === "online"
          ? batteryPercent
          : null,

      p_location_source:
        "network",

      p_is_mock_location:
        false,

      p_device_reference_hash:
        null,

      p_captured_at:
        requestedStatus === "online"
          ? capturedAt
          : new Date().toISOString(),
    }
  );

  if (error) {
    console.error(
      "Changing delivery-partner availability failed:",
      {
        userId:
          user.id,

        requestedStatus,

        code:
          error.code,

        message:
          error.message,

        details:
          error.details,

        hint:
          error.hint,
      }
    );

    return {
      success: false,

      message:
        getSafeAvailabilityError(
          error.message
        ),

      availabilityStatus:
        null,

      updatedAt:
        null,
    };
  }

  const response =
    parseAvailabilityRpcResponse(
      data
    );

  if (
    !response ||
    response.userId !==
      user.id ||
    response.applicationStatus !==
      "approved" ||
    response.vehicleStatus !==
      "approved"
  ) {
    console.error(
      "Delivery availability RPC returned an invalid response:",
      {
        authenticatedUserId:
          user.id,

        requestedStatus,

        response:
          data,
      }
    );

    return {
      success: false,

      message:
        "The availability response was incomplete. Refresh the page and try again.",

      availabilityStatus:
        null,

      updatedAt:
        null,
    };
  }

  if (
    response.availabilityStatus ===
      "online" &&
    (
      response.vehicleAvailable !==
        true ||
      response.liveLocationStored !==
        true
    )
  ) {
    return {
      success: false,

      message:
        "The driver became online, but the vehicle or live location was not activated correctly.",

      availabilityStatus:
        null,

      updatedAt:
        null,
    };
  }

  revalidatePath(
    "/delivery-partner/dashboard"
  );

  revalidatePath(
    "/delivery-partner"
  );

  return {
    success: true,

    message:
      response.availabilityStatus ===
      "online"
        ? "You are now online. Your current location is available for delivery matching."
        : "You are now offline. Your live location has been removed.",

    availabilityStatus:
      response.availabilityStatus,

    updatedAt:
      response.changedAt,
  };
}
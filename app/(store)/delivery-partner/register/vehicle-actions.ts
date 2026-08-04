"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type DeliveryVehicleType =
  | "motorcycle"
  | "three_wheeler"
  | "car"
  | "pickup_truck"
  | "van"
  | "mini_lorry"
  | "lorry"
  | "bus"
  | "bicycle"
  | "other";

export type VehicleOwnershipType =
  | "owned"
  | "leased"
  | "rented"
  | "borrowed"
  | "family_owned"
  | "company_owned"
  | "other";

export interface SaveDeliveryPartnerVehicleInput {
  vehicleId?: string;

  vehicleType: DeliveryVehicleType;
  registrationNumber: string;
  manufacturer: string;
  model: string;
  manufactureYear: string;
  colour: string;

  ownershipType: VehicleOwnershipType;
  ownerName: string;

  maximumPayloadKg: string;
  maximumParcelCount: string;

  cargoLengthCm?: string;
  cargoWidthCm?: string;
  cargoHeightCm?: string;
  cargoVolumeLitres?: string;

  hasClosedCargoArea: boolean;
  hasDeliveryBox: boolean;
  hasRefrigeration: boolean;

  supportsFoodDelivery: boolean;
  supportsFragileParcels: boolean;
  supportsFrozenItems: boolean;
  supportsBulkOrders: boolean;
  supportsCashOnDelivery: boolean;
}

export interface DeliveryPartnerVehicleSummary {
  saved: boolean;

  vehicleId: string;
  driverUserId: string;

  vehicleStatus: string;
  vehicleType: DeliveryVehicleType;

  registrationNumber: string;
  manufacturer: string;
  model: string;
  manufactureYear: number;
  colour: string;

  ownershipType: VehicleOwnershipType;
  ownerName: string;

  maximumPayloadKg: number;
  maximumParcelCount: number;

  isPrimary: boolean;
  updatedAt: string;
}

export type SaveDeliveryPartnerVehicleResult =
  | {
      success: true;
      vehicle: DeliveryPartnerVehicleSummary;
    }
  | {
      success: false;
      code:
        | "UNAUTHENTICATED"
        | "ACCOUNT_RESTRICTED"
        | "APPLICATION_NOT_FOUND"
        | "APPLICATION_LOCKED"
        | "VEHICLE_NOT_FOUND"
        | "VEHICLE_LOCKED"
        | "DUPLICATE_REGISTRATION"
        | "VALIDATION_ERROR"
        | "VEHICLE_ERROR";
      message: string;
    };

const VEHICLE_TYPES =
  new Set<DeliveryVehicleType>([
    "motorcycle",
    "three_wheeler",
    "car",
    "pickup_truck",
    "van",
    "mini_lorry",
    "lorry",
    "bus",
    "bicycle",
    "other",
  ]);

const OWNERSHIP_TYPES =
  new Set<VehicleOwnershipType>([
    "owned",
    "leased",
    "rented",
    "borrowed",
    "family_owned",
    "company_owned",
    "other",
  ]);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function normalizeUppercaseText(
  value: unknown
): string {
  return normalizeText(value).toUpperCase();
}

function normalizeBoolean(
  value: unknown
): boolean {
  return value === true;
}

function parseNumber(
  value: unknown
): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue =
    value.trim();

  if (!normalizedValue) {
    return null;
  }

  const parsedValue =
    Number(normalizedValue);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : null;
}

function normalizeOptionalNumberText(
  value: unknown
): string {
  return normalizeText(value);
}

function isValidNumberRange(
  value: string,
  minimum: number,
  maximum: number,
  integerOnly = false
): boolean {
  const parsedValue =
    parseNumber(value);

  if (
    parsedValue === null ||
    parsedValue < minimum ||
    parsedValue > maximum
  ) {
    return false;
  }

  return (
    !integerOnly ||
    Number.isInteger(parsedValue)
  );
}

function validateInput(
  input: unknown
):
  | {
      valid: true;
      data: SaveDeliveryPartnerVehicleInput;
    }
  | {
      valid: false;
      message: string;
    } {
  if (!isRecord(input)) {
    return {
      valid: false,
      message:
        "Invalid vehicle information.",
    };
  }

  const vehicleId =
    normalizeText(
      input.vehicleId
    );

  const vehicleType =
    normalizeText(
      input.vehicleType
    ) as DeliveryVehicleType;

  const registrationNumber =
    normalizeUppercaseText(
      input.registrationNumber
    );

  const manufacturer =
    normalizeText(
      input.manufacturer
    );

  const model =
    normalizeText(
      input.model
    );

  const manufactureYear =
    normalizeText(
      input.manufactureYear
    );

  const colour =
    normalizeText(
      input.colour
    );

  const ownershipType =
    normalizeText(
      input.ownershipType
    ) as VehicleOwnershipType;

  const ownerName =
    normalizeText(
      input.ownerName
    );

  const maximumPayloadKg =
    normalizeText(
      input.maximumPayloadKg
    );

  const maximumParcelCount =
    normalizeText(
      input.maximumParcelCount
    );

  const cargoLengthCm =
    normalizeOptionalNumberText(
      input.cargoLengthCm
    );

  const cargoWidthCm =
    normalizeOptionalNumberText(
      input.cargoWidthCm
    );

  const cargoHeightCm =
    normalizeOptionalNumberText(
      input.cargoHeightCm
    );

  const cargoVolumeLitres =
    normalizeOptionalNumberText(
      input.cargoVolumeLitres
    );

  if (
    vehicleId &&
    !UUID_PATTERN.test(vehicleId)
  ) {
    return {
      valid: false,
      message:
        "The selected vehicle is invalid.",
    };
  }

  if (
    !VEHICLE_TYPES.has(
      vehicleType
    )
  ) {
    return {
      valid: false,
      message:
        "Please select a valid vehicle type.",
    };
  }

  if (
    registrationNumber.length < 2 ||
    registrationNumber.length > 40
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid vehicle registration number.",
    };
  }

  if (
    manufacturer.length < 2 ||
    manufacturer.length > 100
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid vehicle manufacturer.",
    };
  }

  if (
    model.length < 1 ||
    model.length > 100
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid vehicle model.",
    };
  }

  if (
    colour.length < 2 ||
    colour.length > 50
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid vehicle colour.",
    };
  }

  const currentYear =
    new Date().getUTCFullYear();

  if (
    !isValidNumberRange(
      manufactureYear,
      1950,
      currentYear + 1,
      true
    )
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid vehicle manufacture year.",
    };
  }

  if (
    !OWNERSHIP_TYPES.has(
      ownershipType
    )
  ) {
    return {
      valid: false,
      message:
        "Please select a valid vehicle ownership type.",
    };
  }

  if (
    ownerName.length < 2 ||
    ownerName.length > 120
  ) {
    return {
      valid: false,
      message:
        "Please enter the legal vehicle owner name.",
    };
  }

  if (
    !isValidNumberRange(
      maximumPayloadKg,
      0.01,
      100000
    )
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid maximum payload.",
    };
  }

  if (
    !isValidNumberRange(
      maximumParcelCount,
      1,
      10000,
      true
    )
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid maximum parcel count.",
    };
  }

  const optionalDimensions: Array<{
    value: string;
    maximum: number;
    message: string;
  }> = [
    {
      value: cargoLengthCm,
      maximum: 5000,
      message:
        "Please enter a valid cargo length.",
    },
    {
      value: cargoWidthCm,
      maximum: 5000,
      message:
        "Please enter a valid cargo width.",
    },
    {
      value: cargoHeightCm,
      maximum: 5000,
      message:
        "Please enter a valid cargo height.",
    },
    {
      value: cargoVolumeLitres,
      maximum: 10000000,
      message:
        "Please enter a valid cargo volume.",
    },
  ];

  for (
    const dimension
    of optionalDimensions
  ) {
    if (
      dimension.value &&
      !isValidNumberRange(
        dimension.value,
        0.01,
        dimension.maximum
      )
    ) {
      return {
        valid: false,
        message:
          dimension.message,
      };
    }
  }

  const hasRefrigeration =
    normalizeBoolean(
      input.hasRefrigeration
    );

  const supportsFrozenItems =
    normalizeBoolean(
      input.supportsFrozenItems
    );

  if (
    supportsFrozenItems &&
    !hasRefrigeration
  ) {
    return {
      valid: false,
      message:
        "Frozen-item delivery requires a refrigerated vehicle.",
    };
  }

  return {
    valid: true,

    data: {
      vehicleId:
        vehicleId || undefined,

      vehicleType,
      registrationNumber,
      manufacturer,
      model,
      manufactureYear,
      colour,

      ownershipType,
      ownerName,

      maximumPayloadKg,
      maximumParcelCount,

      cargoLengthCm,
      cargoWidthCm,
      cargoHeightCm,
      cargoVolumeLitres,

      hasClosedCargoArea:
        normalizeBoolean(
          input.hasClosedCargoArea
        ),

      hasDeliveryBox:
        normalizeBoolean(
          input.hasDeliveryBox
        ),

      hasRefrigeration,

      supportsFoodDelivery:
        normalizeBoolean(
          input.supportsFoodDelivery
        ),

      supportsFragileParcels:
        normalizeBoolean(
          input.supportsFragileParcels
        ),

      supportsFrozenItems,

      supportsBulkOrders:
        normalizeBoolean(
          input.supportsBulkOrders
        ),

      supportsCashOnDelivery:
        normalizeBoolean(
          input.supportsCashOnDelivery
        ),
    },
  };
}

function getSafeDatabaseError(
  error: {
    code?: string;
    message: string;
  }
): {
  code:
    | "UNAUTHENTICATED"
    | "ACCOUNT_RESTRICTED"
    | "APPLICATION_NOT_FOUND"
    | "APPLICATION_LOCKED"
    | "VEHICLE_NOT_FOUND"
    | "VEHICLE_LOCKED"
    | "DUPLICATE_REGISTRATION"
    | "VALIDATION_ERROR"
    | "VEHICLE_ERROR";
  message: string;
} {
  const message =
    error.message.trim();

  if (error.code === "23505") {
    return {
      code:
        "DUPLICATE_REGISTRATION",

      message:
        "This vehicle registration number is already registered.",
    };
  }

  if (
    message ===
    "You must sign in before saving a delivery partner vehicle."
  ) {
    return {
      code: "UNAUTHENTICATED",
      message:
        "Please sign in before saving a delivery partner vehicle.",
    };
  }

  if (
    message ===
    "This account cannot currently save a delivery partner vehicle."
  ) {
    return {
      code:
        "ACCOUNT_RESTRICTED",
      message,
    };
  }

  if (
    message ===
    "Start your delivery partner application before registering a vehicle."
  ) {
    return {
      code:
        "APPLICATION_NOT_FOUND",
      message,
    };
  }

  if (
    message ===
    "Vehicle information cannot be edited in the current application status."
  ) {
    return {
      code:
        "APPLICATION_LOCKED",
      message,
    };
  }

  if (
    message ===
    "The selected vehicle could not be found."
  ) {
    return {
      code:
        "VEHICLE_NOT_FOUND",
      message,
    };
  }

  if (
    message ===
    "This vehicle cannot be edited in its current status."
  ) {
    return {
      code:
        "VEHICLE_LOCKED",
      message,
    };
  }

  const safeValidationMessages =
    new Set([
      "Invalid vehicle information.",
      "Please enter valid vehicle capacity values.",
      "Please select a valid vehicle type.",
      "Please enter a valid vehicle registration number.",
      "Please enter a valid vehicle manufacturer.",
      "Please enter a valid vehicle model.",
      "Please enter a valid vehicle colour.",
      "Please enter a valid vehicle manufacture year.",
      "Please select a valid vehicle ownership type.",
      "Please enter the legal vehicle owner name.",
      "Please enter a valid maximum payload.",
      "Please enter a valid maximum parcel count.",
      "Please enter a valid cargo length.",
      "Please enter a valid cargo width.",
      "Please enter a valid cargo height.",
      "Please enter a valid cargo volume.",
      "Frozen-item delivery requires a refrigerated vehicle.",
    ]);

  if (
    safeValidationMessages.has(
      message
    )
  ) {
    return {
      code:
        "VALIDATION_ERROR",
      message,
    };
  }

  return {
    code:
      "VEHICLE_ERROR",

    message:
      "We could not save your vehicle information. Please review the form and try again.",
  };
}

export async function saveDeliveryPartnerVehicle(
  input: SaveDeliveryPartnerVehicleInput
): Promise<SaveDeliveryPartnerVehicleResult> {
  const validation =
    validateInput(input);

  if (!validation.valid) {
    return {
      success: false,
      code:
        "VALIDATION_ERROR",
      message:
        validation.message,
    };
  }

  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    return {
      success: false,
      code:
        "UNAUTHENTICATED",
      message:
        "Please sign in before saving a delivery partner vehicle.",
    };
  }

  const vehiclePayload = {
    vehicleType:
      validation.data.vehicleType,

    registrationNumber:
      validation.data.registrationNumber,

    manufacturer:
      validation.data.manufacturer,

    model:
      validation.data.model,

    manufactureYear:
      validation.data.manufactureYear,

    colour:
      validation.data.colour,

    ownershipType:
      validation.data.ownershipType,

    ownerName:
      validation.data.ownerName,

    maximumPayloadKg:
      validation.data.maximumPayloadKg,

    maximumParcelCount:
      validation.data.maximumParcelCount,

    cargoLengthCm:
      validation.data.cargoLengthCm ?? "",

    cargoWidthCm:
      validation.data.cargoWidthCm ?? "",

    cargoHeightCm:
      validation.data.cargoHeightCm ?? "",

    cargoVolumeLitres:
      validation.data.cargoVolumeLitres ?? "",

    hasClosedCargoArea:
      validation.data.hasClosedCargoArea,

    hasDeliveryBox:
      validation.data.hasDeliveryBox,

    hasRefrigeration:
      validation.data.hasRefrigeration,

    supportsFoodDelivery:
      validation.data.supportsFoodDelivery,

    supportsFragileParcels:
      validation.data.supportsFragileParcels,

    supportsFrozenItems:
      validation.data.supportsFrozenItems,

    supportsBulkOrders:
      validation.data.supportsBulkOrders,

    supportsCashOnDelivery:
      validation.data.supportsCashOnDelivery,
  };

  const {
    data,
    error,
  } = await supabase.rpc(
    "save_delivery_partner_vehicle_draft",
    {
      p_vehicle:
        vehiclePayload,

      p_vehicle_id:
        validation.data.vehicleId ??
        null,
    }
  );

  if (error) {
    console.error(
      "Saving delivery partner vehicle failed:",
      {
        userId:
          user.id,

        vehicleId:
          validation.data.vehicleId ??
          null,

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

    const safeError =
      getSafeDatabaseError(
        error
      );

    return {
      success: false,
      ...safeError,
    };
  }

  if (!isRecord(data)) {
    console.error(
      "Vehicle draft RPC returned an invalid response:",
      data
    );

    return {
      success: false,
      code:
        "VEHICLE_ERROR",
      message:
        "The vehicle response was incomplete. Please try again.",
    };
  }

  const vehicleId =
    normalizeText(
      data.vehicleId
    );

  const driverUserId =
    normalizeText(
      data.driverUserId
    );

  const vehicleStatus =
    normalizeText(
      data.vehicleStatus
    );

  const vehicleType =
    normalizeText(
      data.vehicleType
    ) as DeliveryVehicleType;

  const registrationNumber =
    normalizeText(
      data.registrationNumber
    );

  const manufacturer =
    normalizeText(
      data.manufacturer
    );

  const model =
    normalizeText(
      data.model
    );

  const manufactureYear =
    parseNumber(
      data.manufactureYear
    );

  const colour =
    normalizeText(
      data.colour
    );

  const ownershipType =
    normalizeText(
      data.ownershipType
    ) as VehicleOwnershipType;

  const ownerName =
    normalizeText(
      data.ownerName
    );

  const maximumPayloadKg =
    parseNumber(
      data.maximumPayloadKg
    );

  const maximumParcelCount =
    parseNumber(
      data.maximumParcelCount
    );

  const updatedAt =
    normalizeText(
      data.updatedAt
    );

  if (
    !vehicleId ||
    driverUserId !== user.id ||
    !vehicleStatus ||
    !VEHICLE_TYPES.has(
      vehicleType
    ) ||
    !registrationNumber ||
    !manufacturer ||
    !model ||
    manufactureYear === null ||
    !colour ||
    !OWNERSHIP_TYPES.has(
      ownershipType
    ) ||
    !ownerName ||
    maximumPayloadKg === null ||
    maximumParcelCount === null ||
    !updatedAt
  ) {
    console.error(
      "Vehicle response validation failed:",
      {
        authenticatedUserId:
          user.id,
        response:
          data,
      }
    );

    return {
      success: false,
      code:
        "VEHICLE_ERROR",
      message:
        "The vehicle response was incomplete. Please try again.",
    };
  }

  revalidatePath(
    "/delivery-partner"
  );

  revalidatePath(
    "/delivery-partner/register"
  );

  revalidatePath(
    "/account"
  );

  return {
    success: true,

    vehicle: {
      saved:
        data.saved === true,

      vehicleId,
      driverUserId,

      vehicleStatus,
      vehicleType,

      registrationNumber,
      manufacturer,
      model,
      manufactureYear,
      colour,

      ownershipType,
      ownerName,

      maximumPayloadKg,
      maximumParcelCount,

      isPrimary:
        data.isPrimary === true,

      updatedAt,
    },
  };
}
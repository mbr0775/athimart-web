"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type DeliveryPartnerDocumentSlot =
  | "profile_photo"
  | "identity_front"
  | "identity_back"
  | "driving_licence_front"
  | "driving_licence_back"
  | "police_clearance"
  | "vehicle_front_photo"
  | "vehicle_back_photo"
  | "vehicle_side_photo"
  | "vehicle_registration"
  | "vehicle_ownership"
  | "vehicle_insurance"
  | "vehicle_revenue_licence"
  | "vehicle_emission";

export interface SaveDeliveryPartnerDocumentPathInput {
  documentSlot: DeliveryPartnerDocumentSlot;
  storagePath: string;
  vehicleId?: string | null;
}

export interface DeliveryPartnerDocumentPathSummary {
  saved: boolean;
  userId: string;
  documentSlot: DeliveryPartnerDocumentSlot;
  storagePath: string;
  vehicleId: string | null;
  updatedAt: string;
}

export type SaveDeliveryPartnerDocumentPathResult =
  | {
      success: true;
      document: DeliveryPartnerDocumentPathSummary;
    }
  | {
      success: false;
      code:
        | "UNAUTHENTICATED"
        | "ACCOUNT_RESTRICTED"
        | "APPLICATION_NOT_FOUND"
        | "APPLICATION_LOCKED"
        | "VEHICLE_REQUIRED"
        | "VEHICLE_NOT_FOUND"
        | "VEHICLE_LOCKED"
        | "INVALID_DOCUMENT"
        | "DOCUMENT_NOT_VERIFIED"
        | "DOCUMENT_ERROR";
      message: string;
    };

const DOCUMENT_SLOTS =
  new Set<DeliveryPartnerDocumentSlot>([
    "profile_photo",
    "identity_front",
    "identity_back",
    "driving_licence_front",
    "driving_licence_back",
    "police_clearance",
    "vehicle_front_photo",
    "vehicle_back_photo",
    "vehicle_side_photo",
    "vehicle_registration",
    "vehicle_ownership",
    "vehicle_insurance",
    "vehicle_revenue_licence",
    "vehicle_emission",
  ]);

const VEHICLE_DOCUMENT_SLOTS =
  new Set<DeliveryPartnerDocumentSlot>([
    "vehicle_front_photo",
    "vehicle_back_photo",
    "vehicle_side_photo",
    "vehicle_registration",
    "vehicle_ownership",
    "vehicle_insurance",
    "vehicle_revenue_licence",
    "vehicle_emission",
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

function validateInput(
  input: unknown
):
  | {
      valid: true;
      data: {
        documentSlot: DeliveryPartnerDocumentSlot;
        storagePath: string;
        vehicleId: string | null;
      };
    }
  | {
      valid: false;
      code:
        | "VEHICLE_REQUIRED"
        | "INVALID_DOCUMENT";
      message: string;
    } {
  if (!isRecord(input)) {
    return {
      valid: false,
      code: "INVALID_DOCUMENT",
      message:
        "Invalid delivery-partner document information.",
    };
  }

  const documentSlot =
    normalizeText(
      input.documentSlot
    ) as DeliveryPartnerDocumentSlot;

  const storagePath =
    normalizeText(
      input.storagePath
    );

  const vehicleId =
    normalizeText(
      input.vehicleId
    );

  if (
    !DOCUMENT_SLOTS.has(
      documentSlot
    )
  ) {
    return {
      valid: false,
      code: "INVALID_DOCUMENT",
      message:
        "The selected document type is invalid.",
    };
  }

  if (
    !storagePath ||
    storagePath.length > 1000 ||
    storagePath.startsWith("/") ||
    storagePath.includes("..")
  ) {
    return {
      valid: false,
      code: "INVALID_DOCUMENT",
      message:
        "The uploaded document path is invalid.",
    };
  }

  const pathParts =
    storagePath.split("/");

  if (
    pathParts.length < 3 ||
    pathParts.some(
      (part) => !part.trim()
    )
  ) {
    return {
      valid: false,
      code: "INVALID_DOCUMENT",
      message:
        "The uploaded document path is invalid.",
    };
  }

  const requiresVehicle =
    VEHICLE_DOCUMENT_SLOTS.has(
      documentSlot
    );

  if (
    requiresVehicle &&
    !vehicleId
  ) {
    return {
      valid: false,
      code: "VEHICLE_REQUIRED",
      message:
        "Save your vehicle information before uploading vehicle documents.",
    };
  }

  if (
    vehicleId &&
    !UUID_PATTERN.test(
      vehicleId
    )
  ) {
    return {
      valid: false,
      code: "INVALID_DOCUMENT",
      message:
        "The selected vehicle is invalid.",
    };
  }

  return {
    valid: true,
    data: {
      documentSlot,
      storagePath,
      vehicleId:
        vehicleId || null,
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
    | "VEHICLE_REQUIRED"
    | "VEHICLE_NOT_FOUND"
    | "VEHICLE_LOCKED"
    | "INVALID_DOCUMENT"
    | "DOCUMENT_NOT_VERIFIED"
    | "DOCUMENT_ERROR";
  message: string;
} {
  const message =
    error.message.trim();

  if (
    message ===
    "You must sign in before saving a delivery partner document."
  ) {
    return {
      code: "UNAUTHENTICATED",
      message:
        "Please sign in before saving a delivery-partner document.",
    };
  }

  if (
    message ===
    "This account cannot currently save delivery partner documents."
  ) {
    return {
      code:
        "ACCOUNT_RESTRICTED",
      message,
    };
  }

  if (
    message ===
    "Start your delivery partner application before saving documents."
  ) {
    return {
      code:
        "APPLICATION_NOT_FOUND",
      message,
    };
  }

  if (
    message ===
    "Documents cannot be changed in the current application status."
  ) {
    return {
      code:
        "APPLICATION_LOCKED",
      message,
    };
  }

  if (
    message ===
    "Select a vehicle before saving this document."
  ) {
    return {
      code:
        "VEHICLE_REQUIRED",
      message:
        "Save your vehicle information before uploading vehicle documents.",
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
    "Vehicle documents cannot be changed in the current vehicle status."
  ) {
    return {
      code:
        "VEHICLE_LOCKED",
      message,
    };
  }

  if (
    message ===
    "The uploaded document could not be verified."
  ) {
    return {
      code:
        "DOCUMENT_NOT_VERIFIED",
      message:
        "The uploaded document could not be verified. Please upload it again.",
    };
  }

  const invalidDocumentMessages =
    new Set([
      "The uploaded document path is invalid.",
      "The selected document type is invalid.",
      "The uploaded document does not belong to this account.",
      "The uploaded document category is invalid.",
      "The uploaded document filename is invalid.",
    ]);

  if (
    invalidDocumentMessages.has(
      message
    )
  ) {
    return {
      code:
        "INVALID_DOCUMENT",
      message,
    };
  }

  return {
    code:
      "DOCUMENT_ERROR",
    message:
      "The document was uploaded, but it could not be linked to your application. Please try again.",
  };
}

export async function saveDeliveryPartnerDocumentPath(
  input: SaveDeliveryPartnerDocumentPathInput
): Promise<SaveDeliveryPartnerDocumentPathResult> {
  const validation =
    validateInput(input);

  if (!validation.valid) {
    return {
      success: false,
      code:
        validation.code,
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
        "Please sign in before saving a delivery-partner document.",
    };
  }

  /*
   * Perform an early ownership check.
   *
   * The database function repeats and enforces
   * this check against storage.objects.
   */
  const firstPathPart =
    validation.data.storagePath
      .split("/")[0];

  if (
    firstPathPart !==
    user.id
  ) {
    return {
      success: false,
      code:
        "INVALID_DOCUMENT",
      message:
        "The uploaded document does not belong to this account.",
    };
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "save_delivery_partner_document_path",
    {
      p_document_slot:
        validation.data.documentSlot,

      p_storage_path:
        validation.data.storagePath,

      p_vehicle_id:
        validation.data.vehicleId,
    }
  );

  if (error) {
    console.error(
      "Saving delivery partner document path failed:",
      {
        userId:
          user.id,

        documentSlot:
          validation.data.documentSlot,

        storagePath:
          validation.data.storagePath,

        vehicleId:
          validation.data.vehicleId,

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
      "Delivery partner document-path RPC returned an invalid response:",
      data
    );

    return {
      success: false,
      code:
        "DOCUMENT_ERROR",
      message:
        "The document response was incomplete. Please try again.",
    };
  }

  const responseUserId =
    normalizeText(
      data.userId
    );

  const responseDocumentSlot =
    normalizeText(
      data.documentSlot
    ) as DeliveryPartnerDocumentSlot;

  const responseStoragePath =
    normalizeText(
      data.storagePath
    );

  const responseVehicleId =
    data.vehicleId === null
      ? null
      : normalizeText(
          data.vehicleId
        );

  const updatedAt =
    normalizeText(
      data.updatedAt
    );

  if (
    responseUserId !== user.id ||
    responseDocumentSlot !==
      validation.data.documentSlot ||
    responseStoragePath !==
      validation.data.storagePath ||
    responseVehicleId !==
      validation.data.vehicleId ||
    !updatedAt
  ) {
    console.error(
      "Delivery partner document response validation failed:",
      {
        authenticatedUserId:
          user.id,

        request:
          validation.data,

        response:
          data,
      }
    );

    return {
      success: false,
      code:
        "DOCUMENT_ERROR",
      message:
        "The document response was incomplete. Please try again.",
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

    document: {
      saved:
        data.saved === true,

      userId:
        responseUserId,

      documentSlot:
        responseDocumentSlot,

      storagePath:
        responseStoragePath,

      vehicleId:
        responseVehicleId,

      updatedAt,
    },
  };
}
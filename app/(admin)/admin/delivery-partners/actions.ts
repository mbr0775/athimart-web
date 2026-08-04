"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type DeliveryPartnerReviewDecision =
  | "approve"
  | "reject";

export interface ReviewDeliveryPartnerApplicationInput {
  applicantUserId: string;
  decision: DeliveryPartnerReviewDecision;

  rejectionReason?: string;
  administratorNotes?: string;

  approvedServiceAreas?: string[];
  approvedServiceRadiusKm?: string;

  canHandleCashOnDelivery?: boolean;
  canHandleFoodDelivery?: boolean;
  canHandleFragileParcels?: boolean;
}

export interface ReviewedDeliveryPartnerApplication {
  reviewed: boolean;
  decision: DeliveryPartnerReviewDecision;

  applicantUserId: string;

  applicationStatus: string;
  availabilityStatus: string;

  identityVerificationStatus: string;
  drivingLicenceVerificationStatus: string;

  approvedServiceAreas: string[];

  vehicleId: string;
  vehicleStatus: string;

  reviewedBy: string;
  reviewedAt: string;
}

export type ReviewDeliveryPartnerApplicationResult =
  | {
      success: true;
      application: ReviewedDeliveryPartnerApplication;
    }
  | {
      success: false;
      code:
        | "UNAUTHENTICATED"
        | "UNAUTHORIZED"
        | "INVALID_INPUT"
        | "APPLICATION_NOT_FOUND"
        | "APPLICATION_NOT_REVIEWABLE"
        | "VEHICLE_NOT_FOUND"
        | "REQUIREMENTS_INCOMPLETE"
        | "REVIEW_ERROR";
      message: string;
    };

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

function normalizeTextArray(
  value: unknown,
  maximumItems: number
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const uniqueValues =
    new Set<string>();

  for (const item of value) {
    const normalizedItem =
      normalizeText(item);

    if (normalizedItem) {
      uniqueValues.add(
        normalizedItem
      );
    }

    if (
      uniqueValues.size >=
      maximumItems
    ) {
      break;
    }
  }

  return Array.from(
    uniqueValues
  );
}

function normalizeBoolean(
  value: unknown
): boolean {
  return value === true;
}

function parseRadius(
  value: unknown
): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  const normalizedValue =
    normalizeText(value);

  if (!normalizedValue) {
    return null;
  }

  const parsedValue =
    Number(normalizedValue);

  return Number.isFinite(
    parsedValue
  )
    ? parsedValue
    : null;
}

function validateInput(
  input: unknown
):
  | {
      valid: true;
      data: {
        applicantUserId: string;
        decision: DeliveryPartnerReviewDecision;

        rejectionReason: string;
        administratorNotes: string;

        approvedServiceAreas: string[];
        approvedServiceRadiusKm: number;

        canHandleCashOnDelivery: boolean;
        canHandleFoodDelivery: boolean;
        canHandleFragileParcels: boolean;
      };
    }
  | {
      valid: false;
      message: string;
    } {
  if (!isRecord(input)) {
    return {
      valid: false,
      message:
        "Invalid delivery-partner review information.",
    };
  }

  const applicantUserId =
    normalizeText(
      input.applicantUserId
    );

  const decision =
    normalizeText(
      input.decision
    ) as DeliveryPartnerReviewDecision;

  const rejectionReason =
    normalizeText(
      input.rejectionReason
    );

  const administratorNotes =
    normalizeText(
      input.administratorNotes
    );

  const approvedServiceAreas =
    normalizeTextArray(
      input.approvedServiceAreas,
      100
    );

  const approvedServiceRadiusKm =
    parseRadius(
      input.approvedServiceRadiusKm
    );

  if (
    !UUID_PATTERN.test(
      applicantUserId
    )
  ) {
    return {
      valid: false,
      message:
        "The selected delivery-partner applicant is invalid.",
    };
  }

  if (
    decision !== "approve" &&
    decision !== "reject"
  ) {
    return {
      valid: false,
      message:
        "Select a valid review decision.",
    };
  }

  if (
    administratorNotes.length >
    3000
  ) {
    return {
      valid: false,
      message:
        "Administrator notes must not exceed 3000 characters.",
    };
  }

  if (
    decision === "approve"
  ) {
    if (
      approvedServiceAreas.length ===
      0
    ) {
      return {
        valid: false,
        message:
          "Select at least one approved service area.",
      };
    }

    if (
      approvedServiceRadiusKm ===
        null ||
      approvedServiceRadiusKm <=
        0 ||
      approvedServiceRadiusKm >
        500
    ) {
      return {
        valid: false,
        message:
          "Enter a valid approved service radius.",
      };
    }
  }

  if (
    decision === "reject" &&
    (
      rejectionReason.length <
        5 ||
      rejectionReason.length >
        1500
    )
  ) {
    return {
      valid: false,
      message:
        "Enter a rejection reason between 5 and 1500 characters.",
    };
  }

  return {
    valid: true,

    data: {
      applicantUserId,
      decision,

      rejectionReason,
      administratorNotes,

      approvedServiceAreas,

      approvedServiceRadiusKm:
        approvedServiceRadiusKm ??
        10,

      canHandleCashOnDelivery:
        normalizeBoolean(
          input.canHandleCashOnDelivery
        ),

      canHandleFoodDelivery:
        normalizeBoolean(
          input.canHandleFoodDelivery
        ),

      canHandleFragileParcels:
        normalizeBoolean(
          input.canHandleFragileParcels
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
    | "UNAUTHORIZED"
    | "INVALID_INPUT"
    | "APPLICATION_NOT_FOUND"
    | "APPLICATION_NOT_REVIEWABLE"
    | "VEHICLE_NOT_FOUND"
    | "REQUIREMENTS_INCOMPLETE"
    | "REVIEW_ERROR";
  message: string;
} {
  const message =
    error.message.trim();

  if (
    message ===
    "You must sign in before reviewing a delivery partner application."
  ) {
    return {
      code:
        "UNAUTHENTICATED",

      message:
        "Please sign in before reviewing delivery-partner applications.",
    };
  }

  if (
    message ===
    "Only an AthiMart administrator can review delivery partner applications."
  ) {
    return {
      code:
        "UNAUTHORIZED",

      message:
        "Only an AthiMart administrator can review delivery-partner applications.",
    };
  }

  if (
    message ===
    "The delivery partner application could not be found."
  ) {
    return {
      code:
        "APPLICATION_NOT_FOUND",

      message,
    };
  }

  if (
    message ===
    "This delivery partner application is not awaiting review."
  ) {
    return {
      code:
        "APPLICATION_NOT_REVIEWABLE",

      message,
    };
  }

  if (
    message ===
    "The submitted delivery vehicle could not be found."
  ) {
    return {
      code:
        "VEHICLE_NOT_FOUND",

      message,
    };
  }

  const inputMessages =
    new Set([
      "The delivery partner applicant is required.",
      "The delivery partner review decision is invalid.",
      "Administrator notes must not exceed 3000 characters.",
      "Select at least one approved service area.",
      "Too many approved service areas were provided.",
      "Enter a valid approved service radius.",
      "Enter a rejection reason between 5 and 1500 characters.",
    ]);

  if (
    inputMessages.has(
      message
    )
  ) {
    return {
      code:
        "INVALID_INPUT",

      message,
    };
  }

  const requirementMessages =
    new Set([
      "The applicant profile photograph is missing.",
      "The identity document is missing.",
      "The driving licence documents are incomplete.",
      "The vehicle photograph is missing.",
      "The vehicle registration document is missing.",
      "The vehicle insurance document is missing.",
    ]);

  if (
    requirementMessages.has(
      message
    )
  ) {
    return {
      code:
        "REQUIREMENTS_INCOMPLETE",

      message,
    };
  }

  return {
    code:
      "REVIEW_ERROR",

    message:
      "The delivery-partner application could not be reviewed. Please try again.",
  };
}

export async function reviewDeliveryPartnerApplication(
  input: ReviewDeliveryPartnerApplicationInput
): Promise<ReviewDeliveryPartnerApplicationResult> {
  const validation =
    validateInput(input);

  if (!validation.valid) {
    return {
      success: false,
      code:
        "INVALID_INPUT",
      message:
        validation.message,
    };
  }

  const supabase =
    await createClient();

  /*
   * Verify the current authenticated user.
   */
  const {
    data: {
      user,
    },
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
        "Please sign in before reviewing delivery-partner applications.",
    };
  }

  /*
   * Perform an explicit administrator check
   * inside the Server Action.
   *
   * The database review function repeats and
   * enforces this authorization check.
   */
  const {
    data: isAdmin,
    error: adminError,
  } = await supabase.rpc(
    "is_admin"
  );

  if (
    adminError ||
    isAdmin !== true
  ) {
    console.error(
      "Delivery-partner administrator verification failed:",
      {
        userId:
          user.id,

        code:
          adminError?.code,

        message:
          adminError?.message,

        details:
          adminError?.details,

        hint:
          adminError?.hint,
      }
    );

    return {
      success: false,
      code:
        "UNAUTHORIZED",
      message:
        "Only an AthiMart administrator can review delivery-partner applications.",
    };
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "review_delivery_partner_application",
    {
      p_applicant_user_id:
        validation.data
          .applicantUserId,

      p_decision:
        validation.data
          .decision,

      p_rejection_reason:
        validation.data
          .rejectionReason ||
        null,

      p_admin_notes:
        validation.data
          .administratorNotes ||
        null,

      p_approved_service_areas:
        validation.data
          .approvedServiceAreas,

      p_approved_service_radius_km:
        validation.data
          .approvedServiceRadiusKm,

      p_can_handle_cash_on_delivery:
        validation.data
          .canHandleCashOnDelivery,

      p_can_handle_food_delivery:
        validation.data
          .canHandleFoodDelivery,

      p_can_handle_fragile_parcels:
        validation.data
          .canHandleFragileParcels,
    }
  );

  if (error) {
    console.error(
      "Reviewing delivery-partner application failed:",
      {
        administratorUserId:
          user.id,

        applicantUserId:
          validation.data
            .applicantUserId,

        decision:
          validation.data
            .decision,

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
      "Delivery-partner review RPC returned an invalid response:",
      data
    );

    return {
      success: false,
      code:
        "REVIEW_ERROR",
      message:
        "The delivery-partner review response was incomplete.",
    };
  }

  const decision =
    normalizeText(
      data.decision
    ) as DeliveryPartnerReviewDecision;

  const applicantUserId =
    normalizeText(
      data.applicantUserId
    );

  const applicationStatus =
    normalizeText(
      data.applicationStatus
    );

  const availabilityStatus =
    normalizeText(
      data.availabilityStatus
    );

  const identityVerificationStatus =
    normalizeText(
      data.identityVerificationStatus
    );

  const drivingLicenceVerificationStatus =
    normalizeText(
      data.drivingLicenceVerificationStatus
    );

  const approvedServiceAreas =
    normalizeTextArray(
      data.approvedServiceAreas,
      100
    );

  const vehicleId =
    normalizeText(
      data.vehicleId
    );

  const vehicleStatus =
    normalizeText(
      data.vehicleStatus
    );

  const reviewedBy =
    normalizeText(
      data.reviewedBy
    );

  const reviewedAt =
    normalizeText(
      data.reviewedAt
    );

  const expectedStatus =
    decision === "approve"
      ? "approved"
      : "rejected";

  if (
    data.reviewed !== true ||
    decision !==
      validation.data.decision ||
    applicantUserId !==
      validation.data.applicantUserId ||
    applicationStatus !==
      expectedStatus ||
    vehicleStatus !==
      expectedStatus ||
    !availabilityStatus ||
    !identityVerificationStatus ||
    !drivingLicenceVerificationStatus ||
    !vehicleId ||
    reviewedBy !== user.id ||
    !reviewedAt
  ) {
    console.error(
      "Delivery-partner review response validation failed:",
      {
        administratorUserId:
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
        "REVIEW_ERROR",
      message:
        "The delivery-partner review response was incomplete.",
    };
  }

  revalidatePath(
    "/admin/delivery-partners"
  );

  revalidatePath(
    `/admin/delivery-partners/${applicantUserId}`
  );

  revalidatePath(
    "/delivery-partner"
  );

  revalidatePath(
    "/delivery-partner/register"
  );

  revalidatePath(
    "/delivery-partner/register/documents"
  );

  revalidatePath(
    "/account"
  );

  return {
    success: true,

    application: {
      reviewed: true,

      decision,
      applicantUserId,

      applicationStatus,
      availabilityStatus,

      identityVerificationStatus,
      drivingLicenceVerificationStatus,

      approvedServiceAreas,

      vehicleId,
      vehicleStatus,

      reviewedBy,
      reviewedAt,
    },
  };
}
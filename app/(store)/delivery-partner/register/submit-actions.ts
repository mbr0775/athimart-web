"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface SubmittedDeliveryPartnerApplication {
  submitted: boolean;

  userId: string;

  applicationStatus: string;
  availabilityStatus: string;

  identityVerificationStatus: string;
  drivingLicenceVerificationStatus: string;

  vehicleId: string;
  vehicleStatus: string;

  submittedAt: string;
}

export type SubmitDeliveryPartnerApplicationResult =
  | {
      success: true;
      application: SubmittedDeliveryPartnerApplication;
    }
  | {
      success: false;
      code:
        | "UNAUTHENTICATED"
        | "ACCOUNT_NOT_FOUND"
        | "ACCOUNT_RESTRICTED"
        | "APPLICATION_NOT_FOUND"
        | "APPLICATION_LOCKED"
        | "REQUIREMENTS_INCOMPLETE"
        | "DOCUMENT_VERIFICATION_FAILED"
        | "SUBMISSION_ERROR";
      message: string;
    };

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

function getSafeDatabaseError(
  error: {
    code?: string;
    message: string;
  }
): {
  code:
    | "UNAUTHENTICATED"
    | "ACCOUNT_NOT_FOUND"
    | "ACCOUNT_RESTRICTED"
    | "APPLICATION_NOT_FOUND"
    | "APPLICATION_LOCKED"
    | "REQUIREMENTS_INCOMPLETE"
    | "DOCUMENT_VERIFICATION_FAILED"
    | "SUBMISSION_ERROR";
  message: string;
} {
  const message =
    error.message.trim();

  if (
    message ===
    "You must sign in before submitting a delivery partner application."
  ) {
    return {
      code: "UNAUTHENTICATED",
      message:
        "Please sign in before submitting your delivery-partner application.",
    };
  }

  if (
    message ===
    "The AthiMart account could not be found."
  ) {
    return {
      code: "ACCOUNT_NOT_FOUND",
      message:
        "Your AthiMart account could not be found.",
    };
  }

  if (
    message ===
    "This account cannot currently submit a delivery partner application."
  ) {
    return {
      code: "ACCOUNT_RESTRICTED",
      message,
    };
  }

  if (
    message ===
    "Start your delivery partner application before submitting it."
  ) {
    return {
      code: "APPLICATION_NOT_FOUND",
      message,
    };
  }

  if (
    message ===
    "The application cannot be submitted in its current status."
  ) {
    return {
      code: "APPLICATION_LOCKED",
      message,
    };
  }

  if (
    message ===
    "One or more required uploaded documents could not be verified."
  ) {
    return {
      code:
        "DOCUMENT_VERIFICATION_FAILED",

      message:
        "One or more required documents could not be verified. Please upload the affected files again.",
    };
  }

  const requirementMessages =
    new Set([
      "Complete your full name before submitting the application.",
      "Complete your phone number before submitting the application.",
      "Complete your date of birth before submitting the application.",
      "Delivery partner applicants must be at least 18 years old.",
      "Complete your identity document type before submitting the application.",
      "Complete your identity document number before submitting the application.",
      "Complete your driving licence number before submitting the application.",
      "Enter at least one driving licence class before submitting the application.",
      "The driving licence has expired.",
      "Complete the emergency contact name before submitting the application.",
      "Complete the emergency contact phone number before submitting the application.",
      "Complete the emergency contact relationship before submitting the application.",
      "Enter at least one requested service area before submitting the application.",
      "Accept the delivery partner terms before submitting the application.",
      "Provide privacy consent before submitting the application.",
      "Provide location-sharing consent before submitting the application.",
      "Upload the applicant profile photograph before submitting the application.",
      "Upload the identity document front before submitting the application.",
      "Upload the identity document back before submitting the application.",
      "Upload the driving licence front before submitting the application.",
      "Upload the driving licence back before submitting the application.",
      "Save at least one delivery vehicle before submitting the application.",
      "Complete the vehicle registration number before submitting the application.",
      "Complete the vehicle manufacturer before submitting the application.",
      "Complete the vehicle model before submitting the application.",
      "Complete the vehicle maximum payload before submitting the application.",
      "Complete the vehicle maximum parcel count before submitting the application.",
      "Upload the vehicle front photograph before submitting the application.",
      "Upload the vehicle registration document before submitting the application.",
      "Upload the vehicle insurance document before submitting the application.",
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
      "SUBMISSION_ERROR",

    message:
      "We could not submit your delivery-partner application. Please review your registration and try again.",
  };
}

export async function submitDeliveryPartnerApplication(): Promise<SubmitDeliveryPartnerApplicationResult> {
  const supabase =
    await createClient();

  /*
   * Verify the authenticated user on the server.
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
        "Please sign in before submitting your delivery-partner application.",
    };
  }

  /*
   * The database function performs all final
   * readiness, ownership and document checks.
   */
  const {
    data,
    error,
  } = await supabase.rpc(
    "submit_delivery_partner_application"
  );

  if (error) {
    console.error(
      "Submitting delivery-partner application failed:",
      {
        userId:
          user.id,

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
      "Delivery-partner submission RPC returned an invalid response:",
      data
    );

    return {
      success: false,
      code:
        "SUBMISSION_ERROR",
      message:
        "The submission response was incomplete. Please try again.",
    };
  }

  const userId =
    normalizeText(
      data.userId
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

  const vehicleId =
    normalizeText(
      data.vehicleId
    );

  const vehicleStatus =
    normalizeText(
      data.vehicleStatus
    );

  const submittedAt =
    normalizeText(
      data.submittedAt
    );

  if (
    userId !== user.id ||
    !applicationStatus ||
    !availabilityStatus ||
    !identityVerificationStatus ||
    !drivingLicenceVerificationStatus ||
    !vehicleId ||
    !vehicleStatus ||
    !submittedAt
  ) {
    console.error(
      "Delivery-partner submission response validation failed:",
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
        "SUBMISSION_ERROR",
      message:
        "The submission response was incomplete. Please try again.",
    };
  }

  if (
    applicationStatus !==
      "pending" ||
    vehicleStatus !==
      "pending"
  ) {
    console.error(
      "Delivery-partner submission returned unexpected statuses:",
      {
        userId,
        applicationStatus,
        vehicleStatus,
      }
    );

    return {
      success: false,
      code:
        "SUBMISSION_ERROR",
      message:
        "The application was not moved to the expected review status.",
    };
  }

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
      submitted:
        data.submitted === true,

      userId,

      applicationStatus,
      availabilityStatus,

      identityVerificationStatus,
      drivingLicenceVerificationStatus,

      vehicleId,
      vehicleStatus,

      submittedAt,
    },
  };
}
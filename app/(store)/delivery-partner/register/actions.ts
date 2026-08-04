"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type IdentityDocumentType =
  | "national_identity_card"
  | "passport"
  | "other";

export interface SaveDeliveryPartnerPersonalDetailsInput {
  fullName: string;
  phone: string;
  dateOfBirth: string;

  identityDocumentType: IdentityDocumentType;
  identityDocumentNumber: string;

  drivingLicenceNumber: string;
  drivingLicenceClasses: string[];

  drivingLicenceIssueDate?: string;
  drivingLicenceExpiryDate?: string;

  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;

  requestedServiceAreas: string[];

  termsAccepted: boolean;
  privacyConsent: boolean;
  locationConsent: boolean;
}

export interface DeliveryPartnerPersonalDetailsSummary {
  saved: boolean;
  userId: string;

  applicationStatus: string;
  availabilityStatus: string;

  identityVerificationStatus: string;
  drivingLicenceVerificationStatus: string;

  requestedServiceAreas: string[];

  termsAccepted: boolean;
  privacyConsent: boolean;
  locationConsent: boolean;

  updatedAt: string;
}

export type SaveDeliveryPartnerPersonalDetailsResult =
  | {
      success: true;
      application: DeliveryPartnerPersonalDetailsSummary;
    }
  | {
      success: false;
      code:
        | "UNAUTHENTICATED"
        | "ACCOUNT_RESTRICTED"
        | "APPLICATION_NOT_FOUND"
        | "APPLICATION_LOCKED"
        | "VALIDATION_ERROR"
        | "DUPLICATE_INFORMATION"
        | "APPLICATION_ERROR";
      message: string;
    };

const IDENTITY_DOCUMENT_TYPES =
  new Set<IdentityDocumentType>([
    "national_identity_card",
    "passport",
    "other",
  ]);

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

function isValidIsoDate(
  value: string
): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return false;
  }

  const parsedDate =
    new Date(
      `${value}T00:00:00.000Z`
    );

  return (
    !Number.isNaN(
      parsedDate.getTime()
    ) &&
    parsedDate
      .toISOString()
      .slice(0, 10) === value
  );
}

function normalizeOptionalDate(
  value: unknown
): string {
  const normalizedValue =
    normalizeText(value);

  return normalizedValue;
}

function getBoolean(
  value: unknown
): boolean {
  return value === true;
}

function validateInput(
  input: unknown
):
  | {
      valid: true;
      data: SaveDeliveryPartnerPersonalDetailsInput;
    }
  | {
      valid: false;
      message: string;
    } {
  if (!isRecord(input)) {
    return {
      valid: false,
      message:
        "Invalid delivery partner registration information.",
    };
  }

  const fullName =
    normalizeText(
      input.fullName
    );

  const phone =
    normalizeText(
      input.phone
    );

  const dateOfBirth =
    normalizeText(
      input.dateOfBirth
    );

  const identityDocumentType =
    normalizeText(
      input.identityDocumentType
    ) as IdentityDocumentType;

  const identityDocumentNumber =
    normalizeText(
      input.identityDocumentNumber
    );

  const drivingLicenceNumber =
    normalizeText(
      input.drivingLicenceNumber
    );

  const drivingLicenceClasses =
    normalizeTextArray(
      input.drivingLicenceClasses,
      20
    );

  const drivingLicenceIssueDate =
    normalizeOptionalDate(
      input.drivingLicenceIssueDate
    );

  const drivingLicenceExpiryDate =
    normalizeOptionalDate(
      input.drivingLicenceExpiryDate
    );

  const emergencyContactName =
    normalizeText(
      input.emergencyContactName
    );

  const emergencyContactPhone =
    normalizeText(
      input.emergencyContactPhone
    );

  const emergencyContactRelationship =
    normalizeText(
      input.emergencyContactRelationship
    );

  const requestedServiceAreas =
    normalizeTextArray(
      input.requestedServiceAreas,
      30
    );

  if (
    fullName.length < 2 ||
    fullName.length > 120
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid full name.",
    };
  }

  if (
    phone.length < 7 ||
    phone.length > 30
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid phone number.",
    };
  }

  if (
    !isValidIsoDate(
      dateOfBirth
    )
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid date of birth.",
    };
  }

  if (
    !IDENTITY_DOCUMENT_TYPES.has(
      identityDocumentType
    )
  ) {
    return {
      valid: false,
      message:
        "Please select a valid identity document type.",
    };
  }

  if (
    identityDocumentNumber.length <
      4 ||
    identityDocumentNumber.length >
      50
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid identity document number.",
    };
  }

  if (
    drivingLicenceNumber.length <
      3 ||
    drivingLicenceNumber.length >
      50
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid driving licence number.",
    };
  }

  if (
    drivingLicenceClasses.length ===
    0
  ) {
    return {
      valid: false,
      message:
        "Please enter at least one driving licence class.",
    };
  }

  if (
    drivingLicenceIssueDate &&
    !isValidIsoDate(
      drivingLicenceIssueDate
    )
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid driving licence issue date.",
    };
  }

  if (
    drivingLicenceExpiryDate &&
    !isValidIsoDate(
      drivingLicenceExpiryDate
    )
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid driving licence expiry date.",
    };
  }

  if (
    drivingLicenceIssueDate &&
    drivingLicenceExpiryDate &&
    drivingLicenceExpiryDate <
      drivingLicenceIssueDate
  ) {
    return {
      valid: false,
      message:
        "The driving licence expiry date cannot be before the issue date.",
    };
  }

  if (
    emergencyContactName.length <
      2 ||
    emergencyContactName.length >
      120
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid emergency contact name.",
    };
  }

  if (
    emergencyContactPhone.length <
      7 ||
    emergencyContactPhone.length >
      30
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid emergency contact phone number.",
    };
  }

  if (
    emergencyContactRelationship.length <
      2 ||
    emergencyContactRelationship.length >
      80
  ) {
    return {
      valid: false,
      message:
        "Please enter the emergency contact relationship.",
    };
  }

  if (
    requestedServiceAreas.length ===
    0
  ) {
    return {
      valid: false,
      message:
        "Please enter at least one requested service area.",
    };
  }

  return {
    valid: true,

    data: {
      fullName,
      phone,
      dateOfBirth,

      identityDocumentType,
      identityDocumentNumber,

      drivingLicenceNumber,
      drivingLicenceClasses,

      drivingLicenceIssueDate,
      drivingLicenceExpiryDate,

      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,

      requestedServiceAreas,

      termsAccepted:
        getBoolean(
          input.termsAccepted
        ),

      privacyConsent:
        getBoolean(
          input.privacyConsent
        ),

      locationConsent:
        getBoolean(
          input.locationConsent
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
    | "VALIDATION_ERROR"
    | "DUPLICATE_INFORMATION"
    | "APPLICATION_ERROR";
  message: string;
} {
  const message =
    error.message.trim();

  if (
    error.code === "23505"
  ) {
    return {
      code:
        "DUPLICATE_INFORMATION",

      message:
        "This identity document number or driving licence number is already registered.",
    };
  }

  if (
    message ===
    "You must sign in before updating a delivery partner application."
  ) {
    return {
      code:
        "UNAUTHENTICATED",

      message:
        "Please sign in before updating your delivery partner application.",
    };
  }

  if (
    message ===
    "This account cannot currently update a delivery partner application."
  ) {
    return {
      code:
        "ACCOUNT_RESTRICTED",

      message,
    };
  }

  if (
    message ===
    "Start your delivery partner application before entering registration details."
  ) {
    return {
      code:
        "APPLICATION_NOT_FOUND",

      message,
    };
  }

  if (
    message ===
    "Application details cannot be edited in the current status."
  ) {
    return {
      code:
        "APPLICATION_LOCKED",

      message,
    };
  }

  const safeValidationMessages =
    new Set([
      "Please enter a valid full name.",
      "Please enter a valid phone number.",
      "Please enter your date of birth.",
      "Please enter a valid date of birth.",
      "Please select a valid identity document type.",
      "Please enter a valid identity document number.",
      "Please enter a valid driving licence number.",
      "Please enter at least one driving licence class.",
      "Too many driving licence classes were provided.",
      "The driving licence issue date cannot be in the future.",
      "The driving licence expiry date cannot be before the issue date.",
      "Please enter a valid emergency contact name.",
      "Please enter a valid emergency contact phone number.",
      "Please enter the emergency contact relationship.",
      "Please enter at least one requested service area.",
      "Too many service areas were provided.",
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
      "APPLICATION_ERROR",

    message:
      "We could not save your registration details. Please review the form and try again.",
  };
}

export async function saveDeliveryPartnerPersonalDetails(
  input: SaveDeliveryPartnerPersonalDetailsInput
): Promise<SaveDeliveryPartnerPersonalDetailsResult> {
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
        "Please sign in before updating your delivery partner application.",
    };
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "save_delivery_partner_personal_details",
    {
      p_full_name:
        validation.data.fullName,

      p_phone:
        validation.data.phone,

      p_date_of_birth:
        validation.data.dateOfBirth,

      p_identity_document_type:
        validation.data
          .identityDocumentType,

      p_identity_document_number:
        validation.data
          .identityDocumentNumber,

      p_driving_licence_number:
        validation.data
          .drivingLicenceNumber,

      p_driving_licence_class:
        validation.data
          .drivingLicenceClasses,

      p_driving_licence_issue_date:
        validation.data
          .drivingLicenceIssueDate ||
        null,

      p_driving_licence_expiry_date:
        validation.data
          .drivingLicenceExpiryDate ||
        null,

      p_emergency_contact_name:
        validation.data
          .emergencyContactName,

      p_emergency_contact_phone:
        validation.data
          .emergencyContactPhone,

      p_emergency_contact_relationship:
        validation.data
          .emergencyContactRelationship,

      p_requested_service_areas:
        validation.data
          .requestedServiceAreas,

      p_terms_accepted:
        validation.data
          .termsAccepted,

      p_privacy_consent:
        validation.data
          .privacyConsent,

      p_location_consent:
        validation.data
          .locationConsent,
    }
  );

  if (error) {
    console.error(
      "Saving delivery partner personal details failed:",
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
      "Delivery partner personal-details RPC returned an invalid response:",
      data
    );

    return {
      success: false,
      code:
        "APPLICATION_ERROR",
      message:
        "The registration response was incomplete. Please try again.",
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

  const requestedServiceAreas =
    normalizeTextArray(
      data.requestedServiceAreas,
      30
    );

  const updatedAt =
    normalizeText(
      data.updatedAt
    );

  if (
    userId !== user.id ||
    !applicationStatus ||
    !availabilityStatus ||
    !identityVerificationStatus ||
    !drivingLicenceVerificationStatus ||
    !updatedAt
  ) {
    console.error(
      "Delivery partner personal-details response validation failed:",
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
        "APPLICATION_ERROR",
      message:
        "The registration response was incomplete. Please try again.",
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

    application: {
      saved:
        data.saved === true,

      userId,
      applicationStatus,
      availabilityStatus,

      identityVerificationStatus,
      drivingLicenceVerificationStatus,

      requestedServiceAreas,

      termsAccepted:
        data.termsAccepted === true,

      privacyConsent:
        data.privacyConsent === true,

      locationConsent:
        data.locationConsent === true,

      updatedAt,
    },
  };
}
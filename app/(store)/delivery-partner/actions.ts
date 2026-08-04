"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface DeliveryPartnerApplicationSummary {
  created: boolean;
  userId: string;
  applicationStatus: string;
  availabilityStatus: string;
  createdAt: string;
  updatedAt: string;
}

export type StartDeliveryPartnerApplicationResult =
  | {
      success: true;
      application: DeliveryPartnerApplicationSummary;
    }
  | {
      success: false;
      code:
        | "UNAUTHENTICATED"
        | "ACCOUNT_RESTRICTED"
        | "APPLICATION_ERROR";
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

function getSafeApplicationError(
  message: string
): {
  code:
    | "UNAUTHENTICATED"
    | "ACCOUNT_RESTRICTED"
    | "APPLICATION_ERROR";
  message: string;
} {
  const normalizedMessage =
    message.trim();

  if (
    normalizedMessage ===
    "You must sign in before starting a delivery partner application."
  ) {
    return {
      code: "UNAUTHENTICATED",
      message:
        "Please sign in before starting your delivery partner application.",
    };
  }

  if (
    normalizedMessage ===
    "This account cannot currently start a delivery partner application."
  ) {
    return {
      code: "ACCOUNT_RESTRICTED",
      message:
        "This account cannot currently start a delivery partner application.",
    };
  }

  return {
    code: "APPLICATION_ERROR",
    message:
      "We could not start your delivery partner application. Please try again.",
  };
}

export async function startDeliveryPartnerApplication(): Promise<StartDeliveryPartnerApplicationResult> {
  const supabase =
    await createClient();

  /*
   * Verify the authenticated user on the server.
   */
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    return {
      success: false,
      code: "UNAUTHENTICATED",
      message:
        "Please sign in before starting your delivery partner application.",
    };
  }

  /*
   * The database function securely creates or
   * returns the user's existing draft application.
   */
  const {
    data,
    error,
  } = await supabase.rpc(
    "start_delivery_partner_application"
  );

  if (error) {
    console.error(
      "Starting delivery partner application failed:",
      {
        userId: user.id,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      }
    );

    const safeError =
      getSafeApplicationError(
        error.message
      );

    return {
      success: false,
      ...safeError,
    };
  }

  if (!isRecord(data)) {
    console.error(
      "Delivery partner application RPC returned an invalid response:",
      data
    );

    return {
      success: false,
      code: "APPLICATION_ERROR",
      message:
        "The application response was incomplete. Please try again.",
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

  const createdAt =
    normalizeText(
      data.createdAt
    );

  const updatedAt =
    normalizeText(
      data.updatedAt
    );

  const created =
    data.created === true;

  /*
   * Ensure the returned application belongs
   * to the authenticated user.
   */
  if (
    userId !== user.id ||
    !applicationStatus ||
    !availabilityStatus ||
    !createdAt ||
    !updatedAt
  ) {
    console.error(
      "Delivery partner application response validation failed:",
      {
        authenticatedUserId:
          user.id,
        response:
          data,
      }
    );

    return {
      success: false,
      code: "APPLICATION_ERROR",
      message:
        "The application response was incomplete. Please try again.",
    };
  }

  revalidatePath(
    "/delivery-partner"
  );

  revalidatePath(
    "/account"
  );

  return {
    success: true,

    application: {
      created,
      userId,
      applicationStatus,
      availabilityStatus,
      createdAt,
      updatedAt,
    },
  };
}
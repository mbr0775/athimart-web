// lib/auth/delivery-partner.ts

import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type DeliveryPartnerAvailabilityStatus =
  | "offline"
  | "online"
  | "offered"
  | "busy";

export interface ApprovedDeliveryPartnerProfile {
  userId: string;

  email: string;
  fullName: string;
  phone: string;

  applicationStatus: "approved";

  availabilityStatus:
    DeliveryPartnerAvailabilityStatus;

  approvedServiceAreas: string[];
  approvedServiceRadiusKm: number;

  canHandleCashOnDelivery: boolean;
  canHandleFoodDelivery: boolean;
  canHandleFragileParcels: boolean;
}

export interface DeliveryPartnerSession {
  user: User;
  profile: ApprovedDeliveryPartnerProfile;
}

interface AccountProfileRow {
  id: string;

  email: string | null;
  full_name: string | null;
  phone: string | null;

  is_blocked: boolean | null;
}

interface DeliveryPartnerProfileRow {
  user_id: string;

  application_status: string;
  availability_status: string;

  approved_service_areas:
    | string[]
    | null;

  approved_service_radius_km:
    | number
    | string
    | null;

  can_handle_cash_on_delivery:
    boolean;

  can_handle_food_delivery:
    boolean;

  can_handle_fragile_parcels:
    boolean;
}

function normalizeText(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeTextArray(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) =>
      normalizeText(item)
    )
    .filter(Boolean);
}

function normalizeNumber(
  value: unknown,
  fallback: number
): number {
  const parsedValue =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(
    parsedValue
  )
    ? parsedValue
    : fallback;
}

function normalizeAvailabilityStatus(
  value: unknown
): DeliveryPartnerAvailabilityStatus {
  const status =
    normalizeText(value);

  if (
    status === "online" ||
    status === "offered" ||
    status === "busy"
  ) {
    return status;
  }

  return "offline";
}

/**
 * Verify that the current authenticated user:
 *
 * 1. has an AthiMart account profile;
 * 2. is not blocked;
 * 3. has a delivery-partner profile;
 * 4. has been approved by an administrator.
 *
 * Use this helper inside all approved-driver
 * layouts, pages, Server Actions and services.
 */
export const getCurrentDeliveryPartner =
  cache(
    async (): Promise<DeliveryPartnerSession> => {
      const supabase =
        await createClient();

      /*
       * Confirm the authenticated Supabase user.
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
        redirect(
          "/auth/login?next=%2Fdelivery-partner%2Fdashboard"
        );
      }

      /*
       * Load the main AthiMart account profile.
       */
      const {
        data: accountData,
        error: accountError,
      } = await supabase
        .from("profiles")
        .select(
          `
            id,
            email,
            full_name,
            phone,
            is_blocked
          `
        )
        .eq(
          "id",
          user.id
        )
        .maybeSingle<AccountProfileRow>();

      if (accountError) {
        throw new Error(
          `Unable to verify the delivery-partner account: ${accountError.message}`
        );
      }

      if (!accountData) {
        redirect("/account");
      }

      /*
       * Blocked accounts cannot access
       * operational delivery-driver tools.
       */
      if (
        accountData.is_blocked ===
        true
      ) {
        redirect(
          "/account-blocked"
        );
      }

      /*
       * Load the user's own delivery-partner
       * application through the existing RLS policy.
       */
      const {
        data: deliveryData,
        error: deliveryError,
      } = await supabase
        .from(
          "delivery_partner_profiles"
        )
        .select(
          `
            user_id,
            application_status,
            availability_status,
            approved_service_areas,
            approved_service_radius_km,
            can_handle_cash_on_delivery,
            can_handle_food_delivery,
            can_handle_fragile_parcels
          `
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle<DeliveryPartnerProfileRow>();

      if (deliveryError) {
        throw new Error(
          `Unable to verify delivery-partner access: ${deliveryError.message}`
        );
      }

      /*
       * Users without an application return
       * to the public delivery-partner page.
       */
      if (!deliveryData) {
        redirect(
          "/delivery-partner"
        );
      }

      const applicationStatus =
        normalizeText(
          deliveryData
            .application_status
        );

      /*
       * Draft and rejected applications can
       * return to the editable registration page.
       */
      if (
        applicationStatus ===
          "draft" ||
        applicationStatus ===
          "rejected"
      ) {
        redirect(
          "/delivery-partner/register"
        );
      }

      /*
       * Pending, under-review and suspended
       * applications remain on the status page.
       */
      if (
        applicationStatus !==
        "approved"
      ) {
        redirect(
          "/delivery-partner"
        );
      }

      const email =
        normalizeText(
          accountData.email
        ) ||
        user.email ||
        "";

      const fullName =
        normalizeText(
          accountData.full_name
        ) ||
        normalizeText(
          user.user_metadata
            ?.full_name
        ) ||
        email.split("@")[0] ||
        "AthiMart Delivery Partner";

      const phone =
        normalizeText(
          accountData.phone
        );

      return {
        user,

        profile: {
          userId:
            deliveryData.user_id,

          email,
          fullName,
          phone,

          applicationStatus:
            "approved",

          availabilityStatus:
            normalizeAvailabilityStatus(
              deliveryData
                .availability_status
            ),

          approvedServiceAreas:
            normalizeTextArray(
              deliveryData
                .approved_service_areas
            ),

          approvedServiceRadiusKm:
            normalizeNumber(
              deliveryData
                .approved_service_radius_km,
              10
            ),

          canHandleCashOnDelivery:
            deliveryData
              .can_handle_cash_on_delivery ===
            true,

          canHandleFoodDelivery:
            deliveryData
              .can_handle_food_delivery ===
            true,

          canHandleFragileParcels:
            deliveryData
              .can_handle_fragile_parcels ===
            true,
        },
      };
    }
  );
// lib/delivery-partner/admin-document-urls.ts

import "server-only";

import { getCurrentAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const DELIVERY_PARTNER_DOCUMENT_BUCKET =
  "delivery-partner-documents";

/*
 * Signed document links remain valid for ten minutes.
 * The review page can generate fresh links whenever
 * an authorised administrator reloads the page.
 */
const SIGNED_URL_EXPIRY_SECONDS = 10 * 60;

export type DeliveryPartnerDocumentKey =
  | "profilePhoto"
  | "identityDocumentFront"
  | "identityDocumentBack"
  | "drivingLicenceFront"
  | "drivingLicenceBack"
  | "policeClearance"
  | "vehicleFrontPhoto"
  | "vehicleBackPhoto"
  | "vehicleSidePhoto"
  | "vehicleRegistration"
  | "vehicleOwnership"
  | "vehicleInsurance"
  | "vehicleRevenueLicence"
  | "vehicleEmissionCertificate";

export type DeliveryPartnerDocumentPaths =
  Partial<
    Record<
      DeliveryPartnerDocumentKey,
      string | null
    >
  >;

export interface DeliveryPartnerSignedDocument {
  key: DeliveryPartnerDocumentKey;

  storagePath: string;
  signedUrl: string;

  expiresInSeconds: number;
}

export type DeliveryPartnerSignedDocuments =
  Partial<
    Record<
      DeliveryPartnerDocumentKey,
      DeliveryPartnerSignedDocument
    >
  >;

function normalizeStoragePath(
  value: unknown
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalizedPath =
    value.trim();

  if (
    !normalizedPath ||
    normalizedPath.length > 1000 ||
    normalizedPath.startsWith("/") ||
    normalizedPath.includes("..")
  ) {
    return null;
  }

  return normalizedPath;
}

export async function createAdminDeliveryPartnerDocumentUrls(
  documentPaths: DeliveryPartnerDocumentPaths
): Promise<DeliveryPartnerSignedDocuments> {
  /*
   * Independently protect this helper.
   *
   * A non-administrator must never be able to use
   * this function to generate private document URLs.
   */
  const {
    user,
  } = await getCurrentAdmin();

  const supabase =
    await createClient();

  const signedDocuments:
    DeliveryPartnerSignedDocuments =
      {};

  const documentEntries =
    Object.entries(
      documentPaths
    ) as Array<
      [
        DeliveryPartnerDocumentKey,
        string | null | undefined,
      ]
    >;

  /*
   * Create URLs independently so one unavailable
   * optional document does not prevent the remaining
   * documents from appearing on the review page.
   */
  await Promise.all(
    documentEntries.map(
      async ([
        key,
        rawStoragePath,
      ]) => {
        const storagePath =
          normalizeStoragePath(
            rawStoragePath
          );

        if (!storagePath) {
          return;
        }

        const {
          data,
          error,
        } =
          await supabase.storage
            .from(
              DELIVERY_PARTNER_DOCUMENT_BUCKET
            )
            .createSignedUrl(
              storagePath,
              SIGNED_URL_EXPIRY_SECONDS
            );

        if (
          error ||
          !data?.signedUrl
        ) {
          console.error(
            "Creating delivery-partner administrator document URL failed:",
            {
              administratorUserId:
                user.id,

              documentKey:
                key,

              storagePath,

              code:
                error?.name,

              message:
                error?.message,
            }
          );

          return;
        }

        signedDocuments[key] = {
          key,
          storagePath,

          signedUrl:
            data.signedUrl,

          expiresInSeconds:
            SIGNED_URL_EXPIRY_SECONDS,
        };
      }
    )
  );

  return signedDocuments;
}
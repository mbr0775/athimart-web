// app/(store)/delivery-partner/register/documents/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  FileCheck2,
  LockKeyhole,
  ShieldCheck,
  Truck,
} from "lucide-react";

import DocumentUploadSection, {
  type DeliveryPartnerDocumentInitialValues,
} from "@/components/delivery-partner/document-upload-section";

import SubmitApplicationPanel from "@/components/delivery-partner/submit-application-panel";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Delivery Partner Documents",

  description:
    "Upload private verification documents for your AthiMart Individual Delivery Partner application.",

  robots: {
    index: false,
    follow: false,
    noarchive: true,

    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      noimageindex: true,
    },
  },
};

interface AccountProfileRow {
  is_blocked: boolean;
}

interface DeliveryPartnerDocumentRow {
  application_status: string;

  profile_photo_path: string | null;

  identity_document_front_path: string | null;
  identity_document_back_path: string | null;

  driving_licence_front_path: string | null;
  driving_licence_back_path: string | null;

  police_clearance_path: string | null;
}

interface DeliveryPartnerVehicleDocumentRow {
  id: string;
  vehicle_status: string;

  vehicle_front_photo_path: string | null;
  vehicle_back_photo_path: string | null;
  vehicle_side_photo_path: string | null;

  registration_document_path: string | null;
  ownership_document_path: string | null;
  insurance_document_path: string | null;
  revenue_licence_document_path: string | null;
  emission_certificate_path: string | null;
}

const EDITABLE_APPLICATION_STATUSES = new Set([
  "draft",
  "rejected",
]);

function formatStatus(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

export default async function DeliveryPartnerDocumentsPage() {
  const supabase = await createClient();

  /*
   * Require an authenticated AthiMart account.
   */
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      `/auth/login?next=${encodeURIComponent(
        "/delivery-partner/register/documents"
      )}`
    );
  }

  /*
   * Check the main AthiMart account status.
   */
  const {
    data: accountData,
    error: accountError,
  } = await supabase
    .from("profiles")
    .select("is_blocked")
    .eq("id", user.id)
    .maybeSingle();

  if (accountError || !accountData) {
    console.error(
      "Delivery-partner document account lookup failed:",
      {
        userId: user.id,
        code: accountError?.code,
        message: accountError?.message,
        details: accountError?.details,
        hint: accountError?.hint,
      }
    );

    redirect("/account");
  }

  const accountProfile =
    accountData as AccountProfileRow;

  if (accountProfile.is_blocked) {
    redirect("/account-blocked");
  }

  /*
   * Load applicant-level document paths.
   */
  const {
    data: applicationData,
    error: applicationError,
  } = await supabase
    .from("delivery_partner_profiles")
    .select(
      `
        application_status,
        profile_photo_path,
        identity_document_front_path,
        identity_document_back_path,
        driving_licence_front_path,
        driving_licence_back_path,
        police_clearance_path
      `
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (applicationError) {
    console.error(
      "Delivery-partner document application lookup failed:",
      {
        userId: user.id,
        code: applicationError.code,
        message: applicationError.message,
        details: applicationError.details,
        hint: applicationError.hint,
      }
    );

    redirect("/delivery-partner");
  }

  if (!applicationData) {
    redirect("/delivery-partner");
  }

  const application =
    applicationData as DeliveryPartnerDocumentRow;

  /*
   * Submitted, approved, suspended and inactive
   * applications cannot replace draft documents.
   */
  if (
    !EDITABLE_APPLICATION_STATUSES.has(
      application.application_status
    )
  ) {
    redirect("/delivery-partner");
  }

  /*
   * Load the applicant's primary or earliest
   * editable vehicle and its document paths.
   */
  const {
    data: vehicleData,
    error: vehicleError,
  } = await supabase
    .from("delivery_partner_vehicles")
    .select(
      `
        id,
        vehicle_status,
        vehicle_front_photo_path,
        vehicle_back_photo_path,
        vehicle_side_photo_path,
        registration_document_path,
        ownership_document_path,
        insurance_document_path,
        revenue_licence_document_path,
        emission_certificate_path
      `
    )
    .eq("driver_user_id", user.id)
    .in("vehicle_status", [
      "draft",
      "rejected",
    ])
    .order("is_primary", {
      ascending: false,
    })
    .order("created_at", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle();

  if (vehicleError) {
    console.error(
      "Delivery-partner vehicle-document lookup failed:",
      {
        userId: user.id,
        code: vehicleError.code,
        message: vehicleError.message,
        details: vehicleError.details,
        hint: vehicleError.hint,
      }
    );
  }

  const vehicle =
    vehicleData as
      | DeliveryPartnerVehicleDocumentRow
      | null;

  const initialValues: DeliveryPartnerDocumentInitialValues =
    {
      profilePhotoPath:
        application.profile_photo_path,

      identityDocumentFrontPath:
        application.identity_document_front_path,

      identityDocumentBackPath:
        application.identity_document_back_path,

      drivingLicenceFrontPath:
        application.driving_licence_front_path,

      drivingLicenceBackPath:
        application.driving_licence_back_path,

      policeClearancePath:
        application.police_clearance_path,

      vehicleFrontPhotoPath:
        vehicle?.vehicle_front_photo_path ??
        null,

      vehicleBackPhotoPath:
        vehicle?.vehicle_back_photo_path ??
        null,

      vehicleSidePhotoPath:
        vehicle?.vehicle_side_photo_path ??
        null,

      registrationDocumentPath:
        vehicle?.registration_document_path ??
        null,

      ownershipDocumentPath:
        vehicle?.ownership_document_path ??
        null,

      insuranceDocumentPath:
        vehicle?.insurance_document_path ??
        null,

      revenueLicenceDocumentPath:
        vehicle?.revenue_licence_document_path ??
        null,

      emissionCertificatePath:
        vehicle?.emission_certificate_path ??
        null,
    };

  return (
    <main className="athimart-container py-10 sm:py-14 lg:py-20">
      {/* Navigation */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/delivery-partner/register"
          className="inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--border)] bg-white px-5 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text)] transition-colors hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
        >
          <ArrowLeft
            aria-hidden="true"
            className="h-4 w-4"
            strokeWidth={1.8}
          />

          Registration Details
        </Link>

        <Link
          href="/delivery-partner"
          className="inline-flex min-h-11 items-center justify-center border border-[var(--border)] bg-transparent px-5 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)] transition-colors hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
        >
          Delivery Partner Overview
        </Link>
      </div>

      {/* Page heading */}
      <section className="mt-8 border-b border-[var(--black)] pb-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Registration stage 03
            </p>

            <h1 className="athimart-display-medium mt-3">
              Verification Documents
            </h1>

            <p className="mt-4 max-w-3xl font-[var(--font-body)] text-sm leading-7 text-[var(--text-muted)]">
              Upload clear applicant, identity,
              driving-licence and vehicle documents.
              Each file is stored privately and
              securely linked to your application.
            </p>
          </div>

          <div className="border border-[var(--border)] bg-white p-5">
            <p className="athimart-label text-[var(--text-muted)]">
              Application status
            </p>

            <div className="mt-4 flex items-center gap-3">
              <FileCheck2
                aria-hidden="true"
                className="h-5 w-5 text-[var(--brand-blue)]"
                strokeWidth={1.8}
              />

              <span className="font-[var(--font-body)] text-sm font-semibold uppercase text-[var(--brand-blue)]">
                {formatStatus(
                  application.application_status
                )}
              </span>
            </div>

            <p className="mt-3 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              Uploading documents does not submit or
              approve the application.
            </p>
          </div>
        </div>
      </section>

      {/* Security summary */}
      <section className="mt-8 grid border-l border-t border-[var(--border)] md:grid-cols-3">
        <article className="border-b border-r border-[var(--border)] bg-white p-5">
          <LockKeyhole
            aria-hidden="true"
            className="h-6 w-6 text-[var(--success)]"
            strokeWidth={1.7}
          />

          <h2 className="mt-4 font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.14em]">
            Private Storage
          </h2>

          <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
            Files are stored in a private Supabase
            Storage bucket rather than exposed
            through public URLs.
          </p>
        </article>

        <article className="border-b border-r border-[var(--border)] bg-white p-5">
          <ShieldCheck
            aria-hidden="true"
            className="h-6 w-6 text-[var(--brand-blue)]"
            strokeWidth={1.7}
          />

          <h2 className="mt-4 font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.14em]">
            Account Restricted
          </h2>

          <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
            Applicants can access only their own
            private document directory and linked
            records.
          </p>
        </article>

        <article className="border-b border-r border-[var(--border)] bg-white p-5">
          <Truck
            aria-hidden="true"
            className="h-6 w-6 text-[var(--brand-orange-dark)]"
            strokeWidth={1.7}
          />

          <h2 className="mt-4 font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.14em]">
            Vehicle Required
          </h2>

          <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
            Vehicle documents become available after
            at least one vehicle draft has been
            saved.
          </p>
        </article>
      </section>

      {/* Document uploads */}
      <section className="mt-12">
        <DocumentUploadSection
          vehicleId={
            vehicle?.id ?? null
          }
          initialValues={
            initialValues
          }
        />
      </section>

      {/* Final application submission */}
      <section className="mt-14 border-t border-[var(--black)] pt-12">
        <SubmitApplicationPanel />
      </section>
    </main>
  );
}
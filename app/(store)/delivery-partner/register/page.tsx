// app/(store)/delivery-partner/register/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Truck,
} from "lucide-react";

import PersonalDetailsForm, {
  type DeliveryPartnerPersonalDetailsInitialValues,
} from "@/components/delivery-partner/personal-details-form";

import VehicleForm, {
  type DeliveryPartnerVehicleInitialValues,
} from "@/components/delivery-partner/vehicle-form";

import { createClient } from "@/lib/supabase/server";

import type { IdentityDocumentType } from "@/app/(store)/delivery-partner/register/actions";

import type {
  DeliveryVehicleType,
  VehicleOwnershipType,
} from "@/app/(store)/delivery-partner/register/vehicle-actions";

export const dynamic =
  "force-dynamic";

export const metadata: Metadata = {
  title:
    "Delivery Partner Registration",

  description:
    "Complete your private AthiMart Individual Delivery Partner registration.",

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
  full_name: string | null;
  phone: string | null;
  is_blocked: boolean;
}

interface DeliveryPartnerProfileRow {
  application_status: string;
  availability_status: string;

  date_of_birth: string | null;

  identity_document_type:
    | string
    | null;

  identity_document_number:
    | string
    | null;

  driving_licence_number:
    | string
    | null;

  driving_licence_class:
    | string[]
    | null;

  driving_licence_issue_date:
    | string
    | null;

  driving_licence_expiry_date:
    | string
    | null;

  emergency_contact_name:
    | string
    | null;

  emergency_contact_phone:
    | string
    | null;

  emergency_contact_relationship:
    | string
    | null;

  requested_service_areas:
    | string[]
    | null;

  terms_accepted_at:
    | string
    | null;

  privacy_consent_at:
    | string
    | null;

  location_consent_at:
    | string
    | null;
}

interface DeliveryPartnerVehicleRow {
  id: string;

  vehicle_type: string;
  vehicle_status: string;

  registration_number:
    | string
    | null;

  manufacturer:
    | string
    | null;

  model:
    | string
    | null;

  manufacture_year:
    | number
    | null;

  colour:
    | string
    | null;

  ownership_type:
    | string
    | null;

  owner_name:
    | string
    | null;

  maximum_payload_kg:
    | number
    | string
    | null;

  maximum_parcel_count:
    | number
    | null;

  cargo_length_cm:
    | number
    | string
    | null;

  cargo_width_cm:
    | number
    | string
    | null;

  cargo_height_cm:
    | number
    | string
    | null;

  cargo_volume_litres:
    | number
    | string
    | null;

  has_closed_cargo_area: boolean;
  has_delivery_box: boolean;
  has_refrigeration: boolean;

  supports_food_delivery: boolean;
  supports_fragile_parcels: boolean;
  supports_frozen_items: boolean;
  supports_bulk_orders: boolean;
  supports_cash_on_delivery: boolean;
}

const EDITABLE_APPLICATION_STATUSES =
  new Set([
    "draft",
    "rejected",
  ]);

function normalizeIdentityDocumentType(
  value: string | null
): IdentityDocumentType | undefined {
  if (
    value ===
      "national_identity_card" ||
    value === "passport" ||
    value === "other"
  ) {
    return value;
  }

  return undefined;
}

function normalizeVehicleType(
  value: string
): DeliveryVehicleType | undefined {
  const allowedTypes =
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

  const normalizedValue =
    value as DeliveryVehicleType;

  return allowedTypes.has(
    normalizedValue
  )
    ? normalizedValue
    : undefined;
}

function normalizeOwnershipType(
  value: string | null
): VehicleOwnershipType | undefined {
  const allowedTypes =
    new Set<VehicleOwnershipType>([
      "owned",
      "leased",
      "rented",
      "borrowed",
      "family_owned",
      "company_owned",
      "other",
    ]);

  const normalizedValue =
    value as VehicleOwnershipType;

  return allowedTypes.has(
    normalizedValue
  )
    ? normalizedValue
    : undefined;
}

function numberToText(
  value:
    | number
    | string
    | null
    | undefined
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value);
}

function formatStatus(
  value: string
): string {
  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

export default async function DeliveryPartnerRegistrationPage() {
  const supabase =
    await createClient();

  /*
   * Verify the current authenticated user.
   */
  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    redirect(
      `/auth/login?next=${encodeURIComponent(
        "/delivery-partner/register"
      )}`
    );
  }

  /*
   * Read the user's main AthiMart profile.
   */
  const {
    data: accountData,
    error: accountError,
  } = await supabase
    .from("profiles")
    .select(
      `
        full_name,
        phone,
        is_blocked
      `
    )
    .eq(
      "id",
      user.id
    )
    .maybeSingle();

  if (
    accountError ||
    !accountData
  ) {
    console.error(
      "Delivery partner account lookup failed:",
      {
        userId:
          user.id,

        code:
          accountError?.code,

        message:
          accountError?.message,

        details:
          accountError?.details,

        hint:
          accountError?.hint,
      }
    );

    redirect(
      "/account"
    );
  }

  const accountProfile =
    accountData as AccountProfileRow;

  if (
    accountProfile.is_blocked
  ) {
    redirect(
      "/account-blocked"
    );
  }

  /*
   * Read the user's delivery-partner application.
   */
  const {
    data: applicationData,
    error: applicationError,
  } = await supabase
    .from(
      "delivery_partner_profiles"
    )
    .select(
      `
        application_status,
        availability_status,
        date_of_birth,
        identity_document_type,
        identity_document_number,
        driving_licence_number,
        driving_licence_class,
        driving_licence_issue_date,
        driving_licence_expiry_date,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship,
        requested_service_areas,
        terms_accepted_at,
        privacy_consent_at,
        location_consent_at
      `
    )
    .eq(
      "user_id",
      user.id
    )
    .maybeSingle();

  if (applicationError) {
    console.error(
      "Delivery partner application lookup failed:",
      {
        userId:
          user.id,

        code:
          applicationError.code,

        message:
          applicationError.message,

        details:
          applicationError.details,

        hint:
          applicationError.hint,
      }
    );

    redirect(
      "/delivery-partner"
    );
  }

  if (!applicationData) {
    redirect(
      "/delivery-partner"
    );
  }

  const application =
    applicationData as DeliveryPartnerProfileRow;

  /*
   * Submitted, approved, suspended or inactive
   * applications cannot use the draft forms.
   */
  if (
    !EDITABLE_APPLICATION_STATUSES.has(
      application.application_status
    )
  ) {
    redirect(
      "/delivery-partner"
    );
  }

  /*
   * Read the applicant's primary or earliest
   * editable vehicle draft.
   */
  const {
    data: vehicleData,
    error: vehicleError,
  } = await supabase
    .from(
      "delivery_partner_vehicles"
    )
    .select(
      `
        id,
        vehicle_type,
        vehicle_status,
        registration_number,
        manufacturer,
        model,
        manufacture_year,
        colour,
        ownership_type,
        owner_name,
        maximum_payload_kg,
        maximum_parcel_count,
        cargo_length_cm,
        cargo_width_cm,
        cargo_height_cm,
        cargo_volume_litres,
        has_closed_cargo_area,
        has_delivery_box,
        has_refrigeration,
        supports_food_delivery,
        supports_fragile_parcels,
        supports_frozen_items,
        supports_bulk_orders,
        supports_cash_on_delivery
      `
    )
    .eq(
      "driver_user_id",
      user.id
    )
    .in(
      "vehicle_status",
      [
        "draft",
        "rejected",
      ]
    )
    .order(
      "is_primary",
      {
        ascending: false,
      }
    )
    .order(
      "created_at",
      {
        ascending: true,
      }
    )
    .limit(1)
    .maybeSingle();

  if (vehicleError) {
    console.error(
      "Delivery partner vehicle lookup failed:",
      {
        userId:
          user.id,

        code:
          vehicleError.code,

        message:
          vehicleError.message,

        details:
          vehicleError.details,

        hint:
          vehicleError.hint,
      }
    );
  }

  const personalInitialValues: DeliveryPartnerPersonalDetailsInitialValues =
    {
      fullName:
        accountProfile.full_name ??
        "",

      phone:
        accountProfile.phone ??
        "",

      dateOfBirth:
        application.date_of_birth ??
        "",

      identityDocumentType:
        normalizeIdentityDocumentType(
          application.identity_document_type
        ),

      identityDocumentNumber:
        application.identity_document_number ??
        "",

      drivingLicenceNumber:
        application.driving_licence_number ??
        "",

      drivingLicenceClasses:
        application.driving_licence_class ??
        [],

      drivingLicenceIssueDate:
        application.driving_licence_issue_date ??
        "",

      drivingLicenceExpiryDate:
        application.driving_licence_expiry_date ??
        "",

      emergencyContactName:
        application.emergency_contact_name ??
        "",

      emergencyContactPhone:
        application.emergency_contact_phone ??
        "",

      emergencyContactRelationship:
        application.emergency_contact_relationship ??
        "",

      requestedServiceAreas:
        application.requested_service_areas ??
        [],

      termsAccepted:
        application.terms_accepted_at !==
        null,

      privacyConsent:
        application.privacy_consent_at !==
        null,

      locationConsent:
        application.location_consent_at !==
        null,
    };

  let vehicleInitialValues:
    | DeliveryPartnerVehicleInitialValues
    | undefined;

  if (vehicleData) {
    const vehicle =
      vehicleData as DeliveryPartnerVehicleRow;

    vehicleInitialValues = {
      vehicleId:
        vehicle.id,

      vehicleType:
        normalizeVehicleType(
          vehicle.vehicle_type
        ),

      registrationNumber:
        vehicle.registration_number ??
        "",

      manufacturer:
        vehicle.manufacturer ??
        "",

      model:
        vehicle.model ??
        "",

      manufactureYear:
        numberToText(
          vehicle.manufacture_year
        ),

      colour:
        vehicle.colour ??
        "",

      ownershipType:
        normalizeOwnershipType(
          vehicle.ownership_type
        ),

      ownerName:
        vehicle.owner_name ??
        "",

      maximumPayloadKg:
        numberToText(
          vehicle.maximum_payload_kg
        ),

      maximumParcelCount:
        numberToText(
          vehicle.maximum_parcel_count
        ),

      cargoLengthCm:
        numberToText(
          vehicle.cargo_length_cm
        ),

      cargoWidthCm:
        numberToText(
          vehicle.cargo_width_cm
        ),

      cargoHeightCm:
        numberToText(
          vehicle.cargo_height_cm
        ),

      cargoVolumeLitres:
        numberToText(
          vehicle.cargo_volume_litres
        ),

      hasClosedCargoArea:
        vehicle.has_closed_cargo_area,

      hasDeliveryBox:
        vehicle.has_delivery_box,

      hasRefrigeration:
        vehicle.has_refrigeration,

      supportsFoodDelivery:
        vehicle.supports_food_delivery,

      supportsFragileParcels:
        vehicle.supports_fragile_parcels,

      supportsFrozenItems:
        vehicle.supports_frozen_items,

      supportsBulkOrders:
        vehicle.supports_bulk_orders,

      supportsCashOnDelivery:
        vehicle.supports_cash_on_delivery,
    };
  }

  return (
    <main className="athimart-container py-10 sm:py-14 lg:py-20">
      {/* Page heading */}
      <section className="border-b border-[var(--black)] pb-8">
        <Link
          href="/delivery-partner"
          className="inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--border)] bg-white px-5 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text)] transition-colors hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
        >
          <ArrowLeft
            aria-hidden="true"
            className="h-4 w-4"
            strokeWidth={1.8}
          />

          Delivery Partner Overview
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Individual delivery partner
            </p>

            <h1 className="athimart-display-medium mt-3">
              Registration Details
            </h1>

            <p className="mt-4 max-w-3xl font-[var(--font-body)] text-sm leading-7 text-[var(--text-muted)]">
              Complete your personal details and
              register at least one suitable delivery
              vehicle before submitting your
              application.
            </p>
          </div>

          <div className="border border-[var(--border)] bg-white p-5">
            <p className="athimart-label text-[var(--text-muted)]">
              Current status
            </p>

            <div className="mt-4 flex items-center gap-3">
              <ClipboardList
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
              Saving these forms keeps your
              application as a draft. It does not
              submit it for administrator review.
            </p>
          </div>
        </div>
      </section>

      {/* Security information */}
      <section className="mt-8 grid border-l border-t border-[var(--border)] md:grid-cols-3">
        <article className="border-b border-r border-[var(--border)] bg-white p-5">
          <FileText
            aria-hidden="true"
            className="h-6 w-6 text-[var(--brand-blue)]"
            strokeWidth={1.7}
          />

          <h2 className="mt-4 font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.14em]">
            Save Your Progress
          </h2>

          <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
            You may return later and continue editing
            while the application remains editable.
          </p>
        </article>

        <article className="border-b border-r border-[var(--border)] bg-white p-5">
          <LockKeyhole
            aria-hidden="true"
            className="h-6 w-6 text-[var(--success)]"
            strokeWidth={1.7}
          />

          <h2 className="mt-4 font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.14em]">
            Private Information
          </h2>

          <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
            Registration details are available only
            to the applicant and authorised AthiMart
            administrators.
          </p>
        </article>

        <article className="border-b border-r border-[var(--border)] bg-white p-5">
          <ShieldCheck
            aria-hidden="true"
            className="h-6 w-6 text-[var(--brand-orange-dark)]"
            strokeWidth={1.7}
          />

          <h2 className="mt-4 font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.14em]">
            Verification Required
          </h2>

          <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
            Identity, licence, vehicle and supporting
            documents must be verified before final
            approval.
          </p>
        </article>
      </section>

      {/* Personal registration */}
      <section className="mt-12">
        <div className="mb-7 border-l-4 border-[var(--brand-blue)] pl-5">
          <p className="athimart-label text-[var(--brand-orange-dark)]">
            Registration stage 01
          </p>

          <h2 className="athimart-title-large mt-2">
            Personal and Licence Details
          </h2>
        </div>

        <PersonalDetailsForm
          initialValues={
            personalInitialValues
          }
        />
      </section>

      {/* Vehicle registration */}
      <section className="mt-16 border-t border-[var(--black)] pt-12">
        <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="border-l-4 border-[var(--brand-orange)] pl-5">
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Registration stage 02
            </p>

            <h2 className="athimart-title-large mt-2">
              Delivery Vehicle
            </h2>

            <p className="mt-3 max-w-2xl font-[var(--font-body)] text-sm leading-7 text-[var(--text-muted)]">
              Register the vehicle you plan to use.
              AthiMart will later match assignments
              according to parcel size, weight,
              quantity and vehicle capacity.
            </p>
          </div>

          <div className="flex items-center gap-3 border border-[var(--border)] bg-white px-5 py-4">
            <Truck
              aria-hidden="true"
              className="h-6 w-6 text-[var(--brand-blue)]"
              strokeWidth={1.7}
            />

            <p className="font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.12em]">
              One primary vehicle
            </p>
          </div>
        </div>

        <VehicleForm
          initialValues={
            vehicleInitialValues
          }
        />
      </section>
    </main>
  );
}
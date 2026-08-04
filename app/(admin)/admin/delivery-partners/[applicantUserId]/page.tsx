// app/(admin)/admin/delivery-partners/[applicantUserId]/page.tsx

import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Box,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
  FileText,
  Gauge,
  IdCard,
  LockKeyhole,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Truck,
  UserRound,
  Weight,
  XCircle,
} from "lucide-react";

import DeliveryPartnerReviewForm from "@/components/admin/delivery-partner-review-form";

import {
  createAdminDeliveryPartnerDocumentUrls,
  type DeliveryPartnerDocumentKey,
  type DeliveryPartnerSignedDocuments,
} from "@/lib/delivery-partner/admin-document-urls";

import { getCurrentAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Review Delivery Partner",

  description:
    "Review an AthiMart Individual Delivery Partner application.",

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

interface DeliveryPartnerReviewPageProps {
  params: Promise<{
    applicantUserId: string;
  }>;
}

interface ApplicantAccountRow {
  id: string;

  email: string | null;
  full_name: string | null;
  phone: string | null;

  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;

  is_blocked: boolean;
  blocked_reason: string | null;

  created_at: string | null;
}

interface DeliveryPartnerApplicationRow {
  user_id: string;

  application_status: string;
  availability_status: string;

  identity_document_type: string | null;
  identity_document_number: string | null;

  identity_document_front_path: string | null;
  identity_document_back_path: string | null;

  identity_verification_status: string;
  identity_rejection_reason: string | null;

  date_of_birth: string | null;
  profile_photo_path: string | null;

  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;

  driving_licence_number: string | null;
  driving_licence_class: string[] | null;

  driving_licence_issue_date: string | null;
  driving_licence_expiry_date: string | null;

  driving_licence_front_path: string | null;
  driving_licence_back_path: string | null;

  driving_licence_verification_status: string;
  driving_licence_rejection_reason: string | null;

  police_clearance_path: string | null;
  background_check_status: string;
  training_status: string;

  requested_service_areas: string[];
  approved_service_areas: string[];

  approved_service_radius_km:
    | number
    | string;

  can_handle_cash_on_delivery: boolean;
  can_handle_food_delivery: boolean;
  can_handle_fragile_parcels: boolean;

  terms_accepted_at: string | null;
  privacy_consent_at: string | null;
  location_consent_at: string | null;

  application_submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;

  rejection_reason: string | null;
  administrator_notes: string | null;

  created_at: string;
  updated_at: string;
}

interface DeliveryPartnerVehicleRow {
  id: string;
  driver_user_id: string;

  vehicle_type: string;
  vehicle_status: string;

  is_primary: boolean;
  is_currently_available: boolean;

  registration_number: string | null;
  manufacturer: string | null;
  model: string | null;

  manufacture_year: number | null;
  colour: string | null;

  ownership_type: string | null;
  owner_name: string | null;

  vehicle_front_photo_path: string | null;
  vehicle_back_photo_path: string | null;
  vehicle_side_photo_path: string | null;

  registration_document_path: string | null;
  ownership_document_path: string | null;

  insurance_document_path: string | null;
  insurance_expiry_date: string | null;

  revenue_licence_document_path: string | null;
  revenue_licence_expiry_date: string | null;

  emission_certificate_path: string | null;
  emission_certificate_expiry_date: string | null;

  maximum_payload_kg:
    | number
    | string;

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

  maximum_parcel_count: number;
  passenger_capacity: number | null;

  has_closed_cargo_area: boolean;
  has_delivery_box: boolean;
  has_refrigeration: boolean;

  supports_food_delivery: boolean;
  supports_fragile_parcels: boolean;
  supports_frozen_items: boolean;
  supports_bulk_orders: boolean;
  supports_cash_on_delivery: boolean;

  reviewed_at: string | null;
  reviewed_by: string | null;

  rejection_reason: string | null;
  administrator_notes: string | null;

  created_at: string;
  updated_at: string;
}

interface InformationCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  helper?: string;
}

interface CapabilityCardProps {
  label: string;
  enabled: boolean;
  description: string;
}

interface DocumentDefinition {
  key: DeliveryPartnerDocumentKey;
  label: string;
  description: string;
  required: boolean;
  icon: LucideIcon;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const REVIEWABLE_APPLICATION_STATUSES = [
  "pending",
  "under_review",
];

const REVIEWABLE_VEHICLE_STATUSES = [
  "pending",
  "under_review",
];

const DOCUMENT_DEFINITIONS: DocumentDefinition[] = [
  {
    key: "profilePhoto",
    label: "Applicant Photograph",
    description:
      "Recent profile photograph submitted by the applicant.",
    required: true,
    icon: UserRound,
  },
  {
    key: "identityDocumentFront",
    label: "Identity Document Front",
    description:
      "Front or main information page of the identity document.",
    required: true,
    icon: IdCard,
  },
  {
    key: "identityDocumentBack",
    label: "Identity Document Back",
    description:
      "Reverse side or supporting identity-document page.",
    required: false,
    icon: IdCard,
  },
  {
    key: "drivingLicenceFront",
    label: "Driving Licence Front",
    description:
      "Front side of the applicant’s driving licence.",
    required: true,
    icon: FileCheck2,
  },
  {
    key: "drivingLicenceBack",
    label: "Driving Licence Back",
    description:
      "Reverse side of the applicant’s driving licence.",
    required: true,
    icon: FileCheck2,
  },
  {
    key: "policeClearance",
    label: "Police Clearance",
    description:
      "Optional police-clearance certificate supplied for review.",
    required: false,
    icon: ShieldCheck,
  },
  {
    key: "vehicleFrontPhoto",
    label: "Vehicle Front Photograph",
    description:
      "Front view of the submitted delivery vehicle.",
    required: true,
    icon: Truck,
  },
  {
    key: "vehicleBackPhoto",
    label: "Vehicle Rear Photograph",
    description:
      "Rear view of the submitted delivery vehicle.",
    required: false,
    icon: Truck,
  },
  {
    key: "vehicleSidePhoto",
    label: "Vehicle Side Photograph",
    description:
      "Side view showing vehicle condition and cargo area.",
    required: false,
    icon: Truck,
  },
  {
    key: "vehicleRegistration",
    label: "Vehicle Registration",
    description:
      "Official vehicle registration certificate or registration book.",
    required: true,
    icon: FileText,
  },
  {
    key: "vehicleOwnership",
    label: "Ownership or Authorisation",
    description:
      "Ownership evidence or authorisation to use the vehicle.",
    required: false,
    icon: FileText,
  },
  {
    key: "vehicleInsurance",
    label: "Vehicle Insurance",
    description:
      "Current vehicle insurance certificate or policy.",
    required: true,
    icon: ShieldCheck,
  },
  {
    key: "vehicleRevenueLicence",
    label: "Revenue Licence",
    description:
      "Current vehicle revenue licence where applicable.",
    required: false,
    icon: FileText,
  },
  {
    key: "vehicleEmissionCertificate",
    label: "Emission Certificate",
    description:
      "Current emission-test certificate where applicable.",
    required: false,
    icon: FileText,
  },
];

function formatStatus(
  value: string | null
): string {
  if (!value) {
    return "Not recorded";
  }

  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function formatDate(
  value: string | null
): string {
  if (!value) {
    return "Not recorded";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat(
    "en-LK",
    {
      dateStyle: "medium",
    }
  ).format(date);
}

function formatDateTime(
  value: string | null
): string {
  if (!value) {
    return "Not recorded";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat(
    "en-LK",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

function formatValue(
  value:
    | string
    | number
    | null
    | undefined,
  suffix = ""
): string {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "Not recorded";
  }

  return `${String(value)}${suffix}`;
}

function getApplicantName(
  applicant: ApplicantAccountRow | null
): string {
  const fullName =
    applicant?.full_name?.trim();

  if (fullName) {
    return fullName;
  }

  return (
    applicant?.email?.trim() ||
    "Unnamed Applicant"
  );
}

function getApplicantInitials(
  applicant: ApplicantAccountRow | null
): string {
  const name =
    getApplicantName(applicant);

  const words =
    name
      .split(/\s+/)
      .filter(Boolean);

  if (
    words.length === 0
  ) {
    return "DP";
  }

  const firstWord =
    words[0] ?? "D";

  if (
    words.length === 1
  ) {
    return firstWord
      .slice(0, 2)
      .toUpperCase();
  }

  const lastWord =
    words.at(-1) ??
    firstWord;

  return `${firstWord.charAt(
    0
  )}${lastWord.charAt(
    0
  )}`.toUpperCase();
}

function getAddress(
  applicant: ApplicantAccountRow | null
): string {
  if (!applicant) {
    return "Not recorded";
  }

  const addressParts = [
    applicant.address_line1,
    applicant.address_line2,
    applicant.city,
    applicant.state,
    applicant.postal_code,
    applicant.country,
  ]
    .map((value) =>
      value?.trim()
    )
    .filter(Boolean);

  return (
    addressParts.join(", ") ||
    "Not recorded"
  );
}

function getVehicleTitle(
  vehicle: DeliveryPartnerVehicleRow
): string {
  const title = [
    vehicle.manufacturer?.trim(),
    vehicle.model?.trim(),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    title ||
    formatStatus(
      vehicle.vehicle_type
    )
  );
}

function getDocumentFileType(
  storagePath: string
): string {
  const extension =
    storagePath
      .split(".")
      .at(-1)
      ?.trim()
      .toUpperCase();

  return extension ||
    "FILE";
}

function getStatusBadgeClasses(
  status: string
): string {
  if (
    status === "approved" ||
    status === "verified"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    status === "rejected" ||
    status === "failed"
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (
    status === "under_review"
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-blue-200 bg-blue-50 text-[var(--brand-blue)]";
}

function InformationCard({
  label,
  value,
  icon: Icon,
  helper,
}: Readonly<InformationCardProps>) {
  return (
    <article className="group min-h-[145px] rounded-[24px] border border-slate-200 bg-slate-50/70 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)]">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-white text-[var(--brand-blue)] shadow-[0_7px_20px_rgba(15,23,42,0.08)] transition-transform duration-300 group-hover:scale-110">
          <Icon
            aria-hidden="true"
            className="h-5 w-5"
            strokeWidth={1.8}
          />
        </span>

        <div className="min-w-0">
          <p className="font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.17em] text-slate-400">
            {label}
          </p>

          <p className="mt-3 break-words font-[var(--font-body)] text-sm font-semibold leading-6 text-slate-800">
            {value}
          </p>

          {helper && (
            <p className="mt-2 font-[var(--font-body)] text-[10px] leading-5 text-slate-500">
              {helper}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function CapabilityCard({
  label,
  enabled,
  description,
}: Readonly<CapabilityCardProps>) {
  return (
    <article
      className={`rounded-[22px] border p-5 transition-all duration-300 hover:-translate-y-0.5 ${
        enabled
          ? "border-emerald-200 bg-emerald-50/70 hover:shadow-[0_12px_28px_rgba(5,150,105,0.08)]"
          : "border-slate-200 bg-slate-50 hover:bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${
            enabled
              ? "bg-white text-emerald-700"
              : "bg-white text-slate-400"
          }`}
        >
          {enabled ? (
            <CheckCircle2
              aria-hidden="true"
              className="h-5 w-5"
              strokeWidth={1.8}
            />
          ) : (
            <XCircle
              aria-hidden="true"
              className="h-5 w-5"
              strokeWidth={1.8}
            />
          )}
        </span>

        <div>
          <p
            className={`font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.12em] ${
              enabled
                ? "text-emerald-800"
                : "text-slate-600"
            }`}
          >
            {label}
          </p>

          <p className="mt-2 font-[var(--font-body)] text-[10px] leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}

function DocumentCard({
  definition,
  signedDocuments,
}: Readonly<{
  definition: DocumentDefinition;
  signedDocuments: DeliveryPartnerSignedDocuments;
}>) {
  const document =
    signedDocuments[
      definition.key
    ];

  const Icon =
    definition.icon;

  return (
    <article
      className={`group flex min-h-[205px] flex-col rounded-[24px] border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.09)] ${
        document
          ? "border-slate-200 bg-white hover:border-blue-200"
          : definition.required
            ? "border-red-200 bg-red-50/60"
            : "border-slate-200 bg-slate-50/70"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] shadow-sm transition-transform duration-300 group-hover:scale-110 ${
            document
              ? "bg-blue-50 text-[var(--brand-blue)]"
              : definition.required
                ? "bg-white text-red-600"
                : "bg-white text-slate-400"
          }`}
        >
          <Icon
            aria-hidden="true"
            className="h-5 w-5"
            strokeWidth={1.8}
          />
        </span>

        <span
          className={`rounded-full border px-3 py-1.5 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.13em] ${
            document
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : definition.required
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-slate-200 bg-white text-slate-500"
          }`}
        >
          {document
            ? "Available"
            : definition.required
              ? "Missing"
              : "Not supplied"}
        </span>
      </div>

      <div className="mt-5 flex-1">
        <h3 className="font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.1em] text-slate-800">
          {definition.label}
        </h3>

        <p className="mt-2 font-[var(--font-body)] text-[10px] leading-5 text-slate-500">
          {definition.description}
        </p>

        {document && (
          <p className="mt-3 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-400">
            {getDocumentFileType(
              document.storagePath
            )} document
          </p>
        )}
      </div>

      {document ? (
        <a
          href={document.signedUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            color: "#ffffff",
          }}
          className="mt-5 flex min-h-12 items-center justify-between rounded-[16px] bg-[var(--brand-blue)] px-5 text-white shadow-[0_12px_28px_rgba(23,73,168,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] hover:shadow-[0_16px_34px_rgba(23,73,168,0.30)]"
        >
          <span
            style={{
              color: "#ffffff",
            }}
            className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.15em] text-white"
          >
            Open Secure Document
          </span>

          <ExternalLink
            aria-hidden="true"
            style={{
              color: "#ffffff",
              stroke: "#ffffff",
            }}
            className="h-4 w-4 text-white"
            strokeWidth={1.8}
          />
        </a>
      ) : (
        <div className="mt-5 flex min-h-12 items-center justify-center rounded-[16px] border border-dashed border-slate-300 bg-white px-4">
          <span className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            No Document Available
          </span>
        </div>
      )}
    </article>
  );
}

export default async function DeliveryPartnerReviewPage({
  params,
}: Readonly<DeliveryPartnerReviewPageProps>) {
  await getCurrentAdmin();

  const {
    applicantUserId,
  } = await params;

  if (
    !UUID_PATTERN.test(
      applicantUserId
    )
  ) {
    notFound();
  }

  const supabase =
    await createClient();

  const [
    accountResult,
    applicationResult,
    vehicleResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        `
          id,
          email,
          full_name,
          phone,
          address_line1,
          address_line2,
          city,
          state,
          postal_code,
          country,
          is_blocked,
          blocked_reason,
          created_at
        `
      )
      .eq(
        "id",
        applicantUserId
      )
      .maybeSingle(),

    supabase
      .from(
        "delivery_partner_profiles"
      )
      .select(
        `
          user_id,
          application_status,
          availability_status,
          identity_document_type,
          identity_document_number,
          identity_document_front_path,
          identity_document_back_path,
          identity_verification_status,
          identity_rejection_reason,
          date_of_birth,
          profile_photo_path,
          emergency_contact_name,
          emergency_contact_phone,
          emergency_contact_relationship,
          driving_licence_number,
          driving_licence_class,
          driving_licence_issue_date,
          driving_licence_expiry_date,
          driving_licence_front_path,
          driving_licence_back_path,
          driving_licence_verification_status,
          driving_licence_rejection_reason,
          police_clearance_path,
          background_check_status,
          training_status,
          requested_service_areas,
          approved_service_areas,
          approved_service_radius_km,
          can_handle_cash_on_delivery,
          can_handle_food_delivery,
          can_handle_fragile_parcels,
          terms_accepted_at,
          privacy_consent_at,
          location_consent_at,
          application_submitted_at,
          reviewed_at,
          reviewed_by,
          rejection_reason,
          administrator_notes,
          created_at,
          updated_at
        `
      )
      .eq(
        "user_id",
        applicantUserId
      )
      .in(
        "application_status",
        REVIEWABLE_APPLICATION_STATUSES
      )
      .maybeSingle(),

    supabase
      .from(
        "delivery_partner_vehicles"
      )
      .select(
        `
          id,
          driver_user_id,
          vehicle_type,
          vehicle_status,
          is_primary,
          is_currently_available,
          registration_number,
          manufacturer,
          model,
          manufacture_year,
          colour,
          ownership_type,
          owner_name,
          vehicle_front_photo_path,
          vehicle_back_photo_path,
          vehicle_side_photo_path,
          registration_document_path,
          ownership_document_path,
          insurance_document_path,
          insurance_expiry_date,
          revenue_licence_document_path,
          revenue_licence_expiry_date,
          emission_certificate_path,
          emission_certificate_expiry_date,
          maximum_payload_kg,
          cargo_length_cm,
          cargo_width_cm,
          cargo_height_cm,
          cargo_volume_litres,
          maximum_parcel_count,
          passenger_capacity,
          has_closed_cargo_area,
          has_delivery_box,
          has_refrigeration,
          supports_food_delivery,
          supports_fragile_parcels,
          supports_frozen_items,
          supports_bulk_orders,
          supports_cash_on_delivery,
          reviewed_at,
          reviewed_by,
          rejection_reason,
          administrator_notes,
          created_at,
          updated_at
        `
      )
      .eq(
        "driver_user_id",
        applicantUserId
      )
      .in(
        "vehicle_status",
        REVIEWABLE_VEHICLE_STATUSES
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
      .maybeSingle(),
  ]);

  if (
    accountResult.error
  ) {
    console.error(
      "Loading delivery-partner applicant account failed:",
      {
        applicantUserId,
        code:
          accountResult.error.code,
        message:
          accountResult.error.message,
        details:
          accountResult.error.details,
        hint:
          accountResult.error.hint,
      }
    );
  }

  if (
    applicationResult.error
  ) {
    console.error(
      "Loading delivery-partner application failed:",
      {
        applicantUserId,
        code:
          applicationResult.error.code,
        message:
          applicationResult.error.message,
        details:
          applicationResult.error.details,
        hint:
          applicationResult.error.hint,
      }
    );
  }

  if (
    vehicleResult.error
  ) {
    console.error(
      "Loading delivery-partner vehicle failed:",
      {
        applicantUserId,
        code:
          vehicleResult.error.code,
        message:
          vehicleResult.error.message,
        details:
          vehicleResult.error.details,
        hint:
          vehicleResult.error.hint,
      }
    );
  }

  if (
    applicationResult.error ||
    !applicationResult.data
  ) {
    notFound();
  }

  const applicant =
    accountResult.data as
      | ApplicantAccountRow
      | null;

  const application =
    applicationResult.data as
      DeliveryPartnerApplicationRow;

  const vehicle =
    vehicleResult.data as
      | DeliveryPartnerVehicleRow
      | null;

  const signedDocuments =
    await createAdminDeliveryPartnerDocumentUrls(
      {
        profilePhoto:
          application.profile_photo_path,

        identityDocumentFront:
          application.identity_document_front_path,

        identityDocumentBack:
          application.identity_document_back_path,

        drivingLicenceFront:
          application.driving_licence_front_path,

        drivingLicenceBack:
          application.driving_licence_back_path,

        policeClearance:
          application.police_clearance_path,

        vehicleFrontPhoto:
          vehicle?.vehicle_front_photo_path,

        vehicleBackPhoto:
          vehicle?.vehicle_back_photo_path,

        vehicleSidePhoto:
          vehicle?.vehicle_side_photo_path,

        vehicleRegistration:
          vehicle?.registration_document_path,

        vehicleOwnership:
          vehicle?.ownership_document_path,

        vehicleInsurance:
          vehicle?.insurance_document_path,

        vehicleRevenueLicence:
          vehicle?.revenue_licence_document_path,

        vehicleEmissionCertificate:
          vehicle?.emission_certificate_path,
      }
    );

  const applicantName =
    getApplicantName(
      applicant
    );

  const profilePhotoUrl =
    signedDocuments
      .profilePhoto
      ?.signedUrl;

  const requestedServiceAreas =
    application.requested_service_areas ??
    [];

  return (
    <>
      <style>{`
        @keyframes athimartReviewFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .athimart-review-enter {
          animation:
            athimartReviewFadeUp
            560ms
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            )
            both;
        }

        @media (
          prefers-reduced-motion:
          reduce
        ) {
          .athimart-review-enter {
            animation: none;
          }
        }
      `}</style>

      <div className="mx-auto w-full max-w-[1480px] space-y-10 pb-14">
        {/* Back navigation */}
        <div className="athimart-review-enter">
          <Link
            href="/admin/delivery-partners"
            className="inline-flex min-h-12 items-center gap-3 rounded-[16px] border border-slate-200 bg-white px-5 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] hover:shadow-md"
          >
            <ArrowLeft
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={1.8}
            />

            Delivery Partner Queue
          </Link>
        </div>

        {/* Modern applicant hero */}
        <section className="athimart-review-enter relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#102f78_0%,#1749a8_58%,#2566d7_100%)] px-7 py-9 text-white shadow-[0_24px_70px_rgba(23,73,168,0.22)] sm:px-10 sm:py-11 lg:px-12">
          <div
            aria-hidden="true"
            className="absolute -right-28 -top-36 h-[410px] w-[410px] rounded-full border border-white/10 bg-white/[0.055]"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-36 left-1/3 h-80 w-80 rounded-full bg-[var(--brand-orange)]/15 blur-3xl"
          />

          <div className="relative grid gap-9 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-stretch">
            <div className="flex flex-col justify-center">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt={`${applicantName} profile`}
                    className="h-24 w-24 shrink-0 rounded-[28px] border-4 border-white/20 object-cover shadow-[0_18px_40px_rgba(7,26,70,0.30)]"
                  />
                ) : (
                  <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] border border-white/15 bg-white/10 font-[var(--font-body)] text-2xl font-bold text-white shadow-[0_18px_40px_rgba(7,26,70,0.25)]">
                    {getApplicantInitials(
                      applicant
                    )}
                  </span>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.16em] text-white/80">
                      <Clock3
                        aria-hidden="true"
                        className="h-3.5 w-3.5"
                        strokeWidth={1.8}
                      />

                      Awaiting Administrator Review
                    </span>

                    {applicant?.is_blocked && (
                      <span className="rounded-full border border-red-300/50 bg-red-500/20 px-4 py-2 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.16em] text-white">
                        Account Blocked
                      </span>
                    )}
                  </div>

                  <h1 className="mt-5 font-[var(--font-display)] text-4xl font-light uppercase leading-tight tracking-[0.025em] sm:text-5xl">
                    {applicantName}
                  </h1>

                  <div className="mt-4 flex flex-col gap-2 font-[var(--font-body)] text-xs text-white/65 sm:flex-row sm:flex-wrap sm:gap-x-6">
                    <span>
                      {applicant?.email ??
                        "Email unavailable"}
                    </span>

                    <span>
                      {applicant?.phone ??
                        "Phone unavailable"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex min-h-[230px] flex-col justify-between rounded-[28px] border border-white/15 bg-white/10 p-7 backdrop-blur-md">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-[17px] bg-white text-[var(--brand-blue)] shadow-lg">
                  <BadgeCheck
                    aria-hidden="true"
                    className="h-6 w-6"
                    strokeWidth={1.8}
                  />
                </span>

                <span
                  className={`rounded-full border px-4 py-2 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.15em] ${getStatusBadgeClasses(
                    application.application_status
                  )}`}
                >
                  {formatStatus(
                    application.application_status
                  )}
                </span>
              </div>

              <div className="mt-8">
                <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.17em] text-white/50">
                  Submitted
                </p>

                <p className="mt-3 font-[var(--font-display)] text-2xl font-light uppercase tracking-[0.035em]">
                  {formatDateTime(
                    application.application_submitted_at
                  )}
                </p>

                <p className="mt-3 font-[var(--font-body)] text-[10px] leading-5 text-white/55">
                  Availability remains{" "}
                  {formatStatus(
                    application.availability_status
                  )}.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Blocked account warning */}
        {applicant?.is_blocked && (
          <section className="athimart-review-enter rounded-[26px] border border-red-200 bg-red-50 p-7 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-white text-red-700 shadow-sm">
                <LockKeyhole
                  aria-hidden="true"
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />
              </span>

              <div>
                <h2 className="font-[var(--font-body)] text-sm font-semibold text-red-800">
                  This AthiMart account is blocked
                </h2>

                <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-red-700/75">
                  {applicant.blocked_reason?.trim() ||
                    "No blocking reason was recorded."}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Applicant information */}
        <section className="athimart-review-enter rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-orange-dark)]">
                Applicant Profile
              </p>

              <h2 className="mt-3 font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.035em] text-slate-900 sm:text-4xl">
                Personal Information
              </h2>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              <UserRound
                aria-hidden="true"
                className="h-4 w-4"
                strokeWidth={1.8}
              />

              Account since{" "}
              {formatDate(
                applicant?.created_at ??
                  null
              )}
            </span>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <InformationCard
              label="Full Name"
              value={applicantName}
              icon={UserRound}
            />

            <InformationCard
              label="Email Address"
              value={
                applicant?.email ??
                "Not recorded"
              }
              icon={Mail}
            />

            <InformationCard
              label="Phone Number"
              value={
                applicant?.phone ??
                "Not recorded"
              }
              icon={Phone}
            />

            <InformationCard
              label="Date of Birth"
              value={formatDate(
                application.date_of_birth
              )}
              icon={CalendarDays}
            />

            <InformationCard
              label="Residential Address"
              value={getAddress(
                applicant
              )}
              icon={MapPin}
            />

            <InformationCard
              label="Application Availability"
              value={formatStatus(
                application.availability_status
              )}
              icon={Clock3}
              helper="Drivers remain offline until approved and activated."
            />
          </div>
        </section>

        {/* Identity and emergency contact */}
        <section className="grid gap-7 xl:grid-cols-2">
          <article className="athimart-review-enter rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-8">
            <div className="flex items-start justify-between gap-5 border-b border-slate-200 pb-6">
              <div>
                <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-orange-dark)]">
                  Identity Verification
                </p>

                <h2 className="mt-3 font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.035em] text-slate-900">
                  Identity Details
                </h2>
              </div>

              <span
                className={`rounded-full border px-4 py-2 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] ${getStatusBadgeClasses(
                  application.identity_verification_status
                )}`}
              >
                {formatStatus(
                  application.identity_verification_status
                )}
              </span>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <InformationCard
                label="Document Type"
                value={formatStatus(
                  application.identity_document_type
                )}
                icon={IdCard}
              />

              <InformationCard
                label="Document Number"
                value={
                  application.identity_document_number ??
                  "Not recorded"
                }
                icon={FileText}
              />
            </div>
          </article>

          <article className="athimart-review-enter rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-8">
            <div className="border-b border-slate-200 pb-6">
              <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-orange-dark)]">
                Safety Contact
              </p>

              <h2 className="mt-3 font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.035em] text-slate-900">
                Emergency Contact
              </h2>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <InformationCard
                label="Contact Name"
                value={
                  application.emergency_contact_name ??
                  "Not recorded"
                }
                icon={UserRound}
              />

              <InformationCard
                label="Phone Number"
                value={
                  application.emergency_contact_phone ??
                  "Not recorded"
                }
                icon={Phone}
              />

              <div className="sm:col-span-2">
                <InformationCard
                  label="Relationship"
                  value={
                    application.emergency_contact_relationship ??
                    "Not recorded"
                  }
                  icon={UserRound}
                />
              </div>
            </div>
          </article>
        </section>

        {/* Driving licence */}
        <section className="athimart-review-enter rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-orange-dark)]">
                Driving Eligibility
              </p>

              <h2 className="mt-3 font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.035em] text-slate-900 sm:text-4xl">
                Driving Licence
              </h2>
            </div>

            <span
              className={`rounded-full border px-4 py-2 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] ${getStatusBadgeClasses(
                application.driving_licence_verification_status
              )}`}
            >
              {formatStatus(
                application.driving_licence_verification_status
              )}
            </span>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <InformationCard
              label="Licence Number"
              value={
                application.driving_licence_number ??
                "Not recorded"
              }
              icon={FileCheck2}
            />

            <InformationCard
              label="Licence Classes"
              value={
                application.driving_licence_class?.join(
                  ", "
                ) ||
                "Not recorded"
              }
              icon={BadgeCheck}
            />

            <InformationCard
              label="Issue Date"
              value={formatDate(
                application.driving_licence_issue_date
              )}
              icon={CalendarDays}
            />

            <InformationCard
              label="Expiry Date"
              value={formatDate(
                application.driving_licence_expiry_date
              )}
              icon={CalendarDays}
            />
          </div>
        </section>

        {/* Service areas and consents */}
        <section className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_420px]">
          <article className="athimart-review-enter rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-8">
            <div className="border-b border-slate-200 pb-6">
              <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-orange-dark)]">
                Operating Locations
              </p>

              <h2 className="mt-3 font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.035em] text-slate-900">
                Requested Service Areas
              </h2>
            </div>

            <div className="mt-7 flex min-h-[150px] flex-wrap content-start gap-3 rounded-[24px] border border-slate-200 bg-slate-50/70 p-6">
              {requestedServiceAreas.length >
              0 ? (
                requestedServiceAreas.map(
                  (area) => (
                    <span
                      key={area}
                      className="inline-flex h-fit items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2.5 font-[var(--font-body)] text-[10px] font-semibold text-orange-700 shadow-sm"
                    >
                      <MapPin
                        aria-hidden="true"
                        className="h-3.5 w-3.5"
                        strokeWidth={1.8}
                      />

                      {area}
                    </span>
                  )
                )
              ) : (
                <p className="font-[var(--font-body)] text-xs text-slate-500">
                  No requested service areas were recorded.
                </p>
              )}
            </div>
          </article>

          <article className="athimart-review-enter rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-8">
            <div className="border-b border-slate-200 pb-6">
              <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-orange-dark)]">
                Applicant Declarations
              </p>

              <h2 className="mt-3 font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.035em] text-slate-900">
                Consents
              </h2>
            </div>

            <div className="mt-7 space-y-4">
              {[
                {
                  label: "Delivery Partner Terms",
                  value:
                    application.terms_accepted_at,
                },
                {
                  label: "Privacy Processing",
                  value:
                    application.privacy_consent_at,
                },
                {
                  label: "Location Sharing",
                  value:
                    application.location_consent_at,
                },
              ].map((consent) => (
                <div
                  key={consent.label}
                  className="flex items-center justify-between gap-4 rounded-[18px] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      aria-hidden="true"
                      className={`h-5 w-5 ${
                        consent.value
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                      strokeWidth={1.8}
                    />

                    <span className="font-[var(--font-body)] text-[10px] font-semibold text-slate-700">
                      {consent.label}
                    </span>
                  </div>

                  <span className="font-[var(--font-body)] text-[9px] text-slate-500">
                    {consent.value
                      ? formatDate(
                          consent.value
                        )
                      : "Missing"}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* Vehicle */}
        {vehicle ? (
          <section className="athimart-review-enter rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-8 lg:p-10">
            <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end">
              <div className="flex items-start gap-5">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-blue-50 text-[var(--brand-blue)] shadow-[0_10px_30px_rgba(23,73,168,0.12)]">
                  <Truck
                    aria-hidden="true"
                    className="h-7 w-7"
                    strokeWidth={1.7}
                  />
                </span>

                <div>
                  <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-orange-dark)]">
                    Submitted Primary Vehicle
                  </p>

                  <h2 className="mt-3 font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.035em] text-slate-900 sm:text-4xl">
                    {getVehicleTitle(
                      vehicle
                    )}
                  </h2>

                  <p className="mt-2 font-[var(--font-body)] text-xs text-slate-500">
                    {vehicle.registration_number ??
                      "Registration not recorded"}
                  </p>
                </div>
              </div>

              <span
                className={`w-fit rounded-full border px-4 py-2 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] ${getStatusBadgeClasses(
                  vehicle.vehicle_status
                )}`}
              >
                {formatStatus(
                  vehicle.vehicle_status
                )}
              </span>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <InformationCard
                label="Vehicle Type"
                value={formatStatus(
                  vehicle.vehicle_type
                )}
                icon={Truck}
              />

              <InformationCard
                label="Manufacture Year"
                value={formatValue(
                  vehicle.manufacture_year
                )}
                icon={CalendarDays}
              />

              <InformationCard
                label="Colour"
                value={
                  vehicle.colour ??
                  "Not recorded"
                }
                icon={Box}
              />

              <InformationCard
                label="Ownership"
                value={formatStatus(
                  vehicle.ownership_type
                )}
                icon={UserRound}
                helper={
                  vehicle.owner_name
                    ? `Owner: ${vehicle.owner_name}`
                    : undefined
                }
              />

              <InformationCard
                label="Maximum Payload"
                value={formatValue(
                  vehicle.maximum_payload_kg,
                  " kg"
                )}
                icon={Weight}
              />

              <InformationCard
                label="Maximum Parcels"
                value={formatValue(
                  vehicle.maximum_parcel_count
                )}
                icon={Package}
              />

              <InformationCard
                label="Cargo Volume"
                value={formatValue(
                  vehicle.cargo_volume_litres,
                  " litres"
                )}
                icon={Gauge}
              />

              <InformationCard
                label="Cargo Dimensions"
                value={`${formatValue(
                  vehicle.cargo_length_cm
                )} × ${formatValue(
                  vehicle.cargo_width_cm
                )} × ${formatValue(
                  vehicle.cargo_height_cm
                )} cm`}
                icon={Box}
              />
            </div>

            <div className="mt-10">
              <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Vehicle Equipment and Capabilities
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <CapabilityCard
                  label="Closed Cargo Area"
                  enabled={
                    vehicle.has_closed_cargo_area
                  }
                  description="Cargo is protected inside an enclosed storage area."
                />

                <CapabilityCard
                  label="Delivery Box"
                  enabled={
                    vehicle.has_delivery_box
                  }
                  description="Vehicle includes a dedicated parcel-delivery box."
                />

                <CapabilityCard
                  label="Refrigeration"
                  enabled={
                    vehicle.has_refrigeration
                  }
                  description="Vehicle supports temperature-controlled delivery."
                />

                <CapabilityCard
                  label="Food Delivery"
                  enabled={
                    vehicle.supports_food_delivery
                  }
                  description="Vehicle is declared suitable for food-delivery assignments."
                />

                <CapabilityCard
                  label="Fragile Parcels"
                  enabled={
                    vehicle.supports_fragile_parcels
                  }
                  description="Vehicle can support fragile-parcel handling."
                />

                <CapabilityCard
                  label="Frozen Items"
                  enabled={
                    vehicle.supports_frozen_items
                  }
                  description="Vehicle can support suitable frozen-item deliveries."
                />

                <CapabilityCard
                  label="Bulk Orders"
                  enabled={
                    vehicle.supports_bulk_orders
                  }
                  description="Vehicle can support larger or multiple-parcel assignments."
                />

                <CapabilityCard
                  label="Cash on Delivery"
                  enabled={
                    vehicle.supports_cash_on_delivery
                  }
                  description="Driver has requested Cash on Delivery assignments."
                />
              </div>
            </div>
          </section>
        ) : (
          <section className="athimart-review-enter rounded-[28px] border border-red-200 bg-red-50 p-7">
            <div className="flex items-start gap-4">
              <XCircle
                aria-hidden="true"
                className="mt-0.5 h-6 w-6 shrink-0 text-red-700"
                strokeWidth={1.8}
              />

              <div>
                <h2 className="font-[var(--font-body)] text-sm font-semibold text-red-800">
                  Submitted vehicle not found
                </h2>

                <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-red-700/75">
                  This application cannot be approved until its submitted vehicle record is available.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Secure documents */}
        <section className="athimart-review-enter rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-orange-dark)]">
                Private Verification Files
              </p>

              <h2 className="mt-3 font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.035em] text-slate-900 sm:text-4xl">
                Secure Documents
              </h2>

              <p className="mt-3 max-w-2xl font-[var(--font-body)] text-xs leading-6 text-slate-500">
                Document links are temporary and should be used only for authorised application review.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
              <LockKeyhole
                aria-hidden="true"
                className="h-4 w-4"
                strokeWidth={1.8}
              />

              Private Access
            </span>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {DOCUMENT_DEFINITIONS.map(
              (definition) => (
                <DocumentCard
                  key={
                    definition.key
                  }
                  definition={
                    definition
                  }
                  signedDocuments={
                    signedDocuments
                  }
                />
              )
            )}
          </div>
        </section>

        {/* Review form */}
        {vehicle && (
          <section className="athimart-review-enter rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.07)] sm:p-8 lg:p-10">
            <div className="mb-9 border-b border-slate-200 pb-7">
              <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-orange-dark)]">
                Final Administrator Action
              </p>

              <h2 className="mt-3 font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.035em] text-slate-900 sm:text-4xl">
                Review Decision
              </h2>

              <p className="mt-3 max-w-3xl font-[var(--font-body)] text-xs leading-6 text-slate-500">
                Review all information and private documents before approving or rejecting this application.
              </p>
            </div>

            <DeliveryPartnerReviewForm
              applicantUserId={
                applicantUserId
              }
              requestedServiceAreas={
                requestedServiceAreas
              }
              defaultCashOnDelivery={
                vehicle.supports_cash_on_delivery
              }
              defaultFoodDelivery={
                vehicle.supports_food_delivery
              }
              defaultFragileParcels={
                vehicle.supports_fragile_parcels
              }
            />
          </section>
        )}
      </div>
    </>
  );
}
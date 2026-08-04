"use client";

import type {
  FormEvent,
} from "react";
import {
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  FileText,
  IdCard,
  LoaderCircle,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  saveDeliveryPartnerPersonalDetails,
  type DeliveryPartnerPersonalDetailsSummary,
  type IdentityDocumentType,
} from "@/app/(store)/delivery-partner/register/actions";

export interface DeliveryPartnerPersonalDetailsInitialValues {
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;

  identityDocumentType?: IdentityDocumentType;
  identityDocumentNumber?: string;

  drivingLicenceNumber?: string;
  drivingLicenceClasses?: string[];

  drivingLicenceIssueDate?: string;
  drivingLicenceExpiryDate?: string;

  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;

  requestedServiceAreas?: string[];

  termsAccepted?: boolean;
  privacyConsent?: boolean;
  locationConsent?: boolean;
}

interface PersonalDetailsFormProps {
  initialValues?: DeliveryPartnerPersonalDetailsInitialValues;
}

const fieldClassName =
  "mt-2 min-h-12 w-full border border-[var(--border)] bg-white px-4 font-[var(--font-body)] text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--brand-blue)] focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0";

const textareaClassName =
  "mt-2 min-h-28 w-full resize-y border border-[var(--border)] bg-white px-4 py-3 font-[var(--font-body)] text-sm leading-6 text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--brand-blue)] focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0";

function getFormText(
  formData: FormData,
  fieldName: string
): string {
  const value =
    formData.get(fieldName);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function splitTextList(
  value: string
): string[] {
  const uniqueValues =
    new Set<string>();

  value
    .split(/[\n,]+/)
    .map((item) =>
      item.trim()
    )
    .filter(Boolean)
    .forEach((item) => {
      uniqueValues.add(item);
    });

  return Array.from(
    uniqueValues
  );
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

function formatUpdatedDate(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-LK",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

export default function PersonalDetailsForm({
  initialValues = {},
}: Readonly<PersonalDetailsFormProps>) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    savedApplication,
    setSavedApplication,
  ] =
    useState<DeliveryPartnerPersonalDetailsSummary | null>(
      null
    );

  const maximumDateOfBirth =
    new Date()
      .toISOString()
      .slice(0, 10);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    setErrorMessage("");
    setSavedApplication(null);

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const drivingLicenceClasses =
      splitTextList(
        getFormText(
          formData,
          "drivingLicenceClasses"
        )
      );

    const requestedServiceAreas =
      splitTextList(
        getFormText(
          formData,
          "requestedServiceAreas"
        )
      );

    startTransition(async () => {
      const result =
        await saveDeliveryPartnerPersonalDetails({
          fullName:
            getFormText(
              formData,
              "fullName"
            ),

          phone:
            getFormText(
              formData,
              "phone"
            ),

          dateOfBirth:
            getFormText(
              formData,
              "dateOfBirth"
            ),

          identityDocumentType:
            getFormText(
              formData,
              "identityDocumentType"
            ) as IdentityDocumentType,

          identityDocumentNumber:
            getFormText(
              formData,
              "identityDocumentNumber"
            ),

          drivingLicenceNumber:
            getFormText(
              formData,
              "drivingLicenceNumber"
            ),

          drivingLicenceClasses,

          drivingLicenceIssueDate:
            getFormText(
              formData,
              "drivingLicenceIssueDate"
            ),

          drivingLicenceExpiryDate:
            getFormText(
              formData,
              "drivingLicenceExpiryDate"
            ),

          emergencyContactName:
            getFormText(
              formData,
              "emergencyContactName"
            ),

          emergencyContactPhone:
            getFormText(
              formData,
              "emergencyContactPhone"
            ),

          emergencyContactRelationship:
            getFormText(
              formData,
              "emergencyContactRelationship"
            ),

          requestedServiceAreas,

          termsAccepted:
            formData.get(
              "termsAccepted"
            ) === "on",

          privacyConsent:
            formData.get(
              "privacyConsent"
            ) === "on",

          locationConsent:
            formData.get(
              "locationConsent"
            ) === "on",
        });

      if (!result.success) {
        if (
          result.code ===
          "UNAUTHENTICATED"
        ) {
          window.location.assign(
            `/auth/login?next=${encodeURIComponent(
              "/delivery-partner/register"
            )}`
          );

          return;
        }

        setErrorMessage(
          result.message
        );

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      setSavedApplication(
        result.application
      );

      router.refresh();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={isPending}
      className="space-y-8"
    >
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-3 border-l-4 border-[var(--sale)] bg-red-50 p-4 text-[var(--sale)]"
        >
          <AlertCircle
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0"
            strokeWidth={1.8}
          />

          <p className="font-[var(--font-body)] text-sm leading-6">
            {errorMessage}
          </p>
        </div>
      )}

      {savedApplication && (
        <div
          role="status"
          aria-live="polite"
          className="border-l-4 border-[var(--success)] bg-green-50 p-5"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 h-6 w-6 shrink-0 text-[var(--success)]"
              strokeWidth={1.8}
            />

            <div>
              <p className="font-[var(--font-body)] text-sm font-semibold text-[var(--success)]">
                Personal details saved successfully
              </p>

              <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                Application status:{" "}
                {formatStatus(
                  savedApplication.applicationStatus
                )}
                . Last updated:{" "}
                {formatUpdatedDate(
                  savedApplication.updatedAt
                )}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Personal information */}
      <section className="border border-[var(--border)] bg-white p-5 sm:p-8">
        <div className="flex items-start gap-4 border-b border-[var(--border)] pb-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
            <UserRound
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.7}
            />
          </span>

          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Registration section 01
            </p>

            <h2 className="athimart-title-large mt-2">
              Personal Information
            </h2>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              Enter your legal name, active phone
              number and date of birth.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="athimart-label text-[var(--text-muted)]">
              Full legal name *
            </span>

            <div className="relative">
              <UserRound
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 mt-1 h-5 w-5 -translate-y-1/2 text-[var(--brand-blue)]"
                strokeWidth={1.7}
              />

              <input
                type="text"
                name="fullName"
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                defaultValue={
                  initialValues.fullName ?? ""
                }
                placeholder="Enter your full legal name"
                className={`${fieldClassName} pl-12`}
              />
            </div>
          </label>

          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Phone number *
            </span>

            <div className="relative">
              <Phone
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 mt-1 h-5 w-5 -translate-y-1/2 text-[var(--brand-blue)]"
                strokeWidth={1.7}
              />

              <input
                type="tel"
                name="phone"
                required
                minLength={7}
                maxLength={30}
                autoComplete="tel"
                inputMode="tel"
                defaultValue={
                  initialValues.phone ?? ""
                }
                placeholder="+94 77 123 4567"
                className={`${fieldClassName} pl-12`}
              />
            </div>
          </label>

          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Date of birth *
            </span>

            <div className="relative">
              <CalendarDays
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 mt-1 h-5 w-5 -translate-y-1/2 text-[var(--brand-blue)]"
                strokeWidth={1.7}
              />

              <input
                type="date"
                name="dateOfBirth"
                required
                max={maximumDateOfBirth}
                defaultValue={
                  initialValues.dateOfBirth ?? ""
                }
                className={`${fieldClassName} pl-12`}
              />
            </div>
          </label>
        </div>
      </section>

      {/* Identity information */}
      <section className="border border-[var(--border)] bg-white p-5 sm:p-8">
        <div className="flex items-start gap-4 border-b border-[var(--border)] pb-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--brand-orange-soft)] text-[var(--brand-orange-dark)]">
            <IdCard
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.7}
            />
          </span>

          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Registration section 02
            </p>

            <h2 className="athimart-title-large mt-2">
              Identity Information
            </h2>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              Enter the details exactly as shown on
              your official identity document.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Identity document type *
            </span>

            <select
              name="identityDocumentType"
              required
              defaultValue={
                initialValues.identityDocumentType ??
                ""
              }
              className={fieldClassName}
            >
              <option value="" disabled>
                Select document type
              </option>

              <option value="national_identity_card">
                National Identity Card
              </option>

              <option value="passport">
                Passport
              </option>

              <option value="other">
                Other approved document
              </option>
            </select>
          </label>

          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Document number *
            </span>

            <input
              type="text"
              name="identityDocumentNumber"
              required
              minLength={4}
              maxLength={50}
              autoComplete="off"
              defaultValue={
                initialValues.identityDocumentNumber ??
                ""
              }
              placeholder="Enter the document number"
              className={fieldClassName}
            />
          </label>
        </div>

        <div className="mt-5 flex items-start gap-3 bg-[var(--surface-soft)] p-4">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-blue)]"
            strokeWidth={1.8}
          />

          <p className="font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
            Document images will be uploaded
            separately to AthiMart’s private,
            access-controlled document storage.
          </p>
        </div>
      </section>

      {/* Driving licence */}
      <section className="border border-[var(--border)] bg-white p-5 sm:p-8">
        <div className="flex items-start gap-4 border-b border-[var(--border)] pb-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
            <FileText
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.7}
            />
          </span>

          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Registration section 03
            </p>

            <h2 className="athimart-title-large mt-2">
              Driving Licence
            </h2>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              Provide the licence number, permitted
              classes and validity dates.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Driving licence number *
            </span>

            <input
              type="text"
              name="drivingLicenceNumber"
              required
              minLength={3}
              maxLength={50}
              autoComplete="off"
              defaultValue={
                initialValues.drivingLicenceNumber ??
                ""
              }
              placeholder="Enter licence number"
              className={fieldClassName}
            />
          </label>

          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Licence classes *
            </span>

            <input
              type="text"
              name="drivingLicenceClasses"
              required
              defaultValue={
                initialValues.drivingLicenceClasses?.join(
                  ", "
                ) ?? ""
              }
              placeholder="Example: A, A1, B"
              className={fieldClassName}
            />

            <span className="mt-2 block font-[var(--font-body)] text-[10px] leading-5 text-[var(--text-muted)]">
              Separate multiple classes using commas.
            </span>
          </label>

          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Licence issue date
            </span>

            <input
              type="date"
              name="drivingLicenceIssueDate"
              max={maximumDateOfBirth}
              defaultValue={
                initialValues.drivingLicenceIssueDate ??
                ""
              }
              className={fieldClassName}
            />
          </label>

          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Licence expiry date
            </span>

            <input
              type="date"
              name="drivingLicenceExpiryDate"
              defaultValue={
                initialValues.drivingLicenceExpiryDate ??
                ""
              }
              className={fieldClassName}
            />
          </label>
        </div>
      </section>

      {/* Emergency contact */}
      <section className="border border-[var(--border)] bg-white p-5 sm:p-8">
        <div className="flex items-start gap-4 border-b border-[var(--border)] pb-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-red-50 text-[var(--sale)]">
            <Phone
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.7}
            />
          </span>

          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Registration section 04
            </p>

            <h2 className="athimart-title-large mt-2">
              Emergency Contact
            </h2>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              Provide a trusted person AthiMart may
              contact during an operational emergency.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="athimart-label text-[var(--text-muted)]">
              Emergency contact name *
            </span>

            <input
              type="text"
              name="emergencyContactName"
              required
              minLength={2}
              maxLength={120}
              defaultValue={
                initialValues.emergencyContactName ??
                ""
              }
              placeholder="Enter emergency contact name"
              className={fieldClassName}
            />
          </label>

          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Emergency contact phone *
            </span>

            <input
              type="tel"
              name="emergencyContactPhone"
              required
              minLength={7}
              maxLength={30}
              inputMode="tel"
              defaultValue={
                initialValues.emergencyContactPhone ??
                ""
              }
              placeholder="+94 77 123 4567"
              className={fieldClassName}
            />
          </label>

          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Relationship *
            </span>

            <input
              type="text"
              name="emergencyContactRelationship"
              required
              minLength={2}
              maxLength={80}
              defaultValue={
                initialValues.emergencyContactRelationship ??
                ""
              }
              placeholder="Example: Parent, spouse, sibling"
              className={fieldClassName}
            />
          </label>
        </div>
      </section>

      {/* Service areas */}
      <section className="border border-[var(--border)] bg-white p-5 sm:p-8">
        <div className="flex items-start gap-4 border-b border-[var(--border)] pb-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
            <MapPin
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.7}
            />
          </span>

          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Registration section 05
            </p>

            <h2 className="athimart-title-large mt-2">
              Requested Service Areas
            </h2>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              Enter the towns, villages or local areas
              where you are prepared to complete
              deliveries.
            </p>
          </div>
        </div>

        <label className="mt-7 block">
          <span className="athimart-label text-[var(--text-muted)]">
            Requested locations *
          </span>

          <textarea
            name="requestedServiceAreas"
            required
            defaultValue={
              initialValues.requestedServiceAreas?.join(
                "\n"
              ) ?? ""
            }
            placeholder={`Example:
Kegalle
Rambukkana
Mawanella`}
            className={textareaClassName}
          />

          <span className="mt-2 block font-[var(--font-body)] text-[10px] leading-5 text-[var(--text-muted)]">
            Enter one location per line or separate
            locations using commas. Final approved
            service areas will be determined by
            AthiMart.
          </span>
        </label>
      </section>

      {/* Consent */}
      <section className="border border-[var(--border)] bg-white p-5 sm:p-8">
        <div className="flex items-start gap-4 border-b border-[var(--border)] pb-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-green-50 text-[var(--success)]">
            <ShieldCheck
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.7}
            />
          </span>

          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Registration section 06
            </p>

            <h2 className="athimart-title-large mt-2">
              Consent and Declarations
            </h2>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              You may save the form as a draft.
              Required declarations must be accepted
              before final submission.
            </p>
          </div>
        </div>

        <div className="mt-7 space-y-4">
          <label className="flex cursor-pointer items-start gap-3 border border-[var(--border)] p-4">
            <input
              type="checkbox"
              name="termsAccepted"
              defaultChecked={
                initialValues.termsAccepted ?? false
              }
              className="mt-1 h-4 w-4 accent-[var(--brand-blue)] focus:!outline-none focus-visible:!outline-none"
            />

            <span className="font-[var(--font-body)] text-xs leading-6 text-[var(--text-soft)]">
              I confirm that the information provided
              is accurate and I agree to the AthiMart
              Delivery Partner terms and operating
              requirements.
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 border border-[var(--border)] p-4">
            <input
              type="checkbox"
              name="privacyConsent"
              defaultChecked={
                initialValues.privacyConsent ?? false
              }
              className="mt-1 h-4 w-4 accent-[var(--brand-blue)] focus:!outline-none focus-visible:!outline-none"
            />

            <span className="font-[var(--font-body)] text-xs leading-6 text-[var(--text-soft)]">
              I consent to AthiMart processing the
              submitted personal and verification
              information for delivery-partner
              registration and administration.
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 border border-[var(--border)] p-4">
            <input
              type="checkbox"
              name="locationConsent"
              defaultChecked={
                initialValues.locationConsent ?? false
              }
              className="mt-1 h-4 w-4 accent-[var(--brand-blue)] focus:!outline-none focus-visible:!outline-none"
            />

            <span className="font-[var(--font-body)] text-xs leading-6 text-[var(--text-soft)]">
              I understand that approved operational
              drivers may share location information
              while online or completing an active
              delivery assignment.
            </span>
          </label>
        </div>
      </section>

      {/* Save */}
      <section className="border border-[var(--border)] bg-[var(--brand-blue)] p-5 text-white sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-orange-light)]">
              Save registration progress
            </p>

            <h2 className="mt-2 font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.04em]">
              Save Personal Details
            </h2>

            <p className="mt-3 max-w-xl font-[var(--font-body)] text-xs leading-6 text-white/70">
              Saving this section does not submit the
              application for approval. Vehicle and
              document details will be completed next.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex min-h-14 min-w-64 items-center justify-center gap-3 bg-white px-7 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue)] transition-colors hover:bg-[var(--brand-orange-light)] hover:text-white disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600"
          >
            {isPending ? (
              <LoaderCircle
                aria-hidden="true"
                className="h-5 w-5 animate-spin"
                strokeWidth={1.8}
              />
            ) : (
              <Save
                aria-hidden="true"
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            )}

            {isPending
              ? "Saving Details..."
              : "Save Personal Details"}
          </button>
        </div>
      </section>
    </form>
  );
}
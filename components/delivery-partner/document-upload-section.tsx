import {
  FileText,
  IdCard,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";

import DocumentUploadField from "@/components/delivery-partner/document-upload-field";

export interface DeliveryPartnerDocumentInitialValues {
  profilePhotoPath?: string | null;

  identityDocumentFrontPath?: string | null;
  identityDocumentBackPath?: string | null;

  drivingLicenceFrontPath?: string | null;
  drivingLicenceBackPath?: string | null;

  policeClearancePath?: string | null;

  vehicleFrontPhotoPath?: string | null;
  vehicleBackPhotoPath?: string | null;
  vehicleSidePhotoPath?: string | null;

  registrationDocumentPath?: string | null;
  ownershipDocumentPath?: string | null;
  insuranceDocumentPath?: string | null;
  revenueLicenceDocumentPath?: string | null;
  emissionCertificatePath?: string | null;
}

interface DocumentUploadSectionProps {
  vehicleId?: string | null;
  initialValues?: DeliveryPartnerDocumentInitialValues;
}

export default function DocumentUploadSection({
  vehicleId = null,
  initialValues = {},
}: Readonly<DocumentUploadSectionProps>) {
  const hasSavedVehicle =
    Boolean(vehicleId);

  return (
    <div className="space-y-10">
      {/* Applicant photograph */}
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
              Document section 01
            </p>

            <h2 className="athimart-title-large mt-2">
              Applicant Photograph
            </h2>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              Upload a recent and clearly visible
              photograph of the delivery-partner
              applicant.
            </p>
          </div>
        </div>

        <div className="mt-7">
          <DocumentUploadField
            name="profilePhotoPath"
            category="profile-photo"
            documentSlot="profile_photo"
            label="Applicant profile photograph"
            description="Upload a recent colour photograph with the applicant’s face clearly visible."
            existingPath={
              initialValues.profilePhotoPath
            }
            required
          />
        </div>
      </section>

      {/* Identity documents */}
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
              Document section 02
            </p>

            <h2 className="athimart-title-large mt-2">
              Identity Documents
            </h2>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              Upload clear copies of the official
              identity document entered in your
              personal information.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <DocumentUploadField
            name="identityDocumentFrontPath"
            category="identity"
            documentSlot="identity_front"
            label="Identity document — front"
            description="Upload the front side or main information page of the identity document."
            existingPath={
              initialValues.identityDocumentFrontPath
            }
            required
          />

          <DocumentUploadField
            name="identityDocumentBackPath"
            category="identity"
            documentSlot="identity_back"
            label="Identity document — back"
            description="Upload the reverse side where applicable. Passport holders may upload the relevant supporting page."
            existingPath={
              initialValues.identityDocumentBackPath
            }
          />
        </div>
      </section>

      {/* Driving licence documents */}
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
              Document section 03
            </p>

            <h2 className="athimart-title-large mt-2">
              Driving Licence Documents
            </h2>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              Upload both sides of your driving
              licence so AthiMart can verify its
              number, class and validity.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <DocumentUploadField
            name="drivingLicenceFrontPath"
            category="driving-licence"
            documentSlot="driving_licence_front"
            label="Driving licence — front"
            description="Upload a clear image or PDF of the front side of the driving licence."
            existingPath={
              initialValues.drivingLicenceFrontPath
            }
            required
          />

          <DocumentUploadField
            name="drivingLicenceBackPath"
            category="driving-licence"
            documentSlot="driving_licence_back"
            label="Driving licence — back"
            description="Upload a clear image or PDF of the reverse side of the driving licence."
            existingPath={
              initialValues.drivingLicenceBackPath
            }
            required
          />
        </div>
      </section>

      {/* Supporting verification */}
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
              Document section 04
            </p>

            <h2 className="athimart-title-large mt-2">
              Supporting Verification
            </h2>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              Additional verification documents may
              be requested depending on AthiMart’s
              approval requirements.
            </p>
          </div>
        </div>

        <div className="mt-7">
          <DocumentUploadField
            name="policeClearancePath"
            category="police-clearance"
            documentSlot="police_clearance"
            label="Police clearance certificate"
            description="Upload a current police clearance certificate when required by AthiMart."
            existingPath={
              initialValues.policeClearancePath
            }
          />
        </div>
      </section>

      {/* Vehicle photographs */}
      <section className="border border-[var(--border)] bg-white p-5 sm:p-8">
        <div className="flex items-start gap-4 border-b border-[var(--border)] pb-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
            <Truck
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.7}
            />
          </span>

          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Document section 05
            </p>

            <h2 className="athimart-title-large mt-2">
              Vehicle Photographs
            </h2>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              Images should clearly show the vehicle,
              its overall condition, cargo area and
              registration number.
            </p>
          </div>
        </div>

        {!hasSavedVehicle && (
          <div
            role="status"
            className="mt-7 border-l-4 border-[var(--warning)] bg-amber-50 p-4"
          >
            <p className="font-[var(--font-body)] text-xs font-semibold text-[var(--warning)]">
              Save the vehicle draft first
            </p>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              Vehicle documents cannot be linked
              until the vehicle has been saved and a
              vehicle ID has been created.
            </p>
          </div>
        )}

        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          <DocumentUploadField
            name="vehicleFrontPhotoPath"
            category="vehicle-photos"
            documentSlot="vehicle_front_photo"
            label="Vehicle front photograph"
            description="Upload a clear front view of the registered vehicle."
            vehicleId={vehicleId}
            existingPath={
              initialValues.vehicleFrontPhotoPath
            }
            disabled={!hasSavedVehicle}
            required
          />

          <DocumentUploadField
            name="vehicleBackPhotoPath"
            category="vehicle-photos"
            documentSlot="vehicle_back_photo"
            label="Vehicle rear photograph"
            description="Upload a clear rear view showing the registration number where possible."
            vehicleId={vehicleId}
            existingPath={
              initialValues.vehicleBackPhotoPath
            }
            disabled={!hasSavedVehicle}
          />

          <DocumentUploadField
            name="vehicleSidePhotoPath"
            category="vehicle-photos"
            documentSlot="vehicle_side_photo"
            label="Vehicle side photograph"
            description="Upload a clear side view showing the vehicle condition and cargo area."
            vehicleId={vehicleId}
            existingPath={
              initialValues.vehicleSidePhotoPath
            }
            disabled={!hasSavedVehicle}
          />
        </div>
      </section>

      {/* Vehicle legal documents */}
      <section className="border border-[var(--border)] bg-white p-5 sm:p-8">
        <div className="flex items-start gap-4 border-b border-[var(--border)] pb-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--brand-orange-soft)] text-[var(--brand-orange-dark)]">
            <FileText
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.7}
            />
          </span>

          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Document section 06
            </p>

            <h2 className="athimart-title-large mt-2">
              Vehicle Legal Documents
            </h2>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              Upload valid registration, ownership,
              insurance and operating documents for
              the selected vehicle.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <DocumentUploadField
            name="registrationDocumentPath"
            category="vehicle-registration"
            documentSlot="vehicle_registration"
            label="Vehicle registration document"
            description="Upload the official vehicle registration certificate or registration book."
            vehicleId={vehicleId}
            existingPath={
              initialValues.registrationDocumentPath
            }
            disabled={!hasSavedVehicle}
            required
          />

          <DocumentUploadField
            name="ownershipDocumentPath"
            category="vehicle-ownership"
            documentSlot="vehicle_ownership"
            label="Ownership or authorisation document"
            description="Upload ownership evidence or written permission when the vehicle is not personally owned."
            vehicleId={vehicleId}
            existingPath={
              initialValues.ownershipDocumentPath
            }
            disabled={!hasSavedVehicle}
          />

          <DocumentUploadField
            name="insuranceDocumentPath"
            category="vehicle-insurance"
            documentSlot="vehicle_insurance"
            label="Vehicle insurance"
            description="Upload the current insurance certificate or policy document."
            vehicleId={vehicleId}
            existingPath={
              initialValues.insuranceDocumentPath
            }
            disabled={!hasSavedVehicle}
            required
          />

          <DocumentUploadField
            name="revenueLicenceDocumentPath"
            category="vehicle-revenue-licence"
            documentSlot="vehicle_revenue_licence"
            label="Revenue licence"
            description="Upload the vehicle’s current revenue licence where applicable."
            vehicleId={vehicleId}
            existingPath={
              initialValues.revenueLicenceDocumentPath
            }
            disabled={!hasSavedVehicle}
          />

          <DocumentUploadField
            name="emissionCertificatePath"
            category="vehicle-emission"
            documentSlot="vehicle_emission"
            label="Emission certificate"
            description="Upload the current emission-test certificate where required for the vehicle."
            vehicleId={vehicleId}
            existingPath={
              initialValues.emissionCertificatePath
            }
            disabled={!hasSavedVehicle}
          />
        </div>
      </section>

      {/* Privacy notice */}
      <section className="border border-[var(--border)] bg-[var(--brand-blue-soft)] p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 h-6 w-6 shrink-0 text-[var(--brand-blue)]"
            strokeWidth={1.7}
          />

          <div>
            <h2 className="font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
              Private and Access Controlled
            </h2>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              These documents are stored in a private
              AthiMart Storage bucket. Access is
              intended only for the applicant and
              authorised AthiMart administrators
              involved in registration and
              verification.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
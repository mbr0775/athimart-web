"use client";

import type { FormEvent } from "react";
import {
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Banknote,
  Box,
  CalendarDays,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Package,
  Ruler,
  Save,
  Scale,
  ShieldCheck,
  Snowflake,
  Truck,
  UserRound,
} from "lucide-react";

import {
  saveDeliveryPartnerVehicle,
  type DeliveryPartnerVehicleSummary,
  type DeliveryVehicleType,
  type VehicleOwnershipType,
} from "@/app/(store)/delivery-partner/register/vehicle-actions";

export interface DeliveryPartnerVehicleInitialValues {
  vehicleId?: string;

  vehicleType?: DeliveryVehicleType;
  registrationNumber?: string;
  manufacturer?: string;
  model?: string;
  manufactureYear?: string;
  colour?: string;

  ownershipType?: VehicleOwnershipType;
  ownerName?: string;

  maximumPayloadKg?: string;
  maximumParcelCount?: string;

  cargoLengthCm?: string;
  cargoWidthCm?: string;
  cargoHeightCm?: string;
  cargoVolumeLitres?: string;

  hasClosedCargoArea?: boolean;
  hasDeliveryBox?: boolean;
  hasRefrigeration?: boolean;

  supportsFoodDelivery?: boolean;
  supportsFragileParcels?: boolean;
  supportsFrozenItems?: boolean;
  supportsBulkOrders?: boolean;
  supportsCashOnDelivery?: boolean;
}

interface VehicleFormProps {
  initialValues?: DeliveryPartnerVehicleInitialValues;
}

const fieldClassName =
  "mt-2 min-h-12 w-full border border-[var(--border)] bg-white px-4 font-[var(--font-body)] text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--brand-blue)] focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0";

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

function getFormBoolean(
  formData: FormData,
  fieldName: string
): boolean {
  return (
    formData.get(fieldName) ===
    "on"
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

export default function VehicleForm({
  initialValues = {},
}: Readonly<VehicleFormProps>) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    currentVehicleId,
    setCurrentVehicleId,
  ] = useState(
    initialValues.vehicleId ?? ""
  );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    savedVehicle,
    setSavedVehicle,
  ] =
    useState<DeliveryPartnerVehicleSummary | null>(
      null
    );

  const currentYear =
    new Date().getUTCFullYear();

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    setErrorMessage("");
    setSavedVehicle(null);

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    startTransition(async () => {
      const result =
        await saveDeliveryPartnerVehicle({
          vehicleId:
            currentVehicleId ||
            undefined,

          vehicleType:
            getFormText(
              formData,
              "vehicleType"
            ) as DeliveryVehicleType,

          registrationNumber:
            getFormText(
              formData,
              "registrationNumber"
            ),

          manufacturer:
            getFormText(
              formData,
              "manufacturer"
            ),

          model:
            getFormText(
              formData,
              "model"
            ),

          manufactureYear:
            getFormText(
              formData,
              "manufactureYear"
            ),

          colour:
            getFormText(
              formData,
              "colour"
            ),

          ownershipType:
            getFormText(
              formData,
              "ownershipType"
            ) as VehicleOwnershipType,

          ownerName:
            getFormText(
              formData,
              "ownerName"
            ),

          maximumPayloadKg:
            getFormText(
              formData,
              "maximumPayloadKg"
            ),

          maximumParcelCount:
            getFormText(
              formData,
              "maximumParcelCount"
            ),

          cargoLengthCm:
            getFormText(
              formData,
              "cargoLengthCm"
            ),

          cargoWidthCm:
            getFormText(
              formData,
              "cargoWidthCm"
            ),

          cargoHeightCm:
            getFormText(
              formData,
              "cargoHeightCm"
            ),

          cargoVolumeLitres:
            getFormText(
              formData,
              "cargoVolumeLitres"
            ),

          hasClosedCargoArea:
            getFormBoolean(
              formData,
              "hasClosedCargoArea"
            ),

          hasDeliveryBox:
            getFormBoolean(
              formData,
              "hasDeliveryBox"
            ),

          hasRefrigeration:
            getFormBoolean(
              formData,
              "hasRefrigeration"
            ),

          supportsFoodDelivery:
            getFormBoolean(
              formData,
              "supportsFoodDelivery"
            ),

          supportsFragileParcels:
            getFormBoolean(
              formData,
              "supportsFragileParcels"
            ),

          supportsFrozenItems:
            getFormBoolean(
              formData,
              "supportsFrozenItems"
            ),

          supportsBulkOrders:
            getFormBoolean(
              formData,
              "supportsBulkOrders"
            ),

          supportsCashOnDelivery:
            getFormBoolean(
              formData,
              "supportsCashOnDelivery"
            ),
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

      setCurrentVehicleId(
        result.vehicle.vehicleId
      );

      setSavedVehicle(
        result.vehicle
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

      {savedVehicle && (
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
                Vehicle information saved successfully
              </p>

              <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                Vehicle status:{" "}
                {formatStatus(
                  savedVehicle.vehicleStatus
                )}
                . Registration number:{" "}
                {
                  savedVehicle.registrationNumber
                }
                . Last updated:{" "}
                {formatUpdatedDate(
                  savedVehicle.updatedAt
                )}
                .
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle identity */}
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
              Vehicle section 01
            </p>

            <h2 className="athimart-title-large mt-2">
              Vehicle Information
            </h2>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              Enter the vehicle type and identifying
              details exactly as shown on its official
              records.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Vehicle type *
            </span>

            <select
              name="vehicleType"
              required
              defaultValue={
                initialValues.vehicleType ??
                ""
              }
              className={fieldClassName}
            >
              <option
                value=""
                disabled
              >
                Select vehicle type
              </option>

              <option value="motorcycle">
                Motorcycle
              </option>

              <option value="three_wheeler">
                Three-Wheeler
              </option>

              <option value="car">
                Car
              </option>

              <option value="pickup_truck">
                Pickup Truck
              </option>

              <option value="van">
                Van
              </option>

              <option value="mini_lorry">
                Mini Lorry
              </option>

              <option value="lorry">
                Lorry
              </option>

              <option value="bus">
                Bus
              </option>

              <option value="bicycle">
                Bicycle
              </option>

              <option value="other">
                Other Approved Vehicle
              </option>
            </select>
          </label>

          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Registration number *
            </span>

            <input
              type="text"
              name="registrationNumber"
              required
              minLength={2}
              maxLength={40}
              autoComplete="off"
              defaultValue={
                initialValues.registrationNumber ??
                ""
              }
              placeholder="Example: WP ABC-1234"
              className={fieldClassName}
            />
          </label>

          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Manufacturer *
            </span>

            <input
              type="text"
              name="manufacturer"
              required
              minLength={2}
              maxLength={100}
              defaultValue={
                initialValues.manufacturer ??
                ""
              }
              placeholder="Example: Honda"
              className={fieldClassName}
            />
          </label>

          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Model *
            </span>

            <input
              type="text"
              name="model"
              required
              minLength={1}
              maxLength={100}
              defaultValue={
                initialValues.model ??
                ""
              }
              placeholder="Example: Dio"
              className={fieldClassName}
            />
          </label>

          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Manufacture year *
            </span>

            <div className="relative">
              <CalendarDays
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 mt-1 h-5 w-5 -translate-y-1/2 text-[var(--brand-blue)]"
                strokeWidth={1.7}
              />

              <input
                type="number"
                name="manufactureYear"
                required
                min={1950}
                max={currentYear + 1}
                step={1}
                inputMode="numeric"
                defaultValue={
                  initialValues.manufactureYear ??
                  ""
                }
                placeholder="Example: 2022"
                className={`${fieldClassName} pl-12`}
              />
            </div>
          </label>

          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Colour *
            </span>

            <input
              type="text"
              name="colour"
              required
              minLength={2}
              maxLength={50}
              defaultValue={
                initialValues.colour ??
                ""
              }
              placeholder="Example: Black"
              className={fieldClassName}
            />
          </label>
        </div>
      </section>

      {/* Ownership */}
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
              Vehicle section 02
            </p>

            <h2 className="athimart-title-large mt-2">
              Vehicle Ownership
            </h2>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              AthiMart must understand who legally
              owns or authorises use of the vehicle.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Ownership type *
            </span>

            <select
              name="ownershipType"
              required
              defaultValue={
                initialValues.ownershipType ??
                ""
              }
              className={fieldClassName}
            >
              <option
                value=""
                disabled
              >
                Select ownership type
              </option>

              <option value="owned">
                Personally Owned
              </option>

              <option value="leased">
                Leased
              </option>

              <option value="rented">
                Rented
              </option>

              <option value="borrowed">
                Borrowed with Permission
              </option>

              <option value="family_owned">
                Family Owned
              </option>

              <option value="company_owned">
                Company Owned
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </label>

          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Legal owner name *
            </span>

            <div className="relative">
              <UserRound
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 mt-1 h-5 w-5 -translate-y-1/2 text-[var(--brand-blue)]"
                strokeWidth={1.7}
              />

              <input
                type="text"
                name="ownerName"
                required
                minLength={2}
                maxLength={120}
                defaultValue={
                  initialValues.ownerName ??
                  ""
                }
                placeholder="Enter the legal owner name"
                className={`${fieldClassName} pl-12`}
              />
            </div>
          </label>
        </div>

        <div className="mt-5 flex items-start gap-3 bg-[var(--surface-soft)] p-4">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-blue)]"
            strokeWidth={1.8}
          />

          <p className="font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
            Registration, ownership and insurance
            documents will be uploaded separately to
            AthiMart’s private document storage.
          </p>
        </div>
      </section>

      {/* Capacity */}
      <section className="border border-[var(--border)] bg-white p-5 sm:p-8">
        <div className="flex items-start gap-4 border-b border-[var(--border)] pb-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
            <Scale
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.7}
            />
          </span>

          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Vehicle section 03
            </p>

            <h2 className="athimart-title-large mt-2">
              Carrying Capacity
            </h2>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              Capacity values will help AthiMart avoid
              assigning parcels that are unsuitable
              for your vehicle.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Maximum payload in kilograms *
            </span>

            <input
              type="number"
              name="maximumPayloadKg"
              required
              min="0.01"
              max="100000"
              step="0.01"
              inputMode="decimal"
              defaultValue={
                initialValues.maximumPayloadKg ??
                ""
              }
              placeholder="Example: 10"
              className={fieldClassName}
            />
          </label>

          <label>
            <span className="athimart-label text-[var(--text-muted)]">
              Maximum parcel count *
            </span>

            <input
              type="number"
              name="maximumParcelCount"
              required
              min={1}
              max={10000}
              step={1}
              inputMode="numeric"
              defaultValue={
                initialValues.maximumParcelCount ??
                ""
              }
              placeholder="Example: 3"
              className={fieldClassName}
            />
          </label>
        </div>

        <div className="mt-7 border-t border-[var(--border)] pt-7">
          <div className="flex items-start gap-3">
            <Ruler
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-blue)]"
              strokeWidth={1.8}
            />

            <div>
              <h3 className="font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.14em]">
                Cargo measurements
              </h3>

              <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                These measurements are optional during
                the draft stage but improve parcel and
                vehicle matching.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <label>
              <span className="athimart-label text-[var(--text-muted)]">
                Length (cm)
              </span>

              <input
                type="number"
                name="cargoLengthCm"
                min="0.01"
                max="5000"
                step="0.01"
                inputMode="decimal"
                defaultValue={
                  initialValues.cargoLengthCm ??
                  ""
                }
                placeholder="Length"
                className={fieldClassName}
              />
            </label>

            <label>
              <span className="athimart-label text-[var(--text-muted)]">
                Width (cm)
              </span>

              <input
                type="number"
                name="cargoWidthCm"
                min="0.01"
                max="5000"
                step="0.01"
                inputMode="decimal"
                defaultValue={
                  initialValues.cargoWidthCm ??
                  ""
                }
                placeholder="Width"
                className={fieldClassName}
              />
            </label>

            <label>
              <span className="athimart-label text-[var(--text-muted)]">
                Height (cm)
              </span>

              <input
                type="number"
                name="cargoHeightCm"
                min="0.01"
                max="5000"
                step="0.01"
                inputMode="decimal"
                defaultValue={
                  initialValues.cargoHeightCm ??
                  ""
                }
                placeholder="Height"
                className={fieldClassName}
              />
            </label>

            <label>
              <span className="athimart-label text-[var(--text-muted)]">
                Volume (litres)
              </span>

              <input
                type="number"
                name="cargoVolumeLitres"
                min="0.01"
                max="10000000"
                step="0.01"
                inputMode="decimal"
                defaultValue={
                  initialValues.cargoVolumeLitres ??
                  ""
                }
                placeholder="Volume"
                className={fieldClassName}
              />
            </label>
          </div>
        </div>
      </section>

      {/* Equipment */}
      <section className="border border-[var(--border)] bg-white p-5 sm:p-8">
        <div className="flex items-start gap-4 border-b border-[var(--border)] pb-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--brand-orange-soft)] text-[var(--brand-orange-dark)]">
            <Box
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.7}
            />
          </span>

          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Vehicle section 04
            </p>

            <h2 className="athimart-title-large mt-2">
              Cargo Equipment
            </h2>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              Select the equipment currently available
              on this vehicle.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <label className="flex cursor-pointer items-start gap-3 border border-[var(--border)] p-4">
            <input
              type="checkbox"
              name="hasClosedCargoArea"
              defaultChecked={
                initialValues.hasClosedCargoArea ??
                false
              }
              className="mt-1 h-4 w-4 accent-[var(--brand-blue)] focus:!outline-none focus-visible:!outline-none"
            />

            <span>
              <span className="block font-[var(--font-body)] text-xs font-semibold">
                Closed cargo area
              </span>

              <span className="mt-1 block font-[var(--font-body)] text-[10px] leading-5 text-[var(--text-muted)]">
                Parcels can be protected from rain and
                external exposure.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 border border-[var(--border)] p-4">
            <input
              type="checkbox"
              name="hasDeliveryBox"
              defaultChecked={
                initialValues.hasDeliveryBox ??
                false
              }
              className="mt-1 h-4 w-4 accent-[var(--brand-blue)] focus:!outline-none focus-visible:!outline-none"
            />

            <span>
              <span className="block font-[var(--font-body)] text-xs font-semibold">
                Delivery box
              </span>

              <span className="mt-1 block font-[var(--font-body)] text-[10px] leading-5 text-[var(--text-muted)]">
                The vehicle has a secure parcel or
                food-delivery box.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 border border-[var(--border)] p-4">
            <input
              type="checkbox"
              name="hasRefrigeration"
              defaultChecked={
                initialValues.hasRefrigeration ??
                false
              }
              className="mt-1 h-4 w-4 accent-[var(--brand-blue)] focus:!outline-none focus-visible:!outline-none"
            />

            <span>
              <span className="flex items-center gap-2 font-[var(--font-body)] text-xs font-semibold">
                <Snowflake
                  aria-hidden="true"
                  className="h-4 w-4 text-[var(--brand-blue)]"
                  strokeWidth={1.8}
                />

                Refrigeration
              </span>

              <span className="mt-1 block font-[var(--font-body)] text-[10px] leading-5 text-[var(--text-muted)]">
                The vehicle has functioning
                temperature-controlled storage.
              </span>
            </span>
          </label>
        </div>
      </section>

      {/* Delivery capabilities */}
      <section className="border border-[var(--border)] bg-white p-5 sm:p-8">
        <div className="flex items-start gap-4 border-b border-[var(--border)] pb-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-green-50 text-[var(--success)]">
            <Package
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.7}
            />
          </span>

          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Vehicle section 05
            </p>

            <h2 className="athimart-title-large mt-2">
              Delivery Capabilities
            </h2>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              Select the delivery types this vehicle
              can safely support.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 border border-[var(--border)] p-4">
            <input
              type="checkbox"
              name="supportsFoodDelivery"
              defaultChecked={
                initialValues.supportsFoodDelivery ??
                false
              }
              className="mt-1 h-4 w-4 accent-[var(--brand-blue)] focus:!outline-none focus-visible:!outline-none"
            />

            <span>
              <span className="block font-[var(--font-body)] text-xs font-semibold">
                Food delivery
              </span>

              <span className="mt-1 block font-[var(--font-body)] text-[10px] leading-5 text-[var(--text-muted)]">
                Suitable for safely carrying prepared
                food or grocery orders.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 border border-[var(--border)] p-4">
            <input
              type="checkbox"
              name="supportsFragileParcels"
              defaultChecked={
                initialValues.supportsFragileParcels ??
                false
              }
              className="mt-1 h-4 w-4 accent-[var(--brand-blue)] focus:!outline-none focus-visible:!outline-none"
            />

            <span>
              <span className="block font-[var(--font-body)] text-xs font-semibold">
                Fragile parcels
              </span>

              <span className="mt-1 block font-[var(--font-body)] text-[10px] leading-5 text-[var(--text-muted)]">
                Suitable for carefully protected
                breakable or sensitive goods.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 border border-[var(--border)] p-4">
            <input
              type="checkbox"
              name="supportsFrozenItems"
              defaultChecked={
                initialValues.supportsFrozenItems ??
                false
              }
              className="mt-1 h-4 w-4 accent-[var(--brand-blue)] focus:!outline-none focus-visible:!outline-none"
            />

            <span>
              <span className="block font-[var(--font-body)] text-xs font-semibold">
                Frozen items
              </span>

              <span className="mt-1 block font-[var(--font-body)] text-[10px] leading-5 text-[var(--text-muted)]">
                Requires the refrigeration option to
                be selected.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 border border-[var(--border)] p-4">
            <input
              type="checkbox"
              name="supportsBulkOrders"
              defaultChecked={
                initialValues.supportsBulkOrders ??
                false
              }
              className="mt-1 h-4 w-4 accent-[var(--brand-blue)] focus:!outline-none focus-visible:!outline-none"
            />

            <span>
              <span className="block font-[var(--font-body)] text-xs font-semibold">
                Bulk orders
              </span>

              <span className="mt-1 block font-[var(--font-body)] text-[10px] leading-5 text-[var(--text-muted)]">
                Suitable for multiple parcels or
                larger consolidated orders.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 border border-[var(--border)] p-4 sm:col-span-2">
            <input
              type="checkbox"
              name="supportsCashOnDelivery"
              defaultChecked={
                initialValues.supportsCashOnDelivery ??
                false
              }
              className="mt-1 h-4 w-4 accent-[var(--brand-blue)] focus:!outline-none focus-visible:!outline-none"
            />

            <span>
              <span className="flex items-center gap-2 font-[var(--font-body)] text-xs font-semibold">
                <Banknote
                  aria-hidden="true"
                  className="h-4 w-4 text-[var(--success)]"
                  strokeWidth={1.8}
                />

                Cash on Delivery handling
              </span>

              <span className="mt-1 block font-[var(--font-body)] text-[10px] leading-5 text-[var(--text-muted)]">
                Indicates that this vehicle may later
                be used for assignments involving
                customer cash collection. Final COD
                permission still requires AthiMart
                approval.
              </span>
            </span>
          </label>
        </div>
      </section>

      {/* Save */}
      <section className="border border-[var(--border)] bg-[var(--brand-blue)] p-5 text-white sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-orange-light)]">
              Save vehicle registration
            </p>

            <h2 className="mt-2 font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.04em]">
              Save Vehicle Draft
            </h2>

            <p className="mt-3 max-w-xl font-[var(--font-body)] text-xs leading-6 text-white/70">
              Saving this information does not approve
              or activate the vehicle. Supporting
              documents and administrator verification
              are still required.
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
              ? "Saving Vehicle..."
              : "Save Vehicle Draft"}
          </button>
        </div>
      </section>
    </form>
  );
}
"use client";

import type { FormEvent } from "react";
import {
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  reviewDeliveryPartnerApplication,
  type DeliveryPartnerReviewDecision,
} from "@/app/(admin)/admin/delivery-partners/actions";

interface DeliveryPartnerReviewFormProps {
  applicantUserId: string;
  requestedServiceAreas?: string[];

  defaultCashOnDelivery?: boolean;
  defaultFoodDelivery?: boolean;
  defaultFragileParcels?: boolean;
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

export default function DeliveryPartnerReviewForm({
  applicantUserId,
  requestedServiceAreas = [],
  defaultCashOnDelivery = false,
  defaultFoodDelivery = false,
  defaultFragileParcels = false,
}: Readonly<DeliveryPartnerReviewFormProps>) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    decision,
    setDecision,
  ] =
    useState<DeliveryPartnerReviewDecision>(
      "approve"
    );

  const [
    approvedServiceAreas,
    setApprovedServiceAreas,
  ] = useState(
    requestedServiceAreas.join(
      "\n"
    )
  );

  const [
    approvedServiceRadiusKm,
    setApprovedServiceRadiusKm,
  ] = useState("10");

  const [
    canHandleCashOnDelivery,
    setCanHandleCashOnDelivery,
  ] = useState(
    defaultCashOnDelivery
  );

  const [
    canHandleFoodDelivery,
    setCanHandleFoodDelivery,
  ] = useState(
    defaultFoodDelivery
  );

  const [
    canHandleFragileParcels,
    setCanHandleFragileParcels,
  ] = useState(
    defaultFragileParcels
  );

  const [
    rejectionReason,
    setRejectionReason,
  ] = useState("");

  const [
    administratorNotes,
    setAdministratorNotes,
  ] = useState("");

  const [
    confirmationAccepted,
    setConfirmationAccepted,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const fieldClassName =
    "mt-2 min-h-12 w-full border border-[var(--border)] bg-white px-4 font-[var(--font-body)] text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--brand-blue)] focus:ring-0";

  const textareaClassName =
    "mt-2 min-h-28 w-full resize-y border border-[var(--border)] bg-white px-4 py-3 font-[var(--font-body)] text-sm leading-6 text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--brand-blue)] focus:ring-0";

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      isPending ||
      !confirmationAccepted
    ) {
      return;
    }

    setErrorMessage("");

    const normalizedAreas =
      splitTextList(
        approvedServiceAreas
      );

    if (
      decision === "approve" &&
      normalizedAreas.length === 0
    ) {
      setErrorMessage(
        "Enter at least one approved service area."
      );

      return;
    }

    if (
      decision === "reject" &&
      (
        rejectionReason.trim().length <
          5 ||
        rejectionReason.trim().length >
          1500
      )
    ) {
      setErrorMessage(
        "Enter a rejection reason between 5 and 1500 characters."
      );

      return;
    }

    startTransition(async () => {
      const result =
        await reviewDeliveryPartnerApplication(
          {
            applicantUserId,
            decision,

            rejectionReason:
              decision === "reject"
                ? rejectionReason
                : "",

            administratorNotes,

            approvedServiceAreas:
              decision === "approve"
                ? normalizedAreas
                : [],

            approvedServiceRadiusKm:
              decision === "approve"
                ? approvedServiceRadiusKm
                : "10",

            canHandleCashOnDelivery:
              decision === "approve" &&
              canHandleCashOnDelivery,

            canHandleFoodDelivery:
              decision === "approve" &&
              canHandleFoodDelivery,

            canHandleFragileParcels:
              decision === "approve" &&
              canHandleFragileParcels,
          }
        );

      if (!result.success) {
        if (
          result.code ===
          "UNAUTHENTICATED"
        ) {
          window.location.assign(
            `/auth/login?next=${encodeURIComponent(
              `/admin/delivery-partners/${applicantUserId}`
            )}`
          );

          return;
        }

        if (
          result.code ===
          "UNAUTHORIZED"
        ) {
          window.location.assign(
            "/account"
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

      router.replace(
        `/admin/delivery-partners?reviewed=${encodeURIComponent(
          result.application.applicationStatus
        )}`
      );

      router.refresh();
    });
  }

  function selectDecision(
    nextDecision: DeliveryPartnerReviewDecision
  ) {
    if (isPending) {
      return;
    }

    setDecision(
      nextDecision
    );

    setConfirmationAccepted(
      false
    );

    setErrorMessage("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={isPending}
      className="space-y-7"
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

      {/* Review decision */}
      <section className="border border-[var(--border)] bg-white p-5 sm:p-7">
        <p className="athimart-label text-[var(--text-muted)]">
          Administrator decision
        </p>

        <h2 className="mt-2 font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.04em] text-[var(--text)]">
          Review Outcome
        </h2>

        <p className="mt-3 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
          Select whether this delivery-partner
          application should be approved or returned
          to the applicant as rejected.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              selectDecision(
                "approve"
              )
            }
            className={`flex min-h-24 items-start gap-4 border p-5 text-left transition-colors ${
              decision === "approve"
                ? "border-[var(--success)] bg-green-50"
                : "border-[var(--border)] bg-white hover:border-[var(--success)]"
            }`}
          >
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 h-6 w-6 shrink-0 text-[var(--success)]"
              strokeWidth={1.8}
            />

            <span>
              <span className="block font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
                Approve Application
              </span>

              <span className="mt-2 block font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                Verify the applicant and vehicle,
                define service areas and grant
                approved delivery capabilities.
              </span>
            </span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              selectDecision(
                "reject"
              )
            }
            className={`flex min-h-24 items-start gap-4 border p-5 text-left transition-colors ${
              decision === "reject"
                ? "border-[var(--sale)] bg-red-50"
                : "border-[var(--border)] bg-white hover:border-[var(--sale)]"
            }`}
          >
            <XCircle
              aria-hidden="true"
              className="mt-0.5 h-6 w-6 shrink-0 text-[var(--sale)]"
              strokeWidth={1.8}
            />

            <span>
              <span className="block font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
                Reject Application
              </span>

              <span className="mt-2 block font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                Return the application with a clear
                reason so the applicant can correct
                eligible information.
              </span>
            </span>
          </button>
        </div>
      </section>

      {decision === "approve" ? (
        <>
          {/* Service-area approval */}
          <section className="border border-[var(--border)] bg-white p-5 sm:p-7">
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Operational approval
            </p>

            <h2 className="mt-2 font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.04em]">
              Service Areas
            </h2>

            <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
              <label>
                <span className="athimart-label text-[var(--text-muted)]">
                  Approved service areas *
                </span>

                <textarea
                  required
                  value={
                    approvedServiceAreas
                  }
                  onChange={(event) =>
                    setApprovedServiceAreas(
                      event.target.value
                    )
                  }
                  placeholder={`Example:
Kegalle
Rambukkana
Mawanella`}
                  className={textareaClassName}
                />

                <span className="mt-2 block font-[var(--font-body)] text-[10px] leading-5 text-[var(--text-muted)]">
                  Enter one area per line or separate
                  areas using commas.
                </span>
              </label>

              <label>
                <span className="athimart-label text-[var(--text-muted)]">
                  Service radius (km) *
                </span>

                <input
                  type="number"
                  required
                  min="0.1"
                  max="500"
                  step="0.1"
                  value={
                    approvedServiceRadiusKm
                  }
                  onChange={(event) =>
                    setApprovedServiceRadiusKm(
                      event.target.value
                    )
                  }
                  className={fieldClassName}
                />

                <span className="mt-2 block font-[var(--font-body)] text-[10px] leading-5 text-[var(--text-muted)]">
                  Used later for eligible-driver
                  shortlisting and delivery matching.
                </span>
              </label>
            </div>
          </section>

          {/* Capabilities */}
          <section className="border border-[var(--border)] bg-white p-5 sm:p-7">
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Approved permissions
            </p>

            <h2 className="mt-2 font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.04em]">
              Delivery Capabilities
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <label className="flex cursor-pointer items-start gap-3 border border-[var(--border)] p-4">
                <input
                  type="checkbox"
                  checked={
                    canHandleCashOnDelivery
                  }
                  onChange={(event) =>
                    setCanHandleCashOnDelivery(
                      event.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 accent-[var(--brand-blue)]"
                />

                <span>
                  <span className="block font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.1em]">
                    Cash on Delivery
                  </span>

                  <span className="mt-1 block font-[var(--font-body)] text-[10px] leading-5 text-[var(--text-muted)]">
                    Driver may receive assignments
                    involving customer cash
                    collection.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 border border-[var(--border)] p-4">
                <input
                  type="checkbox"
                  checked={
                    canHandleFoodDelivery
                  }
                  onChange={(event) =>
                    setCanHandleFoodDelivery(
                      event.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 accent-[var(--brand-blue)]"
                />

                <span>
                  <span className="block font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.1em]">
                    Food Delivery
                  </span>

                  <span className="mt-1 block font-[var(--font-body)] text-[10px] leading-5 text-[var(--text-muted)]">
                    Driver and vehicle may receive
                    suitable food-delivery
                    assignments.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 border border-[var(--border)] p-4">
                <input
                  type="checkbox"
                  checked={
                    canHandleFragileParcels
                  }
                  onChange={(event) =>
                    setCanHandleFragileParcels(
                      event.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 accent-[var(--brand-blue)]"
                />

                <span>
                  <span className="block font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.1em]">
                    Fragile Parcels
                  </span>

                  <span className="mt-1 block font-[var(--font-body)] text-[10px] leading-5 text-[var(--text-muted)]">
                    Driver may receive protected
                    fragile-parcel assignments.
                  </span>
                </span>
              </label>
            </div>
          </section>
        </>
      ) : (
        <section className="border border-[var(--sale)] bg-red-50 p-5 sm:p-7">
          <p className="athimart-label text-[var(--sale)]">
            Required explanation
          </p>

          <h2 className="mt-2 font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.04em]">
            Rejection Reason
          </h2>

          <label className="mt-6 block">
            <span className="athimart-label text-[var(--text-muted)]">
              Reason shown to the applicant *
            </span>

            <textarea
              required
              minLength={5}
              maxLength={1500}
              value={
                rejectionReason
              }
              onChange={(event) =>
                setRejectionReason(
                  event.target.value
                )
              }
              placeholder="Clearly explain what must be corrected or why the application cannot be approved."
              className={textareaClassName}
            />
          </label>
        </section>
      )}

      {/* Administrator notes */}
      <section className="border border-[var(--border)] bg-white p-5 sm:p-7">
        <p className="athimart-label text-[var(--text-muted)]">
          Internal information
        </p>

        <h2 className="mt-2 font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.04em]">
          Administrator Notes
        </h2>

        <label className="mt-6 block">
          <span className="athimart-label text-[var(--text-muted)]">
            Internal notes
          </span>

          <textarea
            maxLength={3000}
            value={
              administratorNotes
            }
            onChange={(event) =>
              setAdministratorNotes(
                event.target.value
              )
            }
            placeholder="Optional internal review notes. These notes are not intended as the applicant-facing rejection reason."
            className={textareaClassName}
          />
        </label>
      </section>

      {/* Confirmation and submit */}
      <section
        className={`border p-5 sm:p-7 ${
          decision === "approve"
            ? "border-[var(--success)] bg-green-50"
            : "border-[var(--sale)] bg-red-50"
        }`}
      >
        <div className="flex items-start gap-4">
          <ShieldCheck
            aria-hidden="true"
            className={`mt-0.5 h-6 w-6 shrink-0 ${
              decision === "approve"
                ? "text-[var(--success)]"
                : "text-[var(--sale)]"
            }`}
            strokeWidth={1.8}
          />

          <div className="flex-1">
            <h2 className="font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.14em]">
              Confirm Administrator Decision
            </h2>

            <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
              This decision updates both the
              delivery-partner application and its
              selected primary vehicle.
            </p>
          </div>
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3 border border-[var(--border)] bg-white p-4">
          <input
            type="checkbox"
            checked={
              confirmationAccepted
            }
            disabled={isPending}
            onChange={(event) =>
              setConfirmationAccepted(
                event.target.checked
              )
            }
            className="mt-1 h-4 w-4 accent-[var(--brand-blue)]"
          />

          <span className="font-[var(--font-body)] text-xs leading-6 text-[var(--text-soft)]">
            I confirm that I reviewed the submitted
            applicant details, vehicle information
            and required verification documents
            before making this decision.
          </span>
        </label>

        <button
          type="submit"
          disabled={
            isPending ||
            !confirmationAccepted
          }
          className={`mt-5 flex min-h-14 w-full items-center justify-center gap-3 px-6 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-colors disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600 ${
            decision === "approve"
              ? "bg-[var(--success)] hover:opacity-90"
              : "bg-[var(--sale)] hover:opacity-90"
          }`}
        >
          {isPending ? (
            <LoaderCircle
              aria-hidden="true"
              className="h-5 w-5 animate-spin"
              strokeWidth={1.8}
            />
          ) : decision ===
            "approve" ? (
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

          {isPending
            ? "Saving Review Decision..."
            : decision === "approve"
              ? "Approve Delivery Partner"
              : "Reject Delivery Partner"}
        </button>
      </section>
    </form>
  );
}
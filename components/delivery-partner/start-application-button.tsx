"use client";

import Link from "next/link";
import {
  useState,
  useTransition,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  LoaderCircle,
  Truck,
} from "lucide-react";

import {
  startDeliveryPartnerApplication,
  type DeliveryPartnerApplicationSummary,
} from "@/app/(store)/delivery-partner/actions";

interface StartApplicationButtonProps {
  initialApplication?:
    | DeliveryPartnerApplicationSummary
    | null;
}

function formatStatus(
  status: string
): string {
  return status
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

export default function StartApplicationButton({
  initialApplication = null,
}: Readonly<StartApplicationButtonProps>) {
  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    application,
    setApplication,
  ] =
    useState<DeliveryPartnerApplicationSummary | null>(
      initialApplication
    );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  function handleStartApplication() {
    if (isPending) {
      return;
    }

    setErrorMessage("");

    startTransition(async () => {
      const result =
        await startDeliveryPartnerApplication();

      if (!result.success) {
        if (
          result.code ===
          "UNAUTHENTICATED"
        ) {
          window.location.assign(
            `/auth/login?next=${encodeURIComponent(
              "/delivery-partner"
            )}`
          );

          return;
        }

        setErrorMessage(
          result.message
        );

        return;
      }

      setApplication(
        result.application
      );
    });
  }

  if (application) {
    const canEditApplication = [
      "draft",
      "rejected",
    ].includes(
      application.applicationStatus
    );

    const isUnderReview = [
      "pending",
      "under_review",
    ].includes(
      application.applicationStatus
    );

    return (
      <div className="border border-[var(--border)] bg-white p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-green-50 text-[var(--success)]">
            <CheckCircle2
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.8}
            />
          </span>

          <div className="min-w-0">
            <p className="athimart-label text-[var(--success)]">
              Application started
            </p>

            <h2 className="mt-2 font-[var(--font-display)] text-2xl font-light uppercase tracking-[0.04em] text-[var(--text)]">
              {canEditApplication
                ? "Continue Your Registration"
                : isUnderReview
                  ? "Application Under Review"
                  : "Delivery Partner Application"}
            </h2>

            <p className="mt-3 font-[var(--font-body)] text-sm leading-6 text-[var(--text-muted)]">
              {canEditApplication
                ? "Complete your identity, driving licence, service-area, vehicle and supporting-document information before submitting the application for review."
                : isUnderReview
                  ? "Your application has been submitted and is currently waiting for AthiMart administrator review."
                  : "Your current delivery-partner application status is shown below."}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid border-l border-t border-[var(--border)] sm:grid-cols-2">
          <div className="border-b border-r border-[var(--border)] p-4">
            <dt className="athimart-label text-[var(--text-muted)]">
              Application status
            </dt>

            <dd className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--brand-blue)]">
              {formatStatus(
                application.applicationStatus
              )}
            </dd>
          </div>

          <div className="border-b border-r border-[var(--border)] p-4">
            <dt className="athimart-label text-[var(--text-muted)]">
              Availability
            </dt>

            <dd className="mt-2 font-[var(--font-body)] text-sm font-semibold text-[var(--text)]">
              {formatStatus(
                application.availabilityStatus
              )}
            </dd>
          </div>
        </dl>

        {canEditApplication ? (
          <Link
            href="/delivery-partner/register"
            className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 bg-[var(--brand-blue)] px-6 text-center font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--brand-blue-dark)]"
          >
            <Truck
              aria-hidden="true"
              className="h-5 w-5"
              strokeWidth={1.8}
            />

            Continue Registration
          </Link>
        ) : isUnderReview ? (
          <div className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 bg-neutral-400 px-6 text-center font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
            <ClipboardList
              aria-hidden="true"
              className="h-5 w-5"
              strokeWidth={1.8}
            />

            Application Under Review
          </div>
        ) : application.applicationStatus ===
          "approved" ? (
          <div className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 bg-[var(--success)] px-6 text-center font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
            <CheckCircle2
              aria-hidden="true"
              className="h-5 w-5"
              strokeWidth={1.8}
            />

            Application Approved
          </div>
        ) : (
          <div className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 bg-neutral-400 px-6 text-center font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
            <ClipboardList
              aria-hidden="true"
              className="h-5 w-5"
              strokeWidth={1.8}
            />

            {formatStatus(
              application.applicationStatus
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-4 flex items-start gap-3 border-l-4 border-[var(--sale)] bg-red-50 p-4 text-[var(--sale)]"
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

      <button
        type="button"
        disabled={isPending}
        onClick={
          handleStartApplication
        }
        className="flex min-h-14 w-full items-center justify-center gap-3 bg-[var(--brand-blue)] px-6 text-center font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--brand-blue-dark)] disabled:cursor-not-allowed disabled:bg-neutral-400"
      >
        {isPending ? (
          <LoaderCircle
            aria-hidden="true"
            className="h-5 w-5 animate-spin"
            strokeWidth={1.8}
          />
        ) : (
          <Truck
            aria-hidden="true"
            className="h-5 w-5"
            strokeWidth={1.8}
          />
        )}

        {isPending
          ? "Starting Application..."
          : "Start Delivery Partner Application"}
      </button>
    </div>
  );
}
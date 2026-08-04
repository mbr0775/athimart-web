"use client";

import {
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Send,
  ShieldCheck,
} from "lucide-react";

import {
  submitDeliveryPartnerApplication,
  type SubmittedDeliveryPartnerApplication,
} from "@/app/(store)/delivery-partner/register/submit-actions";

interface SubmitApplicationPanelProps {
  disabled?: boolean;
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

export default function SubmitApplicationPanel({
  disabled = false,
}: Readonly<SubmitApplicationPanelProps>) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    confirmationAccepted,
    setConfirmationAccepted,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    submittedApplication,
    setSubmittedApplication,
  ] =
    useState<SubmittedDeliveryPartnerApplication | null>(
      null
    );

  function handleSubmitApplication() {
    if (
      disabled ||
      isPending ||
      !confirmationAccepted
    ) {
      return;
    }

    setErrorMessage("");
    setSubmittedApplication(null);

    startTransition(async () => {
      const result =
        await submitDeliveryPartnerApplication();

      if (!result.success) {
        if (
          result.code ===
          "UNAUTHENTICATED"
        ) {
          window.location.assign(
            `/auth/login?next=${encodeURIComponent(
              "/delivery-partner/register/documents"
            )}`
          );

          return;
        }

        setErrorMessage(
          result.message
        );

        return;
      }

      setSubmittedApplication(
        result.application
      );

      /*
       * Replace the private editable route with
       * the delivery-partner status page.
       */
      router.replace(
        "/delivery-partner"
      );

      router.refresh();
    });
  }

  return (
    <section className="border border-[var(--border)] bg-[var(--brand-blue)] p-5 text-white sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div>
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-white/10 text-[var(--brand-orange-light)]">
              <Send
                aria-hidden="true"
                className="h-6 w-6"
                strokeWidth={1.8}
              />
            </span>

            <div>
              <p className="font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-orange-light)]">
                Final registration stage
              </p>

              <h2 className="mt-2 font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.04em] sm:text-4xl">
                Submit for Review
              </h2>

              <p className="mt-4 max-w-2xl font-[var(--font-body)] text-sm leading-7 text-white/75">
                AthiMart will validate your personal
                details, vehicle information,
                consents and required private
                documents before moving the
                application to administrator review.
              </p>
            </div>
          </div>

          <div className="mt-7 grid border-l border-t border-white/20 sm:grid-cols-2">
            <div className="border-b border-r border-white/20 p-4">
              <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.15em] text-white/60">
                After submission
              </p>

              <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-white/85">
                Your application and selected vehicle
                will move to Pending status.
              </p>
            </div>

            <div className="border-b border-r border-white/20 p-4">
              <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.15em] text-white/60">
                Editing
              </p>

              <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-white/85">
                Draft information cannot be changed
                while the application is under
                review.
              </p>
            </div>

            <div className="border-b border-r border-white/20 p-4">
              <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.15em] text-white/60">
                Driver availability
              </p>

              <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-white/85">
                Your delivery availability remains
                Offline until approval.
              </p>
            </div>

            <div className="border-b border-r border-white/20 p-4">
              <p className="font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.15em] text-white/60">
                Approval
              </p>

              <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-white/85">
                Submission does not automatically
                approve you as a delivery partner.
              </p>
            </div>
          </div>
        </div>

        <div className="border border-white/20 bg-white p-5 text-[var(--text)] sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck
              aria-hidden="true"
              className="mt-0.5 h-6 w-6 shrink-0 text-[var(--success)]"
              strokeWidth={1.8}
            />

            <div>
              <p className="font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.12em]">
                Applicant Declaration
              </p>

              <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                Review your information and uploaded
                documents carefully before submitting.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="mt-5 flex items-start gap-3 border-l-4 border-[var(--sale)] bg-red-50 p-4 text-[var(--sale)]"
            >
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0"
                strokeWidth={1.8}
              />

              <p className="font-[var(--font-body)] text-xs leading-6">
                {errorMessage}
              </p>
            </div>
          )}

          {submittedApplication && (
            <div
              role="status"
              aria-live="polite"
              className="mt-5 flex items-start gap-3 border-l-4 border-[var(--success)] bg-green-50 p-4"
            >
              <CheckCircle2
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]"
                strokeWidth={1.8}
              />

              <div>
                <p className="font-[var(--font-body)] text-xs font-semibold text-[var(--success)]">
                  Application submitted successfully
                </p>

                <p className="mt-1 font-[var(--font-body)] text-[10px] leading-5 text-[var(--text-muted)]">
                  Status:{" "}
                  {formatStatus(
                    submittedApplication.applicationStatus
                  )}
                </p>
              </div>
            </div>
          )}

          <label className="mt-6 flex cursor-pointer items-start gap-3 border border-[var(--border)] p-4">
            <input
              type="checkbox"
              checked={
                confirmationAccepted
              }
              disabled={
                disabled ||
                isPending
              }
              onChange={(event) => {
                setConfirmationAccepted(
                  event.target.checked
                );

                setErrorMessage("");
              }}
              className="mt-1 h-4 w-4 accent-[var(--brand-blue)] focus:!outline-none focus-visible:!outline-none"
            />

            <span className="font-[var(--font-body)] text-xs leading-6 text-[var(--text-soft)]">
              I confirm that the information and
              documents provided are accurate,
              current and submitted with permission.
              I understand that false or misleading
              information may result in rejection or
              suspension.
            </span>
          </label>

          <button
            type="button"
            disabled={
              disabled ||
              isPending ||
              !confirmationAccepted
            }
            onClick={
              handleSubmitApplication
            }
            className="mt-5 flex min-h-14 w-full items-center justify-center gap-3 bg-[var(--brand-orange)] px-6 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--brand-orange-dark)] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600"
          >
            {isPending ? (
              <LoaderCircle
                aria-hidden="true"
                className="h-5 w-5 animate-spin"
                strokeWidth={1.8}
              />
            ) : (
              <Send
                aria-hidden="true"
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            )}

            {isPending
              ? "Validating and Submitting..."
              : "Submit Application for Review"}
          </button>

          {disabled && (
            <p className="mt-3 text-center font-[var(--font-body)] text-[10px] leading-5 text-[var(--sale)]">
              Complete the required registration
              information before submitting.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
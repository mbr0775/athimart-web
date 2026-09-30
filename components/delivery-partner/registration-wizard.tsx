"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";

type RegistrationStep = 1 | 2 | 3;

interface RegistrationWizardProps {
  currentStatus: string;
  initialCompletedStep: RegistrationStep | 0;
  personalForm: ReactNode;
  vehicleForm: ReactNode;
}

const steps = [
  {
    id: 1 as const,
    label: "Personal Info",
    icon: UserRound,
  },
  {
    id: 2 as const,
    label: "Vehicle Details",
    icon: Truck,
  },
  {
    id: 3 as const,
    label: "Documents & Area",
    icon: FileText,
  },
];

function getFirstIncompleteStep(
  completedStep: RegistrationStep | 0
): RegistrationStep {
  return completedStep === 2
    ? 3
    : (completedStep + 1) as RegistrationStep;
}

export default function RegistrationWizard({
  currentStatus,
  initialCompletedStep,
  personalForm,
  vehicleForm,
}: Readonly<RegistrationWizardProps>) {
  const [activeStep, setActiveStep] =
    useState<RegistrationStep>(() =>
      getFirstIncompleteStep(
        initialCompletedStep
      )
    );
  const [completedStep, setCompletedStep] =
    useState<RegistrationStep | 0>(
      initialCompletedStep
    );

  useEffect(() => {
    function advanceToVehicle() {
      setCompletedStep(1);
      setActiveStep(2);
      requestAnimationFrame(() =>
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      );
    }

    function advanceToDocuments() {
      setCompletedStep(2);
      setActiveStep(3);
      requestAnimationFrame(() =>
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      );
    }

    window.addEventListener(
      "athimart:delivery-personal-saved",
      advanceToVehicle
    );
    window.addEventListener(
      "athimart:delivery-vehicle-saved",
      advanceToDocuments
    );

    return () => {
      window.removeEventListener(
        "athimart:delivery-personal-saved",
        advanceToVehicle
      );
      window.removeEventListener(
        "athimart:delivery-vehicle-saved",
        advanceToDocuments
      );
    };
  }, []);

  const activeStepDetail =
    activeStep === 1
      ? {
          eyebrow: "Step 1 of 3",
          title: "Personal and licence details",
          description:
            "Confirm your personal identity, licence and service-area details before continuing.",
        }
      : activeStep === 2
        ? {
            eyebrow: "Step 2 of 3",
            title: "Delivery vehicle details",
            description:
              "Save the vehicle you plan to use for AthiMart deliveries.",
          }
        : {
            eyebrow: "Step 3 of 3",
            title: "Documents and final review",
            description:
              "Upload the required private documents, then submit your application for review.",
          };

  return (
    <section
      aria-label="Delivery partner registration steps"
      className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#dbe4f2] bg-white shadow-[0_24px_70px_rgba(18,63,158,0.16)]"
    >
      <header className="flex items-start justify-between gap-5 bg-[linear-gradient(135deg,#123f9e_0%,#246be0_100%)] px-6 py-6 text-white sm:px-9">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-orange)]">
            <Truck
              aria-hidden="true"
              className="h-6 w-6"
              strokeWidth={1.9}
            />
          </span>

          <div>
            <p className="font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
              AthiMart logistics network
            </p>

            <h1 className="mt-1 font-[var(--font-body)] text-xl font-bold tracking-[-0.03em] sm:text-2xl">
              Delivery Registration Details
            </h1>

            <p className="mt-1 font-[var(--font-body)] text-xs text-white/75">
              Application status: {currentStatus}
            </p>
          </div>
        </div>

        <Link
          href="/delivery-partner"
          aria-label="Close delivery registration"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X
            aria-hidden="true"
            className="h-5 w-5"
            strokeWidth={1.8}
          />
        </Link>
      </header>

      <nav
        aria-label="Registration progress"
        className="grid grid-cols-3 border-b border-[#e3e9f3] bg-[#f7f9fd]"
      >
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          const isComplete = completedStep >= step.id;
          const isAvailable =
            step.id <= completedStep + 1;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isAvailable}
              aria-current={isActive ? "step" : undefined}
              onClick={() => setActiveStep(step.id)}
              className={`flex min-h-14 items-center justify-center gap-2 border-b-2 px-2 font-[var(--font-body)] text-[11px] font-semibold transition-colors sm:text-xs ${
                isActive
                  ? "border-[var(--brand-blue)] text-[var(--brand-blue)]"
                  : isComplete
                    ? "border-transparent text-[var(--success)] hover:bg-white"
                    : "border-transparent text-[#8da0bf] disabled:cursor-not-allowed"
              }`}
            >
              {isComplete && !isActive ? (
                <Check
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={2.2}
                />
              ) : (
                <Icon
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={1.9}
                />
              )}

              <span className="hidden sm:inline">
                {step.id}. {step.label}
              </span>

              <span className="sm:hidden">
                {step.id}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-7 sm:px-9 sm:py-9">
        <div className="border-b border-[#e6ebf3] pb-6">
          <p className="athimart-label text-[var(--brand-orange-dark)]">
            {activeStepDetail.eyebrow}
          </p>

          <h2 className="mt-2 font-[var(--font-body)] text-2xl font-bold tracking-[-0.03em] text-[#10284f] sm:text-3xl">
            {activeStepDetail.title}
          </h2>

          <p className="mt-2 max-w-2xl font-[var(--font-body)] text-sm leading-6 text-[#687b99]">
            {activeStepDetail.description}
          </p>
        </div>

        <div className="pt-7">
          {activeStep === 1 && personalForm}
          {activeStep === 2 && vehicleForm}

          {activeStep === 3 && (
            <div className="rounded-2xl border border-[#dbe4f2] bg-[#f8faff] p-6 sm:p-8">
              <FileText
                aria-hidden="true"
                className="h-8 w-8 text-[var(--brand-blue)]"
                strokeWidth={1.7}
              />

              <h3 className="mt-5 font-[var(--font-body)] text-xl font-bold text-[#10284f]">
                Complete your document checks
              </h3>

              <p className="mt-3 max-w-2xl font-[var(--font-body)] text-sm leading-7 text-[#687b99]">
                Your personal and vehicle information is saved. Continue to
                upload your identity, driving-licence and vehicle documents,
                then review and submit the application.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#cfd9e8] bg-white px-5 font-[var(--font-body)] text-xs font-semibold text-[#24436f] transition-colors hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
                >
                  <ArrowLeft
                    aria-hidden="true"
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />

                  Back to vehicle
                </button>

                <Link
                  href="/delivery-partner/register/documents"
                  className="inline-flex min-h-12 items-center justify-center gap-2 bg-[var(--brand-blue)] px-6 font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.12em] !text-white transition-colors hover:bg-[var(--brand-blue-dark)]"
                >
                  Continue to documents

                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

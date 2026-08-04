// app/(store)/delivery-partner/page.tsx

import type { Metadata } from "next";
import {
  Bike,
  Car,
  CheckCircle2,
  Clock3,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
  UsersRound,
} from "lucide-react";

import StartApplicationButton from "@/components/delivery-partner/start-application-button";
import { createClient } from "@/lib/supabase/server";
import type { DeliveryPartnerApplicationSummary } from "@/app/(store)/delivery-partner/actions";

/*
 * The page may display information belonging to
 * the currently authenticated user.
 */
export const dynamic =
  "force-dynamic";

export const metadata: Metadata = {
  title:
    "Become an AthiMart Delivery Partner",

  description:
    "Register your interest to become an AthiMart Individual Delivery Partner in Sri Lanka. Use an approved motorcycle, three-wheeler, car, van or lorry to complete local doorstep deliveries.",

  alternates: {
    canonical:
      "/delivery-partner",
  },

  openGraph: {
    type: "website",

    title:
      "Become an AthiMart Delivery Partner",

    description:
      "Join AthiMart as an approved individual delivery partner and complete suitable local deliveries using your registered vehicle.",

    url:
      "/delivery-partner",
  },

  robots: {
    index: true,
    follow: true,
  },
};

interface DeliveryApplicationRow {
  user_id: string;
  application_status: string;
  availability_status: string;
  created_at: string;
  updated_at: string;
}

async function getCurrentApplication(): Promise<DeliveryPartnerApplicationSummary | null> {
  const supabase =
    await createClient();

  /*
   * This page remains publicly accessible.
   * Authentication is checked only to display
   * the signed-in user's existing application.
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
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "delivery_partner_profiles"
    )
    .select(
      `
        user_id,
        application_status,
        availability_status,
        created_at,
        updated_at
      `
    )
    .eq(
      "user_id",
      user.id
    )
    .maybeSingle<DeliveryApplicationRow>();

  if (error) {
    console.error(
      "Reading delivery partner application failed:",
      {
        userId:
          user.id,

        code:
          error.code,

        message:
          error.message,

        details:
          error.details,

        hint:
          error.hint,
      }
    );

    return null;
  }

  if (!data) {
    return null;
  }

  return {
    created: false,

    userId:
      data.user_id,

    applicationStatus:
      data.application_status,

    availabilityStatus:
      data.availability_status,

    createdAt:
      data.created_at,

    updatedAt:
      data.updated_at,
  };
}

const eligibilityItems = [
  "An active AthiMart customer account",
  "Valid identity documentation",
  "A valid driving licence for the registered vehicle",
  "A suitable and legally registered vehicle",
  "A smartphone capable of location sharing",
  "Availability within an approved delivery service area",
];

const processItems = [
  {
    title:
      "Register",

    description:
      "Create your delivery-partner application and provide the required personal details.",
  },

  {
    title:
      "Verify",

    description:
      "Submit identity, driving-licence and vehicle documents for administrator review.",
  },

  {
    title:
      "Get Approved",

    description:
      "AthiMart reviews your eligibility, vehicle capacity and approved service areas.",
  },

  {
    title:
      "Go Online",

    description:
      "Approved partners can share availability and receive suitable nearby delivery offers.",
  },

  {
    title:
      "Accept and Deliver",

    description:
      "Accept an assignment, collect the parcel and complete secure doorstep delivery.",
  },
];

const vehicleItems = [
  {
    name:
      "Motorcycle",

    description:
      "Suitable for food, documents and smaller parcels.",

    icon:
      Bike,
  },

  {
    name:
      "Three-Wheeler or Car",

    description:
      "Suitable for medium orders and protected local deliveries.",

    icon:
      Car,
  },

  {
    name:
      "Van",

    description:
      "Suitable for larger orders, multiple parcels and closed cargo.",

    icon:
      Truck,
  },

  {
    name:
      "Lorry or Approved Heavy Vehicle",

    description:
      "Suitable for bulk deliveries and high-capacity assignments.",

    icon:
      Truck,
  },
];

export default async function DeliveryPartnerPage() {
  const initialApplication =
    await getCurrentApplication();

  return (
    <main>
      {/* Hero */}
      <section className="border-b border-[var(--border)] bg-[var(--brand-blue)] text-white">
        <div className="athimart-container grid gap-10 py-14 sm:py-18 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:py-24">
          <div>
            <p className="font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-orange-light)]">
              AthiMart delivery opportunity
            </p>

            <h1 className="mt-4 max-w-4xl font-[var(--font-display)] text-5xl font-light uppercase leading-[0.96] tracking-[0.03em] sm:text-7xl lg:text-8xl">
              Your Vehicle.
              <br />
              Your Local Area.
              <br />
              A New Opportunity.
            </h1>

            <p className="mt-7 max-w-2xl font-[var(--font-body)] text-sm leading-7 text-white/75 sm:text-base">
              Register your interest to become an
              AthiMart Individual Delivery Partner.
              Approved partners can receive suitable
              doorstep-delivery assignments based on
              their vehicle, carrying capacity,
              service area, availability and location.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-3 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.15em] text-white">
                <MapPin
                  aria-hidden="true"
                  className="h-4 w-4 text-[var(--brand-orange-light)]"
                  strokeWidth={1.8}
                />

                Local service areas
              </span>

              <span className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-3 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.15em] text-white">
                <PackageCheck
                  aria-hidden="true"
                  className="h-4 w-4 text-[var(--brand-orange-light)]"
                  strokeWidth={1.8}
                />

                Suitable assignments
              </span>

              <span className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-3 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.15em] text-white">
                <ShieldCheck
                  aria-hidden="true"
                  className="h-4 w-4 text-[var(--brand-orange-light)]"
                  strokeWidth={1.8}
                />

                Verified partners
              </span>
            </div>
          </div>

          <div className="border border-white/20 bg-white/10 p-5 backdrop-blur-sm sm:p-7">
            <p className="font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-orange-light)]">
              Start here
            </p>

            <h2 className="mt-3 font-[var(--font-display)] text-3xl font-light uppercase tracking-[0.04em] text-white">
              Delivery Partner Registration
            </h2>

            <p className="mt-4 font-[var(--font-body)] text-sm leading-6 text-white/70">
              Start your application now. Detailed
              identity, licence, service-area and
              vehicle information will be completed
              during registration.
            </p>

            <div className="mt-6 text-[var(--text)]">
              <StartApplicationButton
                initialApplication={
                  initialApplication
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* Opportunity summary */}
      <section className="athimart-container py-14 sm:py-18 lg:py-22">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="athimart-label text-[var(--brand-orange-dark)]">
              Individual delivery partners
            </p>

            <h2 className="athimart-display-medium mt-3">
              Who Can Apply?
            </h2>

            <p className="mt-5 font-[var(--font-body)] text-sm leading-7 text-[var(--text-muted)]">
              AthiMart plans to support eligible
              individuals who own or legally use a
              suitable vehicle and can complete
              doorstep deliveries within approved
              locations.
            </p>

            <div className="mt-7 flex items-start gap-4 border-l-4 border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] p-5">
              <UsersRound
                aria-hidden="true"
                className="mt-0.5 h-6 w-6 shrink-0 text-[var(--brand-orange-dark)]"
                strokeWidth={1.7}
              />

              <p className="font-[var(--font-body)] text-sm leading-7 text-[var(--text-soft)]">
                This programme is intended to create
                flexible opportunities, including for
                eligible young people in villages who
                already have a vehicle and smartphone
                but need access to structured delivery
                work.
              </p>
            </div>
          </div>

          <div className="border border-[var(--border)] bg-white p-6 sm:p-8">
            <p className="athimart-label text-[var(--text-muted)]">
              Basic eligibility
            </p>

            <ul className="mt-6 space-y-4">
              {eligibilityItems.map(
                (item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]"
                      strokeWidth={1.8}
                    />

                    <span className="font-[var(--font-body)] text-sm leading-6 text-[var(--text-soft)]">
                      {item}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Vehicles */}
      <section className="border-y border-[var(--border)] bg-white">
        <div className="athimart-container py-14 sm:py-18 lg:py-22">
          <p className="athimart-label text-[var(--brand-orange-dark)]">
            Vehicle-based delivery matching
          </p>

          <div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <h2 className="athimart-display-medium max-w-3xl">
              Different Vehicles for Different Orders
            </h2>

            <p className="max-w-xl font-[var(--font-body)] text-sm leading-7 text-[var(--text-muted)]">
              Assignments will consider parcel size,
              weight, quantity, handling requirements
              and vehicle capacity—not location alone.
            </p>
          </div>

          <div className="mt-9 grid border-l border-t border-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
            {vehicleItems.map(
              ({
                name,
                description,
                icon: Icon,
              }) => (
                <article
                  key={name}
                  className="border-b border-r border-[var(--border)] p-6"
                >
                  <span className="flex h-12 w-12 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
                    <Icon
                      aria-hidden="true"
                      className="h-6 w-6"
                      strokeWidth={1.7}
                    />
                  </span>

                  <h3 className="mt-5 font-[var(--font-display)] text-2xl font-light uppercase tracking-[0.04em]">
                    {name}
                  </h3>

                  <p className="mt-3 font-[var(--font-body)] text-sm leading-6 text-[var(--text-muted)]">
                    {description}
                  </p>
                </article>
              )
            )}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="athimart-container py-14 sm:py-18 lg:py-22">
        <p className="athimart-label text-[var(--brand-orange-dark)]">
          Registration journey
        </p>

        <h2 className="athimart-display-medium mt-3">
          How It Will Work
        </h2>

        <div className="mt-9 grid border-l border-t border-[var(--border)] md:grid-cols-5">
          {processItems.map(
            (
              item,
              index
            ) => (
              <article
                key={item.title}
                className="border-b border-r border-[var(--border)] bg-white p-6"
              >
                <span className="font-[var(--font-display)] text-4xl font-light text-[var(--brand-orange)]">
                  {String(
                    index + 1
                  ).padStart(
                    2,
                    "0"
                  )}
                </span>

                <h3 className="mt-5 font-[var(--font-display)] text-2xl font-light uppercase tracking-[0.04em]">
                  {item.title}
                </h3>

                <p className="mt-3 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                  {
                    item.description
                  }
                </p>
              </article>
            )
          )}
        </div>
      </section>

      {/* Important information */}
      <section className="border-t border-[var(--border)] bg-[var(--brand-blue-soft)]">
        <div className="athimart-container grid gap-8 py-12 md:grid-cols-3">
          <div className="flex items-start gap-4">
            <ShieldCheck
              aria-hidden="true"
              className="mt-0.5 h-6 w-6 shrink-0 text-[var(--brand-blue)]"
              strokeWidth={1.7}
            />

            <div>
              <h2 className="font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.14em]">
                Verification Required
              </h2>

              <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                Registration does not guarantee
                approval. Documents and eligibility
                must be reviewed.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Clock3
              aria-hidden="true"
              className="mt-0.5 h-6 w-6 shrink-0 text-[var(--brand-blue)]"
              strokeWidth={1.7}
            />

            <div>
              <h2 className="font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.14em]">
                Flexible Availability
              </h2>

              <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                Approved drivers will later be able
                to go online or offline according to
                their availability.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MapPin
              aria-hidden="true"
              className="mt-0.5 h-6 w-6 shrink-0 text-[var(--brand-blue)]"
              strokeWidth={1.7}
            />

            <div>
              <h2 className="font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.14em]">
                Location Privacy
              </h2>

              <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
                Live location will be used only for
                approved operational purposes and
                suitable delivery assignment.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
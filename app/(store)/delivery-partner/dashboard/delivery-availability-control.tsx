"use client";

import {
  LoaderCircle,
  LocateFixed,
  MapPin,
  Power,
} from "lucide-react";
import {
  useActionState,
  useRef,
  useState,
} from "react";

import {
  setDeliveryPartnerManualAvailability,
} from "./actions";
import {
  initialDeliveryAvailabilityActionState,
} from "./delivery-availability-state";

type DeliveryPartnerAvailabilityStatus =
  | "offline"
  | "online"
  | "offered"
  | "busy";

type ManualDeliveryAvailabilityStatus =
  | "online"
  | "offline";

interface DeliveryAvailabilityControlProps {
  initialAvailabilityStatus:
    DeliveryPartnerAvailabilityStatus;
}

interface BrowserLocationSummary {
  accuracyMeters: number;
  capturedAt: string;
}

function formatAvailabilityStatus(
  status: DeliveryPartnerAvailabilityStatus
): string {
  return status
    .replace(/[_-]+/g, " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function getAvailabilityDescription(
  status: DeliveryPartnerAvailabilityStatus
): string {
  switch (status) {
    case "online":
      return "You are online and your current location is available for suitable delivery matching.";

    case "offered":
      return "A delivery offer is waiting for your response. Availability is temporarily locked.";

    case "busy":
      return "You have an active delivery. Availability is locked until the delivery is completed.";

    case "offline":
    default:
      return "You are offline and your live location is not being shared.";
  }
}

function getAvailabilityHeading(
  status: DeliveryPartnerAvailabilityStatus
): string {
  switch (status) {
    case "online":
      return "Available for work";

    case "offered":
      return "Offer received";

    case "busy":
      return "Delivery in progress";

    case "offline":
    default:
      return "Currently offline";
  }
}

function getGeolocationErrorCode(
  error: unknown
): number | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "number"
  ) {
    return error.code;
  }

  return null;
}

function getGeolocationErrorMessage(
  error: unknown
): string {
  const errorCode =
    getGeolocationErrorCode(
      error
    );

  switch (errorCode) {
    case 1:
      return "Location permission was denied. Allow location access in your browser before going online.";

    case 2:
      return "Your current location is unavailable. Check your device location settings and try again.";

    case 3:
      return "Getting your location took too long. Check your location settings and try again.";

    default:
      return "We could not get your current location. Check your browser location settings and try again.";
  }
}

function getBrowserPosition(
  options: PositionOptions
): Promise<GeolocationPosition> {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        options
      );
    }
  );
}

async function requestCurrentPosition(): Promise<GeolocationPosition> {
  try {
    /*
     * First try the highest-accuracy location.
     * This normally uses GPS on supported devices.
     */
    return await getBrowserPosition({
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15_000,
    });
  } catch (error) {
    const errorCode =
      getGeolocationErrorCode(
        error
      );

    /*
     * Do not retry after the user denies
     * browser location permission.
     */
    if (errorCode === 1) {
      throw error;
    }

    /*
     * Desktop computers may not have GPS.
     * Retry with Wi-Fi or network location.
     */
    return await getBrowserPosition({
      enableHighAccuracy: false,
      maximumAge: 60_000,
      timeout: 25_000,
    });
  }
}

function setInputValue(
  input: HTMLInputElement | null,
  value: number | string | null
): void {
  if (!input) {
    return;
  }

  input.value =
    value === null
      ? ""
      : String(value);
}

export default function DeliveryAvailabilityControl({
  initialAvailabilityStatus,
}: Readonly<DeliveryAvailabilityControlProps>) {
  const [
    state,
    formAction,
    isPending,
  ] = useActionState(
    setDeliveryPartnerManualAvailability,
    initialDeliveryAvailabilityActionState
  );

  const formRef =
    useRef<HTMLFormElement>(
      null
    );

  const latitudeRef =
    useRef<HTMLInputElement>(
      null
    );

  const longitudeRef =
    useRef<HTMLInputElement>(
      null
    );

  const accuracyRef =
    useRef<HTMLInputElement>(
      null
    );

  const altitudeRef =
    useRef<HTMLInputElement>(
      null
    );

  const speedRef =
    useRef<HTMLInputElement>(
      null
    );

  const headingRef =
    useRef<HTMLInputElement>(
      null
    );

  const batteryRef =
    useRef<HTMLInputElement>(
      null
    );

  const capturedAtRef =
    useRef<HTMLInputElement>(
      null
    );

  const [
    isLocating,
    setIsLocating,
  ] =
    useState(false);

  const [
    locationError,
    setLocationError,
  ] =
    useState("");

  const [
    locationSummary,
    setLocationSummary,
  ] =
    useState<BrowserLocationSummary | null>(
      null
    );

  const currentStatus:
    DeliveryPartnerAvailabilityStatus =
    state.success &&
    state.availabilityStatus
      ? state.availabilityStatus
      : initialAvailabilityStatus;

  const isLocked =
    currentStatus === "offered" ||
    currentStatus === "busy";

  const isOperationallyOnline =
    currentStatus !== "offline";

  const nextStatus:
    ManualDeliveryAvailabilityStatus =
    currentStatus === "offline"
      ? "online"
      : "offline";

  const availabilityLabel =
    formatAvailabilityStatus(
      currentStatus
    );

  const availabilityHeading =
    getAvailabilityHeading(
      currentStatus
    );

  const availabilityDescription =
    getAvailabilityDescription(
      currentStatus
    );

  const actionBusy =
    isPending ||
    isLocating;

  async function handleGoOnline(): Promise<void> {
    setLocationError("");
    setLocationSummary(
      null
    );

    if (
      typeof navigator ===
        "undefined" ||
      !navigator.geolocation
    ) {
      setLocationError(
        "This browser does not support location access. Use a modern browser with location services enabled."
      );

      return;
    }

    /*
     * Browser geolocation requires HTTPS
     * in production. Localhost is permitted
     * during development.
     */
    if (
      !window.isSecureContext &&
      window.location.hostname !==
        "localhost" &&
      window.location.hostname !==
        "127.0.0.1"
    ) {
      setLocationError(
        "Location access requires a secure HTTPS connection."
      );

      return;
    }

    setIsLocating(
      true
    );

    try {
      const position =
        await requestCurrentPosition();

      const {
        latitude,
        longitude,
        accuracy,
        altitude,
        speed,
        heading,
      } =
        position.coords;

      if (
        !Number.isFinite(
          latitude
        ) ||
        !Number.isFinite(
          longitude
        ) ||
        !Number.isFinite(
          accuracy
        )
      ) {
        setLocationError(
          "The browser returned an incomplete location. Please try again."
        );

        return;
      }

      /*
       * The database RPC accepts an accuracy
       * reading of 500 metres or better.
       */
      if (
        accuracy < 0 ||
        accuracy > 500
      ) {
        setLocationError(
          `Your current location accuracy is approximately ${Math.round(
            accuracy
          )} metres. Accuracy must be 500 metres or better before going online.`
        );

        return;
      }

      const altitudeMeters =
        altitude !== null &&
        Number.isFinite(
          altitude
        )
          ? altitude
          : null;

      /*
       * Browser speed is metres per second.
       * The database stores kilometres per hour.
       */
      const speedKph =
        speed !== null &&
        Number.isFinite(
          speed
        )
          ? speed * 3.6
          : null;

      const headingDegrees =
        heading !== null &&
        Number.isFinite(
          heading
        )
          ? heading
          : null;

      const capturedAt =
        new Date(
          position.timestamp
        ).toISOString();

      setInputValue(
        latitudeRef.current,
        latitude
      );

      setInputValue(
        longitudeRef.current,
        longitude
      );

      setInputValue(
        accuracyRef.current,
        accuracy
      );

      setInputValue(
        altitudeRef.current,
        altitudeMeters
      );

      setInputValue(
        speedRef.current,
        speedKph
      );

      setInputValue(
        headingRef.current,
        headingDegrees
      );

      /*
       * Browser battery information is not
       * consistently supported.
       */
      setInputValue(
        batteryRef.current,
        null
      );

      setInputValue(
        capturedAtRef.current,
        capturedAt
      );

      setLocationSummary({
        accuracyMeters:
          accuracy,

        capturedAt,
      });

      /*
       * Submit only after all hidden
       * location fields are populated.
       */
      formRef.current
        ?.requestSubmit();
    } catch (error) {
      setLocationError(
        getGeolocationErrorMessage(
          error
        )
      );
    } finally {
      setIsLocating(
        false
      );
    }
  }

  return (
    <article className="flex h-full flex-col border border-[var(--border)] bg-white p-6 shadow-[0_16px_45px_rgba(17,42,91,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <span
          className={`flex h-12 w-12 items-center justify-center ${
            isOperationallyOnline
              ? "bg-green-50 text-green-700"
              : "bg-neutral-100 text-neutral-500"
          }`}
        >
          <Power
            aria-hidden="true"
            className="h-6 w-6"
            strokeWidth={1.8}
          />
        </span>

        <span
          className={`rounded-full px-3 py-1.5 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.14em] ${
            isOperationallyOnline
              ? "bg-green-50 text-green-700"
              : "bg-neutral-100 text-neutral-600"
          }`}
        >
          {availabilityLabel}
        </span>
      </div>

      <p className="mt-6 athimart-label text-[var(--text-muted)]">
        Current availability
      </p>

      <h2 className="mt-2 font-[var(--font-display)] text-2xl font-light text-[var(--brand-blue-dark)]">
        {availabilityHeading}
      </h2>

      <p className="mt-3 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
        {availabilityDescription}
      </p>

      <form
        ref={formRef}
        action={formAction}
        className="mt-auto pt-5"
      >
        <input
          type="hidden"
          name="availabilityStatus"
          value={nextStatus}
        />

        <input
          ref={latitudeRef}
          type="hidden"
          name="latitude"
          defaultValue=""
        />

        <input
          ref={longitudeRef}
          type="hidden"
          name="longitude"
          defaultValue=""
        />

        <input
          ref={accuracyRef}
          type="hidden"
          name="accuracyMeters"
          defaultValue=""
        />

        <input
          ref={altitudeRef}
          type="hidden"
          name="altitudeMeters"
          defaultValue=""
        />

        <input
          ref={speedRef}
          type="hidden"
          name="speedKph"
          defaultValue=""
        />

        <input
          ref={headingRef}
          type="hidden"
          name="headingDegrees"
          defaultValue=""
        />

        <input
          ref={batteryRef}
          type="hidden"
          name="batteryPercent"
          defaultValue=""
        />

        <input
          ref={capturedAtRef}
          type="hidden"
          name="capturedAt"
          defaultValue=""
        />

        {nextStatus ===
        "online" ? (
          <button
            type="button"
            disabled={
              isLocked ||
              actionBusy
            }
            onClick={
              handleGoOnline
            }
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 bg-[var(--brand-blue)] px-4 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-200 hover:bg-[var(--brand-blue-dark)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionBusy ? (
              <>
                <LoaderCircle
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin"
                  strokeWidth={1.8}
                />

                {isLocating
                  ? "Getting location"
                  : "Going online"}
              </>
            ) : (
              <>
                <LocateFixed
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />

                Go online
              </>
            )}
          </button>
        ) : (
          <button
            type="submit"
            disabled={
              isLocked ||
              actionBusy
            }
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 border border-[var(--brand-orange)] bg-white px-4 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-orange-dark)] transition-all duration-200 hover:bg-[var(--brand-orange-soft)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <>
                <LoaderCircle
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin"
                  strokeWidth={1.8}
                />

                Going offline
              </>
            ) : (
              <>
                <Power
                  aria-hidden="true"
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />

                Go offline
              </>
            )}
          </button>
        )}
      </form>

      {locationSummary &&
        nextStatus ===
          "online" && (
          <div className="mt-4 flex items-start gap-3 border border-blue-100 bg-blue-50 px-4 py-3 text-blue-900">
            <MapPin
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0"
              strokeWidth={1.8}
            />

            <p className="font-[var(--font-body)] text-xs leading-5">
              Location received with
              approximately{" "}
              <strong>
                {Math.round(
                  locationSummary
                    .accuracyMeters
                )}{" "}
                metres
              </strong>{" "}
              accuracy.
            </p>
          </div>
        )}

      {isLocked && (
        <div className="mt-4 border-l-4 border-amber-500 bg-amber-50 px-4 py-3 font-[var(--font-body)] text-xs leading-5 text-amber-900">
          Availability cannot be
          changed while your status is{" "}
          <strong>
            {availabilityLabel}
          </strong>
          .
        </div>
      )}

      {locationError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-4 border-l-4 border-red-600 bg-red-50 px-4 py-3 font-[var(--font-body)] text-xs leading-5 text-red-800"
        >
          {locationError}
        </div>
      )}

      {state.message && (
        <div
          role={
            state.success
              ? "status"
              : "alert"
          }
          aria-live="polite"
          className={`mt-4 border-l-4 px-4 py-3 font-[var(--font-body)] text-xs leading-5 ${
            state.success
              ? "border-green-600 bg-green-50 text-green-800"
              : "border-red-600 bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </div>
      )}
    </article>
  );
}
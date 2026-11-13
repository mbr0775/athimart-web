"use client";

import { useRouter } from "next/navigation";
import { Check, LoaderCircle, MapPin } from "lucide-react";
import type { FormEvent } from "react";
import { deliveryDetailsFromForm } from "@/lib/account/delivery-details";
import { useDeliveryProfileSave } from "@/lib/hooks/use-delivery-profile-save";
import { editorialFont } from "@/lib/fonts";
import type { DeliveryDetails } from "@/types/delivery-details";
import styles from "./delivery-details-form.module.css";

const fields = [
  { name: "shippingName", label: "Full name", autoComplete: "name", required: true, minLength: 2, maxLength: 120 },
  { name: "shippingPhone", label: "Phone number", autoComplete: "tel", required: true, minLength: 7, maxLength: 30, type: "tel" },
  { name: "shippingAddressLine1", label: "Street address", autoComplete: "address-line1", required: true, minLength: 5, maxLength: 200, fullWidth: true },
  { name: "shippingAddressLine2", label: "Apartment, building, or landmark", autoComplete: "address-line2", maxLength: 200, fullWidth: true },
  { name: "shippingCity", label: "City", autoComplete: "address-level2", required: true, minLength: 2, maxLength: 100 },
  { name: "shippingState", label: "Province or district", autoComplete: "address-level1", maxLength: 100 },
  { name: "shippingPostalCode", label: "Postal code", autoComplete: "postal-code", maxLength: 30 },
  { name: "shippingCountry", label: "Country", autoComplete: "country-name", required: true, minLength: 2, maxLength: 100 },
] as const;

export default function DeliveryDetailsForm({ initialDetails }: { initialDetails: DeliveryDetails }) {
  const router = useRouter();
  const { save, status, message } = useDeliveryProfileSave(initialDetails);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "saving") return;
    const result = await save(deliveryDetailsFromForm(new FormData(event.currentTarget)));
    if (result.success) router.refresh();
  }

  return (
    <section id="delivery-details" className={`${styles.panel} ${editorialFont.variable}`} aria-labelledby="saved-delivery-heading">
      <div className={styles.header}><span className={styles.icon}><MapPin size={23} strokeWidth={1.4} aria-hidden="true" /></span><div><p className={styles.eyebrow}>Ready for next time</p><h2 id="saved-delivery-heading">Contact &amp; delivery details</h2></div></div>
      <p className={styles.description}>Manage the details saved to your profile. These are filled in automatically at checkout. Checkout currently supports delivery within Sri Lanka.</p>
      <form onSubmit={handleSubmit} aria-busy={status === "saving"}>
        <fieldset className={styles.fields} disabled={status === "saving"}>
          <legend className="sr-only">Saved contact and delivery details</legend>
          {fields.map((field) => (
            <label key={field.name} htmlFor={`profile-${field.name}`} className={"fullWidth" in field ? styles.fullWidth : undefined}>
              <span>{field.label}{"required" in field ? <span className={styles.required}> *</span> : <span className={styles.optional}> optional</span>}</span>
              <input
                key={initialDetails[field.name]}
                id={`profile-${field.name}`}
                name={field.name}
                type={"type" in field ? field.type : "text"}
                defaultValue={initialDetails[field.name]}
                autoComplete={field.autoComplete}
                required={"required" in field && field.required}
                minLength={"minLength" in field ? field.minLength : undefined}
                maxLength={field.maxLength}
              />
            </label>
          ))}
        </fieldset>
        <div className={styles.footer}><p role="status" data-error={status === "error"}>{message || "Fields marked * are required. Your saved details are linked to your account."}</p><button type="submit" disabled={status === "saving"}>{status === "saving" ? <LoaderCircle size={16} className={styles.spinner} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}{status === "saving" ? "Saving…" : "Save details"}</button></div>
      </form>
    </section>
  );
}

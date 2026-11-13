import "server-only";

import { createClient } from "@/lib/supabase/server";
import { DELIVERY_PROFILE_COLUMNS, deliveryDetailsFromProfile, emptyDeliveryDetails } from "./delivery-details";
import type { DeliveryDetails, DeliveryDetailsResult } from "@/types/delivery-details";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function getSavedDeliveryProfile() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { isSignedIn: false, details: emptyDeliveryDetails(), error: "" };
  const { data, error } = await supabase.from("profiles").select(DELIVERY_PROFILE_COLUMNS).eq("id", user.id).maybeSingle();
  const details = deliveryDetailsFromProfile(data);
  if (!details.shippingName && typeof user.user_metadata?.full_name === "string") details.shippingName = user.user_metadata.full_name;
  // Checkout currently supports Sri Lanka. Keep contact details, but don't
  // silently use a saved overseas address as a Sri Lankan delivery address.
  const checkoutDetails = /^(sri lanka|lk)$/i.test(details.shippingCountry)
    ? { ...details, shippingCountry: "Sri Lanka" }
    : { ...emptyDeliveryDetails(), shippingName: details.shippingName, shippingPhone: details.shippingPhone };
  return { isSignedIn: true, details: checkoutDetails, error: error ? "Your saved details could not be loaded. You can enter them below." : "" };
}

// userId must come from auth.getUser(), never from the submitted form.
export async function persistDeliveryProfile(supabase: SupabaseClient, userId: string, details: DeliveryDetails): Promise<DeliveryDetailsResult> {
  const { data, error } = await supabase.from("profiles").update({
    full_name: details.shippingName,
    phone: details.shippingPhone,
    address_line1: details.shippingAddressLine1,
    address_line2: details.shippingAddressLine2 || null,
    city: details.shippingCity,
    state: details.shippingState || null,
    postal_code: details.shippingPostalCode || null,
    country: details.shippingCountry,
    updated_at: new Date().toISOString(),
  }).eq("id", userId)
    .or("is_blocked.is.null,is_blocked.eq.false")
    .select(DELIVERY_PROFILE_COLUMNS).single();
  if (error || !data) {
    return { success: false, code: "SAVE_ERROR", message: "We couldn't save your details to your profile. Please try again." };
  }
  return { success: true, details: deliveryDetailsFromProfile(data) };
}

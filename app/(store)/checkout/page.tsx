import CheckoutClient from "@/components/checkout/checkout-client";
import { getSavedDeliveryProfile } from "@/lib/account/delivery-profile-service";

export default async function CheckoutPage() {
  const profile = await getSavedDeliveryProfile();
  return <CheckoutClient initialDeliveryDetails={profile.details} isSignedIn={profile.isSignedIn} profileError={profile.error} />;
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateDeliveryDetails } from "@/lib/account/delivery-details";
import { persistDeliveryProfile } from "@/lib/account/delivery-profile-service";
import type { DeliveryDetailsResult } from "@/types/delivery-details";

export async function saveDeliveryDetails(input: unknown): Promise<DeliveryDetailsResult> {
  const validation = validateDeliveryDetails(input);
  if (!validation.valid) return { success: false, code: "VALIDATION_ERROR", message: validation.message };
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { success: false, code: "UNAUTHENTICATED", message: "Sign in to save your contact and delivery details to your profile." };
  const result = await persistDeliveryProfile(supabase, user.id, validation.details);
  if (result.success) {
    revalidatePath("/", "layout");
    revalidatePath("/account");
    revalidatePath("/checkout");
  }
  return result;
}

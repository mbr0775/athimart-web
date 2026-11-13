"use server";

import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { googleAvatarUrl, MAX_AVATAR_UPLOAD_BYTES } from "@/lib/account/profile-identity";
import { persistProfileIdentity, type ProfileSaveResult } from "@/lib/account/save-profile";

export async function saveProfileIdentity(form: FormData): Promise<ProfileSaveResult> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { success: false, message: "Sign in to edit your profile." };
  const name = form.get("fullName");
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 120) return { success: false, message: "Enter a name between 2 and 120 characters." };
  const mode = form.get("photoMode");
  if (!["keep", "upload", "google"].includes(String(mode))) return { success: false, message: "Choose a valid photo option." };

  let photo: { bytes: Uint8Array; filename: string } | { googleUrl: string } | null = null;
  if (mode === "google") {
    const url = googleAvatarUrl(user);
    if (!url) return { success: false, message: "No Google profile photo is available for this account." };
    photo = { googleUrl: url };
  } else if (mode === "upload") {
    const file = form.get("photo");
    if (!(file instanceof File) || !file.size || file.size > MAX_AVATAR_UPLOAD_BYTES || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) return { success: false, message: "Choose a JPG, PNG or WebP profile photo." };
    try {
      const source = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 25_000_000 });
      const metadata = await source.metadata();
      if (!["jpeg", "png", "webp"].includes(metadata.format || "")) throw new Error("Invalid image");
      // Decode, resize and re-encode on the server; discard image metadata.
      const bytes = await source.rotate().resize(512, 512, { fit: "cover" }).webp({ quality: 85 }).toBuffer();
      photo = { bytes, filename: `${randomUUID()}.webp` };
    } catch {
      return { success: false, message: "This image could not be read. Choose another JPG, PNG or WebP photo." };
    }
  }

  try {
    const result = await persistProfileIdentity(supabase, user.id, name.trim(), photo);
    if (result.success) revalidatePath("/", "layout");
    return result;
  } catch {
    return { success: false, message: "Your profile could not be saved. Please try again." };
  }
}

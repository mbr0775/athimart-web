import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AVATAR_BUCKET, ownedAvatarPath } from "./profile-identity";

export type ProfileSaveResult = { success: true } | { success: false; message: string };

export async function persistProfileIdentity(supabase: SupabaseClient, userId: string, name: string, photo: { bytes: Uint8Array; filename: string } | { googleUrl: string } | null): Promise<ProfileSaveResult> {
  const { data: previous, error: readError } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (readError || !previous || previous.is_blocked === true) return { success: false, message: "Your profile cannot be updated. Please sign in again or contact support." };

  let uploadedPath: string | null = null;
  let avatarUrl: string | undefined;
  if (photo && "bytes" in photo) {
    uploadedPath = `${userId}/${photo.filename}`;
    const bucket = supabase.storage.from(AVATAR_BUCKET);
    // A Blob makes Storage use multipart/form-data. Passing the raw Node Buffer
    // leaves it vulnerable to text encoding along the HTTP upload path.
    const uploadBody = new Blob([Uint8Array.from(photo.bytes).buffer], { type: "image/webp" });
    const { error } = await bucket.upload(uploadedPath, uploadBody, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
    if (error) return { success: false, message: "Your photo could not be uploaded. Please try again." };
    // Verify the stored bytes before linking the file to the profile or
    // removing the previous photo. A successful HTTP upload alone is not proof
    // that an image can be displayed.
    let verified = false;
    try {
      const { data: storedFile, error: downloadError } = await bucket.download(uploadedPath);
      if (!downloadError && storedFile) {
        const storedBytes = new Uint8Array(await storedFile.arrayBuffer());
        verified = storedBytes.length === photo.bytes.length
          && storedBytes.every((byte, index) => byte === photo.bytes[index]);
      }
    } catch {
      verified = false;
    }
    if (!verified) {
      await bucket.remove([uploadedPath]).catch(() => {});
      return { success: false, message: "Your photo could not be saved correctly. Please select it again and retry." };
    }
    avatarUrl = bucket.getPublicUrl(uploadedPath).data.publicUrl;
  } else if (photo && "googleUrl" in photo) {
    avatarUrl = photo.googleUrl;
  }

  const { data, error } = await supabase.from("profiles").update({ full_name: name, ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}) })
    .eq("id", userId).or("is_blocked.is.null,is_blocked.eq.false").select("id").single();
  if (error || !data) {
    if (uploadedPath) await supabase.storage.from(AVATAR_BUCKET).remove([uploadedPath]).catch(() => {});
    return { success: false, message: "Your profile could not be saved. Please try again." };
  }

  if (avatarUrl !== undefined && previous.avatar_url !== avatarUrl) {
    const previousPath = ownedAvatarPath(previous.avatar_url, process.env.NEXT_PUBLIC_SUPABASE_URL || "", userId);
    if (previousPath) await supabase.storage.from(AVATAR_BUCKET).remove([previousPath]).catch(() => {});
  }
  return { success: true };
}

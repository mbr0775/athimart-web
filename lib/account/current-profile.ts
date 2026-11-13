import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { profileIdentity } from "./profile-identity";

export const getCurrentProfileIdentity = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  // Selecting all columns also supports existing installations before the avatar
  // column is added. Only the two display fields are passed to the client.
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return profileIdentity(user, data);
});

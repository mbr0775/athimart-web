"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ProfileIdentity } from "@/lib/account/profile-identity";

const ProfileContext = createContext<ProfileIdentity | null>(null);

// The server's verified profile is the source of truth. Profile saves and
// sign-in/out invalidate the root layout, updating every consumer together.
export function ProfileProvider({ identity, children }: { identity: ProfileIdentity | null; children: ReactNode }) {
  return <ProfileContext.Provider value={identity}>{children}</ProfileContext.Provider>;
}

export function useProfileIdentity() {
  return useContext(ProfileContext);
}

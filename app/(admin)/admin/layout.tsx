// app/(admin)/admin/layout.tsx

import type { ReactNode } from "react";

import AdminShell from "@/components/admin/admin-shell";
import { getCurrentAdmin } from "@/lib/auth/admin";

/*
 * The administrator interface depends on the
 * current authenticated Supabase session.
 */
export const dynamic =
  "force-dynamic";

interface AdminLayoutProps {
  children: ReactNode;
}

/*
 * Create a readable administrator display name.
 */
function getAdminDisplayName(
  fullName: unknown,
  email: string
): string {
  if (
    typeof fullName === "string" &&
    fullName.trim()
  ) {
    return fullName.trim();
  }

  const emailName =
    email
      .split("@")[0]
      ?.trim();

  return (
    emailName ||
    "AthiMart Admin"
  );
}

export default async function AdminLayout({
  children,
}: Readonly<AdminLayoutProps>) {
  /*
   * Protect every route below /admin.
   *
   * The existing administrator guard handles:
   * - signed-outLayout({
  children,
}: Readonly<AdminLayoutProps>) {
  /*
   * Protect every route below /admin.
   *
   * users;
   * - non-administrator accounts;
   * - authenticated administrator access.
   */
  const {
    user,
  } = await getCurrentAdmin();

  const email =
    user.email?.trim() ||
    "Admin account";

  const displayName =
    getAdminDisplayName(
      user.user_metadata
        ?.full_name,
      email
    );

  /*
   * Authentication stays on the server.
   * Only serializable account information is
   * passed into the interactive client shell.
   */
  return (
    <AdminShell
      displayName={displayName}
      email={email}
    >
      {children}
    </AdminShell>
  );
}
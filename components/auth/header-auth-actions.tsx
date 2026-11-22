
// components/auth/header-auth-actions.tsx

import {
  LayoutDashboard,
  LogIn,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import Link from "@/components/navigation/navigation-link";

import { createClient } from "@/lib/supabase/server";
import ProfileAvatar from "@/components/account/profile-avatar";
import { profileIdentity } from "@/lib/account/profile-identity";

type AppRole =
  | "customer"
  | "admin";

export async function HeaderAuthActions() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * Signed-out visitor:
   * show clear Sign in and Create account links.
   */
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        {/* Mobile sign-in icon */}
        <Link
          href="/auth/login"
          aria-label="Sign in to AthiMart"
          title="Sign in"
          className="flex h-12 w-12 items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[var(--brand-blue)] transition-all duration-200 hover:border-[var(--brand-blue)] hover:bg-[var(--brand-blue-soft)] lg:hidden"
        >
          <LogIn
            aria-hidden="true"
            className="h-5 w-5"
            strokeWidth={1.8}
          />
        </Link>

        {/* Desktop sign-in button */}
        <Link
          href="/auth/login"
          className="hidden min-h-12 items-center justify-center gap-2 border border-[var(--brand-blue)] bg-[var(--surface)] px-5 font-body text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-blue)] transition-all duration-200 hover:bg-[var(--brand-blue-soft)] lg:inline-flex rounded-full"
        >
          <LogIn
            aria-hidden="true"
            className="h-4 w-4"
            strokeWidth={1.8}
          />

          Sign in
        </Link>

        {/* Desktop sign-up button */}
        <Link
          href="/auth/sign-up"
          className="hidden min-h-12 items-center justify-center gap-2 border border-[var(--brand-orange)] bg-[var(--brand-orange)] px-5 font-body text-[9px] font-semibold uppercase tracking-[0.15em] text-white! shadow-[0_10px_24px_rgba(69,77,54,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:bg-[var(--brand-blue)] lg:inline-flex rounded-full"
        >
          <UserPlus
            aria-hidden="true"
            className="h-4 w-4 text-white!"
            strokeWidth={1.8}
          />

          <span className="text-white!">
            Create account
          </span>
        </Link>
      </div>
    );
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const { name: displayName, avatarUrl } = profileIdentity(user, profile);

  let role: AppRole =
    "customer";

  const {
    data: roleRecord,
  } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    roleRecord?.role === "admin"
  ) {
    role = "admin";
  }

  return (
    <div className="flex items-center gap-2">
      {/* Admin dashboard */}
      {role === "admin" && (
        <>
          {/* Mobile admin icon */}
          <Link
            href="/admin"
            aria-label="Open AthiMart admin dashboard"
            title="Admin dashboard"
            className="flex h-12 w-12 items-center justify-center border border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] text-[var(--brand-orange-dark)] transition-all duration-200 hover:bg-[var(--brand-orange)] hover:text-white lg:hidden"
          >
            <ShieldCheck
              aria-hidden="true"
              className="h-5 w-5"
              strokeWidth={1.8}
            />
          </Link>

          {/* Desktop admin button */}
          <Link
            href="/admin"
            className="hidden min-h-12 items-center justify-center gap-2 border border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] px-4 font-body text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-orange-dark)] transition-all duration-200 hover:bg-[var(--brand-orange)] hover:text-white lg:inline-flex rounded-full"
          >
            <LayoutDashboard
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={1.8}
            />

            Admin
          </Link>
        </>
      )}

      {/* Customer account */}
      <Link
        href="/account"
        aria-label={`Open account for ${displayName}`}
        title={`My account — ${displayName}`}
        className="flex h-12 items-center justify-center gap-3 border border-[var(--brand-blue)] bg-[var(--brand-blue)] px-3 text-white! transition-all duration-200 hover:border-[var(--brand-orange)] hover:bg-[var(--brand-orange)] sm:px-4"
      >
        <ProfileAvatar name={displayName} avatarUrl={avatarUrl} />

        <span className="hidden max-w-28 truncate font-body text-[9px] font-semibold uppercase tracking-[0.13em] text-white! xl:block">
          {displayName}
        </span>
      </Link>
    </div>
  );
}

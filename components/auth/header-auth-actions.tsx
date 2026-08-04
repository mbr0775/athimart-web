
// components/auth/header-auth-actions.tsx

import {
  LayoutDashboard,
  LogIn,
  ShieldCheck,
  UserPlus,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

type AppRole =
  | "customer"
  | "admin";

function getDisplayName(
  fullName: unknown,
  email: string
): string {
  if (
    typeof fullName === "string" &&
    fullName.trim()
  ) {
    return fullName.trim();
  }

  return (
    email.split("@")[0]?.trim() ||
    "Customer"
  );
}

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
          className="flex h-12 w-12 items-center justify-center border border-[var(--border)] bg-white text-[var(--brand-blue)] transition-all duration-200 hover:border-[var(--brand-blue)] hover:bg-[var(--brand-blue-soft)] lg:hidden"
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
          className="hidden min-h-12 items-center justify-center gap-2 border border-[var(--brand-blue)] bg-white px-5 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-blue)] transition-all duration-200 hover:bg-[var(--brand-blue-soft)] lg:inline-flex"
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
          className="hidden min-h-12 items-center justify-center gap-2 border border-[var(--brand-orange)] bg-[var(--brand-orange)] px-5 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.15em] text-white! shadow-[0_10px_24px_rgba(255,121,0,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:bg-[var(--brand-blue)] lg:inline-flex"
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

  const email =
    user.email ?? "";

  const displayName =
    getDisplayName(
      user.user_metadata?.full_name,
      email
    );

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
            className="hidden min-h-12 items-center justify-center gap-2 border border-[var(--brand-orange)] bg-[var(--brand-orange-soft)] px-4 font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-orange-dark)] transition-all duration-200 hover:bg-[var(--brand-orange)] hover:text-white lg:inline-flex"
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
        <UserRound
          aria-hidden="true"
          className="h-5 w-5 text-white!"
          strokeWidth={1.8}
        />

        <span className="hidden max-w-28 truncate font-[var(--font-body)] text-[9px] font-semibold uppercase tracking-[0.13em] text-white! xl:block">
          {displayName}
        </span>
      </Link>
    </div>
  );
}
// app/auth/confirm/route.ts

import type {
  EmailOtpType,
} from "@supabase/supabase-js";
import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { createClient } from "@/lib/supabase/server";

function getPublicOrigin(
  request: NextRequest
): string {
  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    return request.nextUrl.origin;
  }

  const forwardedHost =
    request.headers.get(
      "x-forwarded-host"
    );

  const forwardedProtocol =
    request.headers.get(
      "x-forwarded-proto"
    ) || "https";

  if (forwardedHost) {
    return `${forwardedProtocol}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}

function createRedirect(
  path: string,
  origin: string
) {
  return NextResponse.redirect(
    new URL(path, origin)
  );
}

export async function GET(
  request: NextRequest
) {
  const origin =
    getPublicOrigin(request);

  const tokenHash =
    request.nextUrl.searchParams.get(
      "token_hash"
    );

  const type =
    request.nextUrl.searchParams.get(
      "type"
    ) as EmailOtpType | null;

  if (
    !tokenHash ||
    !type
  ) {
    return createRedirect(
      "/auth/sign-up?error=confirmation-failed",
      origin
    );
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (
    error ||
    !data.user
  ) {
    return createRedirect(
      "/auth/sign-up?error=confirmation-failed",
      origin
    );
  }

  const {
    data: profile,
  } = await supabase
    .from("profiles")
    .select(`
      role,
      seller_approval_status,
      is_blocked
    `)
    .eq(
      "id",
      data.user.id
    )
    .maybeSingle();

  if (
    profile?.is_blocked ===
    true
  ) {
    return createRedirect(
      "/account-blocked",
      origin
    );
  }

  const role =
    profile?.role
      ?.toString()
      .trim() || "";

  const sellerStatus =
    profile
      ?.seller_approval_status
      ?.toString()
      .trim() || "";

  if (role === "admin") {
    return createRedirect(
      "/admin",
      origin
    );
  }

  if (
    sellerStatus ===
      "pending" ||
    sellerStatus ===
      "rejected"
  ) {
    return createRedirect(
      "/seller-pending",
      origin
    );
  }

  if (
    sellerStatus ===
      "approved" &&
    (
      role === "vendor" ||
      role === "seller"
    )
  ) {
    return createRedirect(
      "/seller",
      origin
    );
  }

  return createRedirect(
    "/account",
    origin
  );
}
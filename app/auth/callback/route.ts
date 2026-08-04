// app/auth/callback/route.ts

import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { createClient } from "@/lib/supabase/server";

function getSafeNextPath(
  value: string | null
): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/";
  }

  return value;
}

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

export async function GET(
  request: NextRequest
) {
  const code =
    request.nextUrl.searchParams.get(
      "code"
    );

  const nextPath =
    getSafeNextPath(
      request.nextUrl.searchParams.get(
        "next"
      )
    );

  const publicOrigin =
    getPublicOrigin(request);

  if (code) {
    const supabase =
      await createClient();

    const { error } =
      await supabase.auth
        .exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(
        new URL(
          nextPath,
          publicOrigin
        )
      );
    }
  }

  return NextResponse.redirect(
    new URL(
      "/auth/sign-up?error=confirmation-failed",
      publicOrigin
    )
  );
}
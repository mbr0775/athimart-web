// app/auth/callback/route.ts

import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getSignInDestination, googleSignInError, safeSignInPath } from "@/lib/auth/sign-in";

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
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const nextPath = safeSignInPath(params.get("next"));
  const isGoogleSignIn = params.get("flow") === "google";
  const publicOrigin = getPublicOrigin(request);
  const failurePath = isGoogleSignIn
    ? googleSignInError(params.get("from"), nextPath)
    : "/auth/sign-up?error=confirmation-failed";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      if (!isGoogleSignIn) {
        return NextResponse.redirect(new URL(nextPath, publicOrigin));
      }

      const destination = await getSignInDestination(supabase, data.user.id, nextPath);
      if (destination) {
        return NextResponse.redirect(new URL(destination, publicOrigin));
      }

      await supabase.auth.signOut({ scope: "local" });
    }
  }

  return NextResponse.redirect(new URL(failurePath, publicOrigin));
}

// proxy.ts

import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

/**
 * Refresh the Supabase authentication session
 * before the requested page is processed.
 */
export async function proxy(
  request: NextRequest
) {
  return await updateSession(
    request
  );
}

/**
 * Run the authentication proxy for application
 * routes while skipping static assets and images.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
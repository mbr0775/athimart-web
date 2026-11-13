// app/connection-test/page.tsx

import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

/**
 * Internal AthiMart diagnostic route.
 *
 * This page exists only to verify the connection
 * between the AthiMart website and Supabase.
 *
 * It must never appear in search results,
 * including after public marketplace indexing
 * is enabled.
 */
export const metadata: Metadata = {
  title: "Connection Test",

  description:
    "Internal AthiMart service connection diagnostic.",

  robots: {
    index: false,
    follow: false,
  },
};

/**
 * The result depends on the current Supabase
 * connection and therefore renders on demand.
 */
export const dynamic =
  "force-dynamic";

export default async function ConnectionTestPage() {
  const supabase =
    await createClient();

  const {
    count,
    error,
  } = await supabase
    .from("products")
    .select("id", {
      count: "exact",
      head: true,
    });

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
        <section className="w-full max-w-xl rounded-2xl border border-red-500/30 bg-[var(--surface)] p-8">
          <h1 className="font-editorial text-3xl font-normal text-[var(--sale)]">
            Supabase connection failed
          </h1>

          <p className="mt-4 text-[var(--text-soft)]">
            The website could not access the products table.
          </p>

          <pre className="mt-5 overflow-x-auto rounded-xl bg-[var(--surface-soft)] p-4 text-sm text-red-300">
            {error.message}
          </pre>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
      <section className="w-full max-w-xl rounded-2xl border border-[var(--brand-hover)]/30 bg-[var(--surface)] p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-2xl text-[var(--success)]">
          ✓
        </div>

        <h1 className="mt-5 text-2xl font-bold text-[var(--text)]">
          Supabase connected successfully
        </h1>

        <p className="mt-3 leading-7 text-[var(--text-soft)]">
          The Athimart website is connected to the same Supabase database used
          by the Flutter mobile app.
        </p>

        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
          <p className="text-sm text-[var(--text-soft)]">
            Products found in the shared database
          </p>

          <p className="mt-2 text-4xl font-bold text-[var(--brand-hover)]">
            {count ?? 0}
          </p>
        </div>
      </section>
    </main>
  );
}
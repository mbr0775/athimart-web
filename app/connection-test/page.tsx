import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ConnectionTestPage() {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("products")
    .select("id", {
      count: "exact",
      head: true,
    });

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0A0A0F] p-6">
        <section className="w-full max-w-xl rounded-2xl border border-red-500/30 bg-[#1A1A26] p-8">
          <h1 className="text-2xl font-bold text-red-400">
            Supabase connection failed
          </h1>

          <p className="mt-4 text-[#B0B0C0]">
            The website could not access the products table.
          </p>

          <pre className="mt-5 overflow-x-auto rounded-xl bg-black/40 p-4 text-sm text-red-300">
            {error.message}
          </pre>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0A0F] p-6">
      <section className="w-full max-w-xl rounded-2xl border border-[#D4A017]/30 bg-[#1A1A26] p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-2xl text-green-400">
          ✓
        </div>

        <h1 className="mt-5 text-2xl font-bold text-[#F5F5F5]">
          Supabase connected successfully
        </h1>

        <p className="mt-3 leading-7 text-[#B0B0C0]">
          The Athimart website is connected to the same Supabase database used
          by the Flutter mobile app.
        </p>

        <div className="mt-6 rounded-xl border border-[#2A2A3A] bg-[#12121A] p-5">
          <p className="text-sm text-[#B0B0C0]">
            Products found in the shared database
          </p>

          <p className="mt-2 text-4xl font-bold text-[#D4A017]">
            {count ?? 0}
          </p>
        </div>
      </section>
    </main>
  );
}
import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/account-deletion", label: "Request account deletion" },
];

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#2c3325]">
      <header className="border-b border-[#dcdccc]">
        <div className="mx-auto max-w-3xl px-5 py-4">
          <Link href="/" className="font-serif text-3xl">AthiMart</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10 sm:py-16">
        <article className="space-y-5 text-base leading-7 [&_a]:underline [&_a]:underline-offset-4 [&_h1]:font-serif [&_h1]:text-4xl [&_h1]:leading-tight [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-6 [&_ul]:list-disc">
          {children}
        </article>
        <nav aria-label="Policies" className="mt-12 flex flex-wrap gap-x-5 gap-y-3 border-t border-[#dcdccc] pt-5 text-sm">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} className="underline underline-offset-4">{label}</Link>
          ))}
        </nav>
      </main>
    </div>
  );
}

// app/(store)/layout.tsx

import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

interface StoreLayoutProps {
  children: React.ReactNode;
}

export default function StoreLayout({
  children,
}: Readonly<StoreLayoutProps>) {
  return (
    <>
      <SiteHeader />

      <main
        id="main-content"
        className="min-h-screen pb-28 md:pb-0"
      >
        {children}
      </main>

      <div className="hidden md:block">
        <SiteFooter />
      </div>

      <MobileBottomNav />
    </>
  );
}
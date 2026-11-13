// app/(seller)/seller/layout.tsx

import type { Metadata } from "next";
import type { ReactNode } from "react";
import SellerShell from "@/components/seller/seller-shell";
import { getCurrentSeller } from "@/lib/auth/seller";

/**
 * Every route below /seller is authenticated
 * marketplace-management UI.
 *
 * Seller dashboards and product-management
 * pages must remain outside search results even
 * after public AthiMart indexing is enabled.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface SellerLayoutProps {
  children: ReactNode;
}

export default async function SellerLayout({
  children,
}: Readonly<SellerLayoutProps>) {
  /*
   * Protect every route under /seller.
   *
   * Pending or rejected sellers are redirected
   * to /seller-pending.
   *
   * Normal buyers are redirected to /account.
   *
   * Blocked users are redirected to
   * /account-blocked.
   */
  const { profile } = await getCurrentSeller();

  return (
    <SellerShell
      displayName={profile.fullName || "AthiMart seller"}
      email={profile.email}
    >
      {children}
    </SellerShell>
  );
}

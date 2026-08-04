// app/(store)/checkout/layout.tsx

import type {
  Metadata,
} from "next";
import type {
  ReactNode,
} from "react";

/**
 * Checkout is a private transactional route.
 *
 * Search engines should index AthiMart's public
 * products, categories and market pages instead.
 */
export const metadata: Metadata = {
  title: "Secure Checkout",

  description:
    "Complete your AthiMart order using secure checkout and Cash on Delivery in Sri Lanka.",

  robots: {
    index: false,
    follow: true,
    noarchive: true,

    googleBot: {
      index: false,
      follow: true,
      noarchive: true,
      noimageindex: true,
    },
  },
};

interface CheckoutLayoutProps {
  children: ReactNode;
}

export default function CheckoutLayout({
  children,
}: Readonly<CheckoutLayoutProps>) {
  return children;
}
// app/(store)/cart/layout.tsx

import type {
  Metadata,
} from "next";
import type {
  ReactNode,
} from "react";

/**
 * The cart is a customer utility page.
 *
 * Product and category pages should appear
 * in search engines, but a temporary,
 * customer-specific cart should not.
 */
export const metadata: Metadata = {
  title: "Shopping Cart",

  description:
    "Review the products currently added to your AthiMart shopping cart.",

  robots: {
    index: false,
    follow: true,

    googleBot: {
      index: false,
      follow: true,
    },
  },
};

interface CartLayoutProps {
  children: ReactNode;
}

export default function CartLayout({
  children,
}: Readonly<CartLayoutProps>) {
  return children;
}
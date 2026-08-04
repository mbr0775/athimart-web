// app/layout.tsx

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Oswald, Poppins } from "next/font/google";

import { MotionProvider } from "@/components/providers/motion-provider";
import {
  allowSearchIndexing,
  siteConfig,
} from "@/config/site";

import "./globals.css";

/**
 * Tall editorial headings matching the AthiMart mobile application.
 */
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-oswald",
  display: "swap",
});

/**
 * Body text, navigation, buttons, labels and forms.
 */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

/**
 * Default website metadata.
 *
 * Individual category and product pages will later override:
 * - title
 * - description
 * - canonical URL
 * - Open Graph image
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default: `${siteConfig.name} | Online Marketplace`,
    template: `%s | ${siteConfig.name}`,
  },

  description: siteConfig.description,

  applicationName: siteConfig.name,

  authors: [
    {
      name: siteConfig.creator,
    },
  ],

  creator: siteConfig.creator,
  publisher: siteConfig.name,

  category: "shopping",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_LK",
    url: "/",
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Online Marketplace`,
    description: siteConfig.description,

    images: [
      {
        url: siteConfig.socialImage,
        width: 1200,
        height: 1200,
        alt: `${siteConfig.name} online marketplace`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Online Marketplace`,
    description: siteConfig.description,
    images: [siteConfig.socialImage],
  },

  icons: {
    icon: [
      {
        url: "/favicon.ico",
      },
      {
        url: siteConfig.logo,
        type: "image/png",
      },
    ],

    shortcut: "/favicon.ico",

    apple: [
      {
        url: siteConfig.logo,
        type: "image/png",
      },
    ],
  },

  robots: {
    index: allowSearchIndexing,
    follow: allowSearchIndexing,

    googleBot: {
      index: allowSearchIndexing,
      follow: allowSearchIndexing,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

/**
 * Responsive and mobile-browser settings.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#F2EDE7",
  colorScheme: "light",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html lang="en">
      <body
        className={`${oswald.variable} ${poppins.variable}`}
      >
        <MotionProvider>
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
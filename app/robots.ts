// app/robots.ts

import type { MetadataRoute } from "next";

import {
  allowSearchIndexing,
  siteConfig,
} from "@/config/site";

/**
 * AthiMart robots configuration.
 *
 * While the marketplace is still under development,
 * crawlers are allowed to access pages so they can
 * read the global noindex directives.
 *
 * The sitemap is exposed only when AthiMart is ready
 * for public search-engine indexing.
 */
export default function robots(): MetadataRoute.Robots {
  if (!allowSearchIndexing) {
    return {
      rules: {
        userAgent: "*",
        allow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },

    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
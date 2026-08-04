const developmentUrl = "http://localhost:3000";

const configuredUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

export const siteConfig = {
  name: "AthiMart",

  shortName: "AthiMart",

  tagline:
    "Where Technology Meets Lifestyle, Fitness and Tradition.",

  description:
    "Discover technology products, AI gadgets, fitness technology, fashion, natural essences and digital services through the AthiMart online marketplace.",

  url: configuredUrl || developmentUrl,

  logo: "/brand/athimart-logo.png",

  socialImage: "/brand/athimart-logo.png",

  creator: "Tokilo Technologies",

  markets: ["Sri Lanka", "Maldives"],
} as const;

export const allowSearchIndexing =
  process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
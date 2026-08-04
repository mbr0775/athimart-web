// next.config.ts

import type { NextConfig } from "next";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is missing from .env.local"
  );
}

const supabaseHostname = new URL(
  supabaseUrl
).hostname;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        port: "",
        pathname:
          "/storage/v1/object/public/product-images/**",
      },
    ],

    formats: [
      "image/avif",
      "image/webp",
    ],

    minimumCacheTTL: 60,
  },
};

export default nextConfig;
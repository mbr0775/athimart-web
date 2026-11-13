import type { NextConfig } from "next";
import { productionSiteUrl } from "./config/site";


const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;


if (!supabaseUrl) {

  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is missing from .env.local"
  );

}



const supabaseHostname =
  new URL(supabaseUrl).hostname;





const nextConfig: NextConfig = {

  async redirects() {
    return ["athimart-web.vercel.app", "athimart.com"].map((host) => ({
      source: "/auth/:page(login|sign-up)",
      has: [{ type: "host" as const, value: host.replaceAll(".", "\\.") }],
      destination: `${productionSiteUrl}/auth/:page`,
      permanent: false,
    }));
  },

  outputFileTracingIncludes: {
    "/account": [
      "./node_modules/@img/sharp-linux-x64/**/*",
      "./node_modules/@img/sharp-libvips-linux-x64/**/*",
    ],
  },


  images: {


    remotePatterns: [



      // Supabase product images

      {
        protocol: "https",

        hostname: supabaseHostname,

        port: "",

        pathname:
          "/storage/v1/object/public/product-images/**",
      },




      // Unsplash collection images

      {
        protocol: "https",

        hostname:
          "images.unsplash.com",

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

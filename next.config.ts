import type { NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  basePath: process.env.PAGES_BASE_PATH || "",
  trailingSlash: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  // Static hosts need the same headers; npm start sets them in http-policy.mjs.
  ...(process.env.NODE_ENV === "development"
    ? {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
                { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
                { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
              ],
            },
          ];
        },
      }
    : {}),
};

export default config;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      // Placeholder image host used by mock data. Remove when real assets land.
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
    // Local images — no query strings. To cache-bust a replaced file, rename it
    // (e.g. logo.png → logo-v2.png) rather than appending ?v=N, since Next 16's
    // localPatterns `search` field only matches exact strings, not globs.
    localPatterns: [{ pathname: "/**", search: "" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

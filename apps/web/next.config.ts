import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@fashion-aggregator/contracts", "@fashion-aggregator/domain"],
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
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

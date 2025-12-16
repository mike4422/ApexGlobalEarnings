import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // ✅ required for static export (generates /out)
  images: { unoptimized: true }, // ✅ next/image optimization isn't available with static export
  experimental: {
    optimizePackageImports: ["tailwindcss"],
  },
};

export default nextConfig;

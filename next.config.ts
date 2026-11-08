import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    return [
      { source: "/projects", destination: "/#work", permanent: false },
      { source: "/about", destination: "/#about", permanent: false },
    ];
  },
};

export default nextConfig;

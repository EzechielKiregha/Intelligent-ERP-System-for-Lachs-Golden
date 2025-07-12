import type { NextConfig } from "next";
// import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://github.com/shadcn.png')],
  },
};

export default nextConfig;
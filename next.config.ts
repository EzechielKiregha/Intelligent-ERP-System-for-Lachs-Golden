import type { NextConfig } from "next";
// import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL('https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png'),
      new URL('https://github.com/evilrabbit.png')
    ],
  },
};

export default nextConfig;
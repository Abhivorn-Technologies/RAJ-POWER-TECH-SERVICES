import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cms.microtek.in' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'satyajan.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;

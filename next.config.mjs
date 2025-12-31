/** @type {import('next').NextConfig} */

const IS_PROD = process.env.NODE_ENV === "production";

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'ik.imagekit.io' },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // These apply *only* during production build
  ...(IS_PROD && {
    basePath: "/ccefellow",
    assetPrefix: "/ccefellow",
    output: "standalone",
  }),
};

export default nextConfig;

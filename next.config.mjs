/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // basePath: "/ccefellow",
  // assetPrefix: "/ccefellow",

  // // Needed for server deployment
  // output: "standalone",
};

export default nextConfig;

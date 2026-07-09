/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['applepaygisely.publicsquare.com'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tailwindui.com',
      },
    ],
  },
};

export default nextConfig;

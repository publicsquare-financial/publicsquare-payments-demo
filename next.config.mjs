/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['applepaygisely.publicsquare.com', 'localhost:5090'],
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

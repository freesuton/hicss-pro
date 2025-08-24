/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA({
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const apiBaseUrl = isDevelopment 
      ? 'http://localhost:3000/api/:path*'
      : 'https://api.nenki.network/api/:path*';
    
    return [
      {
        source: '/api/:path*',
        destination: apiBaseUrl,
      },
    ];
  },
  // Add other Next.js config options here if needed
});

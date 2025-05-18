import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    domains: [
      'google.com',
      'example.com',
      'media.istockphoto.com',
      'amybakesbread.com',
      'images.pexels.com',
      'res.cloudinary.com',
      'images.unsplash.com',
    ],
  },
};

export default nextConfig;

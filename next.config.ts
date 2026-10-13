import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      // URL parente des pages communes → liste des zones d'intervention
      { source: '/nettoyage-entreprise', destination: '/zones-intervention', permanent: true },
    ];
  },
};

export default nextConfig;

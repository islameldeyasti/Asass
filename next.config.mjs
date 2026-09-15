import {readFileSync} from 'fs';
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow both localhost and 127.0.0.1 in dev (Next 16 blocks cross-origin /_next by default)
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  images: {
    // Next 16 defaults to qualities: [75] only — other q= values 400 the optimizer
    qualities: [60, 75, 90, 92, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/portraits/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    try {
      const file = path.join(process.cwd(), 'content', 'cms', 'redirects.json');
      const raw = readFileSync(file, 'utf8');
      const doc = JSON.parse(raw);
      const items = Array.isArray(doc?.items) ? doc.items : Array.isArray(doc) ? doc : [];
      return items
        .filter((item) => item && item.active !== false && item.source && item.destination)
        .map((item) => ({
          source: String(item.source).startsWith('/') ? String(item.source) : `/${item.source}`,
          destination: String(item.destination),
          permanent: String(item.type || '301') === '301',
        }));
    } catch {
      return [];
    }
  },
};

export default nextConfig;

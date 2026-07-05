/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Consume the shared workspace package directly (no pre-build step in dev).
  transpilePackages: ['@acm/shared'],
  images: {
    remotePatterns: [
      // Seeded placeholder imagery for Phase 1 mock characters. Replace with the
      // watermarked CDN (S3 / R2) origin in production.
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
    ],
  },
};

export default nextConfig;

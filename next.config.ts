import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Set explicit Turbopack root to avoid multi-lockfile detection warning
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

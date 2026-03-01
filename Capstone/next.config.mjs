/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: ['localhost'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude pino-pretty from server bundle (Vercel fix)
      config.externals.push('pino-pretty');
      
      // Disable node.js modules on client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
      };
    }
    return config;
  },
  // For Next.js 14+ app router (optional but recommended)
  experimental: {
    serverComponentsExternalPackages: ['pino-pretty'],
  },
}

export default nextConfig

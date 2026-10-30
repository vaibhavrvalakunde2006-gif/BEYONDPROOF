/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/dashboard', destination: '/app/dashboard', permanent: false },
      { source: '/upload', destination: '/app/investigations/new', permanent: false },
      { source: '/verification', destination: '/app/history', permanent: false },
      { source: '/admin', destination: '/app/settings', permanent: false },
    ];
  },
};

export default nextConfig;

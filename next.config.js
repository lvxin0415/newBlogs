/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Docker 部署需要
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    // Docker 环境下后端地址
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'http://blog-backend:3001'  // Docker 内部网络
      : 'http://localhost:3001';    // 本地开发
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

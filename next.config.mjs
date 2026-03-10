/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // ❌ [삭제/수정] trailingSlash: true 삭제 (Nginx 라우팅 오류의 주범)
  trailingSlash: false, 

  experimental: {
    turbo: {
      root: '..', 
    },
  },
};

export default nextConfig;
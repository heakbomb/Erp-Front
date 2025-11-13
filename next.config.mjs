/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // [신규] API 프록시 설정을 여기에 추가합니다.
  async rewrites() {
    return [
      {
        source: "/api/:path*", // '/api/'로 시작하는 모든 요청을
        destination: "http://localhost:8080/api/:path*", // 백엔드 서버(8080)로 전달
      },
    ];
  },
};

export default nextConfig;
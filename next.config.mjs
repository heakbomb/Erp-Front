/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ QR 스캐너의 "The operation was aborted" 오류 해결을 위해
  // ✅ 개발 환경의 Strict Mode를 끕니다.
  reactStrictMode: false,

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // ✅ 신규: API 프록시 설정 (백엔드 → localhost:8080)
  async rewrites() {
    return [
      {
        source: "/api/:path*", // 프론트에서 /api/... 로 요청하면
        destination: "http://localhost:8080/api/:path*", // 스프링 부트로 전달
      },
    ];
  },
};

export default nextConfig;

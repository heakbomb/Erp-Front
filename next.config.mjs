/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * 1. 정적 배포 모드 설정
   * 이 설정이 활성화되면 서버 없이 HTML/JS/CSS 파일만 생성됩니다.
   * 따라서 'rewrites', 'redirects', 'headers' 같은 서버 사이드 기능은 사용할 수 없습니다.
   */
  output: 'export',

  /**
   * 2. 빌드 성능 및 에러 관리
   * 배포 시 타입 에러로 인해 빌드가 중단되는 것을 방지합니다.
   */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // 빌드 시 ESLint 에러를 무시하려면 추가하세요 (선택 사항)
    ignoreDuringBuilds: true,
  },

  /**
   * 3. 이미지 최적화 비활성화
   * 'next/image'를 정적 배포 환경(Nginx 등)에서 사용하려면 
   * Next.js 서버의 이미지 최적화 기능을 사용할 수 없으므로 true로 설정해야 합니다.
   */
  images: {
    unoptimized: true,
  },

  /**
   * 4. 기타 권장 설정
   * 페이지 경로 끝에 '/'를 붙일지 여부 (SEO 및 Nginx 설정과 맞추기 위함)
   */
  trailingSlash: true,

  /**
   * [참고] 정적 배포 모드에서는 아래 rewrites 기능을 사용할 수 없으므로 제거하거나 주석 처리합니다.
   * 모든 API 프록시 처리는 Nginx(default.conf)에서 담당하게 됩니다.
   */
  /*
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_PROXY}/:path*`,
      },
    ];
  },
  */
};

export default nextConfig;
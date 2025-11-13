/**
 * next.config.mjs의 rewrites 설정을 사용합니다.
 * 브라우저는 '/api'로 요청을 보내고, Next.js 서버가
 * 백엔드('http://localhost:8080')로 프록시합니다.
 */
export const API_BASE_URL = "http://localhost:8080";

/** 페이지네이션 기본값 */
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_WINDOW = 10;
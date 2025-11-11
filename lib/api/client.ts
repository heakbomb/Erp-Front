import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";
import { extractErrorMessage } from "@/lib/utils";

/**
 * 프로젝트 전역에서 사용할 공용 API 클라이언트
 * next.config.mjs의 rewrites 설정을 사용합니다.
 *
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL, // .env 또는 constants.ts의 '/api'
  timeout: 10000, // 10초 타임아웃
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // CORS 요청 시 쿠키 전송
});

/**
 * 요청 인터셉터
 */
apiClient.interceptors.request.use(
  (config) => {
    // TODO: AuthContext에서 토큰을 가져와 헤더에 설정
    // const token = ...
    // if (token) {
    //   config.headers["Authorization"] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 응답 인터셉터
 */
apiClient.interceptors.response.use(
  (response) => response, // 성공 응답
  (error) => {
    // 401 인증 오류 공통 처리
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.error("401 Unauthorized. 토큰 만료 또는 인증 실패.");
      // TODO: AuthContext의 logout() 호출
      // if (typeof window !== "undefined") window.location.href = "/login";
    }
    
    // 서버 에러 메시지를 Error 객체로 변환
    const friendlyMessage = extractErrorMessage(error);
    return Promise.reject(new Error(friendlyMessage));
  }
);
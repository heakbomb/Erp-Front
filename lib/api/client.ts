import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";
import { extractErrorMessage } from "@/lib/utils";
import { ApiErrorResponse } from "@/lib/types/api"; // ✅ [추가] 타입 임포트

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
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const rawdata = error.response?.data;

      // ✅ 비활성화된 사업장 공통 처리
      const isInactiveStore =
        status === 423 ||
        (status === 403 &&
          (rawdata === "INACTIVE_STORE" ||
            (typeof rawdata === "object" && rawdata !== null && (rawdata as any).code === "INACTIVE_STORE")));

      if (isInactiveStore && typeof window !== "undefined") {
        alert("비활성화된 사업장입니다.\n사업장 관리에서 활성화 후 다시 이용해주세요.");
        // 👉 실제 라우트에 맞게 경로만 조정하면 됨
        window.location.href = "/owner/stores";
      }

      // 401 인증 오류 공통 처리
      if (status === 401) {
        console.error("401 Unauthorized. 토큰 만료 또는 인증 실패.");
        // TODO: AuthContext의 logout() 호출
        // if (typeof window !== "undefined") window.location.href = "/login";
      }

      // ✅ 서버 에러 메시지를 friendlyMessage로 추출
      const friendlyMessage = extractErrorMessage(error);

      // ✅ Error를 새로 만들지 말고, 기존 AxiosError에 메시지만 붙인다.
      (error as any).friendlyMessage = friendlyMessage;

      // ✅ [추가됨] 백엔드 유효성 검사 에러(details)가 있다면 에러 객체에 붙여줌
      //    (컴포넌트에서 error.fieldErrors 로 접근하여 폼 에러 표시에 사용 가능)
      const data = error.response?.data as ApiErrorResponse | undefined;
      if (data?.details) {
        (error as any).fieldErrors = data.details;
      }
    }

    // ✅ 원래 error 그대로 던지기 때문에
    //    err.response.status, err.response.data 등을 프론트에서 그대로 쓸 수 있음
    return Promise.reject(error);
  }
);
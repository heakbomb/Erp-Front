import axios from "axios";
import { API_BASE_URL } from "@/shared/utils/constants"; // ✅ 경로 변경
import { extractErrorMessage } from "@/shared/utils/commonUtils"; // ✅ 경로 변경
import { ApiErrorResponse } from "@/shared/types/api"; // ✅ 경로 변경

// 🔴 비활성화 사업장 안내를 이미 했는지 체크하는 전역 플래그
let inactiveStoreHandled = false;

/**
 * 공용 API 클라이언트
 */
export const apiClient = axios.create({
  baseURL: "/api", // ✅ rewrites 설정 사용
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 쿠키 포함

   validateStatus: (status) => status >= 200 && status < 300,
});

/**
 * 요청 인터셉터
 */
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 응답 인터셉터
 */
apiClient.interceptors.response.use(
  (response) => response, // 성공 응답 그대로 반환
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const raw = error.response?.data;

      /**
       * ===============================
       * 🔥 비활성화된 사업장 처리
       * ===============================
       *
       * 백엔드에서 보내는 형태:
       * status = 423 (LOCKED)
       * body   = "INACTIVE_STORE"
       *
       * 프론트에서는 alert 딱 1번만 띄워야 하고,
       * 이후 다른 API에서 동일 에러가 또 와도 무시해야 함.
       */

      const isInactiveStore =
        status === 423 &&
        (
          raw === "INACTIVE_STORE" ||
          (typeof raw === "object" &&
            raw !== null &&
            (
              (raw as any).code === "INACTIVE_STORE" ||
              (typeof (raw as any).message === "string" &&
                (raw as any).message.includes("INACTIVE_STORE"))
            )
          )
        );

      if (isInactiveStore && typeof window !== "undefined") {
        // 이미 안내를 1번 했으면 더 이상 alert 띄우지 않음
        if (inactiveStoreHandled) {
          // catch 도 실행되지 않도록 Promise 무한 대기 반환
          return new Promise(() => {});
        }

        // 처음 1번만 실행됨
        inactiveStoreHandled = true;

        alert("비활성화된 사업장입니다.\n사업장 관리에서 활성화 후 다시 이용해주세요.");
        window.location.href = "/owner/stores";

        // 에러를 swallow 하기 위해 무한 pending Promise 반환
        return new Promise(() => {});
      }

      /**
       * ===============================
       * 인증 실패(401) 공통 처리
       * ===============================
       */
      if (status === 401) {
        console.error("401 Unauthorized - 로그인 필요 또는 토큰 만료");
      }

      /**
       * ===============================
       * friendlyMessage & fieldErrors
       * ===============================
       */
      const friendlyMessage = extractErrorMessage(error);
      (error as any).friendlyMessage = friendlyMessage;

      const data = error.response?.data as ApiErrorResponse | undefined;
      if (data?.details) {
        (error as any).fieldErrors = data.details;
      }
    }

    // 나머지 에러는 그대로 던짐
    return Promise.reject(error);
  }
);
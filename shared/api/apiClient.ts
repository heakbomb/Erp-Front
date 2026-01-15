import axios from "axios";
import { extractErrorMessage } from "@/shared/utils/commonUtils";
import { ApiErrorResponse } from "@/shared/types/api";

let inactiveStoreHandled = false;

// ✅ refresh 중복 호출 방지(동시 401)
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  validateStatus: (status) => status >= 200 && status < 300,
});

/**
 * ✅ 요청 인터셉터 (Authorization 자동 첨부)
 */
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(ACCESS_KEY);
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

async function tryRefreshToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;

  // 동시성 방지
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      // ✅ 순환 의존 방지: 동적 import
      const { authApi } = await import("@/modules/authC/authApi");

      const res = await authApi.refreshAccessToken(refreshToken);

      if (res?.accessToken) {
        localStorage.setItem(ACCESS_KEY, res.accessToken);

        // rotation이면 refresh도 갱신
        if (res.refreshToken) localStorage.setItem(REFRESH_KEY, res.refreshToken);

        return res.accessToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * 응답 인터셉터
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const raw = error.response?.data;

      const isInactiveStore =
        status === 423 &&
        (raw === "INACTIVE_STORE" ||
          (typeof raw === "object" &&
            raw !== null &&
            ((raw as any).code === "INACTIVE_STORE" ||
              (typeof (raw as any).message === "string" &&
                (raw as any).message.includes("INACTIVE_STORE")))));

      if (isInactiveStore && typeof window !== "undefined") {
        if (inactiveStoreHandled) return new Promise(() => {});
        inactiveStoreHandled = true;

        alert("비활성화된 사업장입니다.\n사업장 관리에서 활성화 후 다시 이용해주세요.");
        window.location.href = "/owner/stores";
        return new Promise(() => {});
      }

      /**
       * ✅ 인증 실패(401) 처리:
       * 1) refreshToken 있으면 accessToken 재발급 시도
       * 2) 성공하면 원 요청을 1회 재시도
       * 3) 실패하면 기존처럼 로그인으로 이동
       */
      if (status === 401 && typeof window !== "undefined") {
        const originalRequest = error.config as any;

        // 무한루프 방지
        if (!originalRequest?._retry) {
          originalRequest._retry = true;

          const newAccessToken = await tryRefreshToken();
          if (newAccessToken) {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          }
        }

        // refresh 실패 or 이미 재시도 실패
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);

        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
          return new Promise(() => {});
        }
      }

      // ✅ 기존 친화 메시지/필드에러 매핑 유지
      const friendlyMessage = extractErrorMessage(error);
      (error as any).friendlyMessage = friendlyMessage;

      const data = error.response?.data as ApiErrorResponse | undefined;
      if (data?.details) (error as any).fieldErrors = data.details;
    }

    return Promise.reject(error);
  }
);
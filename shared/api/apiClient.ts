import axios from "axios";
import { extractErrorMessage } from "@/shared/utils/commonUtils";
import { ApiErrorResponse } from "@/shared/types/api";

let inactiveStoreHandled = false;

// ✅ refresh 중복 호출 방지(동시 401)
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// 🔴 추가: 만료 alert 중복 방지
let sessionExpiredAlerted = false;

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
      const { authApi } = await import("@/modules/authC/authApi");
      const res = await authApi.refreshAccessToken(refreshToken);

      if (res?.accessToken) {
        localStorage.setItem(ACCESS_KEY, res.accessToken);
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
 * ✅ 응답 인터셉터
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
       * 🔴 인증 실패(401) 처리 개선
       * - 사장: refresh 시도 → 실패 시 alert
       * - 직원: 즉시 alert
       */
      if (status === 401 && typeof window !== "undefined") {
        const originalRequest = error.config as any;
        const refreshToken = localStorage.getItem(REFRESH_KEY);

        // 🔴 refreshToken 없는 경우 = 직원
        if (!refreshToken) {
          if (!sessionExpiredAlerted) {
            sessionExpiredAlerted = true;
            alert("로그인이 만료되었습니다.\n다시 로그인해주세요.");
          }

          localStorage.removeItem(ACCESS_KEY);
          localStorage.removeItem(REFRESH_KEY);

          if (!window.location.pathname.startsWith("/login")) {
            window.location.href = "/login";
            return new Promise(() => {});
          }
        }

        // 🔴 사장 refresh 흐름
        if (!originalRequest?._retry) {
          originalRequest._retry = true;

          const newAccessToken = await tryRefreshToken();
          if (newAccessToken) {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          }
        }

        // 🔴 refresh 실패 → 사장도 alert
        if (!sessionExpiredAlerted) {
          sessionExpiredAlerted = true;
          alert("로그인이 만료되었습니다.\n다시 로그인해주세요.");
        }

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
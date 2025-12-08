import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios"; // ✅ 추가: Axios 에러 타입 확인용
import { ApiErrorResponse } from "@/lib/types/api"; // ✅ 추가: 백엔드 에러 타입

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * API 에러 객체에서 사용자에게 보여줄 메시지를 추출합니다.
 * (백엔드 리팩토링 후 JSON 응답 우선 처리)
 */
export function extractErrorMessage(e: any): string {
  // 1. 백엔드 표준 에러 응답 (ApiErrorResponse) 처리
  //    GlobalExceptionHandler에서 보낸 { code, message, details } 형식을 가장 먼저 확인
  if (axios.isAxiosError(e) && e.response?.data) {
    const data = e.response.data as ApiErrorResponse;
    if (data.message) {
      return data.message; 
    }
  }

  // 2. 그 외 레거시/다른 형식의 에러 처리 (기존 로직 유지)
  const data = e?.response?.data;
  if (typeof data === "string") return data; // 문자열 에러
  if (typeof data?.message === "string") return data.message; // 일반 메시지
  if (typeof data?.error === "string") return data.error; // 에러 필드
  if (typeof data?.detail === "string") return data.detail; // 디테일 필드

  // 3. 일반 자바스크립트 에러
  if (e instanceof Error) {
    return e.message;
  }

  return "알 수 없는 오류가 발생했습니다.";
}

/**
 * 숫자를 한국 원화(₩) 형식으로 포맷합니다.
 */
export const formatCurrency = (amount: number | ""): string => {
  const num = Number(amount);
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(num);
};

/**
 * 날짜 문자열(ISO)을 'YYYY-MM-DD' 형식으로 변환합니다.
 */
export const formatDate = (isoString?: string): string => {
  if (!isoString) return "-";
  return isoString.split("T")[0]; // '2024-04-19T10:00:00' -> '2024-04-19'
};

/**
 * Store 상태값을 한글로 변환합니다.
 */
export function formatStoreStatus(status?: string): string {
  switch (status) {
    case "APPROVED": return "승인됨";
    case "PENDING": return "대기";
    case "REJECTED": return "거절됨";
    case "ACTIVE":
    case "OPERATING": return "운영중";
    case "INACTIVE": return "비활성화";
    default: return status ?? "-";
  }
}
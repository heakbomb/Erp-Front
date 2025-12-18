// src/shared/utils/commonUtils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { ApiErrorResponse } from "@/shared/types/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * API 에러 객체에서 사용자에게 보여줄 메시지를 추출합니다.
 */
export function extractErrorMessage(e: any): string {
  // 1. 백엔드 표준 에러 응답 처리
  if (axios.isAxiosError(e) && e.response?.data) {
    const data = e.response.data as ApiErrorResponse;
    if (data.message) {
      return data.message; 
    }
  }

  // 2. 레거시/다른 형식의 에러 처리
  const data = e?.response?.data;
  if (typeof data === "string") return data;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;
  if (typeof data?.detail === "string") return data.detail;

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
  return isoString.split("T")[0];
};

/**
 * [New] 상대적인 시간 표기 (예: '방금 전', '5분 전')
 */
export function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "방금 전";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}일 전`;
  
  // 7일 이상이면 날짜로 표시
  return formatDate(dateString);
}

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
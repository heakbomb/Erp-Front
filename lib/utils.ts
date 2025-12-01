import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

//
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * API 에러 객체에서 사용자에게 보여줄 메시지를 추출합니다.
 *
 */
export function extractErrorMessage(e: any): string {
  const data = e?.response?.data;
  if (typeof data === "string") return data;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;
  if (typeof data?.detail === "string") return data.detail;
  return "알 수 없는 오류가 발생했습니다.";
}

/**
 * 숫자를 한국 원화(₩) 형식으로 포맷합니다.
 *
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
 *
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

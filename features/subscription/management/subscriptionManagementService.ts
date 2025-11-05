// features/subscription/management/subscriptionManagementService.ts
import { apiClient } from "../../../lib/api/client"

// ⭐️ 현재 구독 상태 DTO (예시)
export interface CurrentSubscription {
  ownerSubId: number;
  planId: string; // "basic", "pro" 등
  planName: string;
  price: number;
  nextPaymentDate: string; // "YYYY-MM-DD"
  status: "ACTIVE" | "CANCELED" | "EXPIRED";
}

/**
 * (Owner) 현재 구독 상태 조회
 * GET /owner/subscription/current
 */
export const getCurrentSubscription = async () => {
  const res = await apiClient.get<CurrentSubscription>("/owner/subscription/current");
  
  return res.data;
}

// ⭐️ (참고) 플랜 목록을 API로 가져올 경우
// export const getAvailablePlans = async () => { ... }
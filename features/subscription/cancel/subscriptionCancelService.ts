// features/subscription/cancel/subscriptionCancelService.ts
import { apiClient } from "@/shared/api/apiClient"

interface CancelRequest {
  reason: string;
  feedback?: string;
}

interface CancelResponse {
  success: boolean;
  message: string;
  expiryDate: string; // 취소 후 만료되는 날짜 
}

/**
 * (Owner) 구독 취소 요청
 * ⭐️ 1. POST /owner/subscriptions/cancel (경로 수정)
 */
export const cancelSubscription = async (data: CancelRequest) => {
  // ⭐️ 2. API 경로를 복수형으로 수정 (백엔드에 이 엔드포인트가 필요함)
  const res = await apiClient.post<CancelResponse>("/owner/subscriptions/cancel", data);
  
  // (목업 코드 삭제)

  return res.data;
}
// features/subscription/cancel/subscriptionCancelService.ts
import { apiClient } from "../../../lib/api/client"

// ⭐️ 구독 취소 요청 DTO
interface CancelRequest {
  reason: string;
  feedback?: string;
}

// ⭐️ 구독 취소 응답 DTO (예시)
interface CancelResponse {
  success: boolean;
  message: string;
  expiryDate: string; // 취소 후 만료되는 날짜
}

/**
 * (Owner) 구독 취소 요청
 * POST /owner/subscription/cancel
 */
export const cancelSubscription = async (data: CancelRequest) => {
  // const res = await apiClient.post<CancelResponse>("/owner/subscription/cancel", data);
  // return res.data;

  // (임시) 목업 API 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockResponse: CancelResponse = {
    success: true,
    message: "구독이 정상적으로 취소되었습니다.",
    expiryDate: "2024-05-15",
  };
  return mockResponse;
}
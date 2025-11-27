// features/subscription/checkout/checkoutService.ts
import { apiClient } from "@/lib/api/client";

// 백엔드 OwnerSubscriptionRequest DTO와 일치
interface SubscribeRequest {
  subId: number;
  paymentMethodId?: number; // 기존 카드 ID (선택)
  customerUid?: string;     // 새 카드 빌링키 (선택)
  newCardName?: string;     // 새 카드 별칭 (선택)
}

export const checkoutService = {
  // 구독 신청 (POST /owner/subscriptions)
  subscribe: async (payload: SubscribeRequest) => {
    const { data } = await apiClient.post('/owner/subscriptions', payload);
    return data;
  }
};
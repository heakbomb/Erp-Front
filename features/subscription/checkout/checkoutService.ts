// features/subscription/checkout/checkoutService.ts
import { apiClient } from "../../../lib/api/client"

// ⭐️ 결제 요청 본문 DTO (예시)
interface PaymentRequestBody {
  planId: string;
  cardInfo: {
    cardName: string;
    cardNumber: string;
    cardExpiry: string;
    cardCvc: string;
  };
}

// ⭐️ 결제 응답 DTO (예시)
interface PaymentResponse {
  success: boolean;
  subscriptionId: number;
  message?: string;
}

/**
 * (Owner) 구독 결제 처리
 * POST /owner/subscription/checkout
 */
export const processPayment = async (data: PaymentRequestBody) => {
  const res = await apiClient.post<PaymentResponse>("/owner/subscription/checkout", data);

  return res.data;
}
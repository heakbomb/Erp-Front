// features/subscription/checkout/checkoutService.ts
import { apiClient } from "../../../lib/api/client"

// ⭐️ 1. 백엔드 DTO(OwnerSubscriptionRequest)와 정확히 일치시킵니다.
// (cardInfo 제거)
interface PaymentRequestBody {
  subId: number; 
}

// ⭐️ 2. 응답 DTO (이전과 동일하게 유지)
interface PaymentResponse {
  ownerSubId: number;
  ownerId: number;   
  subId: number;     
  subName: string;   
  startDate: string; 
  expiryDate: string;
}

/**
 * (Owner) 구독 결제 (신규 생성)
 * POST /owner/subscriptions
 */
export const processPayment = async (data: PaymentRequestBody) => { 
  
  // ⭐️ 3. API 호출 시 data 객체에는 { subId: 1 }만 담겨서 전송됩니다.
  const res = await apiClient.post<PaymentResponse>("/owner/subscriptions", data);
  
  return res.data;
}
// features/subscription/payment-method/paymentMethodService.ts
import { apiClient } from "../../../lib/api/client"

// ⭐️ 결제 수단 변경 요청 DTO
interface UpdatePaymentMethodRequest {
    type: "card" | "bank";
    details: object; // 카드 또는 계좌 정보
}

/**
 * (Owner) 결제 수단 변경
 * POST /owner/settings/payment-method
 */
export const updatePaymentMethod = async (data: UpdatePaymentMethodRequest) => {
    // const res = await apiClient.post("/owner/settings/payment-method", data);
    // return res.data;

    // (임시) 목업 API 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
}
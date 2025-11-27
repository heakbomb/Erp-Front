import { apiClient } from "@/lib/api/client";

export const paymentMethodService = {
  // 목록 조회
  getMyCards: async () => {
    const res = await apiClient.get('/owner/payment-methods');
    return res.data;
  },

  // 카드 등록
  registerCard: async (payload: { customerUid: string; cardName: string }) => {
    // ✅ cardName을 받아서 서버로 전송
    const res = await apiClient.post('/owner/payment-methods', payload);
    return res.data;
  },

  // ✅ [추가] 카드 이름 수정
  updateCardName: async (paymentId: number, newName: string) => {
    const res = await apiClient.put(`/owner/payment-methods/${paymentId}`, {
      cardName: newName
    });
    return res.data;
  }
};
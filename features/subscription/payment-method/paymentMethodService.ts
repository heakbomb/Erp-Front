// features/subscription/payment-method/paymentMethodService.ts

import { apiClient } from "@/lib/api/client";

export const paymentMethodService = {
  // 목록 조회
  getMyCards: async () => {
    const res = await apiClient.get('/owner/payment-methods');
    return res.data;
  },

  // 카드 등록
  registerCard: async (payload: { customerUid: string; cardName: string }) => {
    const res = await apiClient.post('/owner/payment-methods', payload);
    return res.data;
  },

  // 이름 수정
  updateCardName: async (paymentId: number, newName: string) => {
    const res = await apiClient.put(`/owner/payment-methods/${paymentId}`, {
      cardName: newName
    });
    return res.data;
  },

  // 카드 삭제
  deleteCard: async (paymentId: number) => {
    const res = await apiClient.delete(`/owner/payment-methods/${paymentId}`);
    return res.data;
  }
};
// modules/subscriptionC/subscriptionApi.ts
import { apiClient } from "@/shared/api/apiClient";
import type { PageResponse } from "@/shared/types/api"; 
import type {
  SubscriptionPlan,
  CurrentSubscription,
  PaymentMethod,
  SubscribeRequest,
  CancelSubscriptionRequest,
  SubscriptionRequest,
  AdminGetSubscriptionsParams,
  AdminGetStatusParams,
  SubscriptionStatus
} from "./subscriptionTypes";

export const subscriptionApi = {
  // ---------------------------------------------
  // [사장님] 구독 관리
  // ---------------------------------------------
  
  // 현재 구독 조회
  getCurrentSubscription: async () => {
    const res = await apiClient.get<CurrentSubscription>("/owner/subscriptions/current");
    return res.data;
  },

  // 이용 가능한 플랜 목록 조회
  getPublicPlans: async () => {
    const res = await apiClient.get<SubscriptionPlan[]>("/owner/subscriptions/products");
    return res.data;
  },

  // 구독 신청
  subscribe: async (data: SubscribeRequest) => {
    const res = await apiClient.post("/owner/subscriptions", data);
    return res.data;
  },

  // 구독 해지
  cancelSubscription: async (ownerSubId: number, body: CancelSubscriptionRequest) => {
    await apiClient.post(`/owner/subscriptions/${ownerSubId}/cancel`, body);
  },

  // ✅ [추가] 구독 해지 취소 (상태 복구)
  undoCancelSubscription: async (ownerSubId: number) => {
    await apiClient.post(`/owner/subscriptions/${ownerSubId}/undo-cancel`);
  },

  // ---------------------------------------------
  // [사장님] 결제 수단 (카드) 관리
  // ---------------------------------------------
  
  getPaymentMethods: async () => {
    const res = await apiClient.get<PaymentMethod[]>("/owner/payment-methods");
    return res.data;
  },

  // 카드 등록 (빌링키)
  addPaymentMethod: async (data: { customerUid: string; cardName: string }) => {
    const res = await apiClient.post<PaymentMethod>("/owner/payment-methods", data);
    return res.data;
  },

  // 카드 이름 수정
  updatePaymentMethodName: async (paymentId: number, cardName: string) => {
    const res = await apiClient.put<PaymentMethod>(`/owner/payment-methods/${paymentId}`, {
      cardName
    });
    return res.data;
  },

  // 카드 삭제
  deletePaymentMethod: async (paymentId: number) => {
    await apiClient.delete(`/owner/payment-methods/${paymentId}`);
  },

  // 기본 카드 설정
  setDefaultPaymentMethod: async (paymentId: number) => {
    await apiClient.patch(`/owner/payment-methods/${paymentId}/default`);
  },

  // ---------------------------------------------
  // [관리자] API
  // ---------------------------------------------
  getAdminPlans: async (params: AdminGetSubscriptionsParams) => {
    const res = await apiClient.get<PageResponse<SubscriptionPlan>>("/admin/subscriptions", { params });
    return res.data;
  },
  createPlan: async (data: SubscriptionRequest) => {
    const res = await apiClient.post<SubscriptionPlan>("/admin/subscriptions", data);
    return res.data;
  },
  updatePlan: async (subId: number, data: SubscriptionRequest) => {
    const res = await apiClient.put<SubscriptionPlan>(`/admin/subscriptions/${subId}`, data);
    return res.data;
  },
  deletePlan: async (subId: number) => {
    await apiClient.delete(`/admin/subscriptions/${subId}`);
  },
  getSubscriptionStatuses: async (params: AdminGetStatusParams) => {
    const res = await apiClient.get<PageResponse<SubscriptionStatus>>("/admin/owner-subscriptions", { params });
    return res.data;
  },
};
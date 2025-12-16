import { apiClient } from "@/shared/api/apiClient";
import type { PageResponse } from "@/shared/types/api";

// --- 1. 구독 '상품' 관련 (기존) ---
export type Subscription = {
  subId: number;
  subName: string;
  monthlyPrice: number;
  isActive: boolean;
};
export type AdminGetSubscriptionsParams = {
  page: number;
  size: number;
  status: string; // "ALL", "ACTIVE", "INACTIVE"
  q: string; // 검색어
};
export type SubscriptionRequest = {
  subName: string;
  monthlyPrice: number;
  isActive: boolean;
};

// --- 2. ✅ [신규] 구독 '현황' 관련 ---
// (AdminOwnerSubscriptionResponse.java DTO)
export type SubscriptionStatus = {
  ownerSubId: number;
  startDate: string; // LocalDate -> string
  expiryDate: string; // LocalDate -> string
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  subId: number;
  subName: string;
};
// (API 요청 파라미터)
export type AdminGetSubscriptionStatusParams = {
  page: number;
  size: number;
  q: string; // 검색어
};

// === 상품 API (기존) ===

export const getSubscriptions = async (params: AdminGetSubscriptionsParams) => {
  const res = await apiClient.get<PageResponse<Subscription>>(
    "/admin/subscriptions",
    { params }
  );
  return res.data;
};
export const createSubscription = async (data: SubscriptionRequest) => {
  const res = await apiClient.post<Subscription>("/admin/subscriptions", data);
  return res.data;
};
export const updateSubscription = async ({ id, data }: { id: number; data: SubscriptionRequest }) => {
  const res = await apiClient.put<Subscription>(`/admin/subscriptions/${id}`, data);
  return res.data;
};
export const deleteSubscription = async (id: number) => {
  const res = await apiClient.delete(`/admin/subscriptions/${id}`);
  return res.data;
};

// === ✅ [신규] 현황 API ===

/**
 * (Admin) 구독 현황 목록 조회 (페이징, 검색)
 * GET /admin/owner-subscriptions
 */
export const getSubscriptionStatus = async (params: AdminGetSubscriptionStatusParams) => {
  const res = await apiClient.get<PageResponse<SubscriptionStatus>>(
    "/admin/owner-subscriptions", // ⭐️ '구독 현황' API 호출
    { params }
  );
  return res.data;
};
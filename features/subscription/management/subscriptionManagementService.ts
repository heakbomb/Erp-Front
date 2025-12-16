import { apiClient } from "@/shared/api/apiClient"

// 백엔드 DTO (OwnerSubscriptionResponse)와 일치시킴
export interface CurrentSubscription {
  ownerSubId: number;
  ownerId: number;
  startDate: string;  // "YYYY-MM-DD"
  expiryDate: string; // "YYYY-MM-DD"
  
  // DB에서 조인하여 가져온 상품 정보
  subId: number;
  subName: string;
  monthlyPrice: number;
  isActive: boolean;
}

// (Owner) 현재 구독 상태 조회
export const getCurrentSubscription = async () => {
  const res = await apiClient.get<CurrentSubscription>("/owner/subscriptions/current");
  return res.data;
}
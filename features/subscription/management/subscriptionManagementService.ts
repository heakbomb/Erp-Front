// features/subscription/management/subscriptionManagementService.ts
import { apiClient } from "../../../lib/api/client"

// ⭐️ 1. (중요) 백엔드 응답 DTO를 실제 엔티티에 맞게 수정합니다.
// (OwnerSubscription + Subscription 조인 결과)
export interface CurrentSubscription {
  ownerSubId: number;
  subId: number;
  ownerId: number;
  startDate: string;  // "YYYY-MM-DD"
  expiryDate: string; // "YYYY-MM-DD"

  // (조인해서 가져와야 하는 정보)
  subName: string;
  monthlyPrice: number;
  isActive: boolean;
  
  // (프론트엔드에서 계산할 상태)
  status?: "ACTIVE" | "EXPIRED"; 
}

/**
 * (Owner) 현재 구독 상태 조회
 * ⭐️ 2. GET /owner/subscriptions/current (백엔드에 이 API가 필요합니다)
 */
export const getCurrentSubscription = async () => {
  // ⭐️ 3. 실제 API 호출을 활성화합니다.
  // (사장 ID 1번의 구독 정보를 가져오는 API)
  const res = await apiClient.get<CurrentSubscription>("/owner/subscriptions/current");
  
  return res.data;
}
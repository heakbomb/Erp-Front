// modules/subscriptionC/subscriptionTypes.ts

/* --- 공통 / 상품 --- */
export interface SubscriptionPlan {
  subId: number;
  subName: string;
  monthlyPrice: number;
  isActive: boolean;
  features?: string[];    // UI 표시용
  description?: string;   // UI 표시용
  popular?: boolean;      // UI 표시용
}

/* --- 사장님용 (User Side) --- */
export interface CurrentSubscription {
  ownerSubId: number;
  ownerId: number;
  startDate: string;  // "YYYY-MM-DD"
  expiryDate: string; // "YYYY-MM-DD"
  
  // 조인된 상품 정보
  subId: number;
  subName: string;
  monthlyPrice: number;
  isActive: boolean;
}

export interface PaymentMethod {
  paymentId: number;
  cardName: string;   // 카드 별칭
  cardNumber: string; // 마스킹된 번호
  isDefault: boolean;
}

// 구독 신청 요청 DTO
export interface SubscribeRequest {
  subId: number;
  paymentMethodId?: number; // 기존 카드 사용 시
  customerUid?: string;     // 새 카드(빌링키) 사용 시
  newCardName?: string;     // 새 카드 별칭
}

// 구독 해지 요청 DTO
export interface CancelSubscriptionRequest {
  reason: string;
  feedback?: string;
}

/* --- 관리자용 (Admin Side) --- */
export interface SubscriptionStatus {
  ownerSubId: number;
  startDate: string;
  expiryDate: string;
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  subId: number;
  subName: string;
}

export interface SubscriptionRequest {
  subName: string;
  monthlyPrice: number;
  isActive: boolean;
}

export interface AdminGetSubscriptionsParams {
  page: number;
  size: number;
  status: string;
  q: string;
}

export interface AdminGetStatusParams {
  page: number;
  size: number;
  q: string;
}
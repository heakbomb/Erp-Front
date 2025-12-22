// modules/settingsC/settingsApi.ts
import { apiClient } from "@/shared/api/apiClient";
import type { 
  ProfileSettings, 
  NotificationSettings, 
  SecuritySettings,
  SubscriptionInfo
} from "./settingsTypes";
// subscriptionC 모듈의 API 재사용
import { subscriptionApi } from "../subscriptionC/subscriptionApi";

export const settingsApi = {
  // 프로필 업데이트 (Mock)
  updateProfile: async (profile: ProfileSettings) => {
    // const res = await apiClient.put(`/owner/settings/profile`, profile);
    return profile; 
  },

  // 알림 설정 업데이트 (Mock)
  updateNotifications: async (notifications: NotificationSettings) => {
    // const res = await apiClient.put(`/owner/settings/notifications`, notifications);
    return notifications;
  },

  // 보안 설정 업데이트 (Mock)
  updateSecurity: async (security: SecuritySettings) => {
    // const res = await apiClient.put(`/owner/settings/security`, security);
    return security;
  },

  // 구독 요약 정보 가져오기 (실제 API 사용)
  fetchSubscriptionInfo: async (): Promise<SubscriptionInfo> => {
    try {
      // 병렬 호출로 성능 최적화
      const [subResult, cardsResult] = await Promise.allSettled([
        subscriptionApi.getCurrentSubscription(),
        subscriptionApi.getPaymentMethods(),
      ]);

      const info: SubscriptionInfo = {
        planName: "구독 정보 없음",
        pricePerMonth: 0,
        nextBillingDate: "-",
        maskedCard: "등록된 카드 없음",
      };

      // 구독 정보 처리
      if (subResult.status === "fulfilled" && subResult.value) {
        const sub = subResult.value;
        info.planName = sub.subName || "무료 플랜";
        info.pricePerMonth = sub.monthlyPrice || 0;
        info.nextBillingDate = sub.expiryDate || "-";
      }

      // 카드 정보 처리 (기본 카드)
      if (cardsResult.status === "fulfilled" && Array.isArray(cardsResult.value) && cardsResult.value.length > 0) {
        const cards = cardsResult.value;
        const defaultCard = cards.find((c) => c.isDefault) || cards[0];
        const name = defaultCard.cardName || "카드";
        const num = defaultCard.cardNumber || "****";
        info.maskedCard = `${name} (${num})`;
      }

      return info;
    } catch (e) {
      console.error("Settings: Failed to load subscription info", e);
      throw e;
    }
  }
};
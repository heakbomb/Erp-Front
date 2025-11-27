// features/owner/settings/hooks/useOwnerSettings.ts
"use client"

import { useState, useEffect } from "react"
import {
  MOCK_OWNER_SETTINGS,
  type ProfileSettings,
  type NotificationSettings,
  type SecuritySettings,
  type SubscriptionInfo,
  updateProfileSettingsApi,
  updateNotificationSettingsApi,
  updateSecuritySettingsApi,
} from "@/features/owner/settings/services/ownerSettingsService"
import { getCurrentSubscription } from "@/features/subscription/management/subscriptionManagementService"
import { paymentMethodService } from "@/features/subscription/payment-method/paymentMethodService"

export default function useOwnerSettings() {
  // 1. 프로필 등 다른 설정은 아직 API가 없다면 기존 MOCK 유지 (또는 AuthContext에서 가져오기)
  const [profile, setProfile] = useState<ProfileSettings>(MOCK_OWNER_SETTINGS.profile)
  const [security, setSecurity] = useState<SecuritySettings>(MOCK_OWNER_SETTINGS.security)
  const [notifications, setNotifications] = useState<NotificationSettings>(MOCK_OWNER_SETTINGS.notifications)

  // 2. 구독 정보 상태 (초기값은 비워두거나 로딩 상태 표시)
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    planName: "로딩 중...",
    pricePerMonth: 0,
    nextBillingDate: "-",
    maskedCard: "-",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ [수정됨] 실제 데이터 불러오기
  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      try {
        // 프로필 등의 로딩은 제외하고, 구독/카드 정보만 백그라운드에서 갱신 느낌으로 처리하거나
        // 전체 로딩을 걸 수도 있습니다. 여기서는 에러 핸들링을 위해 try-catch 사용.
        
        // 1. 구독 정보와 카드 목록을 병렬로 조회
        const [subData, cardsData] = await Promise.allSettled([
          getCurrentSubscription(),
          paymentMethodService.getMyCards(),
        ])

        if (!mounted) return

        // --- 구독 정보 처리 ---
        let newSubInfo: Partial<SubscriptionInfo> = {}

        if (subData.status === "fulfilled" && subData.value) {
          const sub = subData.value
          newSubInfo = {
            planName: sub.subName || "무료 플랜",
            pricePerMonth: sub.monthlyPrice || 0,
            nextBillingDate: sub.expiryDate || "-",
          }
        } else {
          // 구독 정보가 없거나 에러인 경우
          newSubInfo = {
            planName: "구독 정보 없음",
            pricePerMonth: 0,
            nextBillingDate: "-",
          }
        }

        // --- 카드 정보 처리 ---
        if (cardsData.status === "fulfilled" && Array.isArray(cardsData.value)) {
          const defaultCard = cardsData.value.find((c: any) => c.isDefault) || cardsData.value[0]
          if (defaultCard) {
            // 카드명 + 번호 뒷자리 조합
            const cardName = defaultCard.cardName || "신용카드"
            const cardNum = defaultCard.cardNumber || "****"
            newSubInfo.maskedCard = `${cardName} (${cardNum})`
          } else {
            newSubInfo.maskedCard = "등록된 카드 없음"
          }
        } else {
          newSubInfo.maskedCard = "정보 불러오기 실패"
        }

        // 상태 업데이트
        setSubscription((prev) => ({
          ...prev,
          ...newSubInfo,
        }))

      } catch (e: any) {
        console.error("설정 데이터 로드 실패:", e)
        if (mounted) setError("일부 정보를 불러오지 못했습니다.")
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [])

  // ===== 업데이트 핸들러들 (기존 유지) =====
  const updateProfileField = <K extends keyof ProfileSettings>(
    key: K,
    value: ProfileSettings[K],
  ) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const toggleNotification = <K extends keyof NotificationSettings>(
    key: K,
    value: boolean,
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const toggleTwoFactor = (value: boolean) => {
    setSecurity((prev) => ({
      ...prev,
      twoFactorEnabled: value,
    }))
  }

  const saveProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const saved = await updateProfileSettingsApi(profile)
      setProfile(saved)
    } catch (e: any) {
      setError(e?.message ?? "프로필 저장 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const saveNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const saved = await updateNotificationSettingsApi(notifications)
      setNotifications(saved)
    } catch (e: any) {
      setError(e?.message ?? "알림 설정 저장 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const saveSecurity = async () => {
    try {
      setLoading(true)
      setError(null)
      const saved = await updateSecuritySettingsApi(security)
      setSecurity(saved)
    } catch (e: any) {
      setError(e?.message ?? "보안 설정 저장 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    security,
    notifications,
    subscription,
    loading,
    error,
    updateProfileField,
    toggleNotification,
    toggleTwoFactor,
    saveProfile,
    saveNotifications,
    saveSecurity,
  }
}
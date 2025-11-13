// features/owner/settings/hooks/useOwnerSettings.ts
"use client"

import { useState /*, useEffect*/ } from "react"
import {
  MOCK_OWNER_SETTINGS,
  type OwnerSettingsData,
  type ProfileSettings,
  type NotificationSettings,
  type SecuritySettings,
  type SubscriptionInfo,
  // fetchOwnerSettings,
  updateProfileSettingsApi,
  updateNotificationSettingsApi,
  updateSecuritySettingsApi,
} from "@/features/owner/settings/services/ownerSettingsService"

export default function useOwnerSettings() {
  const [profile, setProfile] = useState<ProfileSettings>(
    MOCK_OWNER_SETTINGS.profile,
  )
  const [security, setSecurity] = useState<SecuritySettings>(
    MOCK_OWNER_SETTINGS.security,
  )
  const [notifications, setNotifications] =
    useState<NotificationSettings>(MOCK_OWNER_SETTINGS.notifications)
  const [subscription] = useState<SubscriptionInfo>(
    MOCK_OWNER_SETTINGS.subscription,
  )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 실제 API에서 불러오고 싶을 때는 이 부분만 살리면 됨
  /*
  useEffect(() => {
    let mounted = true

    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const data: OwnerSettingsData = await fetchOwnerSettings()
        if (!mounted) return
        setProfile(data.profile)
        setSecurity(data.security)
        setNotifications(data.notifications)
        setSubscription(data.subscription)
      } catch (e: any) {
        if (mounted) {
          setError(e?.message ?? "설정을 불러오지 못했습니다.")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // run()

    return () => {
      mounted = false
    }
  }, [])
  */

  // ===== 업데이트 핸들러들 =====
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

  // 나중에 실제 API 연결을 위한 더미 액션들
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
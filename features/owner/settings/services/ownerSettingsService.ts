import axios from "axios"

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080"

// ===== Types =====
export type ProfileSettings = {
  name: string
  email: string
  phone: string
}

export type SecuritySettings = {
  twoFactorEnabled: boolean
}

export type NotificationSettings = {
  stockLow: boolean
  employeeRequest: boolean
  aiInsights: boolean
  emailNotification: boolean
}

export type SubscriptionInfo = {
  planName: string
  pricePerMonth: number
  nextBillingDate: string
  maskedCard: string
}

export type OwnerSettingsData = {
  profile: ProfileSettings
  security: SecuritySettings
  notifications: NotificationSettings
  subscription: SubscriptionInfo
}

// ===== Mock Data (현재 page.tsx에 있던 값 그대로 반영) =====
export const MOCK_OWNER_SETTINGS: OwnerSettingsData = {
  profile: {
    name: "김사장",
    email: "kim@example.com",
    phone: "010-1234-5678",
  },
  security: {
    twoFactorEnabled: false,
  },
  notifications: {
    stockLow: true,
    employeeRequest: true,
    aiInsights: true,
    emailNotification: false,
  },
  subscription: {
    planName: "프리미엄 플랜",
    pricePerMonth: 49000,
    nextBillingDate: "2024년 4월 15일",
    maskedCard: "카드 **** 1234",
  },
}

// ===== API Stub (나중에 실제 API 붙일 때 사용) =====
export async function fetchOwnerSettings(): Promise<OwnerSettingsData> {
  // 실제 연동 시:
  // const res = await axios.get<OwnerSettingsData>(`${API_BASE}/api/owner/settings`)
  // return res.data

  // 현재는 목데이터 반환
  return MOCK_OWNER_SETTINGS
}

export async function updateProfileSettingsApi(
  profile: ProfileSettings,
): Promise<ProfileSettings> {
  // TODO: 실제 API 연동
  console.log("updateProfileSettingsApi 호출", profile)
  return profile
}

export async function updateNotificationSettingsApi(
  notifications: NotificationSettings,
): Promise<NotificationSettings> {
  // TODO: 실제 API 연동
  console.log("updateNotificationSettingsApi 호출", notifications)
  return notifications
}

export async function updateSecuritySettingsApi(
  security: SecuritySettings,
): Promise<SecuritySettings> {
  // TODO: 실제 API 연동
  console.log("updateSecuritySettingsApi 호출", security)
  return security
}
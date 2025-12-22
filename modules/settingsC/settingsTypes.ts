// modules/settingsC/settingsTypes.ts

export interface ProfileSettings {
  name: string;
  email: string;
  phone: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
}

export interface NotificationSettings {
  stockLow: boolean;
  employeeRequest: boolean;
  aiInsights: boolean;
  emailNotification: boolean;
}

export interface SubscriptionInfo {
  planName: string;
  pricePerMonth: number;
  nextBillingDate: string;
  maskedCard: string;
}

export interface OwnerSettingsData {
  profile: ProfileSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  subscription: SubscriptionInfo;
}

export const DEFAULT_SETTINGS: OwnerSettingsData = {
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
    planName: "로딩 중...",
    pricePerMonth: 0,
    nextBillingDate: "-",
    maskedCard: "-",
  },
};
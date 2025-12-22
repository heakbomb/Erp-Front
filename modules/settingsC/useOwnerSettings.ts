// modules/settingsC/useOwnerSettings.ts
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { settingsApi } from "./settingsApi";
import { 
  DEFAULT_SETTINGS,
  type ProfileSettings, 
  type NotificationSettings, 
  type SecuritySettings, 
  type SubscriptionInfo 
} from "./settingsTypes";

export function useOwnerSettings() {
  const [profile, setProfile] = useState<ProfileSettings>(DEFAULT_SETTINGS.profile);
  const [security, setSecurity] = useState<SecuritySettings>(DEFAULT_SETTINGS.security);
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_SETTINGS.notifications);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(DEFAULT_SETTINGS.subscription);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      try {
        const subInfo = await settingsApi.fetchSubscriptionInfo();
        if (mounted) {
          setSubscription(subInfo);
        }
      } catch (e) {
        if (mounted) setError("일부 정보를 불러오지 못했습니다.");
      }
    };

    loadData();
    return () => { mounted = false; };
  }, []);

  const updateProfileField = <K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const toggleNotification = <K extends keyof NotificationSettings>(key: K, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const toggleTwoFactor = (value: boolean) => {
    setSecurity(prev => ({ ...prev, twoFactorEnabled: value }));
  };

  const saveProfile = async () => {
    setLoading(true); setError(null);
    try {
      const saved = await settingsApi.updateProfile(profile);
      setProfile(saved);
      toast.success("프로필이 저장되었습니다.");
    } catch (e) {
      setError("프로필 저장 실패");
    } finally {
      setLoading(false);
    }
  };

  const saveNotifications = async () => {
    setLoading(true); setError(null);
    try {
      const saved = await settingsApi.updateNotifications(notifications);
      setNotifications(saved);
      toast.success("알림 설정이 저장되었습니다.");
    } catch (e) {
      setError("알림 설정 저장 실패");
    } finally {
      setLoading(false);
    }
  };

  const saveSecurity = async () => {
    setLoading(true); setError(null);
    try {
      const saved = await settingsApi.updateSecurity(security);
      setSecurity(saved);
      toast.success("보안 설정이 변경되었습니다.");
    } catch (e) {
      setError("보안 설정 저장 실패");
    } finally {
      setLoading(false);
    }
  };

  return {
    profile, security, notifications, subscription,
    loading, error,
    updateProfileField, toggleNotification, toggleTwoFactor,
    saveProfile, saveNotifications, saveSecurity
  };
}
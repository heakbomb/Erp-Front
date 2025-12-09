"use client"

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Zap, Crown, Sparkles } from "lucide-react";
import { getCurrentSubscription } from "../subscriptionManagementService";

// ⭐️ DB의 Subscription ID와 일치시켜야 함 (1: 베이직, 2: 프로, 3: 엔터프라이즈 가정)
export const plans = [
  {
    id: "basic",
    subId: 1, 
    name: "베이직",
    price: 29000,
    icon: Zap,
    description: "소규모 사업장에 적합한 기본 플랜",
    features: ["사업장 1개 등록", "직원 5명까지", "기본 재고 관리", "매출/매입 관리", "월간 리포트", "이메일 지원"],
    popular: false,
  },
  {
    id: "pro",
    subId: 2,
    name: "프로",
    price: 59000,
    icon: Crown,
    description: "성장하는 사업장을 위한 프로 플랜",
    features: [
      "사업장 3개 등록",
      "직원 무제한",
      "고급 재고 관리",
      "매출/매입 관리",
      "AI 수요 예측",
      "가격 최적화",
      "주간 리포트",
      "우선 지원",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    subId: 3,
    name: "엔터프라이즈",
    price: 99000,
    icon: Sparkles,
    description: "대규모 사업장을 위한 프리미엄 플랜",
    features: [
      "사업장 무제한",
      "직원 무제한",
      "모든 프로 기능",
      "맞춤형 AI 분석",
      "전용 계정 매니저",
      "24/7 전화 지원",
      "API 접근",
      "커스텀 통합",
    ],
    popular: false,
  },
]

export function useSubscriptionManagement() {
  const router = useRouter()

  // ⭐️ 백엔드에서 현재 구독 정보 가져오기
  const { 
    data: currentPlanData, 
    isLoading: isCurrentPlanLoading, 
    error: currentPlanError 
  } = useQuery({
    queryKey: ["currentSubscription"],
    queryFn: getCurrentSubscription,
    retry: false, // 404(구독 없음)일 때 계속 재시도하지 않도록 설정
  })

  const handleSelectPlan = (planId: string) => {
    router.push(`/owner/subscription/checkout?plan=${planId}`)
  }

  return {
    currentPlanData,
    isCurrentPlanLoading,
    currentPlanError,
    handleSelectPlan,
  }
}
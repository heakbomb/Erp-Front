// features/subscription/management/hooks/useSubscriptionManagement.ts
"use client"

import { useQuery } from "@tanstack/react-query"; // ⭐️ [FIX]
import { useRouter } from "next/navigation"; // ⭐️ [FIX]
import { Zap, Crown, Sparkles } from "lucide-react"; // ⭐️ [FIX]
import { getCurrentSubscription } from "../subscriptionManagementService"; // ⭐️ [FIX]

// ⭐️ 'subId'가 포함된 'plans' 상수를 정의합니다.
export const plans = [
  {
    id: "basic",
    subId: 1, // ⭐️ DB ID
    name: "베이직",
    price: 29000,
    icon: Zap, // ⭐️
    description: "소규모 사업장에 적합한 기본 플랜",
    features: ["사업장 1개 등록", "직원 5명까지", "기본 재고 관리", "매출/매입 관리", "월간 리포트", "이메일 지원"],
    popular: false,
  },
  {
    id: "pro",
    subId: 2, // ⭐️ DB ID
    name: "프로",
    price: 59000,
    icon: Crown, // ⭐️
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
    subId: 3, // ⭐️ DB ID
    name: "엔터프라이즈",
    price: 99000,
    icon: Sparkles, // ⭐️
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
  const router = useRouter() // ⭐️ [FIX]

  const { 
    data: currentPlanData, 
    isLoading: isCurrentPlanLoading, 
    error: currentPlanError 
  } = useQuery({ // ⭐️ [FIX]
    queryKey: ["currentSubscription"],
    queryFn: getCurrentSubscription, // ⭐️ [FIX]
  })

  // 플랜 선택 핸들러는 'plan.id' (string)를 사용합니다.
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
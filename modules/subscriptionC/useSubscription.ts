// modules/subscriptionC/useSubscription.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { subscriptionApi } from "./subscriptionApi";
import { toast } from "@/shared/ui/use-toast"; // sonner 대신 use-toast 사용 시 변경
import { useAuth } from "@/contexts/AuthContext";
import { Zap, Crown, Sparkles, Package } from "lucide-react"; // 기본 아이콘 Package 추가

// DB의 subName과 매칭될 UI 정보
// 키값을 DB에 저장된 실제 subName과 정확히 일치시켜야 합니다.
export const PLAN_DETAILS: Record<string, any> = {
  "Basic": { // DB에 영어로 저장되어 있다면 영어 키 사용
    icon: Zap,
    description: "소규모 사업장에 적합한 기본 플랜",
    features: ["사업장 1개 등록", "직원 5명까지", "기본 재고 관리", "매출/매입 관리"],
  },
  "Pro": {
    icon: Crown,
    description: "성장하는 사업장을 위한 프로 플랜",
    features: ["사업장 3개 등록", "직원 무제한", "고급 재고 관리", "AI 수요 예측"],
    popular: true,
  },
  "Enterprise": {
    icon: Sparkles,
    description: "대규모 사업장을 위한 프리미엄 플랜",
    features: ["사업장 무제한", "직원 무제한", "모든 프로 기능", "전용 계정 매니저"],
  },
  // 한글 호환용 (DB가 한글일 경우)
  "베이직": {
    icon: Zap,
    description: "소규모 사업장에 적합한 기본 플랜",
    features: ["사업장 1개 등록", "직원 5명까지", "기본 재고 관리", "매출/매입 관리"],
  },
  "프로": {
    icon: Crown,
    description: "성장하는 사업장을 위한 프로 플랜",
    features: ["사업장 3개 등록", "직원 무제한", "고급 재고 관리", "AI 수요 예측"],
    popular: true,
  },
  "엔터프라이즈": {
    icon: Sparkles,
    description: "대규모 사업장을 위한 프리미엄 플랜",
    features: ["사업장 무제한", "직원 무제한", "모든 프로 기능", "전용 계정 매니저"],
  }
};

export function useSubscription() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = user?.role === 'OWNER' || true;

  // 현재 구독 조회
  const { data: currentSubscription, isLoading: isSubscriptionLoading } = useQuery({
    queryKey: ["currentSubscription", user?.owner_id],
    queryFn: subscriptionApi.getCurrentSubscription,
    enabled: isOwner,
    retry: false, 
  });

  // 이용 가능 플랜 조회
  const { data: publicPlans, isLoading: isPlansLoading } = useQuery({
    queryKey: ["publicPlans"],
    queryFn: async () => {
      const plans = await subscriptionApi.getPublicPlans();
      
      return plans.map(p => {
        // 이름으로 매칭 시도 (대소문자 무시 등 유연하게 처리 가능)
        // 매칭되는 정보가 없을 경우 기본값(Package 아이콘) 제공하여 화면에서 사라지지 않게 함
        const details = PLAN_DETAILS[p.subName] || PLAN_DETAILS[p.subName.trim()] || {
          icon: Package,
          description: "ERP 구독 서비스",
          features: ["기본 기능 제공"],
        };

        return {
          ...p,
          ...details
        };
      });
    },
  });

  // 구독 해지 Mutation
  const cancelMutation = useMutation({
    mutationFn: ({ subId, reason }: { subId: number; reason: string }) => 
      subscriptionApi.cancelSubscription(subId, { reason }),
    onSuccess: () => {
      toast({ title: "해지 완료", description: "구독이 정상적으로 해지되었습니다." });
      queryClient.invalidateQueries({ queryKey: ["currentSubscription"] });
    },
    onError: (e: any) => {
      const msg = e.response?.data?.message || e.message || "해지 실패";
      toast({ variant: "destructive", title: "오류", description: msg });
    }
  });

  const handleSelectPlan = (subId: number) => {
    router.push(`/owner/subscription/checkout?planId=${subId}`);
  };

  return {
    currentSubscription,
    isSubscriptionLoading,
    publicPlans: publicPlans || [],
    isPlansLoading,
    handleSelectPlan,
    cancelSubscription: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
  };
}
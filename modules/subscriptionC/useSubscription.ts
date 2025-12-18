// modules/subscriptionC/useSubscription.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { subscriptionApi } from "./subscriptionApi";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Zap, Crown, Sparkles } from "lucide-react"; // 아이콘 추가

// ✅ features에서 사용하던 플랜 정보 (백엔드 데이터와 매핑용)
export const PLAN_DETAILS: Record<string, any> = {
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
  const isOwner = user?.role === 'OWNER' || true; // 테스트용 true

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
      // 백엔드 데이터에 UI 정보(아이콘, 특징 등) 매핑
      return plans.map(p => ({
        ...p,
        ...PLAN_DETAILS[p.subName] // subName으로 매칭 ("베이직", "프로" 등)
      }));
    },
  });

  // 구독 해지 Mutation
  const cancelMutation = useMutation({
    mutationFn: ({ subId, reason }: { subId: number; reason: string }) => 
      subscriptionApi.cancelSubscription(subId, { reason }),
    onSuccess: () => {
      toast.success("구독이 해지되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["currentSubscription"] });
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || "해지 실패");
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
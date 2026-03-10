// modules/subscriptionC/useSubscription.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { subscriptionApi } from "./subscriptionApi";
import { toast } from "@/shared/ui/use-toast"; // 또는 "sonner"
import { useAuth } from "@/contexts/AuthContext";
import { Zap, Crown, Sparkles, Package } from "lucide-react";

export const PLAN_DETAILS: Record<string, any> = {
  "Basic": {
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
        const details = PLAN_DETAILS[p.subName] || PLAN_DETAILS[p.subName.trim()] || {
          icon: Package,
          description: "ERP 구독 서비스",
          features: ["기본 기능 제공"],
        };
        return { ...p, ...details };
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

  // ✅ [추가] 해지 취소 Mutation
  const undoCancelMutation = useMutation({
    mutationFn: (subId: number) => subscriptionApi.undoCancelSubscription(subId),
    onSuccess: () => {
      toast({ title: "구독 복구 완료", description: "해지 취소가 완료되었습니다. 서비스를 계속 이용하실 수 있습니다." });
      queryClient.invalidateQueries({ queryKey: ["currentSubscription"] });
    },
    onError: (e: any) => {
      const msg = e.response?.data?.message || e.message || "해지 취소 실패";
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

    // 추가된 내보내기
    undoCancelSubscription: undoCancelMutation.mutateAsync,
    isUndoCanceling: undoCancelMutation.isPending,
  };
}
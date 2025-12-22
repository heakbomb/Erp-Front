// modules/subscriptionC/useCheckout.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { subscriptionApi } from "./subscriptionApi";
import type { SubscriptionPlan, PaymentMethod } from "./subscriptionTypes";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
// PlanList에서 사용했던 상수 데이터 활용 (없다면 여기서 정의)
import { Zap, Crown, Sparkles } from "lucide-react";

// 백엔드 데이터가 없을 때를 대비한 Fallback 데이터
const FALLBACK_PLANS: Record<number, Partial<SubscriptionPlan>> = {
  1: { subId: 1, subName: "베이직", monthlyPrice: 29000, description: "소규모 사업장에 적합한 기본 플랜" },
  2: { subId: 2, subName: "프로", monthlyPrice: 59000, description: "성장하는 사업장을 위한 프로 플랜" },
  3: { subId: 3, subName: "엔터프라이즈", monthlyPrice: 99000, description: "대규모 사업장을 위한 프리미엄 플랜" },
};

export function useCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const planIdParam = searchParams.get("planId");
  const planId = planIdParam ? Number(planIdParam) : null;

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("new"); // 초기값 명시
  const [loading, setLoading] = useState(true); // 초기 로딩 true

  // 1. 초기 데이터 로드 (플랜 & 카드)
  useEffect(() => {
    // 유저 정보 로딩 중이면 대기 (AuthContext에 따라 다름)
    // planId가 없으면 로드 중단
    if (!planId) {
        setLoading(false);
        return;
    }

    const init = async () => {
      setLoading(true);
      try {
        const [plansData, cardsData] = await Promise.allSettled([
          subscriptionApi.getPublicPlans(),
          subscriptionApi.getPaymentMethods(),
        ]);

        // --- 플랜 정보 설정 ---
        let targetPlan: SubscriptionPlan | undefined;

        // API 성공 시
        if (plansData.status === "fulfilled" && Array.isArray(plansData.value)) {
          targetPlan = plansData.value.find((p) => p.subId === planId);
        }

        // API에 없으면 Fallback 데이터 사용 (테스트용)
        if (!targetPlan && FALLBACK_PLANS[planId]) {
            console.warn("API에서 플랜을 찾을 수 없어 Fallback 데이터를 사용합니다.");
            targetPlan = {
                isActive: true,
                ...FALLBACK_PLANS[planId],
            } as SubscriptionPlan;
        }

        if (targetPlan) {
          setPlan(targetPlan);
        } else {
          toast.error("존재하지 않는 플랜입니다.");
        }

        // --- 카드 정보 설정 ---
        let loadedCards: PaymentMethod[] = [];
        if (cardsData.status === "fulfilled") {
            loadedCards = cardsData.value;
            setCards(loadedCards);
        }

        // 기본 카드 자동 선택
        const defaultCard = loadedCards.find((c) => c.isDefault);
        if (defaultCard) setSelectedCardId(String(defaultCard.paymentId));
        else if (loadedCards.length > 0) setSelectedCardId(String(loadedCards[0].paymentId));
        else setSelectedCardId("new");

      } catch (e) {
        console.error(e);
        toast.error("데이터 로드 실패");
      } finally {
        setLoading(false); // ✅ 반드시 로딩 종료
      }
    };

    init();
  }, [user, planId]);

  // 2. 리다이렉트 복귀 처리 (새 카드로 구독 시)
  useEffect(() => {
    const billingKey = searchParams.get('billingKey');
    const code = searchParams.get('code');

    if (code) {
        toast.error(searchParams.get('message') || "결제가 취소되었습니다.");
        // 실패 시에도 로딩 해제 필요할 수 있음
        return;
    }

    if (billingKey && plan) {
        setLoading(true);
        subscriptionApi.subscribe({
            subId: plan.subId,
            customerUid: billingKey,
            newCardName: "새 카드",
        })
        .then(() => {
            toast.success(`'${plan.subName}' 구독이 시작되었습니다!`);
            router.push('/owner/subscription'); 
        })
        .catch((e: any) => {
            toast.error(e.response?.data?.message || "구독 처리 실패");
        })
        .finally(() => setLoading(false));
    }
  }, [searchParams, plan, router]);

  const handlePayment = async () => {
    if (!plan) return;
    setLoading(true);

    try {
      // A. 기존 카드로 결제
      if (selectedCardId !== "new") {
        await subscriptionApi.subscribe({
          subId: plan.subId,
          paymentMethodId: Number(selectedCardId),
        });
        toast.success(`'${plan.subName}' 구독이 시작되었습니다!`);
        router.push("/owner/subscription");
        return;
      }

      // B. 새 카드 결제 (포트원)
      if (!(window as any).PortOne) {
        toast.error("결제 모듈 로드 중... 잠시 후 다시 시도해주세요.");
        setLoading(false);
        return;
      }

      const ownerId = user && user.role === 'OWNER' ? user.owner_id : 1; 
      const userName = user && user.role === 'OWNER' ? user.username : 'Owner';
      const issueId = `sub_${ownerId}_${new Date().getTime()}`;

      const response = await (window as any).PortOne.requestIssueBillingKey({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
        billingKeyMethod: "CARD",
        issueId: issueId,
        issueName: `구독 결제 (${plan.subName})`,
        redirectUrl: window.location.href,
        customer: {
          fullName: userName,
          phoneNumber: '010-0000-0000',
          email: user?.email || 'test@test.com',
        },
      });

      if (!response.code && response.billingKey) {
        await subscriptionApi.subscribe({
          subId: plan.subId,
          customerUid: response.billingKey,
          newCardName: "새 카드",
        });
        toast.success(`'${plan.subName}' 구독이 시작되었습니다!`);
        router.push("/owner/subscription");
      } else if (response.code) {
        toast.error(response.message || "결제 인증 실패");
      }

    } catch (e: any) {
      console.error(e);
      // 리다이렉트 등으로 인한 중단은 에러 처리 안 함
    } finally {
      setLoading(false);
    }
  };

  return {
    plan,
    cards,
    selectedCardId,
    setSelectedCardId,
    handlePayment,
    loading,
  };
}
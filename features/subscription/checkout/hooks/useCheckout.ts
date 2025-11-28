// features/subscription/checkout/hooks/useCheckout.ts
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { checkoutService } from '../checkoutService';
import { paymentMethodService } from '../../payment-method/paymentMethodService';
import { Owner } from '@/lib/types/database';

const plans = {
  basic: { subId: 1, name: "베이직", price: 29000 },
  pro: { subId: 2, name: "프로", price: 59000 },
  enterprise: { subId: 3, name: "엔터프라이즈", price: 99000 },
};
type PlanIdKey = keyof typeof plans;

export const useCheckout = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const planIdKey = searchParams.get("plan") as PlanIdKey | null;
  const plan = useMemo(() => (planIdKey && plans[planIdKey]) ? plans[planIdKey] : null, [planIdKey]);

  const [cards, setCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('new');
  const [loading, setLoading] = useState(false);

  // 1. 진입 로그
  useEffect(() => {
    console.log("========================================");
    console.log("[DEBUG] Checkout 페이지 로드됨");
    console.log("[DEBUG] 현재 User 정보:", user);
    console.log("[DEBUG] 현재 Plan 정보:", plan);

    if (user && user.role === 'OWNER') {
      paymentMethodService.getMyCards()
        .then((data) => {
          console.log("[DEBUG] 내 카드 목록 로드 성공:", data);
          setCards(data);
          const defaultCard = data.find((c: any) => c.isDefault);
          if (defaultCard) setSelectedCardId(String(defaultCard.paymentId));
        })
        .catch((err) => console.error("[DEBUG] 카드 목록 로드 실패:", err));
    }
  }, [user]);

  // ✅ 2. 리다이렉트 복귀 감지 로직 (이게 있어야 작동합니다!)
  useEffect(() => {
    const billingKey = searchParams.get('billingKey');
    const code = searchParams.get('code');
    
    // URL에 파라미터가 있을 때만 로그 출력
    if (billingKey || code) {
        console.log(`[DEBUG] 리다이렉트 복귀 감지! billingKey=${billingKey}, code=${code}`);
    }

    if (code) {
      toast({ title: "결제 실패", description: searchParams.get('message') || "인증 취소" });
      return;
    }

    if (billingKey && plan) {
      console.log("[DEBUG] 서버로 구독 요청 전송 시작...");
      setLoading(true);
      
      checkoutService.subscribe({
        subId: plan.subId,
        customerUid: billingKey,
        newCardName: '새 카드' 
      })
      .then((res) => {
        console.log("[DEBUG] 서버 응답 성공:", res);
        toast({ title: "구독 시작!", description: "결제가 완료되었습니다." });
        router.push('/owner/dashboard');
      })
      .catch((error) => {
        console.error("[DEBUG] 서버 요청 에러:", error);
        toast({ title: "오류", description: "구독 처리 중 문제가 발생했습니다." });
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, [searchParams, plan, router]);

  const handlePayment = async () => {
    console.log("[DEBUG] 결제하기 버튼 클릭됨");

    if (!plan) {
        console.error("[DEBUG] Plan 정보 없음");
        return;
    }
    
    setLoading(true);

    try {
      // 기존 카드 결제
      if (selectedCardId !== 'new') {
        console.log("[DEBUG] 기존 카드로 결제 시도:", selectedCardId);
        await checkoutService.subscribe({ 
          subId: plan.subId, 
          paymentMethodId: Number(selectedCardId) 
        });
        toast({ title: "구독 성공", description: "완료되었습니다." });
        router.push('/owner/dashboard');
        return;
      }

      // 새 카드 결제 (포트원)
      console.log("[DEBUG] 포트원 SDK 호출 시작");
      if (!window.PortOne) {
        console.error("[DEBUG] PortOne SDK 로드 안됨");
        toast({ title: "모듈 로딩 중...", description: "잠시 후 다시 시도해주세요." });
        setLoading(false);
        return;
      }

      // User 타입 안전하게 처리
      const isOwner = user?.role === 'OWNER';
      const ownerId = isOwner ? (user as Owner).owner_id : 1; 
      const userName = isOwner ? (user as Owner).username : '테스트유저';

      const generatedIssueId = `sub_${ownerId}_${new Date().getTime()}`;
      const returnUrl = window.location.href; // 현재 페이지로 돌아옴

      console.log("[DEBUG] requestIssueBillingKey 파라미터:", {
        issueId: generatedIssueId,
        redirectUrl: returnUrl
      });

      const response = await window.PortOne.requestIssueBillingKey({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
        billingKeyMethod: "CARD",
        issueId: generatedIssueId,
        issueName: `ERP 구독 (${plan.name})`,
        redirectUrl: returnUrl, // ✅ 리다이렉트 URL 필수
        customer: {
          fullName: userName,
          phoneNumber: '010-0000-0000', 
          email: user?.email || 'test@test.com',
        }
      });
      
      // PC 등에서 바로 완료된 경우
      console.log("[DEBUG] 포트원 응답(모달):", response);
      if (!response.code && response.billingKey) {
         console.log("[DEBUG] 빌링키 즉시 수신. 서버 요청.");
         await checkoutService.subscribe({
          subId: plan.subId,
          customerUid: response.billingKey,
          newCardName: '새 카드' 
        });
        toast({ title: "구독 시작!", description: "결제가 완료되었습니다." });
        router.push('/owner/dashboard');
      }

    } catch (error: any) {
      // 리다이렉트 되면 에러가 아니라 페이지 이동임
      console.error("[DEBUG] handlePayment 예외:", error);
    } finally {
      setLoading(false);
    }
  };

  return { plan, cards, selectedCardId, setSelectedCardId, handlePayment, loading };
};
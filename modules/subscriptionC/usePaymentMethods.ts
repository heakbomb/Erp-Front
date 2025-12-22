// modules/subscriptionC/usePaymentMethods.ts
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { subscriptionApi } from "./subscriptionApi";
import type { PaymentMethod } from "./subscriptionTypes";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function usePaymentMethods() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false); // 초기값을 false로 변경

  const loadMethods = async () => {
    try {
      setIsLoading(true);
      const data = await subscriptionApi.getPaymentMethods();
      setMethods(data);
    } catch (e) {
      console.error(e);
      // toast.error("카드 목록을 불러오지 못했습니다."); // 필요 시 주석 해제
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // ✅ 로그인된 Owner인 경우 또는 테스트용 ownerId=1 일 때 로드
    // 현재 AuthContext 구현상 user가 없어도 동작해야 한다면 조건 제거
    if (user?.role === 'OWNER' || true) { // 테스트를 위해 true 추가 (실제 배포시 제거)
        loadMethods();
    }
  }, [user]);

  // 포트원 리다이렉트 복귀 처리 (기존 로직 유지)
  useEffect(() => {
    const billingKey = searchParams.get('billingKey');
    const code = searchParams.get('code');
    const message = searchParams.get('message');

    if (code) {
        toast.error(message || "인증이 취소되었습니다.");
        window.history.replaceState({}, '', window.location.pathname);
        return;
    }

    if (billingKey) {
        setIsLoading(true);
        const savedName = localStorage.getItem('temp_card_name') || '새 카드';
        
        subscriptionApi.addPaymentMethod({
            customerUid: billingKey,
            cardName: savedName,
        }).then(() => {
            toast.success("카드가 등록되었습니다.");
            localStorage.removeItem('temp_card_name');
            loadMethods();
        }).catch((err) => {
            console.error(err);
            toast.error("카드 저장 중 오류가 발생했습니다.");
        }).finally(() => {
            setIsLoading(false);
            window.history.replaceState({}, '', window.location.pathname);
        });
    }
  }, [searchParams]);

  // 카드 추가 (포트원 호출)
  const addMethod = async (cardNameInput: string = "새 카드") => {
    if (!(window as any).PortOne) {
        toast.error("결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
        return;
    }
    
    setIsLoading(true);
    localStorage.setItem('temp_card_name', cardNameInput); 

    // ✅ 테스트용 하드코딩된 값 사용 (실제로는 user 정보 사용)
    const ownerId = user && user.role === 'OWNER' ? user.owner_id : 1; 
    const userName = user && user.role === 'OWNER' ? user.username : 'Owner';
    const userEmail = user?.email || 'test@test.com';
    const issueId = `issue_${ownerId}_${new Date().getTime()}`;

    try {
      const response = await (window as any).PortOne.requestIssueBillingKey({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
        billingKeyMethod: "CARD",
        issueId: issueId,
        issueName: '결제 수단 등록',
        redirectUrl: window.location.href, 
        customer: {
          fullName: userName,
          phoneNumber: '010-0000-0000',
          email: userEmail,
        },
      });

      if (!response.code && response.billingKey) {
        await subscriptionApi.addPaymentMethod({
          customerUid: response.billingKey,
          cardName: cardNameInput,
        });
        toast.success("카드가 등록되었습니다.");
        loadMethods();
      } else if (response.code) {
        toast.error(response.message || "카드 등록 실패");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeMethod = async (id: number) => {
    if (!confirm("정말 이 카드를 삭제하시겠습니까?")) return;
    try {
      await subscriptionApi.deletePaymentMethod(id);
      loadMethods();
      toast.success("삭제되었습니다.");
    } catch (e) {
      toast.error("삭제 실패");
    }
  };

  const setAsDefault = async (id: number) => {
    try {
      await subscriptionApi.setDefaultPaymentMethod(id);
      loadMethods();
      toast.success("기본 카드로 설정되었습니다.");
    } catch (e) {
      toast.error("설정 실패");
    }
  };

  return {
    methods,
    isLoading,
    addMethod,
    removeMethod,
    setAsDefault,
  };
}
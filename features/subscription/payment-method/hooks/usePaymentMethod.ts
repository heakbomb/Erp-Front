"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/shared/ui/use-toast';
import { paymentMethodService } from '../paymentMethodService';
import { Owner } from '@/shared/types/database';

export const usePaymentMethod = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCards = async () => {
    try {
      const data = await paymentMethodService.getMyCards();
      setCards(data);
    } catch (error) {
      console.error("카드 목록 로드 실패:", error);
    }
  };

  // ✅ 리다이렉트 복귀 처리
  useEffect(() => {
    const billingKey = searchParams.get('billingKey');
    const code = searchParams.get('code');

    if (code) {
        toast({ title: "인증 실패", description: searchParams.get('message') || "취소됨" });
        window.history.replaceState({}, '', window.location.pathname);
        return;
    }

    if (billingKey) {
        setLoading(true);
        // ✅ 저장해둔 이름 꺼내기 (없으면 기본값)
        const savedName = localStorage.getItem('temp_card_name') || '새 카드';
        
        paymentMethodService.registerCard({
            customerUid: billingKey,
            cardName: savedName,
        }).then(() => {
            toast({ title: "성공", description: "카드가 등록되었습니다." });
            localStorage.removeItem('temp_card_name'); // 청소
            fetchCards();
        }).catch(() => {
            toast({ title: "오류", description: "저장 실패" });
        }).finally(() => {
            setLoading(false);
            window.history.replaceState({}, '', window.location.pathname);
        });
    }
  }, [searchParams]);

  useEffect(() => {
      if (user?.role === 'OWNER') fetchCards();
  }, [user]);

  // ✅ [수정됨] 이름(alias)을 인자로 받음
  const addCard = async (cardNameInput: string) => {
    if (!window.PortOne) return;
    setLoading(true);

    const isOwner = user?.role === 'OWNER';
    const ownerId = isOwner ? (user as Owner).owner_id : 1; 
    const userName = isOwner ? (user as Owner).username : '테스트유저';
    
    // ✅ 이름을 로컬스토리지에 임시 저장 (리다이렉트 대비)
    localStorage.setItem('temp_card_name', cardNameInput);

    const generatedIssueId = `issue_${ownerId}_${new Date().getTime()}`;

    try {
      const response = await window.PortOne.requestIssueBillingKey({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
        billingKeyMethod: "CARD",
        issueId: generatedIssueId,
        issueName: '결제 수단 등록',
        redirectUrl: window.location.href, 
        customer: {
          fullName: userName,
          phoneNumber: '010-0000-0000',
          email: user?.email || 'test@test.com',
        },
      });

      if (!response.code && response.billingKey) {
        await paymentMethodService.registerCard({
          customerUid: response.billingKey,
          cardName: cardNameInput, // ✅ 입력받은 이름 사용
        });
        toast({ title: "성공", description: "카드가 등록되었습니다." });
        fetchCards();
      } else if (response.code) {
        toast({ title: "등록 실패", description: response.message });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 이름 수정 함수
  const updateCardName = async (paymentId: number, newName: string) => {
    try {
      await paymentMethodService.updateCardName(paymentId, newName);
      toast({ title: "수정 완료", description: "카드 이름이 변경되었습니다." });
      fetchCards();
    } catch (e) {
      toast({ title: "오류", description: "이름 변경 실패" });
    }
  };

  // 삭제 함수
  const removeCard = async (paymentId: number) => {
    if (!confirm("정말 이 카드를 삭제하시겠습니까?")) return;

    try {
      await paymentMethodService.deleteCard(paymentId);
      toast({ title: "삭제 완료", description: "카드가 삭제되었습니다." });
      fetchCards(); // 목록 갱신
    } catch (e) {
      console.error(e);
      toast({ title: "오류", description: "카드 삭제 실패" });
    }
  };

  return { cards, loading, addCard, updateCardName, removeCard }; // removeCard 반환 추가
};
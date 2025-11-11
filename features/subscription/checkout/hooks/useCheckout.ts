// features/subscription/checkout/hooks/useCheckout.ts
"use client"

import type React from "react"
// ⭐️ 'useState'와 'useMemo'만 남기고 'useEffect'는 제거해도 됩니다.
import { useState, useMemo } from "react" 
import { useSearchParams, useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { processPayment } from "../checkoutService" // ⭐️ 수정된 서비스 임포트

// subId가 포함된 plans 상수 (동일)
const plans = {
  basic: { subId: 1, name: "베이직", price: 29000 },
  pro: { subId: 2, name: "프로", price: 59000 },
  enterprise: { subId: 3, name: "엔터프라이즈", price: 99000 },
}
type PlanIdKey = keyof typeof plans;

export function useCheckout() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const planIdKey = searchParams.get("plan") as PlanIdKey | null

  const plan = useMemo(() => (planIdKey && plans[planIdKey]) ? plans[planIdKey] : null, [planIdKey])

  // ⭐️ 결제 폼 상태 (카드 정보)
  // (참고: 이 정보들은 이제 '시각적'으로는 존재하지만,
  // 백엔드로 '전송'되지는 않습니다.)
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [cardName, setCardName] = useState("")

  // ⭐️ 플랜 유효성 검사 (기존 useEffect 대신 useMemo와 렌더링 시 확인으로 변경)
  // (서버 로직이 아니므로 useEffect가 없어도 됩니다)
  if (!plan) {
    // 훅 실행 중에 라우팅을 시도하기보다,
    // 컴포넌트 렌더링 단에서 null을 반환하는 것이 더 안정적입니다.
    // (CheckoutPageFeature.tsx에서 이미 !plan이면 null을 반환하고 있습니다)
  }

  // 결제 처리 뮤테이션 (동일)
  const paymentMutation = useMutation({
    mutationFn: processPayment,
    onSuccess: () => {
      // ⭐️ 여기가 중요합니다.
      // 백엔드에서 사장님(1L)에게 구독 정보가 저장된 후,
      // 'currentSubscription' 쿼리를 새로고침하여 
      // 구독 관리 페이지에 갱신된 내용을 반영합니다.
      alert("구독이 등록되었습니다!") 
      queryClient.invalidateQueries({ queryKey: ["currentSubscription"] })
      router.push("/owner/subscription")
    },
    onError: (error) => {
      // (1단계 SQL 실행 후) 이 오류는 이제 DTO 불일치 등 다른 문제일 것입니다.
      alert(`구독 등록 실패: ${error.message}`)
    },
  })

  // ⭐️ 폼 제출 핸들러 (가장 중요)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!plan) return; 

    // ⭐️ 'cardInfo' 객체를 아예 보내지 않습니다.
    // 'subId'만 포함된 객체를 전달합니다.
    paymentMutation.mutate({
      subId: plan.subId, 
    })
  }

  return {
    plan,
    handleSubmit,
    isProcessing: paymentMutation.isPending,
    
    // (시각적 입력을 위한 상태값들은 그대로 둠)
    cardName, setCardName,
    cardNumber, setCardNumber,
    cardExpiry, setCardExpiry,
    cardCvc, setCardCvc,
  }
}
// features/subscription/checkout/hooks/useCheckout.ts
"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { processPayment } from "../checkoutService"

// ⭐️ 기존 plans 상수 (API로 가져올 경우 Service로 이동)
const plans = {
  basic: { name: "베이직", price: 29000 },
  pro: { name: "프로", price: 59000 },
  enterprise: { name: "엔터프라이즈", price: 99000 },
}
type PlanId = keyof typeof plans;

export function useCheckout() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const planId = searchParams.get("plan") as PlanId | null

  // ⭐️ useMemo로 plan 객체 관리
  const plan = useMemo(() => (planId && plans[planId]) ? plans[planId] : null, [planId])

  // ⭐️ 폼 상태
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [cardName, setCardName] = useState("")

  // ⭐️ 플랜이 유효하지 않으면 리디렉션
  useEffect(() => {
    if (!planId || !plan) {
      router.push("/owner/subscription")
    }
  }, [plan, planId, router])

  // ⭐️ 결제 처리 뮤테이션
  const paymentMutation = useMutation({
    mutationFn: processPayment,
    onSuccess: () => {
      alert("결제가 완료되었습니다!")
      // ⭐️ 결제 성공 시, 현재 구독 상태 쿼리를 무효화
      queryClient.invalidateQueries({ queryKey: ["currentSubscription"] })
      router.push("/owner/subscription")
    },
    onError: (error) => {
      alert(`결제 실패: ${error.message}`)
    },
  })

  // ⭐️ 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!planId) return;

    paymentMutation.mutate({
      planId,
      cardInfo: {
        cardName,
        cardNumber,
        cardExpiry,
        cardCvc,
      },
    })
  }

  return {
    plan,
    handleSubmit,
    isProcessing: paymentMutation.isPending,
    cardName, setCardName,
    cardNumber, setCardNumber,
    cardExpiry, setCardExpiry,
    cardCvc, setCardCvc,
  }
}
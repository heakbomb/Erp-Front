// features/subscription/cancel/hooks/useSubscriptionCancel.ts
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cancelSubscription } from "../subscriptionCancelService"

// ⭐️ 상수
export const cancellationReasons = [
  "가격이 너무 비쌉니다",
  "필요한 기능이 부족합니다",
  "사용하기 어렵습니다",
  "다른 서비스로 이동합니다",
  "사업을 중단합니다",
  "기타",
]

export function useSubscriptionCancel() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // ⭐️ 폼/UI 상태
  const [selectedReason, setSelectedReason] = useState("")
  const [feedback, setFeedback] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)

  // ⭐️ (확장) API를 통해 현재 구독 만료일을 가져올 수 있습니다.
  // const { data: currentSubscription } = useQuery(...)
  // const currentPlanEndDate = currentSubscription?.expiryDate ?? "2024년 5월 15일";

  // ⭐️ 취소 뮤테이션
  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      alert("구독이 취소되었습니다")
      // ⭐️ 현재 구독 정보 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["currentSubscription"] })
      router.push("/owner/dashboard") // ⭐️ 대시보드 또는 구독 페이지로 이동
    },
    onError: (error) => {
      alert(`구독 취소 실패: ${error.message}`)
      setShowConfirmation(false) // ⭐️ 확인 창 닫기
    },
  })

  // ⭐️ 핸들러 1: 확인 창 보이기
  const handleCancel = () => {
    setShowConfirmation(true)
  }

  // ⭐️ 핸들러 2: 실제 취소 실행
  const handleConfirmCancel = () => {
    cancelMutation.mutate({
      reason: selectedReason,
      feedback: feedback,
    })
  }

  return {
    selectedReason,
    setSelectedReason,
    feedback,
    setFeedback,
    showConfirmation,
    setShowConfirmation,
    handleCancel,
    handleConfirmCancel,
    isCanceling: cancelMutation.isPending,
    // currentPlanEndDate, // ⭐️ 확장 시 반환
  }
}
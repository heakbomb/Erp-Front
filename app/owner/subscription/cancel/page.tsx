"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const cancellationReasons = [
  "가격이 너무 비쌉니다",
  "필요한 기능이 부족합니다",
  "사용하기 어렵습니다",
  "다른 서비스로 이동합니다",
  "사업을 중단합니다",
  "기타",
]

export default function SubscriptionCancelPage() {
  const router = useRouter()
  const [selectedReason, setSelectedReason] = useState("")
  const [feedback, setFeedback] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleCancel = () => {
    setShowConfirmation(true)
  }

  const handleConfirmCancel = () => {
    // Handle cancellation logic here
    alert("구독이 취소되었습니다")
    router.push("/owner/dashboard")
  }

  if (showConfirmation) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/owner/subscription">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
        </Link>

        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <CardTitle>구독 취소 최종 확인</CardTitle>
            </div>
            <CardDescription>정말로 구독을 취소하시겠습니까?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-destructive/10 p-4 space-y-2">
              <p className="font-medium text-destructive">구독 취소 시 다음 사항이 적용됩니다:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>현재 결제 주기 종료일(2024년 5월 15일)까지 서비스를 이용할 수 있습니다</li>
                <li>종료일 이후 모든 프리미엄 기능에 대한 접근이 제한됩니다</li>
                <li>AI 인사이트, 수요 예측 등 고급 기능을 사용할 수 없습니다</li>
                <li>저장된 데이터는 90일간 보관되며, 이후 삭제됩니다</li>
                <li>언제든지 다시 구독할 수 있습니다</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowConfirmation(false)}>
                취소하지 않기
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleConfirmCancel}>
                구독 취소 확정
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/owner/subscription">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          돌아가기
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>구독 취소</CardTitle>
          <CardDescription>구독을 취소하기 전에 몇 가지 질문에 답해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>취소 사유를 선택해주세요</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {cancellationReasons.map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason} id={reason} />
                  <Label htmlFor={reason} className="font-normal cursor-pointer">
                    {reason}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="feedback">추가 의견 (선택사항)</Label>
            <Textarea
              id="feedback"
              placeholder="서비스 개선을 위한 의견을 자유롭게 작성해주세요"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium mb-2">구독 취소 전 확인사항</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 현재 결제 주기가 끝날 때까지 서비스를 계속 이용할 수 있습니다</li>
              <li>• 다음 결제일: 2024년 5월 15일</li>
              <li>• 취소 후에도 언제든지 다시 구독할 수 있습니다</li>
            </ul>
          </div>

          <Button variant="destructive" className="w-full" onClick={handleCancel} disabled={!selectedReason}>
            구독 취소 진행
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

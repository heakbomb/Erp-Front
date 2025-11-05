// features/subscription/management/SubscriptionManagementPage.tsx
"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Check, Zap, Crown, Sparkles, Loader2 } from "lucide-react"
import { useSubscriptionManagement } from "./hooks/useSubscriptionManagement"

// ⭐️ 훅에서 plans 상수를 가져오거나, 훅 내부에서 관리
import { plans } from "./hooks/useSubscriptionManagement"

export default function SubscriptionManagementPage() {
  // Radix UI SSR 오류 방지
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => { setMounted(true) }, []);

  const {
    currentPlanData,
    isCurrentPlanLoading,
    handleSelectPlan,
  } = useSubscriptionManagement()

  // ⭐️ 로딩 및 데이터 상태에 따른 UI 처리
  const currentPlanId = currentPlanData?.planId ?? "basic" // 예시
  const currentPlanPrice = currentPlanData?.price ?? 29000 // 예시
  const nextPaymentDate = currentPlanData?.nextPaymentDate ?? "2024-05-15" // 예시

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">구독 플랜</h1>
        <p className="text-muted-foreground">사업장에 맞는 플랜을 선택하세요</p>
      </div>

      {/* Current Plan */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>현재 플랜</CardTitle>
          <CardDescription>
            {isCurrentPlanLoading
              ? "현재 플랜을 불러오는 중..."
              : `${plans.find(p => p.id === currentPlanId)?.name ?? ""} 플랜을 사용 중입니다`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCurrentPlanLoading ? (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">₩{currentPlanPrice.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">월 결제</p>
                </div>
                <Badge>활성</Badge>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">다음 결제일: {nextPaymentDate}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon
          const isCurrentPlan = plan.id === currentPlanId

          return (
            <Card key={plan.id} className={plan.popular ? "border-primary shadow-lg" : ""}>
              {plan.popular && (
                <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium rounded-t-lg">
                  인기
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-6 w-6 text-primary" />
                  <CardTitle>{plan.name}</CardTitle>
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">₩{plan.price.toLocaleString()}</span>
                  <span className="text-muted-foreground">/월</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {/* ⭐️ mounted 상태 확인 추가 */}
                {mounted && (
                  isCurrentPlan ? (
                    <Button variant="outline" className="w-full bg-transparent" disabled>
                      현재 플랜
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => handleSelectPlan(plan.id)}>
                      {plan.price > (plans.find((p) => p.id === currentPlanId)?.price ?? 0) ? "업그레이드" : "다운그레이드"}
                    </Button>
                  )
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
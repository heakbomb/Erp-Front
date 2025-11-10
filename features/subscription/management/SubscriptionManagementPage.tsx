// features/subscription/management/SubscriptionManagementPage.tsx
"use client"

import React, { useState, useEffect } from "react" // ⭐️ [FIX]
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Check, Zap, Crown, Sparkles, Loader2 } from "lucide-react" // ⭐️ [FIX]
import { useSubscriptionManagement } from "./hooks/useSubscriptionManagement"

// 'plans' 상수는 훅에서 임포트합니다.
import { plans } from "./hooks/useSubscriptionManagement" 

export default function SubscriptionManagementPage() {
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => { setMounted(true) }, []);

  const {
    currentPlanData,
    isCurrentPlanLoading,
    handleSelectPlan,
  } = useSubscriptionManagement()

  // (이하 로직은 이전과 동일)
  const currentSubId = currentPlanData?.subId; 
  const currentPlanName = isCurrentPlanLoading 
    ? "불러오는 중..." 
    : (currentPlanData?.subName ?? "플랜 없음");
  const currentPlanPrice = currentPlanData?.monthlyPrice ?? 0;
  const nextPaymentDate = currentPlanData?.expiryDate ?? "N/A";

  return (
    <div className="space-y-6">
      {/* ... (Current Plan 카드) ... */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>현재 플랜</CardTitle>
          <CardDescription>
            {isCurrentPlanLoading 
              ? "현재 플랜을 불러오는 중..." 
              : `${currentPlanName} 플랜을 사용 중입니다`}
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
          const Icon = plan.icon // ⭐️ Zap, Crown, Sparkles 사용
          const isCurrentPlan = plan.subId === currentSubId

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
                {mounted && (
                  isCurrentPlan ? (
                    <Button variant="outline" className="w-full bg-transparent" disabled>
                      현재 플랜
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => handleSelectPlan(plan.id)}>
                      {plan.price > currentPlanPrice ? "업그레이드" : "다운그레이드"}
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
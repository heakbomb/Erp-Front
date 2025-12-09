"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Check, Loader2 } from "lucide-react" 
import { useSubscriptionManagement, plans } from "./hooks/useSubscriptionManagement"

export default function SubscriptionManagementPage() {
  // Hydration Error 방지용
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => { setMounted(true) }, []);

  const {
    currentPlanData,
    isCurrentPlanLoading,
    handleSelectPlan,
  } = useSubscriptionManagement()

  // ⭐️ DB 데이터 기반 변수 할당
  const currentSubId = currentPlanData?.subId; 
  
  // 로딩 중이면 메시지, 데이터 있으면 DB의 subName, 없으면 '플랜 없음'
  const currentPlanName = isCurrentPlanLoading 
    ? "정보를 불러오는 중..." 
    : (currentPlanData?.subName ?? "이용 중인 플랜이 없습니다");

  // DB에 저장된 실제 결제 금액 표시
  const currentPlanPrice = currentPlanData?.monthlyPrice ?? 0;
  const nextPaymentDate = currentPlanData?.expiryDate ?? "-";

  return (
    <div className="space-y-6">
      {/* 1. 현재 이용 중인 플랜 정보 (DB 데이터) */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>현재 이용 중인 플랜</CardTitle>
          <CardDescription>
            {currentPlanName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCurrentPlanLoading ? (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {currentPlanData ? (
                // 구독 정보가 있을 때
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">₩{currentPlanPrice.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">월 결제</p>
                    </div>
                    <Badge variant={currentPlanData.isActive ? "default" : "secondary"}>
                      {currentPlanData.isActive ? "이용 중" : "비활성"}
                    </Badge>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      다음 결제일(만료일): <span className="font-medium text-foreground">{nextPaymentDate}</span>
                    </p>
                  </div>
                </>
              ) : (
                // 구독 정보가 없을 때
                <div className="py-4 text-center text-muted-foreground">
                  현재 구독 중인 상품이 없습니다. 아래에서 플랜을 선택해주세요.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 2. 플랜 목록 (정적 데이터 plans 사용) */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon 
          // ⭐️ DB의 subId와 비교하여 현재 플랜 여부 판단
          const isCurrentPlan = currentSubId === plan.subId;

          return (
            <Card 
              key={plan.id} 
              // ⭐️ [수정] '인기' 대신 '현재 이용 중인 플랜'에 테두리(border-primary) 적용
              className={`flex flex-col ${isCurrentPlan ? "border-primary border-2 shadow-lg" : ""}`}
            >
              {/* ⭐️ [수정] '인기' 배지 섹션 제거됨 */}
              
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
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto pt-6">
                {mounted && (
                  isCurrentPlan ? (
                    <Button variant="outline" className="w-full border-primary text-primary hover:text-primary" disabled>
                      현재 이용 중
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleSelectPlan(plan.id)}
                      // 현재 플랜이 아니면 모두 기본 스타일(default) 혹은 secondary 등 원하는 스타일 적용
                      variant="secondary" 
                    >
                      {currentPlanPrice > 0 && plan.price > currentPlanPrice ? "업그레이드" : "선택하기"}
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
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Crown, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

const plans = [
  {
    id: "basic",
    name: "베이직",
    price: 29000,
    icon: Zap,
    description: "소규모 사업장에 적합한 기본 플랜",
    features: ["사업장 1개 등록", "직원 5명까지", "기본 재고 관리", "매출/매입 관리", "월간 리포트", "이메일 지원"],
    popular: false,
  },
  {
    id: "pro",
    name: "프로",
    price: 59000,
    icon: Crown,
    description: "성장하는 사업장을 위한 프로 플랜",
    features: [
      "사업장 3개 등록",
      "직원 무제한",
      "고급 재고 관리",
      "매출/매입 관리",
      "AI 수요 예측",
      "가격 최적화",
      "주간 리포트",
      "우선 지원",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "엔터프라이즈",
    price: 99000,
    icon: Sparkles,
    description: "대규모 사업장을 위한 프리미엄 플랜",
    features: [
      "사업장 무제한",
      "직원 무제한",
      "모든 프로 기능",
      "맞춤형 AI 분석",
      "전용 계정 매니저",
      "24/7 전화 지원",
      "API 접근",
      "커스텀 통합",
    ],
    popular: false,
  },
]

export default function SubscriptionPage() {
  const router = useRouter()
  const [currentPlan] = useState("basic")

  const handleSubscribe = (planId: string) => {
    router.push(`/owner/subscription/checkout?plan=${planId}`)
  }

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
          <CardDescription>베이직 플랜을 사용 중입니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">₩29,000</p>
              <p className="text-sm text-muted-foreground">월 결제</p>
            </div>
            <Badge>활성</Badge>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">다음 결제일: 2024-05-15</p>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon
          const isCurrentPlan = plan.id === currentPlan

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
                {isCurrentPlan ? (
                  <Button variant="outline" className="w-full bg-transparent" disabled>
                    현재 플랜
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => handleSubscribe(plan.id)}>
                    {plan.price > plans.find((p) => p.id === currentPlan)!.price ? "업그레이드" : "다운그레이드"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Lock } from "lucide-react"

const plans = {
  basic: { name: "베이직", price: 29000 },
  pro: { name: "프로", price: 59000 },
  enterprise: { name: "엔터프라이즈", price: 99000 },
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planId = searchParams.get("plan") as keyof typeof plans
  const plan = plans[planId]

  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [cardName, setCardName] = useState("")

  useEffect(() => {
    if (!plan) {
      router.push("/owner/subscription")
    }
  }, [plan, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement payment logic
    console.log("Processing payment for:", planId)
    alert("결제가 완료되었습니다!")
    router.push("/owner/subscription")
  }

  if (!plan) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">구독 결제</h1>
        <p className="text-muted-foreground">안전한 결제 시스템으로 보호됩니다</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>주문 요약</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">플랜</span>
              <span className="font-medium">{plan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">결제 주기</span>
              <span className="font-medium">월간</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>합계</span>
              <span>₩{plan.price.toLocaleString()}/월</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>결제 정보</CardTitle>
            </div>
            <CardDescription>카드 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-name">카드 소유자명</Label>
                <Input
                  id="card-name"
                  placeholder="홍길동"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-number">카드 번호</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="card-expiry">만료일</Label>
                  <Input
                    id="card-expiry"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    maxLength={5}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-cvc">CVC</Label>
                  <Input
                    id="card-cvc"
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    maxLength={3}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                <Lock className="mr-2 h-4 w-4" />₩{plan.price.toLocaleString()} 결제하기
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
              결제 정보는 안전하게 암호화되어 처리됩니다
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

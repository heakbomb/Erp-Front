"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, Building2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PaymentMethodPage() {
  const router = useRouter()
  const [paymentType, setPaymentType] = useState("card")

  const handleSave = () => {
    alert("결제 수단이 변경되었습니다")
    router.push("/owner/settings")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/owner/settings">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          설정으로 돌아가기
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>결제 수단 변경</CardTitle>
          <CardDescription>새로운 결제 수단을 등록하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>결제 방법 선택</Label>
            <RadioGroup value={paymentType} onValueChange={setPaymentType}>
              <div className="flex items-center space-x-2 p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="h-5 w-5" />
                  <span>신용/체크카드</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Building2 className="h-5 w-5" />
                  <span>계좌이체</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {paymentType === "card" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">카드 번호</Label>
                <Input id="cardNumber" placeholder="0000-0000-0000-0000" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">유효기간</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="000" type="password" maxLength={3} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardHolder">카드 소유자명</Label>
                <Input id="cardHolder" placeholder="홍길동" />
              </div>
            </div>
          )}

          {paymentType === "bank" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">은행명</Label>
                <Input id="bankName" placeholder="은행을 선택하세요" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">계좌번호</Label>
                <Input id="accountNumber" placeholder="계좌번호를 입력하세요" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountHolder">예금주명</Label>
                <Input id="accountHolder" placeholder="홍길동" />
              </div>
            </div>
          )}

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              결제 정보는 안전하게 암호화되어 저장됩니다. 다음 결제일부터 새로운 결제 수단이 적용됩니다.
            </p>
          </div>

          <Button className="w-full" onClick={handleSave}>
            결제 수단 저장
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

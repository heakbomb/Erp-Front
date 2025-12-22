// modules/subscriptionC/CheckoutView.tsx
"use client";

import { useCheckout } from "./useCheckout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";
import { Loader2, CreditCard, Plus, Check, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutView() {
  const { plan, cards, selectedCardId, setSelectedCardId, handlePayment, loading } = useCheckout();

  // 1. 로딩 중이면서 아직 plan 데이터가 없을 때 -> 로딩 화면
  if (loading && !plan) {
    return (
      <div className="container max-w-md mx-auto py-20 text-center space-y-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
        <p className="text-muted-foreground">결제 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 2. 로딩이 끝났는데 plan 데이터가 없을 때 -> 에러 화면
  if (!plan) {
    return (
      <div className="container max-w-md mx-auto py-20 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">상품 정보를 찾을 수 없습니다.</h2>
        <p className="text-muted-foreground">올바르지 않은 접근이거나 상품이 존재하지 않습니다.</p>
        <Link href="/owner/subscription">
          <Button variant="outline" className="mt-4">목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  // 3. 정상 렌더링
  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">구독 결제</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/30 p-4 rounded-lg border">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">상품명</span>
              <span className="font-medium">{plan.subName}</span>
            </div>
            {plan.description && (
                <div className="text-xs text-muted-foreground mb-2">{plan.description}</div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between items-center">
              <span className="font-medium">결제 금액 (월)</span>
              <span className="text-xl font-bold text-primary">₩{plan.monthlyPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base">결제 수단 선택</Label>
            <RadioGroup value={selectedCardId} onValueChange={setSelectedCardId} className="gap-3">
              {cards.map((card) => (
                <div key={card.paymentId} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${selectedCardId === String(card.paymentId) ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                  <RadioGroupItem value={String(card.paymentId)} id={`c-${card.paymentId}`} className="sr-only" />
                  <Label htmlFor={`c-${card.paymentId}`} className="flex-1 flex items-center cursor-pointer gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                          {card.cardName || "카드"} 
                          {card.isDefault && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">기본</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{card.cardNumber}</div>
                    </div>
                  </Label>
                  {selectedCardId === String(card.paymentId) && <Check className="h-4 w-4 text-primary" />}
                </div>
              ))}
              
              <div className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${selectedCardId === "new" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`} onClick={() => setSelectedCardId("new")}>
                <RadioGroupItem value="new" id="c-new" className="sr-only" />
                <Label htmlFor="c-new" className="flex-1 flex items-center cursor-pointer gap-3">
                  <Plus className="h-5 w-5 text-primary" />
                  <span className="font-medium text-primary">새 카드 등록</span>
                </Label>
                {selectedCardId === "new" && <Check className="h-4 w-4 text-primary" />}
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full h-12 text-lg" onClick={handlePayment} disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
            {loading ? "결제 진행 중..." : "결제하기"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
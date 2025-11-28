// features/subscription/checkout/CheckoutPageFeature.tsx
"use client";

import { useCheckout } from './hooks/useCheckout';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, CreditCard, Plus, Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function CheckoutPageFeature() {
  const { 
    plan,
    cards, 
    selectedCardId, 
    setSelectedCardId, 
    handlePayment, 
    loading 
  } = useCheckout();

  if (!plan) return <div className="p-10 text-center">잘못된 접근입니다. (플랜 정보 없음)</div>;

  return (
    <div className="container mx-auto p-6 flex justify-center items-start min-h-screen pt-20">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-center">구독 결제</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 상품 정보 */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-slate-600">플랜명</span>
              <span className="font-bold text-lg">{plan.name}</span>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-600">결제 금액 (월)</span>
              <span className="font-bold text-xl text-primary">
                {plan.price.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 결제 수단 선택 */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-slate-900">결제 수단 선택</h3>
            
            <RadioGroup value={selectedCardId} onValueChange={setSelectedCardId} className="space-y-3">
              
              {/* 1. 기존 등록된 카드 */}
              {cards.map((card) => (
                <div 
                  key={card.paymentId} 
                  className={`flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-all ${
                    selectedCardId === String(card.paymentId) 
                      ? "border-primary bg-primary/5 ring-1 ring-primary" 
                      : "hover:border-slate-400"
                  }`}
                  onClick={() => setSelectedCardId(String(card.paymentId))}
                >
                  <RadioGroupItem value={String(card.paymentId)} id={`card-${card.paymentId}`} />
                  <Label htmlFor={`card-${card.paymentId}`} className="flex-1 flex items-center cursor-pointer">
                    <CreditCard className="w-5 h-5 mr-3 text-slate-500" />
                    <div className="flex flex-col">
                      <span className="font-medium">{card.cardName || "신용카드"}</span>
                      <span className="text-xs text-slate-500">
                        {card.cardNumber ? `${card.cardNumber}` : "****"} 
                        {card.isDefault && <span className="ml-2 text-primary font-semibold">(기본)</span>}
                      </span>
                    </div>
                  </Label>
                  {selectedCardId === String(card.paymentId) && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
              ))}
              
              {/* 2. 새 카드 등록 */}
              <div 
                className={`flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-all ${
                  selectedCardId === "new" 
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" 
                    : "hover:border-slate-400"
                }`}
                onClick={() => setSelectedCardId("new")}
              >
                <RadioGroupItem value="new" id="card-new" />
                <Label htmlFor="card-new" className="flex-1 flex items-center cursor-pointer">
                  <Plus className="w-5 h-5 mr-3 text-blue-600" />
                  <span className="font-medium text-blue-700">새로운 카드로 결제</span>
                </Label>
              </div>

            </RadioGroup>
          </div>
        </CardContent>

        <CardFooter className="pt-2 pb-6">
          <Button 
            className="w-full h-12 text-lg font-bold" 
            size="lg" 
            onClick={handlePayment} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                처리 중...
              </>
            ) : (
              `${plan.price.toLocaleString()}원 결제하기`
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
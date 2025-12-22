// modules/subscriptionC/PaymentMethods.tsx
"use client";

import { usePaymentMethods } from "./usePaymentMethods";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { CreditCard, Plus, Trash2, Loader2, Star } from "lucide-react";

export default function PaymentMethods() {
  const { methods, isLoading, addMethod, removeMethod, setAsDefault } = usePaymentMethods();

  const handleAddClick = () => {
    const name = prompt("카드 별칭을 입력해주세요.", "새 카드");
    if (name) {
      addMethod(name);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">결제 수단 관리</h1>
        <Button onClick={handleAddClick} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Plus className="mr-2 h-4 w-4"/>}
          카드 추가
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading && methods.length === 0 ? (
           <div className="p-8 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin"/></div>
        ) : methods.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground border-dashed">등록된 카드가 없습니다.</Card>
        ) : (
          methods.map((card) => (
            <Card key={card.paymentId} className={`flex items-center p-4 gap-4 ${card.isDefault ? "border-primary bg-primary/5" : ""}`}>
              <div className="p-2 bg-muted rounded-full">
                <CreditCard className="h-6 w-6 text-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{card.cardName || "신용카드"}</h3>
                  {card.isDefault && <Badge variant="default" className="text-xs">기본</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{card.cardNumber}</p>
              </div>
              <div className="flex gap-2">
                {!card.isDefault && (
                  <Button size="sm" variant="ghost" onClick={() => setAsDefault(card.paymentId)}>
                     <Star className="h-4 w-4 mr-1 text-muted-foreground"/> 기본 설정
                  </Button>
                )}
                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeMethod(card.paymentId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
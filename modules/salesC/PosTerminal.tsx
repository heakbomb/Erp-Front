// modules/salesC/PosTerminal.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import usePosTerminal from "./usePosTerminal";
import { PosMenuItem, CartLine } from "./salesTypes";

export default function PosTerminal() {
  const {
    menus, cart, paymentMethod, setPaymentMethod, discount, setDiscount, totalAmount,
    loading, error, lastOrder, addToCart, updateQuantity, clearCart, submitOrder
  } = usePosTerminal();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">가상 POS</h1><p className="text-muted-foreground">주문 및 결제 테스트</p></div>
      </div>

      <Tabs defaultValue="order" className="space-y-4">
        <TabsList><TabsTrigger value="order">주문</TabsTrigger><TabsTrigger value="receipt">마지막 영수증</TabsTrigger></TabsList>

        <TabsContent value="order" className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>메뉴</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="메뉴 검색" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {menus.map((m: PosMenuItem) => (
                  <Button key={m.menuId} variant="outline" className="h-20 flex flex-col items-start" onClick={() => addToCart(m)}>
                    <span className="font-semibold">{m.menuName}</span><span className="text-sm text-muted-foreground">₩{m.price.toLocaleString()}</span>
                  </Button>
                ))}
                {menus.length === 0 && <p className="text-sm text-muted-foreground">메뉴가 없습니다.</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>주문 내역</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {cart.map((line: CartLine) => (
                  <div key={line.menuId} className="flex items-center justify-between gap-2">
                    <div className="flex-1"><div className="font-medium">{line.menuName}</div><div className="text-xs text-muted-foreground">₩{line.unitPrice.toLocaleString()} / 개</div></div>
                    <Input type="number" className="w-16" min={1} value={line.quantity} onChange={(e) => updateQuantity(line.menuId, Number(e.target.value))} />
                    <div className="w-24 text-right text-sm">₩{(line.unitPrice * line.quantity).toLocaleString()}</div>
                  </div>
                ))}
                {cart.length === 0 && <p className="text-sm text-muted-foreground">장바구니가 비어 있습니다.</p>}
              </div>
              <div className="space-y-2 border-t pt-2">
                <div className="flex justify-between text-sm"><span>할인</span><Input type="number" className="w-32 text-right" value={discount} min={0} onChange={e => setDiscount(Number(e.target.value) || 0)} /></div>
                <div className="flex justify-between font-semibold text-lg"><span>결제 금액</span><span>₩{Math.max(totalAmount, 0).toLocaleString()}</span></div>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  {(["CARD", "CASH", "APP"] as const).map(m => (
                    <Button key={m} variant={paymentMethod === m ? "default" : "outline"} className="flex-1" onClick={() => setPaymentMethod(m)}>{m === "CARD" ? "카드" : m === "CASH" ? "현금" : "앱"}</Button>
                  ))}
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <Button className="flex-1" disabled={loading || cart.length === 0} onClick={submitOrder}>{loading ? "처리 중..." : "결제하기"}</Button>
                  <Button variant="outline" className="flex-[0.7]" onClick={clearCart} disabled={loading && cart.length === 0}>초기화</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipt">
          <Card>
            <CardHeader><CardTitle>마지막 영수증</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {!lastOrder ? <p className="text-sm text-muted-foreground">결제 내역이 없습니다.</p> : (
                <div className="text-sm space-y-1">
                  <div>거래번호: {lastOrder.transactionId}</div>
                  <div>시간: {lastOrder.transactionTime}</div>
                  <div>수단: {lastOrder.paymentMethod}</div>
                  <div>상태: {lastOrder.status}</div>
                  <div>금액: ₩{lastOrder.totalAmount.toLocaleString()} (할인: {lastOrder.totalDiscount})</div>
                  <div className="mt-2 border-t pt-2">{lastOrder.lines.map(l => <div key={l.lineId} className="flex justify-between text-xs"><span>{l.menuName} x {l.quantity}</span><span>₩{l.lineAmount.toLocaleString()}</span></div>)}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
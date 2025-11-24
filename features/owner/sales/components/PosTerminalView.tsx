// src/features/owner/sales/components/PosTerminalView.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import usePosTerminal, {
  PosMenuItem,
  CartLine,
  PosOrderLine,
} from "../hooks/usePosTerminal"

export default function PosTerminalView() {
  const {
    menus,
    cart,
    paymentMethod,
    setPaymentMethod,
    discount,
    setDiscount,
    totalAmount,
    loading,
    error,
    lastOrder,
    addToCart,
    updateQuantity,
    clearCart,
    submitOrder,
  } = usePosTerminal()

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">가상 POS</h1>
          <p className="text-muted-foreground">
            메뉴를 선택하고 결제를 진행하면 매출 · 재고가 자동 반영됩니다.
          </p>
        </div>
      </div>

      <Tabs defaultValue="order" className="space-y-4">
        <TabsList>
          <TabsTrigger value="order">주문</TabsTrigger>
          <TabsTrigger value="receipt">마지막 영수증</TabsTrigger>
        </TabsList>

        {/* 주문 탭 */}
        <TabsContent value="order" className="grid gap-4 lg:grid-cols-3">
          {/* 메뉴 리스트 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>메뉴</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="메뉴 검색 (프론트에서 필터링 구현 가능)" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {menus.map((menu: PosMenuItem) => (
                  <Button
                    key={menu.menuId}
                    variant="outline"
                    className="h-20 flex flex-col items-start justify-center"
                    onClick={() => addToCart(menu)}
                  >
                    <span className="font-semibold">{menu.menuName}</span>
                    <span className="text-sm text-muted-foreground">
                      ₩{menu.price.toLocaleString()}
                    </span>
                  </Button>
                ))}
                {menus.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    등록된 메뉴가 없습니다. 먼저 메뉴 관리에서 메뉴를 추가해주세요.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 장바구니 / 결제 영역 */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>주문 내역</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {cart.map((line: CartLine) => (
                  <div
                    key={line.menuId}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{line.menuName}</div>
                      <div className="text-xs text-muted-foreground">
                        ₩{line.unitPrice.toLocaleString()} / 개
                      </div>
                    </div>
                    <Input
                      type="number"
                      className="w-16"
                      min={1}
                      value={line.quantity}
                      onChange={(e) =>
                        updateQuantity(
                          line.menuId,
                          Number(e.target.value) || 0,
                        )
                      }
                    />
                    <div className="w-24 text-right text-sm">
                      ₩
                      {(line.unitPrice * line.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    장바구니가 비어 있습니다. 메뉴를 눌러 추가하세요.
                  </p>
                )}
              </div>

              <div className="space-y-2 border-t pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span>할인</span>
                  <Input
                    type="number"
                    className="w-32 text-right"
                    value={discount}
                    min={0}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center justify-between font-semibold text-lg">
                  <span>결제 금액</span>
                  <span>
                    ₩{Math.max(totalAmount, 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant={paymentMethod === "CARD" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setPaymentMethod("CARD")}
                  >
                    카드
                  </Button>
                  <Button
                    variant={paymentMethod === "CASH" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setPaymentMethod("CASH")}
                  >
                    현금
                  </Button>
                  <Button
                    variant={paymentMethod === "APP" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setPaymentMethod("APP")}
                  >
                    앱
                  </Button>
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={loading || cart.length === 0}
                    onClick={submitOrder}
                  >
                    {loading ? "결제 처리 중..." : "결제하기"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-[0.7]"
                    onClick={clearCart}
                    disabled={loading && cart.length === 0}
                  >
                    초기화
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 마지막 영수증 탭 */}
        <TabsContent value="receipt">
          <Card>
            <CardHeader>
              <CardTitle>마지막 결제 영수증</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!lastOrder && (
                <p className="text-sm text-muted-foreground">
                  아직 결제 내역이 없습니다.
                </p>
              )}
              {lastOrder && (
                <div className="text-sm space-y-1">
                  <div>거래번호: {lastOrder.transactionId}</div>
                  <div>시간: {lastOrder.transactionTime}</div>
                  <div>결제수단: {lastOrder.paymentMethod}</div>
                  <div>상태: {lastOrder.status}</div>
                  <div>
                    금액: ₩{lastOrder.totalAmount.toLocaleString()}{" "}
                    (할인: ₩{lastOrder.totalDiscount.toLocaleString()})
                  </div>
                  <div className="mt-2 border-t pt-2">
                    {lastOrder.lines.map((line: PosOrderLine) => (
                      <div
                        key={line.lineId}
                        className="flex justify-between text-xs"
                      >
                        <span>
                          {line.menuName} x {line.quantity}
                        </span>
                        <span>
                          ₩{line.lineAmount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

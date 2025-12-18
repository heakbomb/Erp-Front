// modules/salesC/usePosTerminal.ts
"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/contexts/StoreContext";
import { salesApi } from "./salesApi";
import type { PosMenuItem, CartLine, PosOrderResponse, PaymentMethod } from "./salesTypes";

export default function usePosTerminal() {
  const { currentStoreId } = useStore();
  const [menus, setMenus] = useState<PosMenuItem[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");
  const [discount, setDiscount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<PosOrderResponse | null>(null);

  useEffect(() => {
    const sum = cart.reduce((acc, line) => acc + line.unitPrice * line.quantity, 0);
    setTotalAmount(sum - discount);
  }, [cart, discount]);

  useEffect(() => {
    if (!currentStoreId) return;
    salesApi.getPosMenus(currentStoreId)
      .then(setMenus)
      .catch(e => { console.error(e); setError("메뉴 로드 실패"); });
  }, [currentStoreId]);

  const addToCart = (menu: PosMenuItem) => {
    setCart(prev => {
      const found = prev.find(l => l.menuId === menu.menuId);
      if (found) return prev.map(l => l.menuId === menu.menuId ? { ...l, quantity: l.quantity + 1 } : l);
      return [...prev, { menuId: menu.menuId, menuName: menu.menuName, quantity: 1, unitPrice: menu.price }];
    });
  };

  const updateQuantity = (menuId: number, qty: number) => {
    setCart(prev => prev.map(l => l.menuId === menuId ? { ...l, quantity: qty } : l).filter(l => l.quantity > 0));
  };

  const clearCart = () => setCart([]);

  const submitOrder = async () => {
    if (!currentStoreId) return setError("사업장 선택 필요");
    if (cart.length === 0) return setError("장바구니가 비어있습니다.");

    setLoading(true); setError(null);
    try {
      const idempotencyKey = crypto.randomUUID();
      const res = await salesApi.createPosOrder({
        storeId: currentStoreId,
        idempotencyKey,
        paymentMethod,
        totalDiscount: discount,
        items: cart.map(l => ({ menuId: l.menuId, quantity: l.quantity, unitPrice: l.unitPrice })),
      });
      setLastOrder(res);
      clearCart();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "결제 오류";
      if (msg.startsWith("INSUFFICIENT_STOCK")) {
        setError(`재고 부족: ${msg.split(":")[1]?.trim() || "확인 필요"}`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    menus, cart, paymentMethod, setPaymentMethod, discount, setDiscount, totalAmount,
    loading, error, lastOrder, addToCart, updateQuantity, clearCart, submitOrder
  };
}
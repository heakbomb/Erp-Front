// src/features/owner/sales/hooks/usePosTerminal.ts
"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/shared/api/apiClient"
import { useStore } from "@/contexts/StoreContext"

// 백엔드 PaymentMethod enum과 맞춤
export type PaymentMethod = "CARD" | "CASH" | "APP"

export type PosMenuItem = {
  menuId: number
  menuName: string
  price: number
}

export type CartLine = {
  menuId: number
  menuName: string
  quantity: number
  unitPrice: number
}

export type PosOrderLine = {
  lineId: number
  menuId: number
  menuName: string
  quantity: number
  unitPrice: number
  lineAmount: number
}

export type PosOrderResponse = {
  transactionId: number
  storeId: number
  transactionTime: string
  totalAmount: number
  totalDiscount: number
  paymentMethod: PaymentMethod
  status: string
  lines: PosOrderLine[]
}

type UsePosTerminalResult = {
  menus: PosMenuItem[]
  cart: CartLine[]
  paymentMethod: PaymentMethod
  setPaymentMethod: React.Dispatch<React.SetStateAction<PaymentMethod>>
  discount: number
  setDiscount: React.Dispatch<React.SetStateAction<number>>
  totalAmount: number
  loading: boolean
  error: string | null
  lastOrder: PosOrderResponse | null
  addToCart: (menu: PosMenuItem) => void
  updateQuantity: (menuId: number, qty: number) => void
  clearCart: () => void
  submitOrder: () => Promise<void>
}

export default function usePosTerminal(): UsePosTerminalResult {
  const { currentStoreId } = useStore()

  const [menus, setMenus] = useState<PosMenuItem[]>([])
  const [cart, setCart] = useState<CartLine[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD")
  const [discount, setDiscount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastOrder, setLastOrder] = useState<PosOrderResponse | null>(null)

  // 합계 계산 (장바구니/할인 바뀔 때마다)
  useEffect(() => {
    const sum = cart.reduce(
      (acc, line) => acc + line.unitPrice * line.quantity,
      0,
    )
    setTotalAmount(sum - discount)
  }, [cart, discount])

  // 메뉴 로딩
  useEffect(() => {
    if (!currentStoreId) return

    const loadMenus = async () => {
      try {
        const res = await apiClient.get<PosMenuItem[]>(
          "/owner/menu/pos",
          {
            params: { storeId: currentStoreId },
          },
        )
        setMenus(res.data)
      } catch (e) {
        console.error(e)
        setError("메뉴를 불러오는 중 오류가 발생했습니다.")
      }
    }

    loadMenus()
  }, [currentStoreId])

  const addToCart = (menu: PosMenuItem) => {
    setCart((prev) => {
      const found = prev.find((l) => l.menuId === menu.menuId)
      if (found) {
        return prev.map((l) =>
          l.menuId === menu.menuId
            ? { ...l, quantity: l.quantity + 1 }
            : l,
        )
      }
      return [
        ...prev,
        {
          menuId: menu.menuId,
          menuName: menu.menuName,
          quantity: 1,
          unitPrice: menu.price,
        },
      ]
    })
  }

  const updateQuantity = (menuId: number, qty: number) => {
    setCart((prev) =>
      prev
        .map((l) =>
          l.menuId === menuId ? { ...l, quantity: qty } : l,
        )
        .filter((l) => l.quantity > 0),
    )
  }

  const clearCart = () => setCart([])

  const submitOrder = async () => {
    if (!currentStoreId) {
      setError("사업장을 선택해 주세요.")
      return
    }
    if (cart.length === 0) {
      setError("장바구니가 비어 있습니다.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 간단 멱등키
      const idempotencyKey = crypto.randomUUID()

      const payload = {
        storeId: currentStoreId,
        idempotencyKey,
        paymentMethod,
        totalDiscount: discount,
        items: cart.map((l) => ({
          menuId: l.menuId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
        })),
      }

      const res = await apiClient.post<PosOrderResponse>(
        "/owner/sales/pos-order",
        payload,
      )

      setLastOrder(res.data)
      clearCart()
    } catch (e: any) {
      console.error(e)

      const rawMessage: string =
        e?.message ??
        e?.response?.data?.message ??
        "결제 처리 중 오류가 발생했습니다."

      if (rawMessage.startsWith("INSUFFICIENT_STOCK")) {
        const itemName = rawMessage.split(":")[1]?.trim() ?? ""
        const friendly = itemName
          ? `재고 부족: "${itemName}" 재고가 부족합니다. 입고(매입)를 먼저 등록해 주세요.`
          : "재고가 부족합니다. 재고 현황을 확인해 주세요."
        setError(friendly)
      } else {
        setError(rawMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return {
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
  }
}

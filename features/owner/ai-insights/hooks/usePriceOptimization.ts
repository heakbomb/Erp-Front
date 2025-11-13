"use client"

import { useMemo, useState } from "react"
import { getMenuItems, type MenuItem } from "@/features/owner/ai-insights/services/priceOptimizationService"

export default function usePriceOptimization() {
  const menuItems: MenuItem[] = useMemo(() => getMenuItems(), [])
  const [selectedMenu, setSelectedMenu] = useState<MenuItem>(menuItems[0])

  // 뷰에서 계산해도 되지만, 나중에 로직 옮기고 싶으면 여기로
  return {
    menuItems,
    selectedMenu,
    setSelectedMenu,
  }
}
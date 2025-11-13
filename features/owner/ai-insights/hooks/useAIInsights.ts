"use client"

import { useMemo } from "react"
import {
  getDemandForecast,
  getMenuPerformance,
  getPriceOptimizationSummary,
  getCategoryData,
  getInventoryAlerts,
  type DemandForecast,
  type MenuPerformance,
  type PriceOptimizationSummary,
  type CategoryData,
  type InventoryAlert,
} from "@/features/owner/ai-insights/services/aiInsightsService"

export default function useAIInsights() {
  // 지금은 정적 데이터라 useMemo로 감싸기만 함
  const demandForecast: DemandForecast[] = useMemo(() => getDemandForecast(), [])
  const menuPerformance: MenuPerformance[] = useMemo(() => getMenuPerformance(), [])
  const priceOptimization: PriceOptimizationSummary[] = useMemo(() => getPriceOptimizationSummary(), [])
  const categoryData: CategoryData[] = useMemo(() => getCategoryData(), [])
  const inventoryAlerts: InventoryAlert[] = useMemo(() => getInventoryAlerts(), [])

  return {
    demandForecast,
    menuPerformance,
    priceOptimization,
    categoryData,
    inventoryAlerts,
  }
}
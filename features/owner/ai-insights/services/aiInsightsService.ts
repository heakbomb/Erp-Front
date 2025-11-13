
// === 수요 예측 데이터 ===
const demandForecastData = [
  { date: "04/21", predicted: 1200000, actual: 0 },
  { date: "04/22", predicted: 980000, actual: 0 },
  { date: "04/23", predicted: 850000, actual: 0 },
  { date: "04/24", predicted: 920000, actual: 0 },
  { date: "04/25", predicted: 1050000, actual: 0 },
  { date: "04/26", predicted: 1380000, actual: 0 },
  { date: "04/27", predicted: 1450000, actual: 0 },
]

// === 메뉴 성과 데이터 ===
const menuPerformanceData = [
  { name: "아메리카노", sales: 652500, margin: 73.3, trend: "up" as const },
  { name: "카페라떼", sales: 490000, margin: 64.0, trend: "up" as const },
  { name: "카푸치노", sales: 380000, margin: 62.0, trend: "down" as const },
  { name: "치즈케이크", sales: 292500, margin: 66.2, trend: "up" as const },
  { name: "딸기 스무디", sales: 192000, margin: 58.3, trend: "up" as const },
]

// === 가격 최적화 제안 데이터 ===
const priceOptimizationData = [
  {
    menu: "아메리카노",
    currentPrice: 4500,
    suggestedPrice: 4800,
    expectedMargin: 75.0,
    impact: "+2.5%",
  },
  {
    menu: "카페라떼",
    currentPrice: 5000,
    suggestedPrice: 5200,
    expectedMargin: 66.5,
    impact: "+3.2%",
  },
  {
    menu: "카푸치노",
    currentPrice: 5000,
    suggestedPrice: 4800,
    expectedMargin: 60.4,
    impact: "-1.8%",
  },
]

// === 카테고리 매출 비중 ===
const categoryData = [
  { name: "커피", value: 1522500, color: "hsl(var(--chart-1))" },
  { name: "음료", value: 192000, color: "hsl(var(--chart-2))" },
  { name: "디저트", value: 292500, color: "hsl(var(--chart-3))" },
]

// === 재고 알림 ===
const inventoryAlertsData = [
  { item: "커피 원두", current: 15, safety: 20, urgency: "high" as const, daysLeft: 3 },
  { item: "설탕", current: 8, safety: 10, urgency: "medium" as const, daysLeft: 5 },
  { item: "우유", current: 50, safety: 30, urgency: "low" as const, daysLeft: 2 },
]

// 지금은 하드코딩, 나중에 여기만 axios 호출로 교체
export function getDemandForecast() {
  return demandForecastData
}

export function getMenuPerformance() {
  return menuPerformanceData
}

export function getPriceOptimizationSummary() {
  return priceOptimizationData
}

export function getCategoryData() {
  return categoryData
}

export function getInventoryAlerts() {
  return inventoryAlertsData
}

// 타입이 필요하면 여기서 export 해서 재사용해도 됨
export type DemandForecast = (typeof demandForecastData)[number]
export type MenuPerformance = (typeof menuPerformanceData)[number]
export type PriceOptimizationSummary = (typeof priceOptimizationData)[number]
export type CategoryData = (typeof categoryData)[number]
export type InventoryAlert = (typeof inventoryAlertsData)[number]
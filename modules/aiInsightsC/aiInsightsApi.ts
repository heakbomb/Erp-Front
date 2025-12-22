// src/modules/aiInsights/aiInsightsApi.ts
import type {
  DemandForecast,
  MenuPerformance,
  PriceOptimizationSummary,
  CategoryData,
  InventoryAlert,
  MenuItem
} from "./aiInsightsTypes";

// Mock Data
const demandForecastData: DemandForecast[] = [
  { date: "04/21", predicted: 1200000, actual: 0 },
  { date: "04/22", predicted: 980000, actual: 0 },
  { date: "04/23", predicted: 850000, actual: 0 },
  { date: "04/24", predicted: 920000, actual: 0 },
  { date: "04/25", predicted: 1050000, actual: 0 },
  { date: "04/26", predicted: 1380000, actual: 0 },
  { date: "04/27", predicted: 1450000, actual: 0 },
];

const menuPerformanceData: MenuPerformance[] = [
  { name: "아메리카노", sales: 652500, margin: 73.3, trend: "up" },
  { name: "카페라떼", sales: 490000, margin: 64.0, trend: "up" },
  { name: "카푸치노", sales: 380000, margin: 62.0, trend: "down" },
  { name: "치즈케이크", sales: 292500, margin: 66.2, trend: "up" },
  { name: "딸기 스무디", sales: 192000, margin: 58.3, trend: "up" },
];

const priceOptimizationData: PriceOptimizationSummary[] = [
  { menu: "아메리카노", currentPrice: 4500, suggestedPrice: 4800, expectedMargin: 75.0, impact: "+2.5%" },
  { menu: "카페라떼", currentPrice: 5000, suggestedPrice: 5200, expectedMargin: 66.5, impact: "+3.2%" },
  { menu: "카푸치노", currentPrice: 5000, suggestedPrice: 4800, expectedMargin: 60.4, impact: "-1.8%" },
];

const categoryData: CategoryData[] = [
  { name: "커피", value: 1522500, color: "hsl(var(--chart-1))" },
  { name: "음료", value: 192000, color: "hsl(var(--chart-2))" },
  { name: "디저트", value: 292500, color: "hsl(var(--chart-3))" },
];

const inventoryAlertsData: InventoryAlert[] = [
  { item: "커피 원두", current: 15, safety: 20, urgency: "high", daysLeft: 3 },
  { item: "설탕", current: 8, safety: 10, urgency: "medium", daysLeft: 5 },
  { item: "우유", current: 50, safety: 30, urgency: "low", daysLeft: 2 },
];

const menuItemsData: MenuItem[] = [
  {
    id: 1,
    name: "아메리카노",
    currentMaterials: [
      { name: "국산 원두", cost: 800, origin: "국내" },
      { name: "물", cost: 10, origin: "국내" },
    ],
    alternativeMaterials: [
      { name: "스페인산 원두", cost: 600, origin: "스페인" },
      { name: "물", cost: 10, origin: "국내" },
    ],
    currentPrice: 4500,
    currentCost: 810,
    currentMargin: 82.0,
    alternativeCost: 610,
    alternativeMargin: 86.4,
    suggestedPrice: 4300,
  },
  {
    id: 2,
    name: "카페라떼",
    currentMaterials: [
      { name: "국산 원두", cost: 800, origin: "국내" },
      { name: "국산 우유", cost: 500, origin: "국내" },
    ],
    alternativeMaterials: [
      { name: "스페인산 원두", cost: 600, origin: "스페인" },
      { name: "수입 우유", cost: 400, origin: "호주" },
    ],
    currentPrice: 5000,
    currentCost: 1300,
    currentMargin: 74.0,
    alternativeCost: 1000,
    alternativeMargin: 80.0,
    suggestedPrice: 4800,
  },
];

export const aiInsightsApi = {
  getDashboardData: async () => {
    // 실제 API 연동 시: await apiClient.get("/ai/dashboard")
    return {
      demandForecast: demandForecastData,
      menuPerformance: menuPerformanceData,
      priceOptimization: priceOptimizationData,
      categoryData: categoryData,
      inventoryAlerts: inventoryAlertsData,
    };
  },

  getMenuItems: async () => {
    // 실제 API 연동 시: await apiClient.get("/ai/price-optimization/menus")
    return menuItemsData;
  },
};
// src/modules/aiInsightsC/aiInsightsTypes.ts

// ✅ 1. 백엔드 수요 예측 (Demand Forecast) DTO
export interface DemandForecastResponse {
  forecastId: number;
  storeId: number;
  forecastDate: string;
  predictedSalesMax: number;
  predictedVisitors: number;
}

// ✅ 2. Recharts 차트용 데이터 타입
export interface DemandForecastChartData {
  date: string;
  predicted: number;
  visitors: number;
  [key: string]: any; 
}

// ✅ 3. 기존 메뉴 및 가격 최적화 관련 타입
export interface Material {
  name: string;
  cost: number;
  origin: string;
}

export interface MenuItem {
  id: number;
  name: string;
  currentMaterials: Material[];
  alternativeMaterials: Material[];
  currentPrice: number;
  currentCost: number;
  currentMargin: number;
  alternativeCost: number;
  alternativeMargin: number;
  suggestedPrice: number;
}

export interface MenuPerformance {
  name: string;
  sales: number;
  margin: number;
  trend: "up" | "down";
  [key: string]: any;
}

export interface PriceOptimizationSummary {
  menu: string;
  currentPrice: number;
  suggestedPrice: number;
  expectedMargin: number;
  impact: string;
  [key: string]: any;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

export interface InventoryAlert {
  item: string;
  current: number;
  safety: number;
  urgency: "high" | "medium" | "low";
  daysLeft: number;
}

// ✅ [신규 추가] 메뉴 성장률 및 발주 제안 타입
export interface MenuGrowthStats {
  menuId: number;
  menuName: string;
  lastWeekSales: number;
  nextWeekPrediction: number;
  growthRate: number;
  recommendation: string;
}

export type ProfitForecastResponse = {
  storeId: number
  year: number
  month: number
  featureYm: string      // 예: "2025-12"
  predForYm: string      // 예: "2026-01"
  target: string         // 예: "y_next_profit"
  pred: number           // 예측값 (원 단위)
  modelPath?: string     // 있으면 표시용
}

export type MenuAnalyticsResponse = {
  menuPerformance: { name: string; sales: number }[];
  categoryData: { name: string; value: number }[];
};
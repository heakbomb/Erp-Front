// src/modules/aiInsightsC/aiInsightsTypes.ts

// ✅ 1. 백엔드 수요 예측 (Demand Forecast) DTO
export interface DemandForecastResponse {
  forecastId: number;
  storeId: number;
  forecastDate: string;        // "YYYY-MM-DD"
  predictedSalesMax: number;   // 예상 일 매출
  predictedVisitors: number;   // 예상 방문객 수
}

// ✅ 2. Recharts 차트용 데이터 타입
export interface DemandForecastChartData {
  date: string;
  predicted: number;
  visitors: number;
  [key: string]: any; 
}

// ✅ 3. 기존 메뉴 및 가격 최적화 관련 타입 (복구됨)
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
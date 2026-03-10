// src/modules/aiInsightsC/aiInsightsTypes.ts

// ✅ 1. 수요 예측 (Demand Forecast) DTO
export interface DemandForecastResponse {
  forecastId: number;
  storeId: number;
  forecastDate: string;        // 백엔드: LocalDate -> string
  predictedSalesMax: number;   // 백엔드: BigDecimal -> number
  predictedVisitors: number;   // 백엔드: Integer -> number
}

// ✅ 2. 메뉴 성장률 및 발주 제안 (백엔드 MenuGrowthResponse와 일치)
export interface MenuGrowthResponse {
  menuId: number;
  menuName: string;
  lastWeekSales: number;       // 지난주 실제 판매량
  nextWeekPrediction: number;  // 다음주 예측 판매량 (DB demand_forecast)
  growthRate: number;          // 증감률 (%)
  recommendation: string;      // "발주 증량", "유지", "감소" 등
}

// 기존 코드와의 호환성을 위해 별칭 사용
export type MenuGrowthStats = MenuGrowthResponse;


// --- 아래는 차트 표시용 가공 데이터 타입 ---

// Recharts 차트용
export interface DemandForecastChartData {
  date: string;
  predicted: number;
  visitors: number;
  [key: string]: any; 
}

// 메뉴 성과 차트용
export interface MenuAnalyticsResponse {
  menuPerformance: { name: string; sales: number }[];
  categoryData: { name: string; value: number }[];
}

// 수익 예측 응답
export type ProfitForecastResponse = {
  storeId: number;
  year: number;
  month: number;
  featureYm: string;
  predForYm: string;
  target: string;
  pred: number;
  modelPath?: string;
}

// 기타 레거시 타입 (필요시 유지)
export interface Material { name: string; cost: number; origin: string; }
export interface MenuItem { id: number; name: string; suggestedPrice: number; [key: string]: any; }
export interface CategoryData { name: string; value: number; color: string; }
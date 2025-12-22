// src/modules/aiInsights/aiInsightsTypes.ts

export interface DemandForecast {
  date: string;
  predicted: number;
  actual: number;
  [key: string]: any; // ✅ Recharts 호환용
}

export interface MenuPerformance {
  name: string;
  sales: number;
  margin: number;
  trend: "up" | "down";
  [key: string]: any; // ✅ Recharts 호환용
}

export interface PriceOptimizationSummary {
  menu: string;
  currentPrice: number;
  suggestedPrice: number;
  expectedMargin: number;
  impact: string;
  [key: string]: any; // ✅ Recharts 호환용
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
  [key: string]: any; // ✅ Recharts 호환용
}

export interface InventoryAlert {
  item: string;
  current: number;
  safety: number;
  urgency: "high" | "medium" | "low";
  daysLeft: number;
}

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
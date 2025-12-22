// src/modules/aiInsights/useAiInsights.ts
"use client";

import { useState, useEffect } from "react";
import { aiInsightsApi } from "./aiInsightsApi";
import type {
  DemandForecast,
  MenuPerformance,
  PriceOptimizationSummary,
  CategoryData,
  InventoryAlert
} from "./aiInsightsTypes";

export default function useAiInsights() {
  const [demandForecast, setDemandForecast] = useState<DemandForecast[]>([]);
  const [menuPerformance, setMenuPerformance] = useState<MenuPerformance[]>([]);
  const [priceOptimization, setPriceOptimization] = useState<PriceOptimizationSummary[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await aiInsightsApi.getDashboardData();
        setDemandForecast(data.demandForecast);
        setMenuPerformance(data.menuPerformance);
        setPriceOptimization(data.priceOptimization);
        setCategoryData(data.categoryData);
        setInventoryAlerts(data.inventoryAlerts);
      } catch (error) {
        console.error("AI Insight data fetch failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    demandForecast,
    menuPerformance,
    priceOptimization,
    categoryData,
    inventoryAlerts,
    isLoading,
  };
}
// src/modules/aiInsightsC/useAiInsights.ts
import { useState, useEffect } from "react";
import { useStore } from "@/contexts/StoreContext"; // ✅ Context import
import { aiInsightsApi } from "./aiInsightsApi";
import { DemandForecastChartData, MenuGrowthStats } from "./aiInsightsTypes";

export default function useAiInsights() { // ❌ storeId 인자 제거
  const { currentStoreId } = useStore(); // ✅ 동적 Store ID 사용

  const [demandForecast, setDemandForecast] = useState<DemandForecastChartData[]>([]);
  const [totalPredictedVisitors, setTotalPredictedVisitors] = useState<number>(0);
  const [expectedWeekendSales, setExpectedWeekendSales] = useState<number>(0);
  const [menuGrowthStats, setMenuGrowthStats] = useState<MenuGrowthStats[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 기존 Mock 데이터 (변경 없음) ---
  const [menuPerformance] = useState([
    { name: "제육 정식", sales: 1200000, margin: 35, trend: "up" },
    { name: "김치찌개", sales: 850000, margin: 40, trend: "up" },
    { name: "계란말이", sales: 450000, margin: 55, trend: "down" },
    { name: "순두부찌개", sales: 600000, margin: 42, trend: "up" },
  ]);

  const [priceOptimization] = useState([
    { menu: "제육 정식", currentPrice: 10000, suggestedPrice: 11000, expectedMargin: 38, impact: "+5.2%" },
    { menu: "계란말이", currentPrice: 8000, suggestedPrice: 7500, expectedMargin: 50, impact: "+12.0%" },
  ]);

  const [categoryData] = useState([
    { name: "식사류", value: 65, color: "#0088FE" },
    { name: "안주류", value: 20, color: "#00C49F" },
    { name: "주류", value: 15, color: "#FFBB28" },
  ]);

  const [inventoryAlerts] = useState([
    { item: "양파", current: 5, safety: 10, urgency: "high", daysLeft: 1 },
    { item: "돼지고기", current: 15, safety: 20, urgency: "medium", daysLeft: 3 },
  ]);

  // ✅ 백엔드 데이터 Fetching
  useEffect(() => {
    const fetchForecast = async () => {
      // ✅ currentStoreId가 없으면 로직 중단 (안전장치)
      if (!currentStoreId) return;
      
      try {
        setLoading(true);

        // 1. 수요 예측 데이터
        const data = await aiInsightsApi.getDemandForecast(currentStoreId);
        const chartData: DemandForecastChartData[] = data.map((item: any) => ({
          date: item.forecastDate,
          predicted: item.predictedSalesMax,
          visitors: item.predictedVisitors,
        }));
        chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setDemandForecast(chartData);

        if (chartData.length > 0) {
          setTotalPredictedVisitors(chartData[0].visitors);
          const totalSales = chartData.reduce((acc, curr) => acc + curr.predicted, 0);
          setExpectedWeekendSales(Math.round(totalSales * 0.35)); 
        }

        // 2. 메뉴 성장률 분석 (Mock) -> 실제 API 호출 시 currentStoreId 사용
        // const growthData = await aiInsightsApi.getMenuGrowth(currentStoreId);
        const mockGrowthData: MenuGrowthStats[] = [
            { menuId: 1, menuName: "마라탕", lastWeekSales: 120, nextWeekPrediction: 150, growthRate: 25.0, recommendation: "발주 증량" },
            { menuId: 2, menuName: "꿔바로우", lastWeekSales: 45, nextWeekPrediction: 40, growthRate: -11.1, recommendation: "발주 감소" },
            { menuId: 3, menuName: "볶음밥", lastWeekSales: 80, nextWeekPrediction: 82, growthRate: 2.5, recommendation: "유지" },
            { menuId: 4, menuName: "탄산음료", lastWeekSales: 200, nextWeekPrediction: 240, growthRate: 20.0, recommendation: "발주 증량" },
        ];
        setMenuGrowthStats(mockGrowthData);

      } catch (error) {
        console.error("Failed to fetch AI insights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [currentStoreId]); // ✅ 의존성 배열 수정

  return {
    demandForecast,
    menuPerformance,
    priceOptimization,
    categoryData,
    inventoryAlerts,
    loading,
    totalPredictedVisitors,
    expectedWeekendSales,
    menuGrowthStats, 
  };
}
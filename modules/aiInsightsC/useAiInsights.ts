// src/modules/aiInsightsC/useAiInsights.ts
import { useState, useEffect } from "react";
import { aiInsightsApi } from "./aiInsightsApi";
import { DemandForecastChartData } from "./aiInsightsTypes";

// storeId를 인자로 받거나, 없으면 기본값(예: 101) 사용
export default function useAiInsights(storeId: number = 101) {
  const [demandForecast, setDemandForecast] = useState<DemandForecastChartData[]>([]);
  const [totalPredictedVisitors, setTotalPredictedVisitors] = useState<number>(0);
  const [expectedWeekendSales, setExpectedWeekendSales] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // --- 기존 Mock 데이터 (아직 백엔드 연결 안 된 부분) ---
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
      if (!storeId) return;
      
      try {
        setLoading(true);
        const data = await aiInsightsApi.getDemandForecast(storeId);

        // API 응답 -> 차트 데이터 매핑
        const chartData: DemandForecastChartData[] = data.map((item) => ({
          date: item.forecastDate,
          predicted: item.predictedSalesMax,
          visitors: item.predictedVisitors,
        }));

        // 날짜순 정렬
        chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setDemandForecast(chartData);

        // 요약 카드용 계산 (예: 첫 번째 날짜의 방문객 수)
        if (chartData.length > 0) {
          setTotalPredictedVisitors(chartData[0].visitors);
          // (단순 예시) 7일치 합계의 30%를 주말 매출로 가정하거나 별도 로직 적용 가능
          const totalSales = chartData.reduce((acc, curr) => acc + curr.predicted, 0);
          setExpectedWeekendSales(Math.round(totalSales * 0.35)); 
        }

      } catch (error) {
        console.error("Failed to fetch demand forecast:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [storeId]);

  return {
    demandForecast,
    menuPerformance,
    priceOptimization,
    categoryData,
    inventoryAlerts,
    loading,
    totalPredictedVisitors, // View에서 사용
    expectedWeekendSales,   // View에서 사용
  };
}
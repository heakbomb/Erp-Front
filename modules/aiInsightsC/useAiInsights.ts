// src/modules/aiInsightsC/useAiInsights.ts
import { useState, useEffect, useMemo } from "react";
import { aiInsightsApi } from "./aiInsightsApi";
import type {
  DemandForecastChartData,
  MenuGrowthStats,
  MenuAnalyticsResponse,
} from "./aiInsightsTypes";

type CategoryPointWithColor = { name: string; value: number; color: string };

const toDateStr = (d: Date) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const getThisMonthRange = () => {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: toDateStr(from), to: toDateStr(now) };
};

// ✅ PieChart 색상은 프론트에서 매핑(원하면 카테고리 추가)
const CATEGORY_COLOR: Record<string, string> = {
  "밥/정식": "#6366F1",     // indigo
  "국/탕": "#06B6D4",       // cyan
  "찌개/전골": "#F97316",   // orange
  "볶음류": "#22C55E",      // green
  "면류": "#A855F7",        // purple
  "사이드": "#F43F5E",      // rose
  "음료": "#EAB308",        // amber
  "주류": "#0EA5E9",        // sky
  "미분류": "#94A3B8",      // slate
};

export default function useAiInsights(storeId: number = 101) {
  const [demandForecast, setDemandForecast] = useState<DemandForecastChartData[]>([]);
  const [totalPredictedVisitors, setTotalPredictedVisitors] = useState<number>(0);
  const [expectedWeekendSales, setExpectedWeekendSales] = useState<number>(0);
   const [menuGrowthStats, setMenuGrowthStats] = useState<MenuGrowthStats[]>([]);
  // ✅ 막대(메뉴별 성과) / 파이(카테고리 비중) - 실데이터
  const [menuPerformance, setMenuPerformance] = useState<MenuAnalyticsResponse["menuPerformance"]>([]);
  const [categoryData, setCategoryData] = useState<CategoryPointWithColor[]>([]);

  // 아직 백엔드 연동 안 된 것들은 빈 배열로 유지 (뷰 깨짐 방지)
  const priceOptimization: any[] = [];
  const inventoryAlerts: any[] = [];
  

  const [loading, setLoading] = useState(true);

  // ✅ 기본 기간(이번달) — 필요하면 추후 UI에서 from/to를 인자로 받게 확장 가능
  const range = useMemo(() => getThisMonthRange(), []);

  useEffect(() => {
    const run = async () => {
      if (!storeId) return;

      try {
        setLoading(true);

        // 1) 수요 예측
        const forecast = await aiInsightsApi.getDemandForecast(storeId);

        const chartData: DemandForecastChartData[] = forecast.map((item: any) => ({
          date: item.forecastDate,
          predicted: item.predictedSalesMax,
          visitors: item.predictedVisitors,
        }));

        chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setDemandForecast(chartData);

        if (chartData.length > 0) {
          setTotalPredictedVisitors(chartData[0].visitors ?? 0);
          const totalSales = chartData.reduce((acc, curr) => acc + (curr.predicted ?? 0), 0);
          setExpectedWeekendSales(Math.round(totalSales * 0.35));
        } else {
          setTotalPredictedVisitors(0);
          setExpectedWeekendSales(0);
        }

        // 2) 메뉴 성과 + 카테고리 비중 (Bar + Pie)
        const analytics = await aiInsightsApi.getMenuAnalytics({
          storeId,
          from: range.from,
          to: range.to,
        });

        setMenuPerformance(analytics.menuPerformance ?? []);

        setCategoryData(
          (analytics.categoryData ?? []).map((x) => ({
            ...x,
            color: CATEGORY_COLOR[x.name] ?? "hsl(var(--chart-5))",
          }))
        );
      } catch (error) {
        console.error("Failed to fetch ai insights:", error);

        // 실패 시 초기화
        setDemandForecast([]);
        setTotalPredictedVisitors(0);
        setExpectedWeekendSales(0);
        setMenuPerformance([]);
        setCategoryData([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [storeId, range.from, range.to]);

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

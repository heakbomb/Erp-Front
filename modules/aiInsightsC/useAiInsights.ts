// src/modules/aiInsightsC/useAiInsights.ts
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/contexts/StoreContext";
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

// ✅ PieChart 색상은 프론트에서 매핑
const CATEGORY_COLOR: Record<string, string> = {
  "밥/정식": "#6366F1",
  "국/탕": "#06B6D4",
  "찌개/전골": "#F97316",
  "볶음류": "#22C55E",
  "면류": "#A855F7",
  "사이드": "#F43F5E",
  "음료": "#EAB308",
  "주류": "#0EA5E9",
  "미분류": "#94A3B8",
};

export default function useAiInsights() {
  const { currentStoreId } = useStore();

  const [demandForecast, setDemandForecast] = useState<DemandForecastChartData[]>([]);
  const [totalPredictedVisitors, setTotalPredictedVisitors] = useState<number>(0);
  const [expectedWeekendSales, setExpectedWeekendSales] = useState<number>(0);

  const [menuGrowthStats, setMenuGrowthStats] = useState<MenuGrowthStats[]>([]);

  // ✅ 실데이터: 막대(메뉴별 성과) / 파이(카테고리 비중)
  const [menuPerformance, setMenuPerformance] =
    useState<MenuAnalyticsResponse["menuPerformance"]>([]);
  const [categoryData, setCategoryData] = useState<CategoryPointWithColor[]>([]);

  // 아직 백엔드 연동 안 된 것들은 빈 배열 유지
  const priceOptimization: any[] = [];
  const inventoryAlerts: any[] = [];

  const [loading, setLoading] = useState(true);

  // ✅ 기본 기간: 이번달
  const range = useMemo(() => getThisMonthRange(), []);

  useEffect(() => {
    const run = async () => {
      if (!currentStoreId) return;

      try {
        setLoading(true);

        // 1) 수요 예측
        const forecast = await aiInsightsApi.getDemandForecast(currentStoreId);
        const chartData: DemandForecastChartData[] = (forecast ?? []).map((item: any) => ({
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
          storeId: currentStoreId,
          from: range.from,
          to: range.to,
        });

        setMenuPerformance(analytics?.menuPerformance ?? []);
        setCategoryData(
          (analytics?.categoryData ?? []).map((x: any) => ({
            name: x.name,
            value: x.value,
            color: CATEGORY_COLOR[x.name] ?? "#94A3B8", // 미정은 회색
          }))
        );

        // 3) 주간 메뉴 트렌드(성장률) — API 있으면 호출 / 없으면 fallback
        // ✅ 실제 API가 준비되어 있다면 이걸로 바꿔서 쓰면 됨:
        // const growth = await aiInsightsApi.getMenuGrowthStats(currentStoreId);
        // setMenuGrowthStats(growth ?? []);

        // fallback (원치 않으면 제거 가능)
        const fallback: MenuGrowthStats[] = [
          { menuId: 1, menuName: "마라탕", lastWeekSales: 120, nextWeekPrediction: 150, growthRate: 25.0, recommendation: "발주 증량" },
          { menuId: 2, menuName: "꿔바로우", lastWeekSales: 45, nextWeekPrediction: 40, growthRate: -11.1, recommendation: "발주 감소" },
          { menuId: 3, menuName: "볶음밥", lastWeekSales: 80, nextWeekPrediction: 82, growthRate: 2.5, recommendation: "유지" },
          { menuId: 4, menuName: "탄산음료", lastWeekSales: 200, nextWeekPrediction: 240, growthRate: 20.0, recommendation: "발주 증량" },
        ];
        setMenuGrowthStats(fallback);
      } catch (e) {
        console.error("Failed to fetch ai insights:", e);

        // 실패 시 초기화 (뷰 깨짐 방지)
        setDemandForecast([]);
        setTotalPredictedVisitors(0);
        setExpectedWeekendSales(0);
        setMenuPerformance([]);
        setCategoryData([]);
        setMenuGrowthStats([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [currentStoreId, range.from, range.to]);

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

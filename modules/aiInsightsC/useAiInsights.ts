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

  // ✅ 실제 백엔드 데이터로 채울 상태
  const [menuGrowthStats, setMenuGrowthStats] = useState<MenuGrowthStats[]>([]);

  const [menuPerformance, setMenuPerformance] =
    useState<MenuAnalyticsResponse["menuPerformance"]>([]);
  const [categoryData, setCategoryData] = useState<CategoryPointWithColor[]>([]);

  const priceOptimization: any[] = [];
  const inventoryAlerts: any[] = [];

  const [loading, setLoading] = useState(true);

  const range = useMemo(() => getThisMonthRange(), []);

  useEffect(() => {
    const run = async () => {
      if (!currentStoreId) return;

      try {
        setLoading(true);

        // 1) 수요 예측 (그래프)
        const forecast = await aiInsightsApi.getDemandForecast(currentStoreId);
        const chartData: DemandForecastChartData[] = (forecast ?? []).map((item) => ({
          date: item.forecastDate,
          predicted: item.predictedSalesMax, // 백엔드 DTO 필드명 매핑
          visitors: item.predictedVisitors,
        }));

        chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setDemandForecast(chartData);

        // 요약 카드용 수치 계산
        if (chartData.length > 0) {
          // 내일 방문객 (첫 번째 데이터 사용)
          setTotalPredictedVisitors(chartData[0].visitors ?? 0);
          
          // 주말 예상 매출 합계
          const weekendSales = chartData
            .filter(d => {
              const day = new Date(d.date).getDay();
              return day === 0 || day === 5 || day === 6; // 일, 금, 토
            })
            .reduce((acc, curr) => acc + (curr.predicted ?? 0), 0);
            
          setExpectedWeekendSales(Math.round(weekendSales));
        } else {
          setTotalPredictedVisitors(0);
          setExpectedWeekendSales(0);
        }

        // 2) 주간 메뉴 트렌드 (발주 참고 표) - ✅ 실제 API 호출
        const growth = await aiInsightsApi.getMenuGrowthStats(currentStoreId);
        setMenuGrowthStats(growth ?? []);

        // 3) 메뉴 성과 + 카테고리 비중
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
            color: CATEGORY_COLOR[x.name] ?? "#94A3B8",
          }))
        );

      } catch (e) {
        console.error("Failed to fetch ai insights:", e);
        // 에러 시 초기화
        setDemandForecast([]);
        setMenuGrowthStats([]);
        setMenuPerformance([]);
        setCategoryData([]);
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
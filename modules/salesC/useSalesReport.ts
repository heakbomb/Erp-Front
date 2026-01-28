"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/contexts/StoreContext";
import { salesApi } from "./salesApi";
import type { MonthlyReport, MonthlyTopMenu, WeeklyPoint } from "./salesTypes";

function toPieTopMenus(raw: { menuName: string; revenue: number }[]): MonthlyTopMenu[] {
  const rows = (raw ?? []).map((m) => ({
    menuName: m.menuName ?? "미상",
    sales: Number(m.revenue ?? 0),
  }));

  const total = rows.reduce((acc, r) => acc + r.sales, 0);

  return rows.map((r) => ({
    menuName: r.menuName,
    sales: r.sales,
    rate: total > 0 ? Math.round((r.sales / total) * 1000) / 10 : 0, // 소수1자리 %
  }));
}

export default function useSalesReport({ year, month }: { year: number; month: number }) {
  const { currentStoreId } = useStore();
  const [data, setData] = useState<
    | (Omit<MonthlyReport, "topMenus"> & {
        topMenus: MonthlyTopMenu[]; // ✅ 화면에는 파이차트용으로 내려줌
      })
    | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!currentStoreId || !year || !month) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) 내 월간 리포트 (백엔드는 TopMenuStatsResponse[] 내려줌)
        const report = await salesApi.getMonthlyReport(currentStoreId, year, month);

        // 2) 주간 지역평균
        const area = await salesApi.getWeeklyAreaAvg(currentStoreId, year, month);

        // 3) 주간 데이터에 areaAvgSales 합치기
        const weeklySales: WeeklyPoint[] = (report.weeklySales || []).map((w: any) => {
          const match = area.data.find((a) => a.weekIndex === w.weekIndex);
          const raw = match?.areaAvgSales ?? 0;
          return {
            ...w,
            areaAvgSales: Math.floor(Number(raw)),
          };
        });

        // ✅ 4) topMenus를 파이차트용으로 변환
        // report.topMenus: [{menuId, menuName, quantity, revenue}]
        const pieTopMenus = toPieTopMenus(
          (report.topMenus ?? []).map((m: any) => ({
            menuName: m.menuName ?? m.name ?? "미상",
            revenue: Number(m.revenue ?? m.sales ?? 0),
          }))
        );

        // ✅ 화면에 내려줄 data.topMenus는 MonthlyTopMenu[]
        setData({
          ...report,
          topMenus: pieTopMenus,
          weeklySales,
        });
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [currentStoreId, year, month]);

  return { data, loading, error, currentStoreId };
}

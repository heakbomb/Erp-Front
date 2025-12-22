// modules/salesC/OwnerSalesReportView.tsx
"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

// ✅ 하위 컴포넌트 import
import { YearMonthSelect } from "./components/YearMonthSelect";
import { SummarySection } from "./components/SummarySection";
import { PieChartSection } from "./components/PieChartSection";
import { WeeklyGraph } from "./components/WeeklyGraph";
import { WeeklyTable } from "./components/WeeklyTable";

import useSalesReport from "./useSalesReport";

export default function OwnerSalesReportView() {
  const params = useSearchParams();
  const router = useRouter();
  const printableRef = useRef<HTMLDivElement | null>(null);

  const now = useMemo(() => new Date(), []);
  const initialYear = Number(params.get("year")) || now.getFullYear();
  const initialMonth = Number(params.get("month")) || now.getMonth() + 1;

  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  useEffect(() => {
    const y = Number(params.get("year"));
    const m = Number(params.get("month"));
    if (y && m) {
      setYear(y);
      setMonth(m);
    }
  }, [params]);

  const { data, loading, error, currentStoreId } = useSalesReport({ year, month });

  const handleChange = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
    router.push(`/owner/sales/report?year=${y}&month=${m}`, { scroll: false });
  };

  const handlePrint = () => {
    if (typeof window === "undefined") return;
    window.print();
  };

  if (!currentStoreId) return <div>매장을 선택해주세요.</div>;
  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>리포트를 불러오는 중 오류가 발생했습니다.</div>;
  if (!data) return <div>표시할 데이터가 없습니다.</div>;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold">월간 매출 리포트</h1>
          <p className="text-muted-foreground">
            {year}년 {month}월 매출 현황 리포트
          </p>
        </div>
        <div className="flex items-center gap-3">
          <YearMonthSelect year={year} month={month} onChange={handleChange} />
          <Button variant="outline" onClick={handlePrint}>
            PDF 다운로드 (인쇄)
          </Button>
        </div>
      </div>

      {/* 리포트 본문 (인쇄 대상) */}
      <div
        id="report-content"
        ref={printableRef}
        className="grid gap-4 lg:grid-cols-2 bg-white p-6 rounded-xl border shadow-sm print:block print:p-8"
      >
        <div className="col-span-2 mb-4 hidden print:block text-center">
          <h1 className="text-2xl font-semibold">
            {year}년 {month}월 매출 리포트
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            지점 매출 현황 · 인기 메뉴 · 주간 추이
          </p>
        </div>

        <div className="space-y-4">
          <Card className="print-avoid-break">
            <CardHeader>
              <CardTitle>인기 메뉴 비율</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChartSection data={data.topMenus} />
            </CardContent>
          </Card>

          <Card className="print-avoid-break">
            <CardHeader>
              <CardTitle>요약</CardTitle>
            </CardHeader>
            <CardContent>
              <SummarySection summary={data.summary} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="print-avoid-break">
            <CardHeader>
              <CardTitle>주간 매출 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyGraph data={data.weeklySales} />
            </CardContent>
          </Card>

          <Card className="print-avoid-break">
            <CardHeader>
              <CardTitle>주간 매출 상세</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyTable data={data.weeklySales} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
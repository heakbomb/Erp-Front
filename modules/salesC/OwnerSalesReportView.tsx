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

/**
 * ✅ 인쇄 전용: WeeklyTable(스크롤/가상화/ScrollArea)을 우회하고
 * 같은 데이터로 "순수 <table>"을 출력해서 잘림을 원천 차단.
 * - 화면(UI)에는 영향 없음(print에서만 렌더링)
 */
function PrintWeeklyTable({ data }: { data: any[] }) {
  const money = (v: any) => {
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n)) return "-";
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(n);
  };

  const num = (v: any) => {
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n)) return "-";
    return new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 }).format(n);
  };

  const weekLabel = (row: any, idx: number) => {
    const w =
      row?.week ??
      row?.weekNo ??
      row?.weekIndex ??
      row?.weekNumber ??
      row?.weekOfMonth ??
      row?.label;

    if (typeof w === "string" && w.trim()) return w.includes("주차") ? w : `${w}주차`;
    if (typeof w === "number") return `${w}주차`;
    return `${idx + 1}주차`;
  };

  const mySales = (row: any) =>
    row?.mySales ?? row?.my ?? row?.sales ?? row?.storeSales ?? row?.value ?? row?.myAmount;

  // ✅ 너 데이터 구조상 여기로 들어오는 값은 weeklySales.areaAvgSales
  //    하지만 혹시 모를 구조 대응도 열어둠
  const regionAvg = (row: any) =>
    row?.areaAvgSales ??
    row?.regionAvg ??
    row?.avg ??
    row?.average ??
    row?.regionAverage ??
    row?.avgSales ??
    row?.mean;

  // ✅ FIX: 인쇄에서 gap이 '-'로 나오는 문제 해결
  // - 서버가 gap을 안 내려주면: mySales - regionAvg 로 직접 계산
  const gap = (row: any) => {
    const raw =
      row?.gap ??
      row?.diff ??
      row?.difference ??
      row?.delta ??
      row?.variance ??
      row?.gapSales ??
      row?.salesGap;

    // 값이 있으면 그대로 사용(문자열이어도 Number 변환은 money/num에서 처리)
    if (raw !== undefined && raw !== null && raw !== "") return raw;

    // 없으면 계산
    const a = mySales(row);
    const b = regionAvg(row);

    const na = typeof a === "number" ? a : Number(a);
    const nb = typeof b === "number" ? b : Number(b);

    if (!Number.isFinite(na) || !Number.isFinite(nb)) return null;
    return na - nb;
  };

  return (
    <div className="w-full">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left font-medium py-2 border-b">주차</th>
            <th className="text-right font-medium py-2 border-b">내 매출</th>
            <th className="text-right font-medium py-2 border-b">구 평균 매출</th>
            <th className="text-right font-medium py-2 border-b">격차</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((row: any, idx: number) => {
            const a = mySales(row);
            const b = regionAvg(row);
            const g = gap(row);

            return (
              <tr key={row?.id ?? row?.week ?? row?.weekIndex ?? idx}>
                <td className="py-2 border-b">{weekLabel(row, idx)}</td>
                <td className="py-2 border-b text-right">{money(a)}</td>
                <td className="py-2 border-b text-right">{money(b)}</td>

                {/* ✅ 격차도 매출 단위(원)로 보여주는 게 자연스러워서 money로 통일 */}
                <td className="py-2 border-b text-right">{money(g)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function OwnerSalesReportView() {
  const params = useSearchParams();
  const router = useRouter();
  const printableRef = useRef<HTMLDivElement | null>(null);

  const now = useMemo(() => new Date(), []);
  const initialYear = Number(params.get("year")) || now.getFullYear();
  const initialMonth = Number(params.get("month")) || now.getMonth() + 1;

  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  // ✅ 인쇄 모드 여부 추적 (print일 때 WeeklyTable을 아예 렌더링하지 않기 위함)
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const y = Number(params.get("year"));
    const m = Number(params.get("month"));
    if (y && m) {
      setYear(y);
      setMonth(m);
    }
  }, [params]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const beforePrint = () => setIsPrinting(true);
    const afterPrint = () => setIsPrinting(false);

    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);

    return () => {
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, []);

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
          <p className="mt-1 text-sm text-muted-foreground">지점 매출 현황 · 인기 메뉴 · 주간 추이</p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>인기 메뉴 비율</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChartSection data={data.topMenus} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>요약</CardTitle>
            </CardHeader>
            <CardContent>
              <SummarySection summary={data.summary} />
            </CardContent>
          </Card>
        </div>

        {/* ✅ 다음 페이지로 넘기고 싶은 의도라면 이 라인이 더 안전 */}
        <div className="hidden print:block" style={{ breakBefore: "page" }} />

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>주간 매출 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyGraph data={data.weeklySales} />
            </CardContent>
          </Card>

          {/* ✅ 화면(UI)에서만 WeeklyTable 렌더 (인쇄 때는 아예 렌더 X) */}
          {!isPrinting && (
            <Card className="print:hidden">
              <CardHeader>
                <CardTitle>주간 매출 상세</CardTitle>
              </CardHeader>
              <CardContent>
                <WeeklyTable data={data.weeklySales} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* ✅ 인쇄에서는 다음 페이지부터 테이블 시작(절대 안 잘리게) */}
        <div className="hidden print:block" />

        {/* ✅ 인쇄에서만 "순수 table"로 렌더링 (잘림 방지) */}
        <div className="hidden print:block">
          <Card>
            <CardHeader>
              <CardTitle>주간 매출 상세</CardTitle>
            </CardHeader>
            <CardContent>
              <PrintWeeklyTable data={data.weeklySales} />
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          /* ✅ 종이 여백/페이지 설정 */
          @page {
            size: A4;
            margin: 12mm;
          }

          html,
          body {
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* ✅ 인쇄 대상 영역: grid 끄고 흐름 레이아웃으로 */
          #report-content {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* ✅ Tailwind 고정 높이/스크롤 계열 강제 해제 */
          .h-screen,
          .min-h-screen,
          .max-h-screen {
            height: auto !important;
            min-height: auto !important;
            max-height: none !important;
          }

          .overflow-hidden,
          .overflow-auto,
          .overflow-scroll {
            overflow: visible !important;
          }

          /* ✅ Radix ScrollArea(Shadcn) viewport/root 높이/오버플로우 해제 */
          [data-radix-scroll-area-viewport],
          [data-radix-scroll-area-root] {
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }

          /* ✅ 테이블 헤더 반복 */
          table thead {
            display: table-header-group;
          }
          table tfoot {
            display: table-footer-group;
          }

          /* ✅ 행 단위는 쪼개지지 않게 */
          tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /* ✅ 차트가 잘릴 때 대비 */
          canvas,
          svg {
            max-width: 100% !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

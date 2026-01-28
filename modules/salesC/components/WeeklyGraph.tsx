// modules/salesC/components/WeeklyGraph.tsx
"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { MonthlyReport } from "../salesTypes";

// ✅ 돈 포맷
const money = (v: number | undefined | null) =>
  new Intl.NumberFormat("ko-KR").format(Math.round(Number(v ?? 0)));

// ✅ 최대값 자릿수 기반으로 Y축 width 자동 산정 (숫자 잘림 방지)
const yAxisWidthFromMax = (max: number, minWidth = 60, maxWidth = 120) => {
  const digits = String(Math.max(0, Math.floor(Math.abs(max)))).length;
  const commaCount = Math.floor((digits - 1) / 3);
  const approxChars = digits + commaCount + 2; // 여유 +2
  const px = approxChars * 8; // 대략 글자폭
  return Math.min(maxWidth, Math.max(minWidth, px));
};

// ✅ 범례를 "내 매출 -> 구 평균 매출" 순서로 강제 렌더링
function FixedLegend() {
  const items = [
    { label: "내 매출", color: "#3b82f6" },
    { label: "구 평균 매출", color: "#e2e8f0" },
  ];

  return (
    <ul className="flex justify-center gap-6 pt-2 text-sm">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: it.color }}
          />
          <span>{it.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function WeeklyGraph({ data }: { data: MonthlyReport["weeklySales"] }) {
  const maxY = Math.max(
    0,
    ...(data?.map((d: any) =>
      Math.max(Number(d?.areaAvgSales ?? 0), Number(d?.mySales ?? 0))
    ) ?? [0])
  );

  const yWidth = yAxisWidthFromMax(maxY, 70, 130);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        // ✅ left 여백 넉넉히 (Y축 숫자 잘림 방지)
        margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="weekIndex" tickFormatter={(v) => `${v}주차`} />

        <YAxis
          width={yWidth}
          tickMargin={8}
          tickFormatter={(v) => money(Number(v))}
        />

        <Tooltip formatter={(val: any) => `₩${money(Number(val))}`} />

        {/* ✅ 이게 핵심: recharts 기본 Legend 대신 커스텀 content로 고정 */}
        <Legend content={<FixedLegend />} />

        {/* ✅ 막대 위치: 내 매출(왼쪽) -> 구 평균(오른쪽) */}
        <Bar
          dataKey="mySales"
          name="내 매출"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="areaAvgSales"
          name="구 평균 매출"
          fill="#e2e8f0"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

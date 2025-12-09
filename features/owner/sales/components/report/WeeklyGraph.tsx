"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"

interface WeeklyPoint {
  weekIndex: number
  mySales: number | string
  areaAvgSales: number | string
}

interface WeeklyGraphProps {
  data: WeeklyPoint[]
}

export function WeeklyGraph({ data }: WeeklyGraphProps) {
  const chartData = (data || []).map((d) => ({
    week: `${d.weekIndex}주차`,
    mySales: Number(d.mySales || 0),
    areaAvgSales: Number(d.areaAvgSales || 0),
  }))

  return (
    // 🔥 overflow-hidden 추가해서 스크롤바 생기며 흔들리는 것 방지
    <div className="w-full h-[260px] overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 16, right: 24, bottom: 8, left: 48 }}
        >
          <XAxis dataKey="week" />
          <YAxis
            width={80}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(v: number) => v.toLocaleString()}
          />
          <Tooltip
            // 🔥 마우스 이벤트로 인한 리렌더 줄이기
            wrapperStyle={{ pointerEvents: "none" }}
            formatter={(value: any) => `${Number(value).toLocaleString()}원`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="mySales"
            name="내 매장"
            stroke="#4f46e5"
            strokeWidth={2}
            // 🔥 애니메이션/hover 애니메이션 둘 다 끄기
            isAnimationActive={false}
            animationDuration={0}
            dot={false}             // 점 없애면 흔들림 더 줄어듦 (원하면 true로)
            activeDot={{ r: 4 }}    // hover 시 작은 점만
          />
          <Line
            type="monotone"
            dataKey="areaAvgSales"
            name="상권 평균"
            stroke="#94a3b8"
            strokeWidth={2}
            isAnimationActive={false}
            animationDuration={0}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

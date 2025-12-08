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
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 16, right: 24, bottom: 8, left: 48 }} // ← 왼쪽 여백
        >
          <XAxis dataKey="week" />
          <YAxis
            width={80}              // ← Y축 숫자 영역 확보
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(v: number) => v.toLocaleString()}
          />
          <Tooltip
            formatter={(value: any) => `${Number(value).toLocaleString()}원`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="mySales"
            name="내 매장"
            stroke="#4f46e5"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="areaAvgSales"
            name="상권 평균"
            stroke="#94a3b8"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

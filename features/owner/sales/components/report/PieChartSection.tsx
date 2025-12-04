"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TopMenu {
  menuName: string
  sales: number | string
  rate: number | string
}

interface PieChartSectionProps {
  data: TopMenu[]
}

const COLORS = ["#4f46e5", "#3b82f6", "#06b6d4", "#10b981", "#fbbf24"]

export function PieChartSection({ data }: PieChartSectionProps) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">데이터가 없습니다.</div>
  }

  const chartData = data.map((d) => ({
    name: d.menuName,
    value: Number(d.rate || 0),
  }))

  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, value }) => `${name} (${value}%)`}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

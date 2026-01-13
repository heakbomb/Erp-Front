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

export function WeeklyGraph({ data }: { data: MonthlyReport["weeklySales"] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="weekIndex" tickFormatter={(v) => `${v}주차`} />
        <YAxis />
        <Tooltip formatter={(val: number) => `₩${val.toLocaleString()}`} />
        <Legend />
         <Bar dataKey="areaAvgSales" name=" 구 평균 매출" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
        <Bar dataKey="mySales" name="내 매출" fill="#3b82f6" radius={[4, 4, 0, 0]} />
       
      </BarChart>
    </ResponsiveContainer>
  );
}
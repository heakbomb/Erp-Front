// modules/salesC/components/PieChartSection.tsx
"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  PieLabelRenderProps,
} from "recharts";
import { MonthlyReport } from "../salesTypes";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function PieChartSection({ data }: { data: MonthlyReport["topMenus"] }) {
  // 라벨 렌더링 함수
  const renderLabel = (props: PieLabelRenderProps) => {
    const { name } = props;
    // payload에서 커스텀 데이터(rate) 추출
    const payload = props.payload as { rate?: number }; 
    const rate = payload.rate ?? 0;

    return `${name} (${rate}%)`;
  };

  return (
    <div className="h-[300px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data as any[]} // ✅ 타입 에러 수정: Recharts가 요구하는 인덱스 시그니처 호환을 위해 casting
            dataKey="sales"      // 값으로 사용할 키
            nameKey="menuName"   // 이름으로 사용할 키
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label={renderLabel}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(val: number) => `₩${val.toLocaleString()}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
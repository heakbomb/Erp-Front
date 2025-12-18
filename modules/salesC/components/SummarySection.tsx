// modules/salesC/components/SummarySection.tsx
"use client";

import { MonthlyReport } from "../salesTypes";

export function SummarySection({ summary }: { summary: MonthlyReport["summary"] }) {
  return (
    <div className="grid grid-cols-2 gap-4 text-center">
      <div className="p-4 bg-slate-50 rounded">
        <div className="text-sm text-muted-foreground">지난달 매출</div>
        <div className="text-lg font-bold">₩{summary.lastMonthTotal.toLocaleString()}</div>
      </div>
      <div className="p-4 bg-slate-50 rounded">
        <div className="text-sm text-muted-foreground">이번달 매출</div>
        <div className="text-lg font-bold">₩{summary.thisMonthTotal.toLocaleString()}</div>
      </div>
      <div className="col-span-2 text-sm">
        전월 대비{" "}
        <span className={summary.diff >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
          {summary.diff > 0 ? "+" : ""}
          {summary.diff.toLocaleString()}원
        </span>{" "}
        {summary.diff >= 0 ? "증가" : "감소"}
      </div>
    </div>
  );
}
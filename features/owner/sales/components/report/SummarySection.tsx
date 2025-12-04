"use client"

interface SummarySectionProps {
  summary: {
    lastMonthTotal: number | string
    thisMonthTotal: number | string
    diff: number | string
  }
}

export function SummarySection({ summary }: SummarySectionProps) {
  const fmt = (v: number | string) =>
    Number(v || 0).toLocaleString("ko-KR")

  return (
    <table className="w-full text-sm">
      <tbody>
        <tr>
          <td>지난달 매출</td>
          <td className="text-right">{fmt(summary.lastMonthTotal)}원</td>
        </tr>
        <tr>
          <td>이번달 매출</td>
          <td className="text-right">{fmt(summary.thisMonthTotal)}원</td>
        </tr>
        <tr>
          <td>증감액</td>
          <td
            className={`text-right font-semibold ${
              Number(summary.diff) >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {fmt(summary.diff)}원
          </td>
        </tr>
      </tbody>
    </table>
  )
}

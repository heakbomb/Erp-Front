"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

interface WeeklyPoint {
  weekIndex: number
  mySales: number | string
  areaAvgSales: number | string
}

interface WeeklyTableProps {
  data: WeeklyPoint[]
}

export function WeeklyTable({ data }: WeeklyTableProps) {
  const fmt = (v: number | string) =>
    Number(v || 0).toLocaleString("ko-KR")

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>주차</TableHead>
          <TableHead className="text-right">내 매장</TableHead>
          <TableHead className="text-right">상권 평균</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(data || []).map((row) => (
          <TableRow key={row.weekIndex}>
            <TableCell>{row.weekIndex}주차</TableCell>
            <TableCell className="text-right">
              {fmt(row.mySales)}원
            </TableCell>
            <TableCell className="text-right">
              {fmt(row.areaAvgSales)}원
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

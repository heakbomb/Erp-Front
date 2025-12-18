// modules/salesC/components/WeeklyTable.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { MonthlyReport } from "../salesTypes";

export function WeeklyTable({ data }: { data: MonthlyReport["weeklySales"] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>주차</TableHead>
          <TableHead className="text-right">내 매출</TableHead>
          <TableHead className="text-right">지역 평균 매출</TableHead>
          <TableHead className="text-right">격차</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => {
          const diff = item.mySales - item.areaAvgSales;
          return (
            <TableRow key={item.weekIndex}>
              <TableCell>{item.weekIndex}주차</TableCell>
              <TableCell className="text-right">₩{item.mySales.toLocaleString()}</TableCell>
              <TableCell className="text-right">₩{item.areaAvgSales.toLocaleString()}</TableCell>
              <TableCell className={`text-right ${diff >= 0 ? "text-green-600" : "text-red-600"}`}>
                {diff > 0 ? "+" : ""}
                {diff.toLocaleString()}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
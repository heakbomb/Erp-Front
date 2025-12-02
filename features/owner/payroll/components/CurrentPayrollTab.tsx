"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"

type EmployeePayrollRow = {
  id: number
  name: string
  role: string
  workDays: number
  workHours: number
  basePay: number
  bonus: number
  deductions: number
  netPay: number
  status: string
}

type Props = {
  monthLabel: string
  loading: boolean
  searchQuery: string
  setSearchQuery: (v: string) => void
  filteredEmployees: EmployeePayrollRow[]
}

export default function CurrentPayrollTab({
  monthLabel,
  loading,
  searchQuery,
  setSearchQuery,
  filteredEmployees,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>{monthLabel} 급여 내역</CardTitle>
            <CardDescription>직원별 급여 상세 내역</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="직원 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">급여 데이터를 불러오는 중입니다…</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>근무일</TableHead>
                <TableHead>근무시간</TableHead>
                <TableHead>기본급</TableHead>
                <TableHead>상여금</TableHead>
                <TableHead>공제액</TableHead>
                <TableHead>실수령액</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.workDays}일</TableCell>
                  <TableCell>{employee.workHours}시간</TableCell>
                  <TableCell>₩{employee.basePay.toLocaleString()}</TableCell>
                  <TableCell className="text-green-600">
                    {employee.bonus > 0 ? `+₩${employee.bonus.toLocaleString()}` : "-"}
                  </TableCell>
                  <TableCell className="text-red-600">
                    -₩{employee.deductions.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    ₩{employee.netPay.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{employee.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
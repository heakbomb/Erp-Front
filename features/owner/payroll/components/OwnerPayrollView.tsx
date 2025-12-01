// features/owner/payroll/components/OwnerPayrollView.tsx
"use client"

import { useMemo, useState } from "react"
import { format, differenceInCalendarDays } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Download, FileText, DollarSign, Users, Calculator } from "lucide-react"

import useOwnerPayroll from "@/features/owner/payroll/hooks/useOwnerPayroll"

export default function OwnerPayrollView() {
  // ✅ 선택 월 (기본: 오늘 기준)
  const [yearMonth, setYearMonth] = useState<string>(format(new Date(), "yyyy-MM"))

  // 보기 좋게 "2024년 4월" 같은 라벨로 변환
  const monthLabel = useMemo(() => {
    try {
      const baseDate = new Date(`${yearMonth}-01`)
      return format(baseDate, "yyyy년 M월")
    } catch {
      return "선택 월"
    }
  }, [yearMonth])

  // 지급 예정일: 선택 월의 다음 달 5일
  const { payDateLabel, payDDayLabel } = useMemo(() => {
    try {
      const [y, m] = yearMonth.split("-").map(Number)
      // 다음 달 5일
      const payDate = new Date(y, m, 5) // month는 0-based라 m이 다음 달 index
      const label = format(payDate, "M월 d일")

      const today = new Date()
      const d = differenceInCalendarDays(payDate, today)

      let dLabel = ""
      if (d > 0) dLabel = `D-${d}일`
      else if (d === 0) dLabel = "오늘 지급"
      else dLabel = "지급 완료"

      return { payDateLabel: label, payDDayLabel: dLabel }
    } catch {
      return { payDateLabel: "-", payDDayLabel: "" }
    }
  }, [yearMonth])

  const {
    employees,
    history,
    totalPayroll,
    totalWorkHours,
    filteredEmployees,
    searchQuery,
    setSearchQuery,
    isSettingsDialogOpen,
    setIsSettingsDialogOpen,
    loading,
    error,
  } = useOwnerPayroll(yearMonth)

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground">급여 관리</h1>
          <p className="text-muted-foreground">
            {monthLabel} 기준 직원 급여를 계산하고 관리하세요
          </p>
          {error && (
            <p className="mt-1 text-xs text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* ✅ 월 선택 */}
          <div className="flex flex-col items-end gap-1">
            <Label className="text-xs text-muted-foreground">조회 월</Label>
            <Input
              type="month"
              className="w-[160px]"
              value={yearMonth}
              onChange={(e) => setYearMonth(e.target.value)}
            />
          </div>

          <Button variant="outline" className="bg-transparent">
            <FileText className="mr-2 h-4 w-4" />
            급여명세서 일괄 생성
          </Button>
          <Button variant="outline" className="bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Excel 내보내기
          </Button>

          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={loading || employees.length === 0}>
                <Calculator className="mr-2 h-4 w-4" />
                급여 계산
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>급여 자동 계산</DialogTitle>
                <DialogDescription>
                  {monthLabel} 근무 기록을 기반으로 급여를 자동 계산합니다
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  {monthLabel} 근무 기록을 기반으로{" "}
                  <span className="font-medium">{employees.length}</span>명의 직원 급여를 계산하시겠습니까?
                </p>
                <div className="mt-4 p-4 rounded-lg bg-muted">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>총 근무 시간</span>
                      <span className="font-medium">
                        {totalWorkHours.toLocaleString()}시간
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>예상 총 급여</span>
                      <span className="font-medium text-primary">
                        ₩{totalPayroll.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={() => setIsSettingsDialogOpen(false)} disabled={employees.length === 0}>
                  계산 시작
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 총 급여</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{totalPayroll.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {/* 전월 대비 증감은 나중에 백엔드에서 내려주는 값으로 교체 예정 */}
              전월 대비 추이는 추후 제공 예정
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">급여 대상 직원</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}명</div>
            <p className="text-xs text-muted-foreground">
              현재 선택된 사업장의 직원 수입니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 급여</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{(employees.length ? Math.round(totalPayroll / employees.length) : 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">1인당 평균</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">지급 예정일</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payDateLabel}</div>
            <p className="text-xs text-muted-foreground">{payDDayLabel}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">이번 달 급여</TabsTrigger>
          <TabsTrigger value="history">급여 지급 내역</TabsTrigger>
          <TabsTrigger value="settings">급여 설정</TabsTrigger>
        </TabsList>

        {/* 이번 달 급여 */}
        <TabsContent value="current" className="space-y-4">
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
        </TabsContent>

        {/* 급여 지급 내역 */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>급여 지급 내역</CardTitle>
              <CardDescription>과거 급여 지급 기록</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((record, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <h3 className="font-medium">{record.month}</h3>
                      <p className="text-sm text-muted-foreground">{record.employees}명 지급</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ₩{record.totalPaid.toLocaleString()}
                      </p>
                      <Badge variant="default" className="mt-1">
                        {record.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 급여 설정 (그대로) */}
        <TabsContent value="settings" className="space-y-4">
          {/* ... 네가 준 설정 카드 그대로 유지 ... */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
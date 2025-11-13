"use client"

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
  const {
    employees,
    history,
    totalPayroll,
    filteredEmployees,
    searchQuery,
    setSearchQuery,
    isSettingsDialogOpen,
    setIsSettingsDialogOpen,
  } = useOwnerPayroll()

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">급여 관리</h1>
          <p className="text-muted-foreground">직원 급여를 계산하고 관리하세요</p>
        </div>
        <div className="flex gap-2">
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
              <Button>
                <Calculator className="mr-2 h-4 w-4" />
                급여 계산
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>급여 자동 계산</DialogTitle>
                <DialogDescription>이번 달 근무 기록을 기반으로 급여를 자동 계산합니다</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  2024년 4월 근무 기록을 기반으로 {employees.length}명의 직원 급여를 계산하시겠습니까?
                </p>
                <div className="mt-4 p-4 rounded-lg bg-muted">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>총 근무 시간</span>
                      {/* 현재는 하드코딩 값 그대로 사용 */}
                      <span className="font-medium">480시간</span>
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
                <Button onClick={() => setIsSettingsDialogOpen(false)}>계산 시작</Button>
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
              <span className="text-red-600">+8.5%</span> 전월 대비
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
            <p className="text-xs text-muted-foreground">전체 직원 12명</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 급여</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{Math.round(totalPayroll / Math.max(employees.length, 1)).toLocaleString()}
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
            <div className="text-2xl font-bold">5월 5일</div>
            <p className="text-xs text-muted-foreground">D-15일</p>
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>2024년 4월 급여 내역</CardTitle>
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

        {/* 급여 설정 */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>급여 설정</CardTitle>
              <CardDescription>기본 급여 정책을 설정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="base-wage">기본 시급</Label>
                <Input id="base-wage" type="number" defaultValue="10000" />
                <p className="text-xs text-muted-foreground">
                  2024년 최저시급: ₩9,860
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="overtime-rate">야간 수당률</Label>
                <Input id="overtime-rate" type="number" defaultValue="50" />
                <p className="text-xs text-muted-foreground">기본급의 %</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="holiday-rate">휴일 수당률</Label>
                <Input id="holiday-rate" type="number" defaultValue="50" />
                <p className="text-xs text-muted-foreground">기본급의 %</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deduction-rate">공제율</Label>
                <Input id="deduction-rate" type="number" defaultValue="5" />
                <p className="text-xs text-muted-foreground">
                  4대보험 등 공제 비율
                </p>
              </div>
              <Button className="w-full">설정 저장</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
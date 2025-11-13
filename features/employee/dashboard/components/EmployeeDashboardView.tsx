"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, DollarSign, CheckCircle } from "lucide-react"
import type { QuickStats, WorkRecord } from "../services/dashboardService"

type EmployeeDashboardViewProps = {
  currentWorkplace: string
  quickStats: QuickStats
  recentRecords: WorkRecord[]
}

export function EmployeeDashboardView({
  currentWorkplace,
  quickStats,
  recentRecords,
}: EmployeeDashboardViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">대시보드</h1>
        <p className="text-muted-foreground">
          오늘의 근무 현황을 확인하세요 - {currentWorkplace}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 오늘 근무 시간 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 근무 시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.todayWorkTime}</div>
            <p className="text-xs text-muted-foreground">{quickStats.todayStartTime}</p>
          </CardContent>
        </Card>

        {/* 이번 달 근무 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 근무</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.monthWorkDays}</div>
            <p className="text-xs text-muted-foreground">{quickStats.monthWorkHours}</p>
          </CardContent>
        </Card>

        {/* 예상 급여 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">예상 급여</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.expectedSalary}</div>
            <p className="text-xs text-muted-foreground">{quickStats.hourlyWage}</p>
          </CardContent>
        </Card>

        {/* 근무 상태 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">근무 상태</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.workStatus}</div>
            <p className="text-xs text-muted-foreground">{quickStats.expectedLeaveTime}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>최근 근무 기록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRecords.map((record, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted"
                >
                  <div>
                    <p className="font-medium text-sm">{record.date}</p>
                    <p className="text-xs text-muted-foreground">
                      {record.start} - {record.end}
                    </p>
                  </div>
                  <Badge variant="secondary">{record.hours}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 오른쪽 컬럼은 원래 비어 있었음 – 그대로 둠 (나중에 TODO 용) */}
      </div>
    </div>
  )
}
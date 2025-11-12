"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, DollarSign, FileText, CheckCircle } from "lucide-react"

export default function EmployeeDashboardPage() {
  const currentWorkplace = "김사장님의 카페"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">대시보드</h1>
        <p className="text-muted-foreground">오늘의 근무 현황을 확인하세요 - {currentWorkplace}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 근무 시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5시간 30분</div>
            <p className="text-xs text-muted-foreground">09:00 출근</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 근무</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18일</div>
            <p className="text-xs text-muted-foreground">총 144시간</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">예상 급여</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩1,440,000</div>
            <p className="text-xs text-muted-foreground">시급 ₩10,000</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">근무 상태</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">근무중</div>
            <p className="text-xs text-muted-foreground">퇴근 예정 18:00</p>
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
              {[
                { date: "2024-04-19", start: "09:00", end: "18:00", hours: "8시간" },
                { date: "2024-04-18", start: "09:00", end: "18:00", hours: "8시간" },
                { date: "2024-04-17", start: "09:15", end: "18:00", hours: "7시간 45분" },
                { date: "2024-04-16", start: "09:00", end: "17:30", hours: "7시간 30분" },
              ].map((record, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted">
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

        
      </div>
    </div>
  )
}

"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, TrendingUp, DollarSign, Package, AlertCircle } from "lucide-react"

import useOwnerDashboard from "@/features/owner/dashboard/hooks/useOwnerDashboard"

export default function OwnerDashboardView() {
  const { stats, alerts, quickActions, aiInsights } = useOwnerDashboard()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">대시보드</h1>
        <p className="text-muted-foreground">사업장 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 오늘 매출 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{stats.todaySales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                +{stats.todaySalesChange.toFixed(1)}%
              </span>{" "}
              전일 대비
            </p>
          </CardContent>
        </Card>

        {/* 이번 달 매출 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 매출</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{stats.monthSales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                +{stats.monthSalesChange.toFixed(1)}%
              </span>{" "}
              전월 대비
            </p>
          </CardContent>
        </Card>

        {/* 재고 알림 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">재고 알림</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockCount}개</div>
            <p className="text-xs text-muted-foreground">안전 재고 미달 품목</p>
          </CardContent>
        </Card>

        {/* 근무 중인 직원 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">근무 중인 직원</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.workingEmployees}명
            </div>
            <p className="text-xs text-muted-foreground">
              전체 직원 {stats.totalEmployees}명
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>중요 알림</CardTitle>
          <CardDescription>확인이 필요한 항목들입니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => {
              const colorClass =
                alert.level === "warning"
                  ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-600"
                  : alert.level === "danger"
                  ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600"
                  : alert.level === "primary"
                  ? "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-blue-600"
                  : "bg-muted border border-border"

              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${colorClass}`}
                >
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & AI 인사이트 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 빠른 작업 */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-muted-foreground">
                  {action.description}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* AI 인사이트 */}
        <Card>
          <CardHeader>
            <CardTitle>AI 인사이트</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiInsights.map((insight) => (
              <div
                key={insight.id}
                className="p-3 rounded-lg bg-primary/10"
              >
                <div className="font-medium text-sm mb-1">
                  {insight.title}
                </div>
                <div className="text-sm text-muted-foreground">
                  {insight.description}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
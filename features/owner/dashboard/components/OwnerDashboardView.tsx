// features/owner/dashboard/components/OwnerDashboardView.tsx
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import {
  Users,
  TrendingUp,
  DollarSign,
  Package,
  AlertCircle,
} from "lucide-react"

import useOwnerDashboard from "@/features/owner/dashboard/hooks/useOwnerDashboard"
import type {
  QuickAction,
  AiInsight,
  OwnerAlert,
} from "@/features/owner/dashboard/services/ownerDashboardService"

export default function OwnerDashboardView() {
  const { stats, alerts, quickActions, aiInsights, loading, error } =
    useOwnerDashboard()

  if (loading && !stats) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 rounded bg-muted animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-32 rounded-lg bg-muted animate-pulse" />
          <div className="h-32 rounded-lg bg-muted animate-pulse" />
          <div className="h-32 rounded-lg bg-muted animate-pulse" />
          <div className="h-32 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">점포 대시보드</h1>
        <p className="text-sm text-muted-foreground">
          아직 데이터를 불러오지 못했습니다.
          {error && <span className="ml-2 text-red-500">{error}</span>}
        </p>
      </div>
    )
  }

  const {
    todaySales,
    todaySalesChange,
    monthSales,
    monthSalesChange,
    lowStockCount,
    workingEmployees,
    totalEmployees,
  } = stats

  const formatCurrency = (value: number) =>
    `₩${value.toLocaleString("ko-KR")}`

  const formatRate = (value: number) => {
    if (!value || isNaN(value)) return "0.0%"
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`
  }

  const rateColor = (value: number) =>
    value > 0
      ? "text-emerald-500"
      : value < 0
      ? "text-red-500"
      : "text-muted-foreground"

  const ratePrefix = (value: number) =>
    value > 0 ? "▲" : value < 0 ? "▼" : "■"

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          점포 대시보드
        </h1>
        <p className="text-sm text-muted-foreground">
          오늘 매출 흐름과 재고, 직원 현황을 한 눈에 확인하세요.
        </p>
      </div>

      {/* 상단 통계 카드 4개 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 오늘 매출 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(todaySales)}
            </div>
            <p className={`text-xs mt-1 ${rateColor(todaySalesChange)}`}>
              {ratePrefix(todaySalesChange)}{" "}
              {formatRate(todaySalesChange)}{" "}
              <span className="text-muted-foreground ml-1">
                전일 대비
              </span>
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
              {formatCurrency(monthSales)}
            </div>
            <p className={`text-xs mt-1 ${rateColor(monthSalesChange)}`}>
              {ratePrefix(monthSalesChange)}{" "}
              {formatRate(monthSalesChange)}{" "}
              <span className="text-muted-foreground ml-1">
                전월 대비
              </span>
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
            <div className="text-2xl font-bold">{lowStockCount}개</div>
            <p className="text-xs text-muted-foreground mt-1">
              안전 재고 미만 품목
            </p>
          </CardContent>
        </Card>

        {/* 직원 현황 (나중에 백 연결해도 구조 그대로 사용) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">직원 현황</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workingEmployees}/{totalEmployees}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              현재 근무 중 / 전체 직원
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 하단: 알림 / 빠른 작업 / AI 인사이트 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 알림 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              알림 센터
            </CardTitle>
            <CardDescription>
              재고, 매출, 직원 관련 주요 알림입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                표시할 알림이 없습니다.
              </p>
            )}
            {alerts.map((alert: OwnerAlert) => (
              <div
                key={alert.id}
                className="flex items-start justify-between gap-3 rounded-lg border bg-muted/40 p-3"
              >
                <div>
                  <div className="text-sm font-medium">{alert.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {alert.description}
                  </div>
                </div>
                <Badge
                  variant={
                    alert.severity === "high"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {alert.severity === "high"
                    ? "긴급"
                    : alert.severity === "medium"
                    ? "주의"
                    : "정보"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 빠른 작업 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              빠른 작업
            </CardTitle>
            <CardDescription>
              자주 사용하는 기능을 빠르게 실행해 보세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                등록된 빠른 작업이 없습니다.
              </p>
            )}
            {quickActions.map((action: QuickAction) => (
              <button
                key={action.id}
                type="button"
                className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {action.description}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* AI 인사이트 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              AI 인사이트
            </CardTitle>
            <CardDescription>
              AI가 분석한 매출 및 운영 인사이트입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiInsights.length === 0 && (
              <p className="text-sm text-muted-foreground">
                아직 제공할 인사이트가 없습니다.
              </p>
            )}
            {aiInsights.map((insight: AiInsight) => (
              <div
                key={insight.id}
                className="p-3 rounded-lg border bg-muted/40"
              >
                <div className="font-medium text-sm mb-1">
                  {insight.title}
                </div>
                <div className="text-xs text-muted-foreground">
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

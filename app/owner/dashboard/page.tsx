"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, DollarSign, Package, AlertCircle } from "lucide-react"

export default function OwnerDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">대시보드</h1>
        <p className="text-muted-foreground">사업장 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩1,234,000</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> 전일 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 매출</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩28,450,000</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> 전월 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">재고 알림</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5개</div>
            <p className="text-xs text-muted-foreground">안전 재고 미달 품목</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">근무 중인 직원</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8명</div>
            <p className="text-xs text-muted-foreground">전체 직원 12명</p>
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
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">원자재 가격 상승</p>
                <p className="text-sm text-muted-foreground">
                  커피 원두 가격이 8% 상승했습니다. 메뉴 가격 조정을 검토하세요.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">직원 신청 대기</p>
                <p className="text-sm text-muted-foreground">3명의 직원이 사업장 가입을 신청했습니다.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">재고 부족</p>
                <p className="text-sm text-muted-foreground">
                  5개 품목이 안전 재고 수준 이하입니다. 발주가 필요합니다.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors">
              <div className="font-medium">매출 기록 추가</div>
              <div className="text-sm text-muted-foreground">오늘의 매출을 기록하세요</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors">
              <div className="font-medium">재고 확인</div>
              <div className="text-sm text-muted-foreground">현재 재고 현황을 확인하세요</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors">
              <div className="font-medium">직원 출결 확인</div>
              <div className="text-sm text-muted-foreground">오늘의 출결 현황을 확인하세요</div>
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI 인사이트</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <div className="font-medium text-sm mb-1">수요 예측</div>
              <div className="text-sm text-muted-foreground">
                이번 주말 방문객이 평소보다 20% 증가할 것으로 예상됩니다.
              </div>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <div className="font-medium text-sm mb-1">가격 최적화</div>
              <div className="text-sm text-muted-foreground">
                아메리카노 가격을 4,800원으로 조정하면 마진율 25.5%를 유지할 수 있습니다.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

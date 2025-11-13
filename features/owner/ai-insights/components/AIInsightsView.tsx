// features/owner/ai-insights/components/AIInsightsView.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  DollarSign,
  Users,
  Package,
  Target,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import useAIInsights from "@/features/owner/ai-insights/hooks/useAIInsights"

export default function AIInsightsView() {
  const {
    demandForecast,
    menuPerformance,
    priceOptimization,
    categoryData,
    inventoryAlerts,
  } = useAIInsights()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI 인사이트</h1>
        <p className="text-muted-foreground">AI 기반 예측과 추천을 확인하세요</p>
      </div>

      {/* Key Insights */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">예상 주말 매출</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩2,830,000</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+20%</span> 평소 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최적화 가능 마진</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+3.2%</div>
            <p className="text-xs text-muted-foreground">가격 조정 시</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">재고 최적화</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩150,000</div>
            <p className="text-xs text-muted-foreground">절감 가능 금액</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">예상 방문객</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245명</div>
            <p className="text-xs text-muted-foreground">내일 예상</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle>오늘의 AI 추천</CardTitle>
          </div>
          <CardDescription>데이터 분석을 통한 맞춤 추천사항입니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background border">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">주말 수요 증가 예상</p>
                <p className="text-sm text-muted-foreground mt-1">
                  이번 주말 방문객이 평소보다 20% 증가할 것으로 예상됩니다. 인기 메뉴의 재고를 미리 확보하세요.
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">커피 원두 +10kg</Badge>
                  <Badge variant="secondary">우유 +20L</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-background border">
              <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">가격 최적화 기회</p>
                <p className="text-sm text-muted-foreground mt-1">
                  아메리카노 가격을 4,800원으로 조정하면 마진율 75%를 유지하면서 매출을 증대할 수 있습니다.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">예상 추가 수익: ₩45,000/월</Badge>
                  <Link href="/owner/ai-insights/price-optimization">
                    <Button variant="link" size="sm" className="h-auto p-0">
                      상세 분석 보기
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-background border">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">원자재 가격 변동 알림</p>
                <p className="text-sm text-muted-foreground mt-1">
                  커피 원두 가격이 8% 상승했습니다. 현재 재고로 3일 운영 가능하며, 조기 발주를 권장합니다.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forecast">수요 예측</TabsTrigger>
          <TabsTrigger value="menu">메뉴 분석</TabsTrigger>
          <TabsTrigger value="pricing">가격 최적화</TabsTrigger>
          <TabsTrigger value="inventory">재고 예측</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>7일 매출 예측</CardTitle>
              <CardDescription>AI 모델 기반 매출 예측 (날씨, 이벤트, 과거 데이터 반영)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={demandForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `₩${value.toLocaleString()}`} labelStyle={{ color: "#000" }} />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="예상 매출"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 rounded-lg bg-muted">
                <p className="text-sm font-medium mb-2">예측 요약</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">주간 예상 매출</p>
                    <p className="font-medium">₩7,830,000</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">최고 매출 예상일</p>
                    <p className="font-medium">4월 27일 (토)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">평균 일 매출</p>
                    <p className="font-medium">₩1,118,571</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">예측 정확도</p>
                    <p className="font-medium">92.5%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>메뉴별 성과 분석</CardTitle>
                <CardDescription>매출과 마진율 기준</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={menuPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip labelStyle={{ color: "#000" }} />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" name="매출" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>카테고리별 매출 비중</CardTitle>
                <CardDescription>전체 매출 구성</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        // 여기 label 부분 전체 교체
                        label={(props: any) => {
                            const name = String(props.name ?? "")
                            const percent = typeof props.percent === "number" ? props.percent : 0
                            return `${name} ${(percent * 100).toFixed(0)}%`
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `₩${value.toLocaleString()}`}
                      labelStyle={{ color: "#000" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>메뉴 성과 상세</CardTitle>
              <CardDescription>마진율과 트렌드 분석</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {menuPerformance.map((menu, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{menu.name}</p>
                        <p className="text-sm text-muted-foreground">마진율: {menu.margin.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">₩{menu.sales.toLocaleString()}</p>
                        <div className="flex items-center gap-1 text-sm">
                          {menu.trend === "up" ? (
                            <>
                              <TrendingUp className="h-3 w-3 text-green-600" />
                              <span className="text-green-600">상승</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-3 w-3 text-red-600" />
                              <span className="text-red-600">하락</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI 가격 최적화 제안</CardTitle>
                  <CardDescription>수요 탄력성과 경쟁사 분석 기반</CardDescription>
                </div>
                <Link href="/owner/ai-insights/price-optimization">
                  <Button variant="outline" size="sm">
                    상세 분석
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {priceOptimization.map((item, i) => (
                  <div key={i} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{item.menu}</h3>
                        <p className="text-sm text-muted-foreground">
                          현재 가격: ₩{item.currentPrice.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={item.impact.startsWith("+") ? "default" : "secondary"}>{item.impact}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">제안 가격</p>
                        <p className="font-medium text-primary">₩{item.suggestedPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">예상 마진율</p>
                        <p className="font-medium">{item.expectedMargin.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">매출 영향</p>
                        <p className="font-medium">{item.impact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>재고 소진 예측</CardTitle>
              <CardDescription>현재 소비 패턴 기반 예측</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inventoryAlerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border ${
                      alert.urgency === "high"
                        ? "border-red-200 bg-red-50 dark:bg-red-950/20"
                        : alert.urgency === "medium"
                          ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20"
                          : "border-blue-200 bg-blue-50 dark:bg-blue-950/20"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{alert.item}</h3>
                        <p className="text-sm text-muted-foreground">
                          현재: {alert.current}개 / 안전: {alert.safety}개
                        </p>
                      </div>
                      <Badge
                        variant={
                          alert.urgency === "high"
                            ? "destructive"
                            : alert.urgency === "medium"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {alert.urgency === "high" ? "긴급" : alert.urgency === "medium" ? "주의" : "정상"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">예상 소진일</span>
                      <span className="font-medium">{alert.daysLeft}일 후</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
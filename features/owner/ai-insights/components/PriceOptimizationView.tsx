// features/owner/ai-insights/components/PriceOptimizationView.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, TrendingUp, Sparkles } from "lucide-react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import usePriceOptimization from "@/features/owner/ai-insights/hooks/usePriceOptimization"

export default function PriceOptimizationView() {
  const { menuItems, selectedMenu, setSelectedMenu } = usePriceOptimization()

  const currentCostData = selectedMenu.currentMaterials.map((m) => ({
    name: m.name,
    value: m.cost,
    color: "hsl(var(--chart-1))",
  }))

  const alternativeCostData = selectedMenu.alternativeMaterials.map((m) => ({
    name: m.name,
    value: m.cost,
    color: "hsl(var(--chart-2))",
  }))

  const comparisonData = [
    {
      category: "원가",
      current: selectedMenu.currentCost,
      alternative: selectedMenu.alternativeCost,
    },
    {
      category: "마진",
      current: selectedMenu.currentPrice - selectedMenu.currentCost,
      alternative: selectedMenu.suggestedPrice - selectedMenu.alternativeCost,
    },
  ]

  const marginDiff = selectedMenu.alternativeMargin - selectedMenu.currentMargin
  const costSavings = selectedMenu.currentCost - selectedMenu.alternativeCost

  return (
    <div className="space-y-6">
      <Link href="/owner/ai-insights">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          AI 인사이트로 돌아가기
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-foreground">AI 가격 최적화 & 원자재 분석</h1>
        <p className="text-muted-foreground">원자재 변경에 따른 수익성 비교 분석</p>
      </div>

      {/* Menu Selection */}
      <Card>
        <CardHeader>
          <CardTitle>메뉴 선택</CardTitle>
          <CardDescription>분석할 메뉴를 선택하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {menuItems.map((menu) => (
              <button
                key={menu.id}
                onClick={() => setSelectedMenu(menu)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  selectedMenu.id === menu.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{menu.name}</span>
                  {selectedMenu.id === menu.id && <Badge>선택됨</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  현재 가격: ₩{menu.currentPrice.toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendation Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI 추천</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-lg font-medium">
              {selectedMenu.name}의 원자재를 변경하면 마진율을{" "}
              <span className="text-primary font-bold">+{marginDiff.toFixed(1)}%</span> 개선할 수 있습니다
            </p>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>원가 절감: ₩{costSavings.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>마진 증가: {marginDiff.toFixed(1)}%p</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comparison">비교 분석</TabsTrigger>
          <TabsTrigger value="materials">원자재 상세</TabsTrigger>
          <TabsTrigger value="visualization">시각화</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Current Materials */}
            <Card>
              <CardHeader>
                <CardTitle>현재 원자재</CardTitle>
                <CardDescription>기존 레시피 구성</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {selectedMenu.currentMaterials.map((material, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div>
                        <p className="font-medium">{material.name}</p>
                        <p className="text-sm text-muted-foreground">{material.origin}</p>
                      </div>
                      <p className="font-medium">₩{material.cost.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">총 원가</span>
                    <span className="font-medium">₩{selectedMenu.currentCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">판매가</span>
                    <span className="font-medium">₩{selectedMenu.currentPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">마진율</span>
                    <span className="text-lg font-bold">{selectedMenu.currentMargin.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alternative Materials */}
            <Card className="border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>대체 원자재 (AI 추천)</CardTitle>
                    <CardDescription>최적화된 레시피 구성</CardDescription>
                  </div>
                  <Badge variant="default">추천</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {selectedMenu.alternativeMaterials.map((material, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20"
                    >
                      <div>
                        <p className="font-medium">{material.name}</p>
                        <p className="text-sm text-muted-foreground">{material.origin}</p>
                      </div>
                      <p className="font-medium text-primary">₩{material.cost.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">총 원가</span>
                    <span className="font-medium text-primary">
                      ₩{selectedMenu.alternativeCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">제안 판매가</span>
                    <span className="font-medium text-primary">
                      ₩{selectedMenu.suggestedPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">예상 마진율</span>
                    <span className="text-lg font-bold text-primary">
                      {selectedMenu.alternativeMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Impact Summary */}
          <Card>
            <CardHeader>
              <CardTitle>변경 효과 요약</CardTitle>
              <CardDescription>원자재 변경 시 예상되는 효과</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-muted-foreground mb-1">원가 절감</p>
                  <p className="text-2xl font-bold text-green-600">₩{costSavings.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">메뉴 1개당</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-muted-foreground mb-1">마진율 증가</p>
                  <p className="text-2xl font-bold text-blue-600">+{marginDiff.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">퍼센트 포인트</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-muted-foreground mb-1">월 예상 절감액</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ₩{(costSavings * 300).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">월 300개 판매 기준</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>원자재 상세 비교</CardTitle>
              <CardDescription>각 원자재의 원산지와 가격 정보</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedMenu.currentMaterials.map((current, i) => {
                  const alternative = selectedMenu.alternativeMaterials[i]
                  const priceDiff = current.cost - alternative.cost

                  return (
                    <div key={i} className="p-4 rounded-lg border">
                      <h3 className="font-medium mb-3">재료 {i + 1}</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">현재</p>
                          <p className="font-medium">{current.name}</p>
                          <p className="text-sm text-muted-foreground">원산지: {current.origin}</p>
                          <p className="text-lg font-bold">₩{current.cost.toLocaleString()}</p>
                        </div>
                        <div className="space-y-2 p-3 rounded-lg bg-primary/5">
                          <p className="text-sm font-medium text-primary">대체 (추천)</p>
                          <p className="font-medium">{alternative.name}</p>
                          <p className="text-sm text-muted-foreground">원산지: {alternative.origin}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-bold text-primary">
                              ₩{alternative.cost.toLocaleString()}
                            </p>
                            {priceDiff > 0 && (
                              <Badge variant="default" className="text-xs">
                                -₩{priceDiff.toLocaleString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualization" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>원가 구성 비교</CardTitle>
                <CardDescription>현재 vs 대체 원자재</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => `₩${value.toLocaleString()}`}
                      labelStyle={{ color: "#000" }}
                    />
                    <Legend />
                    <Bar dataKey="current" fill="hsl(var(--chart-1))" name="현재" />
                    <Bar dataKey="alternative" fill="hsl(var(--primary))" name="대체 (추천)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>마진율 비교</CardTitle>
                <CardDescription>변경 전후 마진율 차이</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">현재 마진율</span>
                      <span className="text-lg font-bold">{selectedMenu.currentMargin.toFixed(1)}%</span>
                    </div>
                    <div className="h-4 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-chart-1" style={{ width: `${selectedMenu.currentMargin}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-primary">예상 마진율 (대체)</span>
                      <span className="text-lg font-bold text-primary">
                        {selectedMenu.alternativeMargin.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-4 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${selectedMenu.alternativeMargin}%` }} />
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">마진율 개선</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="text-xl font-bold text-green-600">
                          +{marginDiff.toFixed(1)}%p
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>원자재 비용 분포</CardTitle>
              <CardDescription>각 원자재가 차지하는 비용 비율</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-4 text-center">현재 원자재</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={alternativeCostData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        // 🔽 label 수정
                        label={(props: any) => {
                            const name = String(props.name ?? "")
                            const percent = typeof props.percent === "number" ? props.percent : 0
                            return `${name} ${(percent * 100).toFixed(0)}%`
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        >
                        {currentCostData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => `₩${value.toLocaleString()}`}
                        labelStyle={{ color: "#000" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-4 text-center text-primary">대체 원자재 (추천)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={currentCostData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        // 🔽 label 수정
                        label={(props: any) => {
                            const name = String(props.name ?? "")
                            const percent = typeof props.percent === "number" ? props.percent : 0
                            return `${name} ${(percent * 100).toFixed(0)}%`
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        >
                        {alternativeCostData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => `₩${value.toLocaleString()}`}
                        labelStyle={{ color: "#000" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
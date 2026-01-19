// src/modules/aiInsightsC/AIInsightsView.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { TrendingUp, Target, Package, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell 
} from "recharts";
import useAiInsights from "./useAiInsights";

export default function AIInsightsView() {
  // 실제 storeId를 props나 Context에서 가져와야 하지만, 편의상 Hook 기본값(101) 사용
  const { 
    demandForecast, 
    menuPerformance, 
    priceOptimization, 
    categoryData, 
    inventoryAlerts,
    totalPredictedVisitors,
    expectedWeekendSales
  } = useAiInsights();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI 인사이트</h1>
        <p className="text-muted-foreground">AI 기반 수요 예측과 운영 제안을 확인하세요</p>
      </div>

      {/* 상단 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">예상 주말 매출</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* 실제 데이터 연결 (7일 예측 기반 추정치) */}
            <div className="text-2xl font-bold">₩{expectedWeekendSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground"><span className="text-green-600">+15%</span> 지난주 대비</p>
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
            <CardTitle className="text-sm font-medium">내일 예상 방문객</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* ✅ 실제 AI 예측 데이터 연결 */}
            <div className="text-2xl font-bold">{totalPredictedVisitors.toLocaleString()}명</div>
            <p className="text-xs text-muted-foreground">AI 예측 기반</p>
          </CardContent>
        </Card>
      </div>

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
              <CardDescription>AI 모델이 분석한 향후 7일간의 예상 매출과 방문객 추이입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                {/* ✅ [수정] margin 속성 추가 */}
                <LineChart 
                  data={demandForecast}
                  margin={{ top: 10, right: 30, left: 10, bottom: 5 }} // 여백 확보
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  {/* padding을 주어 첫 데이터와 마지막 데이터가 벽에 붙지 않게 함 */}
                  <XAxis dataKey="date" padding={{ left: 20, right: 20 }} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  
                  <Tooltip 
                    formatter={(value: number | undefined, name: string | undefined) => {
                      const safeName = name ?? "";
                      if (value === undefined) return ["-", safeName];
                      return [
                        safeName === "예상 매출" ? `₩${value.toLocaleString()}` : `${value}명`,
                        safeName
                      ];
                    }} 
                  />
                  <Line yAxisId="left" type="monotone" dataKey="predicted" stroke="hsl(var(--primary))" strokeWidth={2} name="예상 매출" activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="visitors" stroke="#82ca9d" strokeWidth={2} name="예상 방문객" activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>메뉴별 성과 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={menuPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" name="매출" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>카테고리별 매출 비중</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number | undefined) => `₩${(value ?? 0).toLocaleString()}`} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
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
                    상세 분석 <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {priceOptimization.map((item: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg border flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{item.menu}</h3>
                      <p className="text-sm text-muted-foreground">현재: ₩{item.currentPrice.toLocaleString()} → 제안: <span className="text-primary font-bold">₩{item.suggestedPrice.toLocaleString()}</span></p>
                    </div>
                    <div className="text-right">
                      <Badge variant={item.impact.startsWith("+") ? "default" : "secondary"}>{item.impact}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">예상 마진 {item.expectedMargin}%</p>
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
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inventoryAlerts.map((alert: any, i: number) => (
                  <div key={i} className={`p-4 rounded-lg border ${alert.urgency === 'high' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{alert.item}</h3>
                        <p className="text-sm text-muted-foreground">남은 기간: {alert.daysLeft}일</p>
                      </div>
                      <Badge variant={alert.urgency === 'high' ? "destructive" : "default"}>{alert.urgency === 'high' ? '긴급' : '주의'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
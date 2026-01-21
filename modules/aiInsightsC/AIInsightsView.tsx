"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { TrendingUp, Target, Package, Users, ArrowUp, ArrowDown, Minus } from "lucide-react";
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
} from "recharts";

import useAiInsights from "./useAiInsights";
import { useProfitForecast } from "@/modules/aiInsightsC/useProfitForecast";
import { useStore } from "@/contexts/StoreContext";

const money = (v: number | undefined | null) =>
  new Intl.NumberFormat("ko-KR").format(Math.round(Number(v ?? 0)));

export default function AIInsightsView() {
  const { currentStoreId, isLoading } = useStore();

  const {
    demandForecast,
    menuPerformance,
    categoryData,
    totalPredictedVisitors,
    expectedWeekendSales,
    menuGrowthStats,
  } = useAiInsights();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // ✅ storeId는 StoreContext 내부에서 처리하는 훅이라고 가정
  const profitQ = useProfitForecast(year, month);

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
            <div className="text-2xl font-bold">₩{expectedWeekendSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15%</span> 지난주 대비
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
            <CardTitle className="text-sm font-medium">내일 예상 방문객</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPredictedVisitors.toLocaleString()}명</div>
            <p className="text-xs text-muted-foreground">AI 예측 기반</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forecast">수요 예측</TabsTrigger>
          <TabsTrigger value="menu">메뉴 분석</TabsTrigger>
          <TabsTrigger value="profit">수익 예측</TabsTrigger>
        </TabsList>

        {/* 1. 수요 예측 탭 */}
        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>7일 매출 예측</CardTitle>
              <CardDescription>
                AI 모델이 분석한 향후 7일간의 예상 매출과 방문객 추이입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={demandForecast} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" padding={{ left: 20, right: 20 }} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value: number | undefined, name: string | undefined) => {
                      const safeName = name ?? "";
                      if (value === undefined) return ["-", safeName];
                      return [
                        safeName === "예상 매출" ? `₩${value.toLocaleString()}` : `${value}명`,
                        safeName,
                      ];
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="predicted"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="예상 매출"
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="visitors"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="예상 방문객"
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. 메뉴 분석 탭 */}
        <TabsContent value="menu" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>주간 메뉴 트렌드 예측 (발주 참고)</CardTitle>
              <CardDescription>
                지난주 실제 판매량 대비 다음 주 예상 판매량의 증감률입니다.
                <span className="text-primary font-bold"> 발주 수량 산정</span>에 참고하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {menuGrowthStats && menuGrowthStats.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>메뉴명</TableHead>
                      <TableHead className="text-right">지난주 판매</TableHead>
                      <TableHead className="text-right">다음주 예측</TableHead>
                      <TableHead className="text-right">예상 증감률</TableHead>
                      <TableHead className="text-center">AI 발주 제안</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuGrowthStats.map((item) => (
                      <TableRow key={item.menuId}>
                        <TableCell className="font-medium">{item.menuName}</TableCell>
                        <TableCell className="text-right">{item.lastWeekSales.toLocaleString()}개</TableCell>
                        <TableCell className="text-right font-bold">
                          {item.nextWeekPrediction.toLocaleString()}개
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className={`flex items-center justify-end gap-1 ${
                              item.growthRate > 0
                                ? "text-red-500"
                                : item.growthRate < 0
                                ? "text-blue-500"
                                : "text-gray-500"
                            }`}
                          >
                            {item.growthRate > 0 ? (
                              <ArrowUp size={14} />
                            ) : item.growthRate < 0 ? (
                              <ArrowDown size={14} />
                            ) : (
                              <Minus size={14} />
                            )}
                            {Math.abs(item.growthRate)}%
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              item.recommendation.includes("증량") ||
                              item.recommendation.includes("급증")
                                ? "default"
                                : item.recommendation.includes("소진")
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {item.recommendation}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">데이터를 분석 중입니다...</div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>메뉴별 성과 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={menuPerformance}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#22C55E" stopOpacity={0.85} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" radius={[10, 10, 4, 4]} fill="url(#barGrad)" />
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
                    <Tooltip formatter={(value: number | undefined) => `₩${(value ?? 0).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 3. 수익 예측 탭 (한국어 문구 개선 완료) */}
        <TabsContent value="profit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>월 수익 예측</span>
                {profitQ.data ? (
                  <Badge variant="outline" className="text-xs">
                    업데이트됨
                  </Badge>
                ) : null}
              </CardTitle>
              <CardDescription>
                기준월 데이터를 기반으로 다음 달(예측월) 예상 수익을 산출합니다.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="rounded-lg border p-4 text-muted-foreground">매장 정보를 불러오는 중…</div>
              ) : !currentStoreId ? (
                <div className="rounded-lg border p-4 text-muted-foreground">
                  먼저 매장을 선택(또는 등록)해주세요.
                </div>
              ) : profitQ.isLoading ? (
                <div className="rounded-lg border p-4 text-muted-foreground">수익 예측을 불러오는 중…</div>
              ) : profitQ.isError ? (
                <div className="rounded-lg border p-4 text-red-600">
                  수익 예측 조회에 실패했습니다. (서버 로그 확인)
                </div>
              ) : !profitQ.data ? (
                <div className="rounded-lg border p-4 text-muted-foreground">예측 데이터가 없습니다.</div>
              ) : (
                <>
                  {/* KPI 카드 */}
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border p-4">
                      <div className="text-sm text-muted-foreground">예측 수익</div>
                      <div className="mt-1 text-3xl font-bold tracking-tight">
                        ₩{money(profitQ.data.pred)}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        예측 지표: <span className="font-medium">다음 달 수익</span>
                      </div>
                    </div>

                    <div className="rounded-xl border p-4">
                      <div className="text-sm text-muted-foreground">기준월</div>
                      <div className="mt-1 text-2xl font-semibold">{profitQ.data.featureYm}</div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        기준 연월:{" "}
                        <span className="font-medium">
                          {profitQ.data.year}-{String(profitQ.data.month).padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border p-4">
                      <div className="text-sm text-muted-foreground">예측월</div>
                      <div className="mt-1 text-2xl font-semibold">{profitQ.data.predForYm}</div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        매장 ID: <span className="font-medium">{profitQ.data.storeId}</span>
                      </div>
                    </div>
                  </div>

                  {/* 요약 배너 */}
                  <div className="rounded-xl border bg-muted/40 p-4">
                    <div className="text-sm font-medium">AI 수익 예측 요약</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      <span className="font-medium">{profitQ.data.featureYm}</span> 매출·비용 데이터를 바탕으로{" "}
                      <span className="font-medium">{profitQ.data.predForYm}</span> 예상 수익은{" "}
                      <span className="font-medium">₩{money(profitQ.data.pred)}</span> 입니다.
                    </div>
                  </div>

                  {/* 상세 정보 (접기) */}
                  <details className="rounded-xl border p-4">
                    <summary className="cursor-pointer text-sm font-medium">
                      예측 상세 정보
                    </summary>

                    <div className="mt-4 space-y-3">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-40">항목</TableHead>
                            <TableHead>값</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">매장 ID</TableCell>
                            <TableCell>{profitQ.data.storeId}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">기준 연월</TableCell>
                            <TableCell>
                              {profitQ.data.year}-{String(profitQ.data.month).padStart(2, "0")}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">예측 대상 월</TableCell>
                            <TableCell>{profitQ.data.predForYm}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">예측 수익</TableCell>
                            <TableCell className="font-semibold">₩{money(profitQ.data.pred)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </details>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

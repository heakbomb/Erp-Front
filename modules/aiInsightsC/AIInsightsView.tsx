"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import {
  TrendingUp,
  Target,
  Package,
  Users,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertTriangle,
} from "lucide-react";
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
import { useProfitBenchmark } from "@/modules/aiInsightsC/useProfitBenchmark";
import { useStore } from "@/contexts/StoreContext";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";

// ✅ 업종 벤치마킹 훅 (Top3 메뉴 삭제, 소분류 랭킹만 사용)
import { useIndustryCategoryRank, useIndustrySubCategoryRank } from "@/modules/aiInsightsC/useIndustryBenchmark";

// ✅ Select(shadcn) - 없으면 native select로 교체 필요
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

// 돈 단위 포맷팅 헬퍼
const money = (v: number | undefined | null) =>
  new Intl.NumberFormat("ko-KR").format(Math.round(Number(v ?? 0)));

// ✅ Y축 숫자 잘림 방지용: 값 자릿수 기반으로 width 자동 산정
const yAxisWidthFromMax = (max: number, minWidth = 60, maxWidth = 96) => {
  const digits = String(Math.max(0, Math.floor(Math.abs(max)))).length;
  const approxChars = digits + Math.floor((digits - 1) / 3) + 2; // 콤마 여유
  const px = approxChars * 7;
  return Math.min(maxWidth, Math.max(minWidth, px));
};

// ✅ X축 라벨 줄바꿈 (최대 2줄)
function MenuNameTick(props: any) {
  const { x, y, payload } = props;
  const raw = String(payload?.value ?? "");

  // 공백 기준으로 줄바꿈(공백 없으면 길이로 강제 분할)
  const parts = raw.includes(" ") ? raw.split(" ") : [raw];

  const line1 =
    parts.length === 1
      ? raw.slice(0, 8)
      : parts.slice(0, Math.ceil(parts.length / 2)).join(" ");

  const line2 =
    parts.length === 1
      ? raw.length > 8
        ? raw.slice(8, 16)
        : ""
      : parts.slice(Math.ceil(parts.length / 2)).join(" ");

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={14} textAnchor="middle" fontSize={12}>
        {line1}
      </text>
      {line2 ? (
        <text x={0} y={30} textAnchor="middle" fontSize={12}>
          {line2}
        </text>
      ) : null}
    </g>
  );
}

export default function AIInsightsView() {
  const { currentStoreId, isLoading: isStoreLoading } = useStore();

  const {
    demandForecast,
    menuPerformance,
    categoryData,
    totalPredictedVisitors,
    expectedWeekendSales,
    menuGrowthStats,
    loading: isAiLoading,
  } = useAiInsights();

  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const year = base.getFullYear();
  const month = base.getMonth() + 1;

  const profitQ = useProfitForecast(year, month);

  // ✅ 구·업종 평균 대비 손익 비교
  const benchQ = useProfitBenchmark({
    storeId: currentStoreId ?? undefined,
    year,
    month,
    // myCogsRate: 0.33,
  });

  const isLoading = isStoreLoading || isAiLoading;

  // ✅ 차트별 최대값 추출(없으면 0)
  const maxMenuSales = Math.max(0, ...(menuPerformance?.map((d: any) => Number(d?.sales ?? 0)) ?? [0]));
  const maxPredictedSales = Math.max(0, ...(demandForecast?.map((d: any) => Number(d?.predicted ?? 0)) ?? [0]));

  // ✅ 필요 폭 계산
  const menuYAxisWidth = yAxisWidthFromMax(maxMenuSales, 70, 110);
  const forecastLeftYAxisWidth = yAxisWidthFromMax(maxPredictedSales, 70, 110);

  // ==========================================================
  // ✅ 업종 벤치마킹: 업종 선택 → 중분류 TOP → (선택 중분류) 소분류 TOP
  // ==========================================================
  const INDUSTRY_OPTIONS = [
    { value: "KOREAN", label: "한식" },
    { value: "CHICKEN", label: "치킨" },
    { value: "CHINESE", label: "중식" },
    { value: "CAFE", label: "카페" },
    { value: "JAPANESE", label: "일식" },
    { value: "WESTERN", label: "양식" },
    { value: "FAST_FOOD", label: "패스트푸드" },
    { value: "SNACK", label: "분식" },
    { value: "BBQ", label: "구이/바베큐" },
    { value: "SEAFOOD", label: "해산물" },
    { value: "BAKERY", label: "베이커리" },
    { value: "BAR", label: "주점" },
    { value: "FUSION", label: "퓨전" },
    { value: "ASIAN", label: "아시안" },
  ] as const;

  const [benchIndustry, setBenchIndustry] = React.useState<string>("KOREAN");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const categoryRankQ = useIndustryCategoryRank({
    industry: benchIndustry,
    periodDays: 30,
    top: 10,
  });

  // ✅ 선택된 중분류에 대한 소분류 랭킹
  const subCategoryRankQ = useIndustrySubCategoryRank({
    industry: benchIndustry,
    categoryName: selectedCategory ?? undefined,
    periodDays: 30,
    top: 5,
  });

  // 업종 변경 시 선택 중분류 초기화
  React.useEffect(() => {
    setSelectedCategory(null);
  }, [benchIndustry]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI 인사이트</h1>
        <p className="text-muted-foreground">데이터 기반의 수요 예측과 운영 제안을 확인하세요</p>
      </div>

      <Alert className="border-amber-200 bg-amber-50 text-amber-900">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="font-semibold">주의</AlertTitle>
        <AlertDescription className="text-sm">
          AI 인사이트/예측 결과는 참고용이며, 데이터 누락·이상치·외부 요인(날씨/이벤트/취소 등)에 따라
          실제와 다를 수 있습니다.
        </AlertDescription>
      </Alert>

      {/* 상단 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">예상 주말 매출</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{Number(expectedWeekendSales ?? 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">금/토/일 합계 (예측)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">내일 예상 방문객</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(totalPredictedVisitors ?? 0).toLocaleString()}명</div>
            <p className="text-xs text-muted-foreground">DB 예측 데이터 기반</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최적화 가능 마진</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+3.2%</div>
            <p className="text-xs text-muted-foreground">가격 조정 시 (예상)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">재고 최적화</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩150,000</div>
            <p className="text-xs text-muted-foreground">폐기 절감 가능액</p>
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
                DB에 저장된 수요 예측 데이터를 기반으로 분석한 향후 7일간의 예상 매출 추이입니다.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6">
              {demandForecast.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={demandForecast} margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" padding={{ left: 20, right: 20 }} />
                    <YAxis
                      yAxisId="left"
                      width={forecastLeftYAxisWidth}
                      tickMargin={8}
                      tickFormatter={(v) => money(Number(v))}
                    />
                    <YAxis yAxisId="right" orientation="right" width={60} tickMargin={8} />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        name === "예상 매출" ? `₩${money(Number(value))}` : `${Number(value).toLocaleString()}명`,
                        name,
                      ]}
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
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  {isLoading ? "데이터를 불러오는 중입니다..." : "표시할 예측 데이터가 없습니다."}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. 메뉴 분석 탭 */}
        <TabsContent value="menu" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>주간 메뉴 트렌드 예측 (발주 참고)</CardTitle>
              <CardDescription>
                지난주 실제 판매량과 다음 주 예측 판매량(DB)을 비교하여{" "}
                <span className="text-primary font-bold">발주 추천</span>을 제공합니다.
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
                    {menuGrowthStats.map((item: any) => (
                      <TableRow key={item.menuId}>
                        <TableCell className="font-medium">{item.menuName}</TableCell>
                        <TableCell className="text-right">{Number(item.lastWeekSales ?? 0).toLocaleString()}개</TableCell>
                        <TableCell className="text-right font-bold">
                          {Number(item.nextWeekPrediction ?? 0).toLocaleString()}개
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className={`flex items-center justify-end gap-1 ${item.growthRate > 0
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
                            {Math.abs(Number(item.growthRate ?? 0))}%
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              item.recommendation?.includes("증량") || item.recommendation?.includes("급증")
                                ? "default"
                                : item.recommendation?.includes("소진") || item.recommendation?.includes("감소")
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
                <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                  {isLoading ? "분석 중입니다..." : "분석할 데이터가 충분하지 않습니다."}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ✅ 업종 벤치마킹: 중분류 TOP → 소분류 TOP */}
          <Card>
            <CardHeader>
              <CardTitle>업종 벤치마킹: 중분류/소분류 인기 TOP</CardTitle>
              <CardDescription>
                선택한 업종에서 어떤 <b>중분류</b>가 잘 팔리는지 확인하고, 중분류를 클릭하면 해당 중분류 안에서
                어떤 <b>소분류</b>가 강한지까지 확인합니다. (표본 5개 미만이면 결과가 없을 수 있어요)
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-sm text-muted-foreground">업종 선택</div>

                <Select value={benchIndustry} onValueChange={setBenchIndustry}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="업종 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label} ({opt.value})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {categoryRankQ.data?.[0]?.sampleCount != null ? (
                  <Badge variant="outline">
                    표본 {Number(categoryRankQ.data[0].sampleCount).toLocaleString()}개
                  </Badge>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* 왼쪽: 중분류 랭킹 */}
                <div className="rounded-2xl border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-medium">중분류 랭킹 </div>
                    <div className="text-xs text-muted-foreground">최근 30일 · 수량 기준</div>
                  </div>

                  {categoryRankQ.isLoading ? (
                    <div className="text-sm text-muted-foreground p-2">불러오는 중…</div>
                  ) : categoryRankQ.isError ? (
                    <div className="text-sm text-red-600 p-2">조회 실패 (API/DB 확인)</div>
                  ) : !categoryRankQ.data || categoryRankQ.data.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-2">
                      데이터가 없습니다. (표본 수 부족 또는 집계 미생성)
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {categoryRankQ.data.map((item: any) => {
                        const active = selectedCategory === item.categoryName;
                        return (
                          <button
                            key={item.categoryName}
                            type="button"
                            onClick={() => setSelectedCategory(item.categoryName)}
                            className={`w-full rounded-xl border px-3 py-2 text-left transition ${active ? "bg-muted/50 border-primary" : "hover:bg-muted/30"
                              }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={item.rank <= 3 ? "default" : "outline"}>#{item.rank}</Badge>
                                <span className="font-medium">{item.categoryName}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {Number(item.shareQty ?? 0).toFixed(1)}%
                              </div>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              판매수량 {Number(item.quantity ?? 0).toLocaleString()}개
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 오른쪽: 선택 중분류의 소분류 TOP */}
                <div className="rounded-2xl border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-medium">
                      {selectedCategory ? `“${selectedCategory}” 소분류 TOP3` : "중분류를 선택하세요"}
                    </div>
                    <div className="text-xs text-muted-foreground">최근 30일 · 수량 점유율</div>
                  </div>

                  {!selectedCategory ? (
                    <div className="text-sm text-muted-foreground p-2">
                      왼쪽에서 중분류를 클릭하면 소분류 Top이 표시됩니다.
                    </div>
                  ) : subCategoryRankQ.isLoading ? (
                    <div className="text-sm text-muted-foreground p-2">불러오는 중…</div>
                  ) : subCategoryRankQ.isError ? (
                    <div className="text-sm text-red-600 p-2">조회 실패 (API/DB 확인)</div>
                  ) : !subCategoryRankQ.data || subCategoryRankQ.data.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-2">
                      결과가 없습니다. (표본 수 부족 또는 데이터 없음)
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[70px]">순위</TableHead>
                          <TableHead>소분류</TableHead>
                          <TableHead className="text-right">수량</TableHead>
                          <TableHead className="text-right">점유율</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(subCategoryRankQ.data ?? []).map((r: any) => (
                          <TableRow key={`${r.rank}-${r.subCategoryName}`}>
                            <TableCell>
                              <Badge variant={r.rank === 1 ? "default" : "outline"}>#{r.rank}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{r.subCategoryName}</TableCell>
                            <TableCell className="text-right">{Number(r.quantity ?? 0).toLocaleString()}개</TableCell>
                            <TableCell className="text-right">{Number(r.shareQty ?? 0).toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {subCategoryRankQ.data?.[0]?.sampleCount != null ? (
                    <div className="mt-3 text-xs text-muted-foreground">
                      * 표본 {Number(subCategoryRankQ.data[0].sampleCount).toLocaleString()}개 매장 기준
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* ✅ 메뉴별 매출 현황 (X축 줄바꿈) */}
            <Card>
              <CardHeader>
                <CardTitle>메뉴별 매출 현황</CardTitle>
              </CardHeader>

              <CardContent className="px-6">
                {menuPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={menuPerformance} margin={{ top: 10, right: 20, left: 40, bottom: 50 }}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366F1" stopOpacity={0.95} />
                          <stop offset="100%" stopColor="#22C55E" stopOpacity={0.85} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        interval={0}
                        height={50}
                        tickMargin={10}
                        tick={<MenuNameTick />}
                      />
                      <YAxis width={menuYAxisWidth} tickMargin={8} tickFormatter={(v) => money(Number(v))} />
                      <Tooltip formatter={(value: any) => `₩${money(Number(value))}`} />
                      <Bar dataKey="sales" radius={[10, 10, 4, 4]} fill="url(#barGrad)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">데이터 없음</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>카테고리별 매출 비중</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
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
                      <Tooltip formatter={(value: any) => `₩${money(Number(value))}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">데이터 없음</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 3. 수익 예측 탭 */}
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
              <CardDescription>기준월 데이터를 기반으로 다음 달(예측월) 예상 수익을 산출합니다.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {isStoreLoading ? (
                <div className="rounded-lg border p-4 text-muted-foreground">매장 정보를 불러오는 중…</div>
              ) : !currentStoreId ? (
                <div className="rounded-lg border p-4 text-muted-foreground">먼저 매장을 선택(또는 등록)해주세요.</div>
              ) : profitQ.isLoading ? (
                <div className="rounded-lg border p-4 text-muted-foreground">수익 예측을 불러오는 중…</div>
              ) : profitQ.isError ? (
                <div className="rounded-lg border p-4 text-red-600">수익 예측 조회에 실패했습니다. (ML 서버 상태 확인 필요)</div>
              ) : !profitQ.data ? (
                <div className="rounded-lg border p-4 text-muted-foreground">
                  아직 예측 데이터가 준비되지 않았습니다. (다음 달 1일에 갱신됩니다)
                </div>
              ) : (
                <>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border p-4">
                      <div className="text-sm text-muted-foreground">예측 순수익</div>
                      <div className="mt-1 text-3xl font-bold tracking-tight">₩{money((profitQ.data as any).pred)}</div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        예측 지표: <span className="font-medium">다음 달 순이익</span>
                      </div>
                    </div>

                    <div className="rounded-xl border p-4">
                      <div className="text-sm text-muted-foreground">기준월</div>
                      <div className="mt-1 text-2xl font-semibold">{(profitQ.data as any).featureYm}</div>
                      <div className="mt-2 text-xs text-muted-foreground">데이터 기준</div>
                    </div>

                    <div className="rounded-xl border p-4">
                      <div className="text-sm text-muted-foreground">예측월</div>
                      <div className="mt-1 text-2xl font-semibold">{(profitQ.data as any).predForYm}</div>
                      <div className="mt-2 text-xs text-muted-foreground">예측 대상 기간</div>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-muted/40 p-4">
                    <div className="text-sm font-medium">AI 분석 요약</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      <span className="font-medium">{(profitQ.data as any).featureYm}</span>의 매출, 비용, 상권 데이터를 종합 분석한 결과,{" "}
                      <span className="font-medium">{(profitQ.data as any).predForYm}</span> 예상 수익은 약{" "}
                      <span className="font-medium text-primary">₩{money((profitQ.data as any).pred)}</span>으로 전망됩니다.
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* ✅ 구·업종 평균 대비 손익 비교 */}
          <Card>
            <CardHeader>
              <CardTitle>구·업종 평균 대비 손익 비교</CardTitle>
              <CardDescription>내 매장의 월 매출/인건비를 기반으로, 같은 구·업종 평균과 비교합니다.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {isStoreLoading ? (
                <div className="rounded-lg border p-4 text-muted-foreground">매장 정보를 불러오는 중…</div>
              ) : !currentStoreId ? (
                <div className="rounded-lg border p-4 text-muted-foreground">먼저 매장을 선택(또는 등록)해주세요.</div>
              ) : benchQ.isLoading ? (
                <div className="rounded-lg border p-4 text-muted-foreground">벤치마크 비교 데이터를 불러오는 중…</div>
              ) : benchQ.isError ? (
                <div className="rounded-lg border p-4 text-red-600">
                  벤치마크 비교 조회에 실패했습니다. (industry_benchmark 집계/데이터 확인)
                </div>
              ) : !benchQ.data ? (
                <div className="rounded-lg border p-4 text-muted-foreground">벤치마크 데이터가 없습니다. (스케줄러 실행/샘플 수 부족)</div>
              ) : (
                (() => {
                  const b: any = benchQ.data;

                  const pct = (v: number) => `${(Number(v ?? 0) * 100).toFixed(1)}%`;
                  const pctPoint = (v: number) => `${Math.abs(Number(v ?? 0)).toFixed(2)}%p`;

                  const diff = Number(b.diffProfitRatePct ?? 0);

                  const DiffBadge = () => {
                    // ✅ 수정됨: 텍스트 크기(text-base), 패딩(px-3 py-1), 아이콘 크기(h-4 w-4) 키움
                    if (diff > 0)
                      return (
                        <Badge className="gap-1 bg-blue-600 hover:bg-blue-600 text-base px-3 py-1">
                          <ArrowUp className="h-4 w-4" /> 평균보다 {pctPoint(diff)}
                        </Badge>
                      );
                    if (diff < 0)
                      return (
                        <Badge variant="destructive" className="gap-1 text-base px-3 py-1">
                          <ArrowDown className="h-4 w-4" /> 평균보다 {pctPoint(diff)}
                        </Badge>
                      );
                    return (
                      <Badge variant="outline" className="gap-1 text-base px-3 py-1">
                        <Minus className="h-4 w-4" /> 평균과 동일
                      </Badge>
                    );
                  };

                  const InfoChip = ({ label, value }: { label: string; value: React.ReactNode }) => (
                    <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-foreground">{value}</span>
                    </div>
                  );

                  const StatCard = ({
                    title,
                    value,
                    sub,
                  }: {
                    title: string;
                    value: React.ReactNode;
                    sub?: React.ReactNode;
                  }) => (
                    <div className="rounded-2xl border bg-background p-4 shadow-sm">
                      <div className="text-xs text-muted-foreground">{title}</div>
                      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
                      {sub ? <div className="mt-2 text-xs text-muted-foreground">{sub}</div> : null}
                    </div>
                  );

                  return (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <InfoChip label="기준" value={`${b.year}-${String(b.month).padStart(2, "0")}`} />
                          <InfoChip label="구" value={b.sigunguCdNm ?? "구 정보 없음"} />
                          <InfoChip label="업종" value={b.industry ?? "업종 없음"} />
                          <InfoChip label="표본" value={`${Number(b.sampleCount ?? 0).toLocaleString()}개`} />
                        </div>
                        <DiffBadge />
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        <StatCard title="매출" value={`₩${money(b.sales)}`} sub="비교 기준(내 매출)" />
                        <StatCard title="내 순이익(추정)" value={`₩${money(b.myProfit)}`} sub={`이익률 ${pct(b.myProfitRate)}`} />
                        <StatCard
                          title="구·업종 평균 순이익(환산)"
                          value={`₩${money(b.benchProfit)}`}
                          sub={`평균 이익률 ${pct(b.benchProfitRate)}`}
                        />
                        <div className="mt-1 text-[11px] text-muted-foreground">* 세금(부가세/소득세 등)은 별도입니다.</div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border bg-background p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-medium">인건비</div>
                            <Badge variant="outline">
                              내 {pct(b.myLaborRate)} · 평균 {pct(b.benchLaborRate)}
                            </Badge>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            내 인건비 <span className="font-medium text-foreground">₩{money(b.myLaborAmount)}</span> / 평균 환산{" "}
                            <span className="font-medium text-foreground">₩{money(b.benchLaborAmount)}</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border bg-background p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-medium">원가(대략)</div>
                            <Badge variant="outline">
                              내 {pct(b.myCogsRate)} · 평균 {pct(b.benchCogsRate)}
                            </Badge>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            내 원가 <span className="font-medium text-foreground">₩{money(b.myCogsAmount)}</span> / 평균 환산{" "}
                            <span className="font-medium text-foreground">₩{money(b.benchCogsAmount)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        * 평균 환산 금액은 “내 매출”을 기준으로 평균 원가율/인건비율을 적용해 계산합니다.
                      </div>
                    </div>
                  );
                })()
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

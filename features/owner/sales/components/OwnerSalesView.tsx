// src/features/owner/sales/components/OwnerSalesView.tsx
"use client"

import React, { useMemo, useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  FileSpreadsheet,
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

import useOwnerSales, {
  TopMenu,
  TransactionSummary,
} from "@/features/owner/sales/hooks/useOwnerSales"

type Period = "DAY" | "WEEK" | "MONTH" | "YEAR"

const formatKR = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 0,
})

const formatPercentLabel = (value: number | null | undefined) => {
  if (value == null) return "0%"
  if (value > 0) return `+${value.toFixed(1)}%`
  if (value < 0) return `${value.toFixed(1)}%`
  return "0%"
}

const rateTextClass = (value: number | null | undefined) => {
  if (value == null || value === 0) return "text-muted-foreground"
  return value > 0 ? "text-green-600" : "text-red-600"
}

const periodLabel: Record<Period, string> = {
  DAY: "일",
  WEEK: "주",
  MONTH: "월",
  YEAR: "년",
}

export default function OwnerSalesView() {
  const {
    salesPeriod,
    setSalesPeriod,
    dailySalesData,
    menuPeriod,
    setMenuPeriod,
    topMenus,
    txFrom,
    txTo,
    setTxFrom,
    setTxTo,
    recentTransactions,
    summary,
  } = useOwnerSales() as any

  // ===== 거래 내역 프론트 페이징 상태 =====
  const [txPage, setTxPage] = useState<number>(1)
  const txPageSize = 10

  const totalTxPages = useMemo(() => {
    if (!recentTransactions || recentTransactions.length === 0) return 1
    return Math.max(1, Math.ceil(recentTransactions.length / txPageSize))
  }, [recentTransactions, txPageSize])

  const pagedTransactions = useMemo(() => {
    const startIdx = (txPage - 1) * txPageSize
    return recentTransactions.slice(startIdx, startIdx + txPageSize)
  }, [recentTransactions, txPage, txPageSize])

  // ===== 기간 선택 시 from > to 되지 않도록 보정 + 페이지 초기화 =====
  const handleTxFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFrom = e.target.value
    if (txTo && newFrom > txTo) {
      // 시작 날짜가 끝 날짜보다 뒤로 가면 끝 날짜를 맞춰줌
      setTxTo(newFrom)
    }
    setTxFrom(newFrom)
    setTxPage(1)
  }

  const handleTxToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTo = e.target.value
    if (txFrom && newTo < txFrom) {
      // 끝 날짜가 시작 날짜보다 과거면 시작 날짜를 맞춰줌
      setTxFrom(newTo)
    }
    setTxTo(newTo)
    setTxPage(1)
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">매출 관리</h1>
          <p className="text-muted-foreground">매출 현황을 확인하고 분석하세요</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-transparent">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel 내보내기
          </Button>
          <Button variant="outline" className="bg-transparent">
            <FileText className="mr-2 h-4 w-4" />
            PDF 내보내기
          </Button>
        </div>
      </div>

      {/* 상단 4개 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* 오늘 매출 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">오늘 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{formatKR.format(summary?.todaySales ?? 0)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className={rateTextClass(summary?.todaySalesChangeRate)}>
                {formatPercentLabel(summary?.todaySalesChangeRate)}
              </span>{" "}
              전일 대비
            </p>
          </CardContent>
        </Card>

        {/* 이번 주 매출 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">이번 주 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{formatKR.format(summary?.weekSales ?? 0)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className={rateTextClass(summary?.weekSalesChangeRate)}>
                {formatPercentLabel(summary?.weekSalesChangeRate)}
              </span>{" "}
              전주 대비
            </p>
          </CardContent>
        </Card>

        {/* 이번 달 매출 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">이번 달 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{formatKR.format(summary?.monthSales ?? 0)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className={rateTextClass(summary?.monthSalesChangeRate)}>
                {formatPercentLabel(summary?.monthSalesChangeRate)}
              </span>{" "}
              전월 대비
            </p>
          </CardContent>
        </Card>

        {/* 평균 객단가 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">평균 객단가</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{formatKR.format(summary?.avgTicket ?? 0)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className={rateTextClass(summary?.avgTicketChangeRate)}>
                {formatPercentLabel(summary?.avgTicketChangeRate)}
              </span>{" "}
              전일 대비
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">매출 현황</TabsTrigger>
          <TabsTrigger value="menu">메뉴별 분석</TabsTrigger>
          <TabsTrigger value="transactions">거래 내역</TabsTrigger>
        </TabsList>

        {/* 매출 현황 탭 */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>매출 추이</CardTitle>
                <CardDescription>
                  선택한 기간의 매출 흐름을 확인합니다.
                </CardDescription>
              </div>
              {/* 기간 토글 */}
              <div className="inline-flex items-center rounded-full bg-muted p-1 text-xs">
                {(["DAY", "WEEK", "MONTH", "YEAR"] as Period[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSalesPeriod(p)}
                    className={`px-3 py-1 rounded-full transition ${
                      salesPeriod === p
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {periodLabel[p]}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) =>
                      `₩${formatKR.format(value ?? 0)}`
                    }
                    labelStyle={{ color: "#000" }}
                  />
                  <Bar
                    dataKey="sales"
                    fill="#bae6fd"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 메뉴별 분석 탭 */}
        <TabsContent value="menu" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>인기 메뉴 TOP 5</CardTitle>
                <CardDescription>선택한 기간 기준 판매량 상위 메뉴</CardDescription>
              </div>
              <div className="inline-flex items-center rounded-full bg-muted p-1 text-xs">
                {(["DAY", "WEEK", "MONTH", "YEAR"] as Period[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setMenuPeriod(p)}
                    className={`px-3 py-1 rounded-full transition ${
                      menuPeriod === p
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {periodLabel[p]}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>순위</TableHead>
                    <TableHead>메뉴명</TableHead>
                    <TableHead>판매량</TableHead>
                    <TableHead>매출액</TableHead>
                    <TableHead>증감률</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topMenus.map((menu: TopMenu, index: number) => (
                    <TableRow key={menu.menuId}>
                      <TableCell className="font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>{menu.name}</TableCell>
                      <TableCell>{menu.quantity}개</TableCell>
                      <TableCell>
                        ₩{formatKR.format(menu.revenue ?? 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {menu.growth > 0 ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="text-green-600">
                                +{menu.growth.toFixed(1)}%
                              </span>
                            </>
                          ) : menu.growth < 0 ? (
                            <>
                              <TrendingDown className="h-4 w-4 text-red-600" />
                              <span className="text-red-600">
                                {menu.growth.toFixed(1)}%
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">0%</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {topMenus.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        해당 기간에 대한 판매 데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 거래 내역 탭 */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>거래 내역</CardTitle>
                <CardDescription>선택한 기간 내의 주문 기록</CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">기간</span>
                <input
                  type="date"
                  value={txFrom}
                  onChange={handleTxFromChange}
                  className="h-8 rounded-md border bg-background px-2 text-xs"
                />
                <span className="text-muted-foreground">~</span>
                <input
                  type="date"
                  value={txTo}
                  onChange={handleTxToChange}
                  className="h-8 rounded-md border bg-background px-2 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent>
              {/* 페이징 컨트롤 (디자인 최소 변경, 우측 상단 정렬) */}
              <div className="mb-3 flex items-center justify-end gap-2 text-xs">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={txPage <= 1}
                  onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                >
                  이전
                </Button>
                <span className="text-muted-foreground">
                  {txPage} / {totalTxPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={txPage >= totalTxPages}
                  onClick={() =>
                    setTxPage((p) => Math.min(totalTxPages, p + 1))
                  }
                >
                  다음
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>거래번호</TableHead>
                    <TableHead>시간</TableHead>
                    <TableHead>주문 내역</TableHead>
                    <TableHead>결제수단</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">할인</TableHead>
                    <TableHead className="text-right">금액</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedTransactions.map((tx: TransactionSummary) => (
                    <TableRow key={tx.transactionId}>
                      <TableCell className="font-medium">
                        {tx.transactionId}
                      </TableCell>
                      <TableCell>{tx.transactionTime}</TableCell>
                      <TableCell>{tx.itemsSummary}</TableCell>
                      <TableCell>{tx.paymentMethod}</TableCell>
                      <TableCell>{tx.status}</TableCell>
                      <TableCell className="text-right">
                        ₩{formatKR.format(tx.totalDiscount ?? 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        ₩{formatKR.format(tx.totalAmount ?? 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {pagedTransactions.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-muted-foreground"
                      >
                        선택한 기간에 거래 내역이 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

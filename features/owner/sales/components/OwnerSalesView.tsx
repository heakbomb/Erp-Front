"use client"
import Link from "next/link"
import React, { useState, useEffect } from "react"

import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

import {
  FileSpreadsheet, FileText, TrendingUp, TrendingDown, Loader2, Calendar as CalendarIcon
} from "lucide-react"
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts"

// ✅ 날짜 처리를 위한 import 추가
import { format, parseISO, isValid } from "date-fns"
import { ko } from "date-fns/locale"
import { DateRange } from "react-day-picker"

import useOwnerSales from "../hooks/useOwnerSales"

type Period = "DAY" | "WEEK" | "MONTH" | "YEAR"

const formatKR = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 })

// 증감률 배지 컴포넌트
const RateBadge = ({ rate }: { rate: number | undefined }) => {
  const val = rate ?? 0
  if (val === 0) return <span className="text-muted-foreground text-xs">0%</span>

  const isUp = val > 0
  return (
    <span className={`text-xs flex items-center ${isUp ? "text-green-600" : "text-red-600"}`}>
      {isUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
      {Math.abs(val).toFixed(1)}%
    </span>
  )
}

const periodLabel: Record<Period, string> = {
  DAY: "일", WEEK: "주", MONTH: "월", YEAR: "년",
}

export default function OwnerSalesView() {
  const {
    summary,
    salesPeriod, setSalesPeriod, chartData,
    menuPeriod, setMenuPeriod, topMenus,
    txFrom, setTxFrom, txTo, setTxTo,
    transactions, txPage, setTxPage, txTotalPages, txLoading,
    handleRefund
  } = useOwnerSales()

  // 환불 모달 상태
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [selectedTxId, setSelectedTxId] = useState<number | null>(null)
  const [refundReason, setRefundReason] = useState("")
  const [isWaste, setIsWaste] = useState(false)

  // ✅ 날짜 선택기용 로컬 상태 (DateRange 객체)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: txFrom ? parseISO(txFrom) : undefined,
    to: txTo ? parseISO(txTo) : undefined,
  })

  // ✅ 날짜 선택 변경 시 hook의 상태(string) 업데이트 및 페이지 초기화
  useEffect(() => {
    if (dateRange?.from) {
      setTxFrom(format(dateRange.from, "yyyy-MM-dd"))
    }
    if (dateRange?.to) {
      setTxTo(format(dateRange.to, "yyyy-MM-dd"))
    }

    // 날짜 범위가 변경되면 1페이지로 이동
    if (dateRange?.from || dateRange?.to) {
      setTxPage(0)
    }
  }, [dateRange, setTxFrom, setTxTo, setTxPage])

  // 🛠️ [핵심] 거래 시간 포맷팅 헬퍼 함수
  // Spring Boot가 배열([년,월,일,시,분...])로 보낼 때와 문자열("2024-...")로 보낼 때 모두 처리
  const formatTxTime = (time: any) => {
    if (!time) return "-";

    try {
      // 1. 배열인 경우 ([2024, 11, 27, 14, 30]) -> "2024-11-27 14:30"
      if (Array.isArray(time)) {
        if (time.length < 5) return "-";
        const [y, m, d, h, min, s] = time;
        const date = new Date(y, m - 1, d, h, min, s || 0);
        return format(date, "yyyy-MM-dd HH:mm");
      }

      // 2. 문자열인 경우
      if (typeof time === "string") {
        // ✅ [추가] "20:44" 처럼 시간만 있는 경우 -> 그대로 출력
        if (time.length === 5 && time.includes(":")) {
          return time;
        }

        // "2024-11-27T14:30:00" 처럼 풀 포맷인 경우 -> 포맷팅
        const date = parseISO(time);
        if (isValid(date)) {
          return format(date, "yyyy-MM-dd HH:mm");
        }
      }
    } catch (e) {
      console.error("Time parsing error:", time, e);
      // 변환 에러가 나도 원본 데이터라도 보여주도록 처리
      return String(time);
    }
    // 포맷을 알 수 없는 경우 원본 문자열 반환
    return String(time);
  };

  const openRefundModal = (id: number) => {
    setSelectedTxId(id)
    setRefundReason("")
    setIsWaste(false)
    setRefundModalOpen(true)
  }

  const submitRefund = async () => {
    if (!selectedTxId) return
    if (!refundReason.trim()) {
      alert("취소 사유를 입력해주세요.")
      return
    }
    try {
      await handleRefund(selectedTxId, isWaste, refundReason)
      setRefundModalOpen(false)
    } catch {
      // 에러는 hook에서 toast 처리됨
    }
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
          <Button asChild variant="outline" className="bg-transparent">
            <Link href="/owner/sales/pos">
              <FileText className="mr-2 h-4 w-4" />
              POS
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="bg-transparent"
          >
            <Link
              href={`/owner/sales/report?year=${new Date().getFullYear()}&month=${new Date().getMonth() + 1}`}
            >
              <FileText className="mr-2 h-4 w-4" />
              월간 리포트
            </Link>
          </Button>
        </div>
      </div>

      {/* 상단 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">오늘 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{formatKR.format(summary?.todaySales ?? 0)}</div>
            <div className="mt-1 flex items-center gap-2">
              <RateBadge rate={summary?.todayRate} />
              <span className="text-xs text-muted-foreground">전일 대비</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">이번 주 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{formatKR.format(summary?.weekSales ?? 0)}</div>
            <div className="mt-1 flex items-center gap-2">
              <RateBadge rate={summary?.weekRate} />
              <span className="text-xs text-muted-foreground">전주 대비</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">이번 달 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{formatKR.format(summary?.monthSales ?? 0)}</div>
            <div className="mt-1 flex items-center gap-2">
              <RateBadge rate={summary?.monthRate} />
              <span className="text-xs text-muted-foreground">전월 대비</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">평균 객단가</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{formatKR.format(summary?.avgTicket ?? 0)}</div>
            <div className="mt-1 flex items-center gap-2">
              <RateBadge rate={summary?.avgTicketRate} />
              <span className="text-xs text-muted-foreground">전월 대비</span>
            </div>
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
              <CardTitle>매출 추이</CardTitle>
              <div className="inline-flex items-center rounded-full bg-muted p-1 text-xs">
                {(["DAY", "WEEK", "MONTH", "YEAR"] as Period[]).map((p) => (
                  <button key={p} onClick={() => setSalesPeriod(p)} className={`px-3 py-1 rounded-full transition ${salesPeriod === p ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    {periodLabel[p]}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `₩${formatKR.format(value ?? 0)}`} labelStyle={{ color: "#000" }} />
                  <Bar dataKey="sales" fill="#bae6fd" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 메뉴별 분석 탭 */}
        <TabsContent value="menu" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <CardTitle>인기 메뉴 TOP 5</CardTitle>
              <div className="inline-flex items-center rounded-full bg-muted p-1 text-xs">
                {(["DAY", "WEEK", "MONTH", "YEAR"] as Period[]).map((p) => (
                  <button key={p} onClick={() => setMenuPeriod(p)} className={`px-3 py-1 rounded-full transition ${menuPeriod === p ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    {periodLabel[p]}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">순위</TableHead>
                    <TableHead>메뉴명</TableHead>
                    <TableHead className="text-right">판매량</TableHead>
                    <TableHead className="text-right">매출액</TableHead>
                    <TableHead className="w-[150px]">매출 비중</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topMenus.map((menu, index) => (
                    <TableRow key={menu.menuId}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{menu.name}</TableCell>
                      <TableCell className="text-right">{menu.quantity}개</TableCell>
                      <TableCell className="text-right">₩{formatKR.format(menu.revenue ?? 0)}</TableCell>
                      {/* ✅ 매출 비중 표시 (Progress Bar) */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={menu.share} className="h-2 w-16" />
                          <span className="text-xs text-muted-foreground w-8 text-right">{menu.share?.toFixed(0) || 0}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {topMenus.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">데이터가 없습니다.</TableCell>
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
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle>거래 내역</CardTitle>

                {/* ✅ 통합된 날짜 선택 UI (DateRangePicker) */}
                <div className={cn("grid gap-2")}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-[300px] justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "PPP", { locale: ko })} -{" "}
                              {format(dateRange.to, "PPP", { locale: ko })}
                            </>
                          ) : (
                            format(dateRange.from, "PPP", { locale: ko })
                          )
                        ) : (
                          <span>날짜 선택</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        locale={ko}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>시간</TableHead>
                      <TableHead>주문 내역</TableHead>
                      <TableHead>결제수단</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.transactionId} className={tx.status === 'CANCELED' ? "opacity-50 bg-muted/50" : ""}>
                        {/* ✅ [수정] 헬퍼 함수를 사용하여 시간 포맷팅 오류 해결 */}
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatTxTime(tx.transactionTime)}
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate" title={tx.itemsSummary}>
                          {tx.itemsSummary}
                        </TableCell>
                        <TableCell>{tx.paymentMethod}</TableCell>
                        <TableCell className={tx.status === 'CANCELED' ? "line-through" : "font-medium"}>
                          ₩{formatKR.format(tx.totalAmount ?? 0)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={tx.status === 'PAID' ? 'default' : 'destructive'}>{tx.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {tx.status === 'PAID' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => openRefundModal(tx.transactionId)}
                            >
                              취소
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {transactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">선택한 기간에 거래 내역이 없습니다.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}

              {/* 페이지네이션 컨트롤 */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button variant="outline" size="sm" disabled={txPage === 0 || txLoading} onClick={() => setTxPage(Math.max(0, txPage - 1))}>이전</Button>
                <span className="text-sm text-muted-foreground py-2">{txPage + 1} / {Math.max(1, txTotalPages)}</span>
                <Button variant="outline" size="sm" disabled={txPage >= txTotalPages - 1 || txLoading} onClick={() => setTxPage(Math.min(txTotalPages - 1, txPage + 1))}>다음</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 환불 모달 */}
      <Dialog open={refundModalOpen} onOpenChange={setRefundModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>결제 취소</DialogTitle>
            <DialogDescription>취소 사유를 입력하고 재고 처리 방식을 선택하세요.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="reason">취소 사유</Label>
              <Input id="reason" placeholder="예: 고객 단순 변심, 주문 실수" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} />
            </div>
            <div className="flex items-center space-x-2 border p-3 rounded-md">
              <Checkbox id="isWaste" checked={isWaste} onCheckedChange={(c) => setIsWaste(!!c)} />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="isWaste" className="text-sm font-medium leading-none">폐기 처리 (재고 복구 안 함)</label>
                <p className="text-xs text-muted-foreground">이미 조리된 음식이거나 재사용이 불가능한 경우 체크하세요.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundModalOpen(false)}>닫기</Button>
            <Button variant="destructive" onClick={submitRefund}>취소 확정</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
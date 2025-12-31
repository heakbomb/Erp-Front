// modules/salesC/SalesDashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { Progress } from "@/shared/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Calendar } from "@/shared/ui/calendar";
import { cn } from "@/shared/utils/commonUtils";
import { FileText, TrendingUp, TrendingDown, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { format, parseISO, isValid } from "date-fns";
import { ko } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { useOwnerSales } from "./useOwnerSales";
import { Period } from "./salesTypes";

const formatKR = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });

const RateBadge = ({ rate }: { rate: number | undefined }) => {
  const val = rate ?? 0;
  if (val === 0) return <span className="text-muted-foreground text-xs">0%</span>;
  const isUp = val > 0;
  return (
    <span className={`text-xs flex items-center ${isUp ? "text-green-600" : "text-red-600"}`}>
      {isUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
      {Math.abs(val).toFixed(1)}%
    </span>
  );
};

const periodLabel: Record<Period, string> = { DAY: "일", WEEK: "주", MONTH: "월", YEAR: "년" };

const REFUND_REASONS = [
  "결제 실수",
  "단순 변심",
  "주문 입력 오류",
  "시스템 오류",
];

export default function SalesDashboard() {
  const {
    summary, salesPeriod, setSalesPeriod, chartData,
    menuPeriod, setMenuPeriod, topMenus,
    txFrom, setTxFrom, txTo, setTxTo,
    transactions, txPage, setTxPage, txTotalPages, txLoading,
    handleRefund
  } = useOwnerSales();

  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState<number | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [isWaste, setIsWaste] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: txFrom ? parseISO(txFrom) : undefined,
    to: txTo ? parseISO(txTo) : undefined,
  });

  useEffect(() => {
    if (dateRange?.from) setTxFrom(format(dateRange.from, "yyyy-MM-dd"));
    if (dateRange?.to) setTxTo(format(dateRange.to, "yyyy-MM-dd"));
    if (dateRange?.from || dateRange?.to) setTxPage(0);
  }, [dateRange, setTxFrom, setTxTo, setTxPage]);

  const formatTxTime = (time: any) => {
    if (!time) return "-";
    try {
      if (Array.isArray(time)) {
        if (time.length < 5) return "-";
        const [y, m, d, h, min, s] = time;
        return format(new Date(y, m - 1, d, h, min, s || 0), "yyyy-MM-dd HH:mm");
      }
      if (typeof time === "string") {
        if (time.length === 5 && time.includes(":")) return time;
        const date = parseISO(time);
        if (isValid(date)) return format(date, "yyyy-MM-dd HH:mm");
      }
    } catch { return String(time); }
    return String(time);
  };

  // [수정] 2. 모달 열 때 기본 사유 선택 (빈 값 방지)
  const openRefundModal = (id: number) => {
    setSelectedTxId(id);
    setRefundReason(REFUND_REASONS[0]); // "결제 실수"를 기본값으로 설정
    setIsWaste(false);
    setRefundModalOpen(true);
  };

  const submitRefund = async () => {
    if (!selectedTxId) return;
    // 직접 입력이 사라졌으므로 빈 값 체크는 사실상 불필요하지만 안전을 위해 유지
    if (!refundReason.trim()) return alert("취소 사유 선택 필요");
    await handleRefund(selectedTxId, isWaste, refundReason);
    setRefundModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">매출 관리</h1>
          <p className="text-muted-foreground">매출 현황 확인 및 분석</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="bg-transparent"><Link href="/owner/sales/pos"><FileText className="mr-2 h-4 w-4"/>POS</Link></Button>
          <Button asChild variant="outline" className="bg-transparent">
            <Link href={`/owner/sales/report?year=${new Date().getFullYear()}&month=${new Date().getMonth() + 1}`}>
              <FileText className="mr-2 h-4 w-4"/>월간 리포트
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "오늘 매출", val: summary?.todaySales, rate: summary?.todayRate, label: "전일 대비" },
          { title: "이번 주 매출", val: summary?.weekSales, rate: summary?.weekRate, label: "전주 대비" },
          { title: "이번 달 매출", val: summary?.monthSales, rate: summary?.monthRate, label: "전월 대비" },
          { title: "평균 객단가", val: summary?.avgTicket, rate: summary?.avgTicketRate, label: "전월 대비" },
        ].map((item, i) => (
          <Card key={i}>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">{item.title}</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩{formatKR.format(item.val ?? 0)}</div>
              <div className="mt-1 flex items-center gap-2"><RateBadge rate={item.rate} /><span className="text-xs text-muted-foreground">{item.label}</span></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">매출 현황</TabsTrigger>
          <TabsTrigger value="menu">메뉴별 분석</TabsTrigger>
          <TabsTrigger value="transactions">거래 내역</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:justify-between">
              <CardTitle>매출 추이</CardTitle>
              <div className="inline-flex items-center rounded-full bg-muted p-1 text-xs">
                {(["DAY", "WEEK", "MONTH", "YEAR"] as Period[]).map(p => (
                  <button key={p} onClick={() => setSalesPeriod(p)} className={`px-3 py-1 rounded-full transition ${salesPeriod === p ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{periodLabel[p]}</button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ top: 16, right: 16, left: 56, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(val: number) => `₩${formatKR.format(val)}`} />
                  <Bar dataKey="sales" fill="#bae6fd" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:justify-between">
              <CardTitle>인기 메뉴 TOP 5</CardTitle>
              <div className="inline-flex items-center rounded-full bg-muted p-1 text-xs">
                {(["DAY", "WEEK", "MONTH", "YEAR"] as Period[]).map(p => (
                  <button key={p} onClick={() => setMenuPeriod(p)} className={`px-3 py-1 rounded-full transition ${menuPeriod === p ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{periodLabel[p]}</button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>순위</TableHead><TableHead>메뉴명</TableHead><TableHead className="text-right">판매량</TableHead><TableHead className="text-right">매출액</TableHead><TableHead>매출 비중</TableHead></TableRow></TableHeader>
                <TableBody>
                  {topMenus.map((m, i) => (
                    <TableRow key={m.menuId}>
                      <TableCell>{i + 1}</TableCell><TableCell>{m.name}</TableCell><TableCell className="text-right">{m.quantity}개</TableCell><TableCell className="text-right">₩{formatKR.format(m.revenue)}</TableCell>
                      <TableCell><div className="flex items-center gap-2"><Progress value={m.share} className="h-2 w-16" /><span className="text-xs text-muted-foreground w-8 text-right">{m.share?.toFixed(0) || 0}%</span></div></TableCell>
                    </TableRow>
                  ))}
                  {topMenus.length === 0 && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">데이터가 없습니다.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>거래 내역</CardTitle>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, "yy.MM.dd")} - ${format(dateRange.to, "yy.MM.dd")}` : format(dateRange.from, "yy.MM.dd")) : "날짜 선택"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={ko} />
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent>
              {txLoading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div> : (
                <Table>
                  <TableHeader><TableRow><TableHead>시간</TableHead><TableHead>주문 내역</TableHead><TableHead>결제수단</TableHead><TableHead>금액</TableHead><TableHead>상태</TableHead><TableHead className="text-right">관리</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {transactions.map(tx => (
                      <TableRow key={tx.transactionId} className={tx.status === "CANCELED" ? "opacity-50 bg-muted/50" : ""}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatTxTime(tx.transactionTime)}</TableCell>
                        <TableCell className="max-w-[180px] truncate" title={tx.itemsSummary}>{tx.itemsSummary}</TableCell>
                        <TableCell>{tx.paymentMethod}</TableCell>
                        <TableCell className={tx.status === "CANCELED" ? "line-through" : "font-medium"}>₩{formatKR.format(tx.totalAmount)}</TableCell>
                        <TableCell><Badge variant={tx.status === "PAID" ? "default" : "destructive"}>{tx.status}</Badge></TableCell>
                        <TableCell className="text-right">{tx.status === "PAID" && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openRefundModal(tx.transactionId)}>취소</Button>}</TableCell>
                      </TableRow>
                    ))}
                    {transactions.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">내역이 없습니다.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              )}
              <div className="flex justify-center gap-2 mt-4">
                <Button variant="outline" size="sm" disabled={txPage === 0 || txLoading} onClick={() => setTxPage(Math.max(0, txPage - 1))}>이전</Button>
                <span className="text-sm py-2">{txPage + 1} / {Math.max(1, txTotalPages)}</span>
                <Button variant="outline" size="sm" disabled={txPage >= txTotalPages - 1 || txLoading} onClick={() => setTxPage(Math.min(txTotalPages - 1, txPage + 1))}>다음</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 결제 취소 다이얼로그 부분 */}
      <Dialog open={refundModalOpen} onOpenChange={setRefundModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>결제 취소</DialogTitle>
            <DialogDescription>취소 사유와 폐기 여부를 선택하세요.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-2">
            {/* [수정] 3. Input을 버튼형 토글 선택으로 변경 */}
            <div className="grid gap-2">
              <Label>취소 사유</Label>
              <div className="grid grid-cols-2 gap-2">
                {REFUND_REASONS.map((reason) => (
                  <Button
                    key={reason}
                    type="button"
                    // 선택된 항목은 색상을 채우고(default), 아니면 외곽선(outline) 처리
                    variant={refundReason === reason ? "default" : "outline"}
                    onClick={() => setRefundReason(reason)}
                    className="w-full"
                  >
                    {reason}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 border p-3 rounded-md">
              <Checkbox id="isWaste" checked={isWaste} onCheckedChange={(c) => setIsWaste(!!c)} />
              <div className="grid gap-1.5">
                <label htmlFor="isWaste" className="text-sm font-medium">폐기 처리 (재고 복구 X)</label>
                <p className="text-xs text-muted-foreground">이미 조리된 경우 체크</p>
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
  );
}
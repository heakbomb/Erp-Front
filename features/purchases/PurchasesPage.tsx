// features/purchases/PurchasesPage.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Label } from "@/shared/ui/label";
import { Plus, Search, Upload, Download, FileText, Loader2, Pencil, Trash2 } from "lucide-react";
import { usePurchases } from "./hooks/usePurchases";
import { PurchaseModal } from "./components/PurchaseModal";

const KR = new Intl.NumberFormat("ko-KR");

export default function PurchasesPageFeature() {
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => { setMounted(true) }, []);

  // 1. 훅 호출
  const {
    purchasesQuery,
    inventoryQuery,
    filteredRows,
    inventoryOpts,
    isLoading,
    error,
    selectedItemId, setSelectedItemId,
    startDate, setStartDate,
    endDate, setEndDate,
    searchText, setSearchText,
    size, setSize,
    page,
    totalPages,
    totalElements,
    handlePageChange,
    totalAmount,
    isAddOpen, setIsAddOpen,
    handleSubmit,
    isSubmitting,
    editingPurchase,
    handleEditClick,
    handleDeleteClick,
    handleModalClose
  } = usePurchases();

  // 2. 페이지네이션 UI (inline)
  const PageButtons = () => {
    if (totalPages <= 1) return null;
    const groupSize = 5;
    const currentGroup = Math.floor(page / groupSize);
    const start = currentGroup * groupSize;
    const end = Math.min(totalPages, start + groupSize);

    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="bg-transparent"
          disabled={page === 0}
          onClick={() => handlePageChange(page - 1)}
        >
          이전
        </Button>
        {Array.from({ length: end - start }, (_, idx) => {
          const p = start + idx;
          const active = p === page;
          return (
            <Button
              key={p}
              variant={active ? "default" : "outline"}
              className={active ? "" : "bg-transparent"}
              onClick={() => handlePageChange(p)}
            >
              {p + 1}
            </Button>
          );
        })}
        <Button
          variant="outline"
          className="bg-transparent"
          disabled={page >= totalPages - 1}
          onClick={() => handlePageChange(page + 1)}
        >
          다음
        </Button>
        <div className="ml-2 text-sm text-muted-foreground">
          총 {KR.format(totalElements)}건 / {totalPages}페이지
        </div>
      </div>
    );
  };

  // 3. 메인 JSX
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">매입 관리</h1>
          <p className="text-muted-foreground">매입 내역을 기록하고 관리하세요</p>
        </div>
        <div className="flex gap-2">
          {mounted && (
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> 매입 기록
            </Button>
          )}
        </div>
      </div>

      {/* 검색/필터 바 */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-sm">필터</CardTitle>
          <CardDescription>기간/품목으로 필터링하세요</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="space-y-1">
            <Label>시작일</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                const newStart = e.target.value;

                // 시작일 변경
                setStartDate(newStart);

                if (endDate && newStart && endDate < newStart) {
                  setEndDate(newStart);        // or 시작일과 같게 맞추기
                }

                handlePageChange(0);
              }}
            />
          </div>
          <div className="space-y-1">
            <Label>종료일</Label>
            <Input
              type="date"
              value={endDate}
              min={startDate || undefined}      // 🔥 시작일 이전 날짜는 캘린더에서 선택 불가
              onChange={(e) => {
                const newEnd = e.target.value;

                // 사용자가 직접 타이핑했을 때 대비
                if (startDate && newEnd && newEnd < startDate) {
                  // 필요하면 alert/toast 넣어도 됨
                  // toast.error("종료일은 시작일보다 빠를 수 없습니다.");
                  return;
                }

                setEndDate(newEnd);
                handlePageChange(0);
              }}
            />
          </div>
          <div className="space-y-1">
            <Label>품목</Label>
            <select
              className="w-full h-9 rounded-md border px-3 text-sm bg-transparent"
              value={selectedItemId}
              onChange={(e) => { setSelectedItemId(e.target.value); handlePageChange(0); }}
              disabled={inventoryQuery.isLoading}
            >
              <option value="">전체</option>
              {inventoryOpts.map((opt) => (
                <option key={opt.itemId} value={opt.itemId}>
                  {opt.itemName} ({opt.stockType})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>검색(표시용)</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="품목명 검색…"
                className="pl-8"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>페이지 크기</Label>
            <select
              className="w-full h-9 rounded-md border px-3 text-sm bg-transparent"
              value={size}
              onChange={(e) => { setSize(Number(e.target.value)); handlePageChange(0); }}
            >
              {[10, 20, 30, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 통계 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">현재 페이지 총 매입</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{KR.format(totalAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">리스트에 표시된 합계</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">건수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRows.length}건</div>
            <p className="text-xs text-muted-foreground mt-1">현재 페이지 기준</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">총 건수(전체)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{KR.format(totalElements)}건</div>
            <p className="text-xs text-muted-foreground mt-1">필터 조건 반영</p>
          </CardContent>
        </Card>
      </div>

      {/* 테이블 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>매입 내역</CardTitle>
              <CardDescription>필터·페이지 적용된 결과</CardDescription>
            </div>
            <PageButtons />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
          {error && <div className="text-sm text-red-500 text-center p-4">{error.message}</div>}
          {!isLoading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead>품목</TableHead>
                  <TableHead>수량</TableHead>
                  <TableHead>단가</TableHead>
                  <TableHead>총액</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((r) => {
                  const inv = inventoryOpts.find((i) => i.itemId === r.itemId);
                  const unit = inv?.stockType ? ` ${inv.stockType}` : "";
                  const total = Number(r.purchaseQty) * Number(r.unitPrice);
                  return (
                    <TableRow key={r.purchaseId}>
                      <TableCell>{r.purchaseDate}</TableCell>
                      <TableCell className="font-medium">{inv?.itemName ?? `#${r.itemId}`}</TableCell>
                      <TableCell>{KR.format(Number(r.purchaseQty))}{unit}</TableCell>
                      <TableCell>₩{KR.format(Number(r.unitPrice))}</TableCell>
                      <TableCell className="font-medium">₩{KR.format(total)}</TableCell>
                      {/* ✅ 수정/삭제 버튼 추가 */}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-100" onClick={() => handleEditClick(r)}>
                            <Pencil className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-100" onClick={() => handleDeleteClick(r.purchaseId)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!filteredRows.length && (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground">데이터가 없습니다.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 4. 모달 렌더링 */}
      {mounted && (
        <PurchaseModal
          open={isAddOpen}
          onOpenChange={handleModalClose}
          onSubmit={handleSubmit}
          isPending={isSubmitting}
          inventoryOpts={inventoryOpts}
          initialData={editingPurchase}
        />
      )}
    </div>
  );
}
// modules/purchasesC/PurchaseList.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Label } from "@/shared/ui/label";
import { Plus, Search, Loader2, Pencil, Trash2 } from "lucide-react";
import { usePurchases } from "./usePurchases";
import PurchaseModal from "./PurchaseModal";

const KR = new Intl.NumberFormat("ko-KR");

export default function PurchaseList() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  const {
    inventoryOpts, isLoading, error,
    selectedItemId, setSelectedItemId,
    startDate, setStartDate,
    endDate, setEndDate,
    searchText, setSearchText,
    size, setSize,
    page, totalPages, totalElements, handlePageChange,
    totalAmount, filteredRows,
    isAddOpen, setIsAddOpen, handleSubmit, isSubmitting,
    editingPurchase, handleEditClick, handleDeleteClick, handleModalClose
  } = usePurchases();

  const renderPageButtons = () => {
    if (totalPages <= 1) return null;
    const groupSize = 5;
    const currentGroup = Math.floor(page / groupSize);
    const start = currentGroup * groupSize;
    const end = Math.min(totalPages, start + groupSize);
    
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => handlePageChange(page - 1)}>이전</Button>
        {Array.from({ length: end - start }, (_, idx) => {
          const p = start + idx;
          return <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => handlePageChange(p)}>{p + 1}</Button>;
        })}
        <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => handlePageChange(page + 1)}>다음</Button>
        <span className="text-xs text-muted-foreground ml-2">총 {totalElements}건</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">매입 관리</h1>
          <p className="text-muted-foreground">매입 내역을 기록하고 관리하세요</p>
        </div>
        {mounted && <Button onClick={() => setIsAddOpen(true)}><Plus className="mr-2 h-4 w-4"/> 매입 기록</Button>}
      </div>

      <Card className="bg-slate-50 border-slate-200">
        <CardHeader><CardTitle className="text-sm">필터</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="space-y-1"><Label>시작일</Label><Input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); handlePageChange(0); }} /></div>
          <div className="space-y-1"><Label>종료일</Label><Input type="date" value={endDate} min={startDate} onChange={e => { setEndDate(e.target.value); handlePageChange(0); }} /></div>
          <div className="space-y-1"><Label>품목</Label>
            <select className="w-full h-9 rounded-md border px-3 text-sm bg-background" value={selectedItemId} onChange={e => { setSelectedItemId(e.target.value); handlePageChange(0); }}>
              <option value="">전체</option>
              {inventoryOpts.map(opt => <option key={opt.itemId} value={opt.itemId}>{opt.itemName}</option>)}
            </select>
          </div>
          <div className="space-y-1"><Label>검색</Label>
            <div className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-8" placeholder="품목명..." value={searchText} onChange={e => setSearchText(e.target.value)} /></div>
          </div>
          <div className="space-y-1"><Label>페이지 크기</Label>
            <select className="w-full h-9 rounded-md border px-3 text-sm bg-background" value={size} onChange={e => { setSize(Number(e.target.value)); handlePageChange(0); }}>
              {[10, 20, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">총 매입액 (현재 페이지)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">₩{KR.format(totalAmount)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">건수 (현재 페이지)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{filteredRows.length}건</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">총 건수 (전체)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalElements}건</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>매입 내역</CardTitle>
            {renderPageButtons()}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></div> : 
           error ? <div className="text-center text-red-500 py-8">에러 발생: {error.message}</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead>품목</TableHead>
                  <TableHead className="text-right">수량</TableHead>
                  <TableHead className="text-right">단가</TableHead>
                  <TableHead className="text-right">총액</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8">데이터가 없습니다.</TableCell></TableRow> : filteredRows.map(r => {
                  const inv = inventoryOpts.find(i => i.itemId === r.itemId);
                  const total = r.purchaseQty * r.unitPrice;
                  return (
                    <TableRow key={r.purchaseId}>
                      <TableCell>{r.purchaseDate}</TableCell>
                      <TableCell className="font-medium">{inv?.itemName ?? r.itemName ?? `#${r.itemId}`}<span className="text-xs text-muted-foreground ml-1">({inv?.stockType ?? r.itemUnit})</span></TableCell>
                      <TableCell className="text-right">{KR.format(r.purchaseQty)}</TableCell>
                      <TableCell className="text-right">₩{KR.format(r.unitPrice)}</TableCell>
                      <TableCell className="text-right font-bold">₩{KR.format(total)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(r)}><Pencil className="h-4 w-4 text-blue-600"/></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(r.purchaseId)}><Trash2 className="h-4 w-4 text-red-600"/></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
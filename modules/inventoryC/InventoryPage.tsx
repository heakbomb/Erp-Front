// modules/inventoryC/InventoryPage.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useInventory } from "./useInventory";
import InventoryModal from "./InventoryModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Plus, Search, AlertTriangle, Download, Edit, Loader2 } from "lucide-react";
import { INGREDIENT_CATEGORIES } from "./inventoryTypes";

const PAGE_WINDOW = 5;

export default function InventoryPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  const {
    inventoryData, isInventoryLoading, inventoryError,
    lowStockItems, isLowStockLoading,
    page, pageSize, setPageSize, goToPage,
    searchQuery, handleSearch,
    showInactiveOnly, setShowInactiveOnly,
    itemTypeFilter, handleChangeItemType,
    isAddModalOpen, setIsAddModalOpen,
    isEditModalOpen, setIsEditModalOpen,
    editingItem, openAddModal, openEditModal,
    handleCreate, handleUpdate, handleDeactivate, handleReactivate, handleExportExcel,
    isCreating, isUpdating, isDeactivating, isReactivating, isExporting
  } = useInventory();

  const items = inventoryData?.content ?? [];
  const totalPages = inventoryData?.totalPages ?? 0;
  const start = Math.floor(page / PAGE_WINDOW) * PAGE_WINDOW;
  const end = Math.min(start + PAGE_WINDOW - 1, Math.max(totalPages - 1, 0));

  const [localSearch, setLocalSearch] = useState(searchQuery);
  useEffect(() => { setLocalSearch(searchQuery) }, [searchQuery]);

  const renderCategoryLabel = (val?: string) => 
    INGREDIENT_CATEGORIES.find(c => c.value === val)?.label || val || "-";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">재고 관리</h1>
          <p className="text-muted-foreground">재고 현황을 확인하고 관리하세요</p>
        </div>
        {mounted && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportExcel} disabled={isExporting}>
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Excel 내보내기
            </Button>
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" /> 재고 추가
            </Button>
          </div>
        )}
      </div>

      {(isLowStockLoading || lowStockItems.length > 0) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-900">재고 부족 알림 (활성 재고)</CardTitle>
            </div>
            <CardDescription className="text-amber-700">
              {isLowStockLoading ? "계산 중..." : `${lowStockItems.length}개 품목이 안전 재고 이하입니다`}
            </CardDescription>
          </CardHeader>
          {!isLowStockLoading && (
            <CardContent>
              <div className="space-y-2">
                {lowStockItems.map((i) => (
                  <div key={i.itemId} className="flex justify-between p-3 rounded-lg bg-white">
                    <div>
                      <p className="font-medium">{i.itemName}</p>
                      <p className="text-sm text-muted-foreground">
                        현재: {i.stockQty}{i.stockType} / 안전: {i.safetyQty}{i.stockType}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <CardTitle>재고 목록</CardTitle>
              <CardDescription>페이지 {page + 1} / {Math.max(totalPages, 1)}</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="품목 검색..." 
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e.currentTarget.value)}
                  className="pl-8"
                />
              </div>
              <select 
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={itemTypeFilter ?? ""}
                onChange={(e) => handleChangeItemType(e.target.value)}
              >
                <option value="">전체 타입</option>
                {INGREDIENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={showInactiveOnly} onChange={(e) => { setShowInactiveOnly(e.target.checked); goToPage(0); }} />
                비활성만 보기
              </label>
              <select 
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); goToPage(0); }}
              >
                {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/페이지</option>)}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isInventoryLoading ? <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>품목명</TableHead>
                    <TableHead>타입</TableHead>
                    <TableHead>현재 재고</TableHead>
                    <TableHead>안전 재고</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8">데이터가 없습니다.</TableCell></TableRow> : items.map((i) => {
                    const isLow = Number(i.stockQty) < Number(i.safetyQty);
                    const status = i.status ?? (showInactiveOnly ? "INACTIVE" : "ACTIVE");
                    return (
                      <TableRow key={i.itemId} className={status === "INACTIVE" ? "opacity-50" : (isLow ? "bg-red-50" : "")}>
                        <TableCell className="font-medium">{i.itemName}</TableCell>
                        <TableCell>{renderCategoryLabel(i.itemType)}</TableCell>
                        <TableCell>
                          {i.stockQty} {i.stockType}
                          {status === "ACTIVE" && isLow && <div className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3"/>부족</div>}
                        </TableCell>
                        <TableCell>{i.safetyQty} {i.stockType}</TableCell>
                        <TableCell><Badge variant={status === "INACTIVE" ? "secondary" : isLow ? "destructive" : "default"}>{status === "INACTIVE" ? "비활성" : isLow ? "부족" : "정상"}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(i)} disabled={isDeactivating || isReactivating}><Edit className="h-4 w-4"/></Button>
                            {status === "ACTIVE" ? (
                              <Button variant="outline" size="sm" onClick={() => handleDeactivate(i.itemId)} disabled={isDeactivating}>비활성화</Button>
                            ) : (
                              <Button variant="default" size="sm" onClick={() => handleReactivate(i.itemId)} disabled={isReactivating}>해제</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {totalPages > 0 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">{page + 1} / {totalPages}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => goToPage(0)}>«</Button>
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => goToPage(page - 1)}>‹</Button>
                    {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(p => (
                      <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => goToPage(p)}>{p + 1}</Button>
                    ))}
                    <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => goToPage(page + 1)}>›</Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => goToPage(totalPages - 1)}>»</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {mounted && (
        <>
          <InventoryModal mode="add" open={isAddModalOpen} onOpenChange={setIsAddModalOpen} onSubmit={handleCreate} isPending={isCreating} />
          <InventoryModal mode="edit" open={isEditModalOpen} onOpenChange={setIsEditModalOpen} onSubmit={handleUpdate} isPending={isUpdating} defaultValues={editingItem} />
        </>
      )}
    </div>
  );
}
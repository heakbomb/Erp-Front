// features/inventory/InventoryPage.tsx
"use client"

import React, { useMemo, useState } from "react";
// ⭐️ 1. shadcn/ui 및 아이콘 임포트 (경로 수정)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Plus, Search, AlertTriangle, Upload, Download, Edit, Trash2, Loader2 } from "lucide-react"

// ⭐️ 2. (핵심) 훅 및 신규 컴포넌트 임포트
import { useInventory } from "./hooks/useInventory";
import { InventoryModal } from "./components/InventoryModal";
import type { Inventory as InventoryResponse } from "../../lib/types/database";

// ⭐️ 3. (핵심) 페이지네이션 상수 (훅으로 이동 가능)
const PAGE_WINDOW = 10;

// ⭐️ 4. export default function 이름 변경 (기존 MenuPage -> MenuPageFeature)
export default function InventoryPageFeature() {
  // Radix UI SSR 오류 방지
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => { setMounted(true) }, []);

  // ⭐️ 5. (핵심) 훅 호출!
  // (기존의 모든 useState, useEffect, fetch... 로직이 이 한 줄로 대체됨)
  const {
    inventoryData,
    isInventoryLoading,
    inventoryError,
    lowStockItems,
    isLowStockLoading,
    page,
    pageSize,
    setPageSize,
    goToPage,
    searchQuery,
    handleSearch,
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    editingItem,
    openAddModal,
    openEditModal,
    handleCreate,
    handleUpdate,
    handleDelete,
    isCreating,
    isUpdating,
    // isDeleting, // (필요 시 사용)
  } = useInventory();

  // ⭐️ 6. 훅에서 받아온 데이터 사용
  const items = inventoryData?.content ?? [];
  const totalPages = inventoryData?.totalPages ?? 0;
  const error = inventoryError as Error | null;

  // ⭐️ 7. 페이지네이션 계산 (기존 로직 유지)
  const start = Math.floor(page / PAGE_WINDOW) * PAGE_WINDOW
  const end = Math.min(start + PAGE_WINDOW - 1, Math.max(totalPages - 1, 0))

  return (
    <div className="space-y-6">
      {/* ( ... 헤더 ... ) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">재고 관리</h1>
          <p className="text-muted-foreground">재고 현황을 확인하고 관리하세요</p>
        </div>
        {mounted && (
          <div className="flex gap-2">
            {/* ( ... Excel 버튼들 ... ) */}
            <Button variant="outline" className="bg-transparent">
              <Upload className="mr-2 h-4 w-4" />
              Excel 가져오기
            </Button>
            <Button variant="outline" className="bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Excel 내보내기
            </Button>
            
            {/* ⭐️ 8. (핵심) 모달 여는 버튼 (로직이 훅에 있음) */}
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              재고 추가
            </Button>
          </div>
        )}
      </div>

      {/* ( ... 재고 부족 알림 ... ) */}
      {/* ⭐️ 9. (핵심) 훅의 상태(lowStockItems) 사용 */}
      {(isLowStockLoading || lowStockItems.length > 0) && (
        <Card className="border-amber-2 00 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-900 dark:text-amber-100">재고 부족 알림 (전체)</CardTitle>
            </div>
            <CardDescription className="text-amber-700 dark:text-amber-200">
              {isLowStockLoading ? "계산 중…" : `${lowStockItems.length}개 품목이 안전 재고 이하입니다`}
            </CardDescription>
          </CardHeader>
          {!isLowStockLoading && (
            <CardContent>
              <div className="space-y-2">
                {lowStockItems.map((i) => (
                  <div key={i.itemId} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-card">
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

      {/* ( ... 재고 표 ... ) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle>재고 목록</CardTitle>
              <CardDescription>페이지 {page + 1} / {Math.max(totalPages, 1)}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                {/* ⭐️ 10. (핵심) 검색 핸들러 연결 (기존 onChange -> onKeyDown Enter) */}
                <Input
                  placeholder="품목 검색..."
                  defaultValue={searchQuery} // ⭐️ 제어되지 않는 컴포넌트로 변경 (선택 사항)
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch(e.currentTarget.value);
                  }}
                  className="pl-8"
                />
              </div>
              <label className="text-sm text-muted-foreground ml-2">표시 개수</label>
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
          {/* ⭐️ 11. (핵심) 로딩/에러 처리 (훅 상태 사용) */}
          {isInventoryLoading && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
          {error && <div className="text-sm text-red-500">{error.message}</div>}
          
          {!isInventoryLoading && !error && (
            <>
              <Table>
                {/* ( ... 테이블 헤더 ... ) */}
                <TableHeader>
                  <TableRow>
                    <TableHead>품목명</TableHead>
                    <TableHead>품목 타입</TableHead>
                    <TableHead>현재 재고</TableHead>
                    <TableHead>안전 재고</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* ⭐️ 12. (핵심) 훅에서 받아온 items 맵핑 */}
                  {items.map((i) => {
                    const isLow = Number(i.stockQty) < Number(i.safetyQty)
                    return (
                      <TableRow key={i.itemId}>
                        <TableCell className="font-medium">{i.itemName}</TableCell>
                        <TableCell>{i.itemType}</TableCell>
                        <TableCell>{i.stockQty} {i.stockType}</TableCell>
                        <TableCell>{i.safetyQty} {i.stockType}</TableCell>
                        <TableCell>
                          <Badge variant={isLow ? "destructive" : "default"}>
                            {isLow ? "부족" : "정상"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* ⭐️ 13. (핵심) 훅의 핸들러 연결 */}
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(i)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(i.itemId)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {/* ( ... 페이지네이션 ... ) */}
              {/* ⭐️ 14. (핵심) 훅의 goToPage 핸들러 연결 */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  페이지 {page + 1} / {Math.max(totalPages, 1)} · {pageSize}/페이지
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" disabled={page === 0} onClick={() => goToPage(0)}>
                    « 처음
                  </Button>
                  {/* ... (기타 페이지네이션 버튼들) ... */}
                  <Button variant="outline" disabled={page <= 0} onClick={() => goToPage(page - 1)}>
                    ‹ 이전
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) => (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        onClick={() => goToPage(p)}
                      >
                        {p + 1}
                      </Button>
                    ))}
                  </div>
                  <Button variant="outline" disabled={page >= totalPages - 1} onClick={() => goToPage(page + 1)}>
                    다음 ›
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages - 1}
                    onClick={() => goToPage(Math.max(totalPages - 1, 0))}
                  >
                    마지막 »
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ⭐️ 15. (핵심) 분리된 모달 컴포넌트 렌더링 */}
      {/* (기존의 긴 Dialog JSX가 이 4줄로 대체됨) */}
      {mounted && (
        <>
          <InventoryModal
            mode="add"
            open={isAddModalOpen}
            onOpenChange={setIsAddModalOpen}
            onSubmit={handleCreate}
            isPending={isCreating}
          />
          <InventoryModal
            mode="edit"
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            onSubmit={handleUpdate}
            isPending={isUpdating}
            defaultValues={editingItem}
          />
        </>
      )}
    </div>
  )
}
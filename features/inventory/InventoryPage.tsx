// features/inventory/InventoryPage.tsx
"use client"

import React, { useMemo, useState } from "react";
// ⭐️ 1. shadcn/ui 및 아이콘 임포트 (경로 수정)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, AlertTriangle, Upload, Download, Edit, Loader2 } from "lucide-react"
import { PAGE_WINDOW } from "@/lib/constants"; // ⭐️ (경로 수정)

// ⭐️ 2. (핵심) 훅 및 신규 컴포넌트 임포트 (경로 수정)
import { useInventory } from "@/features/inventory/hooks/useInventory";
import { InventoryModal } from "@/features/inventory/components/InventoryModal";
import type { Inventory } from "@/lib/types/database"; // ⭐️ (경로 수정)

// ⭐️ 3. 백엔드 DTO가 status를 포함하므로, Inventory 타입을 확장하는 로컬 타입을 정의
type InventoryResponse = Inventory & {
  status?: "ACTIVE" | "INACTIVE"; // DTO에만 있는 필드로, optional 처리
};

export default function InventoryPageFeature() {
  // Radix UI SSR 오류 방지
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => { setMounted(true) }, []);

  // ⭐️ 4. (핵심) 훅 호출! (모든 상태와 핸들러를 가져옴)
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
    handleSearch, // ⭐️ 검색 핸들러
    showInactiveOnly,
    setShowInactiveOnly,
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    editingItem,
    openAddModal,
    openEditModal,
    handleCreate,
    handleUpdate,
    handleDeactivate,
    handleReactivate,
    isCreating,
    isUpdating,
    isDeactivating,
    isReactivating,
  } = useInventory();

  // ⭐️ 5. 훅에서 받아온 데이터 사용
  const items = (inventoryData?.content ?? []) as InventoryResponse[];
  const totalPages = inventoryData?.totalPages ?? 0;
  const error = inventoryError as Error | null;

  // ⭐️ 6. 페이지네이션 계산
  const start = Math.floor(page / PAGE_WINDOW) * PAGE_WINDOW
  const end = Math.min(start + PAGE_WINDOW - 1, Math.max(totalPages - 1, 0))

  // ⭐️ 7. 검색어 입력 상태 (API 호출은 handleSearch로)
  const [localSearch, setLocalSearch] = useState(searchQuery);
  React.useEffect(() => { setLocalSearch(searchQuery) }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">재고 관리</h1>
          <p className="text-muted-foreground">재고 현황을 확인하고 관리하세요</p>
        </div>
        {mounted && (
          <div className="flex gap-2">
            <Button variant="outline" className="bg-transparent">
              <Upload className="mr-2 h-4 w-4" />
              Excel 가져오기
            </Button>
            <Button variant="outline" className="bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Excel 내보내기
            </Button>
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              재고 추가
            </Button>
          </div>
        )}
      </div>

      {/* 재고 부족 알림 (훅의 isLowStockLoading, lowStockItems 사용) */}
      {(isLowStockLoading || lowStockItems.length > 0) && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-900 dark:text-amber-100">재고 부족 알림 (활성 재고)</CardTitle>
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

      {/* 재고 표 */}
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
                <Input
                  placeholder="품목 검색..."
                  value={localSearch} // ⭐️ 로컬 검색어 바인딩
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch(e.currentTarget.value); // ⭐️ Enter 키로 검색
                  }}
                  className="pl-8"
                />
              </div>

              {/* '비활성만 보기' 체크박스 */}
              <label className="ml-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={showInactiveOnly}
                  onChange={(e) => { 
                    setShowInactiveOnly(e.target.checked); 
                    goToPage(0); 
                  }}
                />
                비활성만 보기
              </label>

              <label className="text-sm text-muted-foreground ml-2">표시 개수</label>
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={pageSize}
                onChange={(e) => { 
                  setPageSize(Number(e.target.value)); 
                  goToPage(0); 
                }}
              >
                {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/페이지</option>)}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 로딩/에러 처리 (훅 상태 사용) */}
          {isInventoryLoading && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
          {error && <div className="text-sm text-red-500">{error.message}</div>}
          
          {!isInventoryLoading && !error && (
            <>
              <Table>
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
                  {/* 훅에서 받아온 items 맵핑 */}
                  {items.map((i) => {
                    const isLow = Number(i.stockQty) < Number(i.safetyQty)
                    const status = i.status ?? (showInactiveOnly ? "INACTIVE" : "ACTIVE"); 

                    return (
                      <TableRow 
                        key={i.itemId}
                        className={status === "INACTIVE" ? "opacity-50" : (isLow ? "bg-red-50/70 dark:bg-red-950/20" : "")}
                      >
                        <TableCell className="font-medium">{i.itemName}</TableCell>
                        <TableCell>{i.itemType}</TableCell>
                        <TableCell>
                          {i.stockQty} {i.stockType}
                          {status === "ACTIVE" && isLow && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-300">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              <span>안전재고 미만</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{i.safetyQty} {i.stockType}</TableCell>
                        <TableCell>
                          <Badge variant={status === "INACTIVE" ? "secondary" : isLow ? "destructive" : "default"}>
                            {status === "INACTIVE" ? "비활성" : isLow ? "부족" : "정상"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* 훅의 핸들러 연결 */}
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(i)} disabled={isDeactivating || isReactivating}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            {/* 조건부 버튼 (비활성화/활성화) */}
                            {status === "ACTIVE" ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-transparent" 
                                onClick={() => handleDeactivate(i.itemId)}
                                disabled={isDeactivating || isReactivating}
                              >
                                {isDeactivating ? <Loader2 className="h-4 w-4 animate-spin" /> : "비활성화"}
                              </Button>
                            ) : (
                              <Button 
                                variant="default" 
                                size="sm" 
                                onClick={() => handleReactivate(i.itemId)}
                                disabled={isDeactivating || isReactivating}
                              >
                                {isReactivating ? <Loader2 className="h-4 w-4 animate-spin" /> : "비활성 해제"}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {!items.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                        데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {/* 페이지네이션 */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  페이지 {page + 1} / {Math.max(totalPages, 1)} · {pageSize}/페이지
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" disabled={page === 0} onClick={() => goToPage(0)}>
                    « 처음
                  </Button>
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

      {/* ⭐️ 15. 분리된 모달 컴포넌트 렌더링 */}
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
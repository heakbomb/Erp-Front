// modules/menuC/MenuPage.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Plus, Search, Edit } from "lucide-react";
import { useMenu } from "./useMenu";
import MenuModal from "./MenuModal";
import RecipeModal from "./RecipeModal";

const formatKR = new Intl.NumberFormat("ko-KR");
const PAGE_WINDOW = 5;

export default function MenuPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  const {
    items, loading, error, stats,
    searchQuery, setSearchQuery, showInactiveOnly, setShowInactiveOnly,
    invOptions, page, pageSize, setPageSize, totalPages, goToPage,
    isAddModalOpen, setIsAddModalOpen, isEditModalOpen, setIsEditModalOpen,
    editingMenu, openAddModal, openEditModal, handleCreate, handleUpdate, toggleStatus,
    isRecipeModalOpen, setIsRecipeModalOpen, selectedMenuForRecipe, openRecipeModal
  } = useMenu();

  const start = Math.floor(page / PAGE_WINDOW) * PAGE_WINDOW;
  const end = Math.min(start + PAGE_WINDOW - 1, Math.max(totalPages - 1, 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">메뉴 관리</h1>
          <p className="text-muted-foreground">메뉴/가격 및 레시피를 관리하세요</p>
        </div>
        {mounted && (
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="메뉴 검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={showInactiveOnly} onChange={e => setShowInactiveOnly(e.target.checked)} className="h-4 w-4" />
              비활성만 보기
            </label>
            <Button onClick={openAddModal}><Plus className="mr-2 h-4 w-4" /> 메뉴 추가</Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">전체 메뉴</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}개</div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">평균 마진율</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.avgMargin.toFixed(1)}%</div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">비활성 메뉴</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.inactive}개</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>메뉴 목록</CardTitle>
          <CardDescription>등록된 메뉴를 관리하세요</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-sm">불러오는 중...</div> : error ? <div className="text-sm text-red-500">{error}</div> : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.length === 0 ? <div className="text-sm text-muted-foreground col-span-full">데이터가 없습니다.</div> : items.map(item => {
                  const cost = Number(item.calculatedCost ?? 0);
                  const price = Number(item.price || 0);
                  const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
                  const isInactive = item.status === "INACTIVE";
                  
                  return (
                    <Card key={item.menuId} className={isInactive ? "opacity-70" : ""}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{item.menuName}</CardTitle>
                            <Badge variant={isInactive ? "secondary" : "default"}>{item.status}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 pt-2 border-t text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">판매가</span><span className="font-medium">₩{formatKR.format(price)}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">원가</span><span className="font-medium">₩{formatKR.format(cost)}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">마진율</span><span className="font-medium text-primary">{margin.toFixed(1)}%</span></div>
                        </div>
                        {margin < 50 && <div className="p-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded">마진율 50% 미만입니다.</div>}
                        
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(item)} disabled={isInactive}><Edit className="mr-1 h-3 w-3"/> 수정</Button>
                          <Button variant={isInactive ? "default" : "outline"} size="sm" className="flex-1" onClick={() => toggleStatus(item)}>{isInactive ? "활성화" : "비활성화"}</Button>
                        </div>
                        {mounted && !isInactive && <div className="pt-2"><Button variant="secondary" size="sm" className="w-full" onClick={() => openRecipeModal(item)}>레시피 관리</Button></div>}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">페이지 {page + 1} / {Math.max(totalPages, 1)}</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" disabled={page === 0} onClick={() => goToPage(0)}>«</Button>
                  <Button variant="outline" disabled={page <= 0} onClick={() => goToPage(page - 1)}>‹</Button>
                  {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(p => (
                    <Button key={p} variant={p === page ? "default" : "outline"} onClick={() => goToPage(p)}>{p + 1}</Button>
                  ))}
                  <Button variant="outline" disabled={page >= totalPages - 1} onClick={() => goToPage(page + 1)}>›</Button>
                  <Button variant="outline" disabled={page >= totalPages - 1} onClick={() => goToPage(totalPages - 1)}>»</Button>
                  <select className="ml-2 h-9 rounded-md border px-2 text-sm bg-background" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); goToPage(0); }}>
                    {[6, 12, 24, 48].map(n => <option key={n} value={n}>{n}/페이지</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {mounted && (
        <>
          <MenuModal mode="add" open={isAddModalOpen} onOpenChange={setIsAddModalOpen} onSubmit={handleCreate} />
          <MenuModal mode="edit" open={isEditModalOpen} onOpenChange={setIsEditModalOpen} onSubmit={handleUpdate} defaultValues={editingMenu ? { menuName: editingMenu.menuName, price: editingMenu.price } : undefined} />
          <RecipeModal open={isRecipeModalOpen} onOpenChange={setIsRecipeModalOpen} menu={selectedMenuForRecipe} invOptions={invOptions} />
        </>
      )}
    </div>
  );
}
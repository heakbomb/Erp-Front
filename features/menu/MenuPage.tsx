// features/menu/MenuPage.tsx
"use client";

// ⭐️ 1. React/Next.js/shadcn 컴포넌트 임포트 경로 변경
// (기존 "@/components/ui/..." -> "../../../components/ui/...")
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";

// ⭐️ 2. 기능별(feature) 내부 파일 임포트 경로 변경
// (기존 "./hooks/useMenu" -> "./useMenu")
// (기존 "./components/..." -> "./components/...")
import { useMenu } from "./hooks/useMenu"; 
import { MenuModal } from "./components/MenuModal"; 
import { RecipeModal } from "./components/RecipeModal"; 

// 숫자 포맷
const formatKR = new Intl.NumberFormat("ko-KR");

// ⭐️ 3. export default function 이름 변경 (기존 MenuPage -> MenuPageFeature)
export default function MenuPageFeature() {
  // Radix UI의 SSR ID 불일치 오류를 피하기 위해 mounted 상태 사용
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => { setMounted(true) }, []);

  // 4. 훅 로직은 변경 없이 그대로 사용
  const {
    menuData,
    isMenusLoading,
    menusError,
    menuStats,
    // page, setPage, // (페이지네이션 UI가 없으므로 일단 미사용)
    searchQuery,
    handleSearch,
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    editingMenu,
    handleCreate,
    handleUpdate,
    openAddModal,
    openEditModal,
    isCreating,
    isUpdating,
    handleDelete,
    isRecipeModalOpen,
    setIsRecipeModalOpen,
    selectedMenuForRecipe,
    openRecipeModal,
  } = useMenu();

  const items = menuData?.content ?? [];
  const error = menusError as Error | null;

  return (
    <div className="space-y-6">
      {/* --- 헤더 --- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">메뉴 관리</h1>
          <p className="text-muted-foreground">메뉴/가격 및 레시피를 관리하세요</p>
        </div>
        {mounted && (
          <div className="flex gap-2">
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              메뉴 추가
            </Button>
          </div>
        )}
      </div>

      {/* --- 통계 --- */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">전체 메뉴</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{menuStats.total}개</div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">평균 마진율</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{menuStats.avgMargin.toFixed(1)}%</div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">품절 메뉴</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">0개</div></CardContent></Card>
      </div>

      {/* --- 목록 --- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>메뉴 목록</CardTitle><CardDescription>등록된 메뉴를 관리하세요</CardDescription></div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="메뉴 검색..."
                defaultValue={searchQuery}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch(e.currentTarget.value);
                }}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isMenusLoading && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
          {error && <div className="text-sm text-red-500">{error.message}</div>}
          {!isMenusLoading && !error && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const margin = Number(item.price || 0) > 0
                  ? ((Number(item.price) - Number(item.calculatedCost || 0)) / Number(item.price)) * 100 : 0;
                return (
                  <Card key={item.menuId}>
                    <CardHeader>
                      <CardTitle className="text-lg">{item.menuName}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">판매가</span>
                          <span className="font-medium">₩{formatKR.format(Number(item.price))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">원가</span>
                          <span className="font-medium">₩{formatKR.format(Number(item.calculatedCost || 0))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">마진율</span>
                          <span className="font-medium text-primary">{margin.toFixed(1)}%</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => openEditModal(item)}>
                          <Edit className="mr-1 h-3 w-3" />수정
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => handleDelete(item.menuId)}>
                          <Trash2 className="mr-1 h-3 w-3" />삭제
                        </Button>
                      </div>

                      {mounted && (
                        <div className="pt-2">
                          <Button variant="secondary" size="sm" className="w-full" onClick={() => openRecipeModal(item)}>
                            레시피 관리
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- 모달 렌더링 --- */}
      {mounted && (
        <>
          <MenuModal
            mode="add"
            open={isAddModalOpen}
            onOpenChange={setIsAddModalOpen}
            onSubmit={handleCreate}
            isPending={isCreating}
          />
          <MenuModal
            mode="edit"
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            onSubmit={handleUpdate}
            isPending={isUpdating}
            defaultValues={editingMenu}
          />
          <RecipeModal
            menu={selectedMenuForRecipe}
            open={isRecipeModalOpen}
            onOpenChange={setIsRecipeModalOpen}
          />
        </>
      )}
    </div>
  );
}
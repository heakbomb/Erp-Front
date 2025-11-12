// features/menu/MenuPage.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit } from "lucide-react";
import { useMenu } from "./hooks/useMenu";
import { MenuModal } from "./components/MenuModal";
import { RecipeModal } from "./components/RecipeModal";

const formatKR = new Intl.NumberFormat("ko-KR");

export default function MenuPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    items,
    loading,
    error,
    calculatedCostMap,
    stats,

    searchQuery,
    setSearchQuery,
    showInactiveOnly,
    setShowInactiveOnly,
    costingMethod,
    setCostingMethod,

    invOptions,
    recipeMap,
    onRecipeUpdated,

    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    editingMenu,
    openAddModal,
    openEditModal,
    handleCreate,
    handleUpdate,
    toggleStatus,

    isRecipeModalOpen,
    setIsRecipeModalOpen,
    selectedMenuForRecipe,
    openRecipeModal,
  } = useMenu();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            메뉴 관리
          </h1>
          <p className="text-muted-foreground">
            메뉴/가격 및 레시피를 관리하세요
          </p>
        </div>

        {/* 우측 컨트롤 */}
        {mounted && (
          <div className="flex items-center gap-3">
            {/* 검색 */}
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="메뉴 검색..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                className="pl-8"
              />
            </div>

            {/* 비활성만 보기 */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={showInactiveOnly}
                onChange={(e) =>
                  setShowInactiveOnly(e.target.checked)
                }
              />
              비활성만 보기
            </label>

            {/* 원가 계산 방식 토글 */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                원가방식
              </span>
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={costingMethod}
                onChange={(e) =>
                  setCostingMethod(
                    e.target.value as any
                  )
                }
                title="평균가(가중평균) 또는 최신매입가 기준 원가"
              >
                <option value="AVERAGE">
                  평균가
                </option>
                <option value="LAST">최신가</option>
              </select>
            </div>

            {/* 메뉴 추가 버튼 */}
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              메뉴 추가
            </Button>
          </div>
        )}
      </div>

      {/* 간단 통계 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              전체 메뉴
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total}개
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              평균 마진율
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              비활성 메뉴
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.inactive}개
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 메뉴 카드 리스트 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>메뉴 목록</CardTitle>
              <CardDescription>
                등록된 메뉴를 관리하세요
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-sm text-muted-foreground">
              불러오는 중…
            </div>
          )}
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
          {!loading && !error && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const cost =
                  calculatedCostMap[item.menuId] ??
                  0;
                const price = Number(
                  item.price || 0
                );
                const margin =
                  price > 0
                    ? ((price - cost) / price) *
                      100
                    : 0;
                const isInactive =
                  item.status === "INACTIVE";

                return (
                  <Card
                    key={item.menuId}
                    className={
                      isInactive ? "opacity-70" : ""
                    }
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            {item.menuName}
                          </CardTitle>
                          <Badge
                            variant={
                              isInactive
                                ? "secondary"
                                : "default"
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            판매가
                          </span>
                          <span className="font-medium">
                            ₩
                            {formatKR.format(price)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            원가(
                            {costingMethod ===
                            "AVERAGE"
                              ? "평균"
                              : "최신"}
                            )
                          </span>
                          <span className="font-medium">
                            ₩
                            {formatKR.format(cost)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            마진율
                          </span>
                          <span className="font-medium text-primary">
                            {margin.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() =>
                            openEditModal(item)
                          }
                          disabled={isInactive}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          수정
                        </Button>
                        <Button
                          variant={
                            isInactive
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            toggleStatus(item)
                          }
                        >
                          {isInactive
                            ? "활성화"
                            : "비활성화"}
                        </Button>
                      </div>

                      {mounted && !isInactive && (
                        <div className="pt-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full"
                            onClick={() =>
                              openRecipeModal(item)
                            }
                          >
                            레시피 관리
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              {!items.length && (
                <div className="text-sm text-muted-foreground">
                  표시할 데이터가 없습니다.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 모달들 */}
      {mounted && (
        <>
          <MenuModal
            mode="add"
            open={isAddModalOpen}
            onOpenChange={setIsAddModalOpen}
            onSubmit={handleCreate}
          />
          <MenuModal
            mode="edit"
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            onSubmit={handleUpdate}
            defaultValues={
              editingMenu
                ? {
                    menuName: editingMenu.menuName,
                    price: Number(
                      editingMenu.price
                    ),
                  }
                : undefined
            }
          />
          <RecipeModal
            open={isRecipeModalOpen}
            onOpenChange={setIsRecipeModalOpen}
            menu={selectedMenuForRecipe}
            invOptions={invOptions}
            onRecipeUpdated={onRecipeUpdated}
          />
        </>
      )}
    </div>
  );
}

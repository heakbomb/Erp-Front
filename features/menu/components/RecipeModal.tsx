// features/menu/components/RecipeModal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from "lucide-react";
import type {
  InventoryResponse,
  MenuItemResponse,
  RecipeIngredientResponse,
} from "../menuService";
import {
  addRecipeIngredient,
  updateRecipeIngredient,
  deleteRecipeIngredient,
  fetchRecipeIngredients,
} from "../menuService";

// ✅ 추가: 메뉴 리스트 재요청을 위해
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../../contexts/StoreContext";

type RecipeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menu: MenuItemResponse | null;
  invOptions: InventoryResponse[];
};

export function RecipeModal({
  open,
  onOpenChange,
  menu,
  invOptions,
}: RecipeModalProps) {
  const queryClient = useQueryClient();
  const { currentStoreId } = useStore();

  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [recipeList, setRecipeList] = useState<RecipeIngredientResponse[]>([]);

  const [selectedItemId, setSelectedItemId] = useState<number | "">("");
  const [consumptionQty, setConsumptionQty] = useState<number | "">("");

  // 공통: 메뉴 목록 다시 불러오도록 invalidation
  const invalidateMenus = () => {
    if (!currentStoreId) return;
    queryClient.invalidateQueries({
      queryKey: ["menus", currentStoreId],
    });
  };

  // 레시피 로드
  const loadRecipeList = async (menuId: number) => {
    setRecipeLoading(true);
    setRecipeError(null);
    try {
      const list = await fetchRecipeIngredients(menuId);
      setRecipeList(list);
      // ❌ 더 이상 onRecipeUpdated로 프론트에서 원가 계산 안 함
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "레시피를 불러오는 중 오류가 발생했습니다.";
      setRecipeError(msg);
    } finally {
      setRecipeLoading(false);
    }
  };

  useEffect(() => {
    if (open && menu) {
      loadRecipeList(menu.menuId);
      setSelectedItemId("");
      setConsumptionQty("");
    }
  }, [open, menu]);

  // 이미 포함된 재료 제외한 인벤토리 옵션
  const existingItemIds = useMemo(
    () => new Set(recipeList.map((r) => r.itemId)),
    [recipeList]
  );

  const availableInvOptions = useMemo(
    () =>
      invOptions.filter(
        (opt) =>
          opt.status !== "INACTIVE" &&
          !existingItemIds.has(opt.itemId)
      ),
    [invOptions, existingItemIds]
  );

  // 비활성 재고 포함 여부
  const hasInactiveInRecipe = useMemo(() => {
    const inactiveSet = new Set(
      invOptions
        .filter((o) => o.status === "INACTIVE")
        .map((o) => o.itemId)
    );
    return recipeList.some((ri) => inactiveSet.has(ri.itemId));
  }, [invOptions, recipeList]);

  // 재료 추가
  const [isAdding, setIsAdding] = useState(false);

  const handleAddRecipe = async () => {
    if (!menu) return;
    if (
      selectedItemId === "" ||
      consumptionQty === "" ||
      Number(consumptionQty) <= 0
    ) {
      alert("재료와 수량을 올바르게 입력하세요.");
      return;
    }
    try {
      setIsAdding(true);
      await addRecipeIngredient(menu.menuId, {
        menuId: menu.menuId,
        itemId: Number(selectedItemId),
        consumptionQty: Number(consumptionQty),
      });
      setSelectedItemId("");
      setConsumptionQty("");
      await loadRecipeList(menu.menuId); // 모달 안 리스트 갱신
      invalidateMenus();                 // ✅ 메뉴 목록/원가 갱신
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "레시피 추가 중 오류가 발생했습니다.";
      alert(msg);
    } finally {
      setIsAdding(false);
    }
  };

  // 수량 수정
  const handleUpdateRecipe = async (recipeId: number, newQty: number) => {
    if (!menu) return;
    if (newQty <= 0) return;
    try {
      await updateRecipeIngredient(recipeId, {
        consumptionQty: Number(newQty),
      });
      await loadRecipeList(menu.menuId); // 모달 안 리스트 갱신
      invalidateMenus();                 // ✅ 메뉴 목록/원가 갱신
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "레시피 수정 중 오류가 발생했습니다.";
      alert(msg);
    }
  };

  // 삭제
  const handleDeleteRecipe = async (recipeId: number) => {
    if (!menu) return;
    if (!window.confirm("이 재료를 레시피에서 제거할까요?")) return;
    try {
      await deleteRecipeIngredient(recipeId);
      await loadRecipeList(menu.menuId); // 모달 안 리스트 갱신
      invalidateMenus();                 // ✅ 메뉴 목록/원가 갱신
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "삭제 중 오류가 발생했습니다.";
      alert(msg);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setRecipeList([]);
      setRecipeError(null);
      setSelectedItemId("");
      setConsumptionQty("");
    }
    onOpenChange(open);
  };

  if (!menu) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>레시피 관리</DialogTitle>
          <DialogDescription>
            {`${menu.menuName} (ID: ${menu.menuId})`}
          </DialogDescription>
        </DialogHeader>

        {/* 비활성 재고 경고 */}
        {hasInactiveInRecipe && (
          <div className="rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20 p-3 text-sm">
            비활성 재고가 포함되어 있습니다. 대체 재고로 교체해 주세요.
          </div>
        )}

        <div className="space-y-3">
          {recipeLoading && (
            <div className="text-sm text-muted-foreground">
              불러오는 중…
            </div>
          )}
          {recipeError && (
            <div className="text-sm text-red-500">
              {recipeError}
            </div>
          )}

          {!recipeLoading && !recipeError && (
            <>
              {recipeList.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  등록된 재료가 없습니다. 아래에서 추가하세요.
                </div>
              ) : (
                <div className="space-y-2">
                  {recipeList.map((ri) => {
                    const inv = invOptions.find((o) => o.itemId === ri.itemId);
                    const invName = inv?.itemName ?? `#${ri.itemId}`;
                    const unit = inv?.stockType ?? "";
                    const invInactive = inv?.status === "INACTIVE";

                    return (
                      <div
                        key={ri.recipeId}
                        className="flex items-center justify-between rounded-md border p-3 bg-card"
                      >
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {invName}
                            {invInactive && (
                              <Badge variant="secondary">비활성</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            소모 수량: {ri.consumptionQty}
                            {unit ? ` ${unit}` : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-24"
                            defaultValue={ri.consumptionQty}
                            onBlur={(e) => {
                              const v = Number(e.currentTarget.value);
                              if (!isNaN(v) && v > 0 && v !== ri.consumptionQty) {
                                handleUpdateRecipe(ri.recipeId, v);
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRecipe(ri.recipeId)}
                          >
                            제거
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* 재료 추가 폼 */}
        <div className="space-y-3 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>재료 선택</Label>
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm w-full"
                value={selectedItemId}
                onChange={(e) =>
                  setSelectedItemId(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              >
                <option value="">-- 재료 선택 --</option>
                {availableInvOptions.map((opt) => (
                  <option key={opt.itemId} value={opt.itemId}>
                    {opt.itemName} ({opt.stockType})
                    {" • 재고 "}
                    {opt.stockQty}
                    {opt.stockType}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>소모 수량</Label>
              <Input
                type="number"
                placeholder="예) 0.035"
                value={consumptionQty}
                onChange={(e) =>
                  setConsumptionQty(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAddRecipe} disabled={isAdding}>
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              재료 추가
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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

// DB 스펙: DECIMAL(10,3) → 정수부 7자리, 소수부 3자리
const QTY_MAX_INTEGER_DIGITS = 7;
const QTY_MAX_FRACTION_DIGITS = 3;

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
  // 🔧 수량은 문자열로 관리 (소수점 포함 입력 처리)
  const [consumptionQty, setConsumptionQty] = useState<string>("");
  const [consumptionQtyError, setConsumptionQtyError] = useState<string | null>(
    null
  );

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
      setConsumptionQtyError(null);
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
          opt.status !== "INACTIVE" && !existingItemIds.has(opt.itemId)
      ),
    [invOptions, existingItemIds]
  );

  // 비활성 재고 포함 여부
  const hasInactiveInRecipe = useMemo(() => {
    const inactiveSet = new Set(
      invOptions.filter((o) => o.status === "INACTIVE").map((o) => o.itemId)
    );
    return recipeList.some((ri) => inactiveSet.has(ri.itemId));
  }, [invOptions, recipeList]);

  // 재료 추가
  const [isAdding, setIsAdding] = useState(false);

  // 🔧 수량 입력 핸들러: 숫자 + 소수점, 자리수 제한, 에러 메시지
  const handleConsumptionQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 빈 값 허용
    if (value === "") {
      setConsumptionQty("");
      setConsumptionQtyError(null);
      return;
    }

    // 숫자 + 소수점 1개만 허용
    // 허용 예: "123", "123.", "123.4", "123.456", ".5", "0.5"
    const decimalPattern = /^(?:\d+|\d+\.\d*|\.\d+)$/;
    if (!decimalPattern.test(value)) {
      // ❌ 문자, 여러개 점 등 → 입력 무시
      return;
    }

    const [integerPart = "", fractionPart = ""] = value.split(".");

    if (integerPart.length > QTY_MAX_INTEGER_DIGITS) {
      setConsumptionQtyError(
        `정수부는 최대 ${QTY_MAX_INTEGER_DIGITS}자리까지 입력할 수 있습니다.`
      );
      return;
    }

    if (fractionPart.length > QTY_MAX_FRACTION_DIGITS) {
      setConsumptionQtyError(
        `소수부는 최대 ${QTY_MAX_FRACTION_DIGITS}자리까지 입력할 수 있습니다.`
      );
      return;
    }

    setConsumptionQtyError(null);
    setConsumptionQty(value);
  };

  const handleAddRecipe = async () => {
    if (!menu) return;

    if (selectedItemId === "") {
      alert("재료를 선택해주세요.");
      return;
    }

    if (!consumptionQty || Number(consumptionQty) <= 0) {
      alert("소모 수량을 0보다 큰 값으로 입력해주세요.");
      return;
    }

    // 자리수 검증 (서브미션 시 한 번 더)
    const numericQty = Number(consumptionQty);
    if (Number.isNaN(numericQty)) {
      alert("소모 수량은 숫자만 입력할 수 있습니다.");
      return;
    }

    const [integerPart = "", fractionPart = ""] = consumptionQty
      .toString()
      .split(".");
    if (integerPart.length > QTY_MAX_INTEGER_DIGITS) {
      alert(
        `소모 수량은 정수부 최대 ${QTY_MAX_INTEGER_DIGITS}자리까지 입력할 수 있습니다.`
      );
      return;
    }
    if (fractionPart.length > QTY_MAX_FRACTION_DIGITS) {
      alert(
        `소모 수량은 소수부 최대 ${QTY_MAX_FRACTION_DIGITS}자리까지 입력할 수 있습니다.`
      );
      return;
    }

    try {
      setIsAdding(true);
      await addRecipeIngredient(menu.menuId, {
        menuId: menu.menuId,
        itemId: Number(selectedItemId),
        consumptionQty: numericQty,
      });
      setSelectedItemId("");
      setConsumptionQty("");
      setConsumptionQtyError(null);
      await loadRecipeList(menu.menuId); // 모달 안 리스트 갱신
      invalidateMenus(); // ✅ 메뉴 목록/원가 갱신
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

  // 수량 수정 (기존 인풋은 그냥 숫자만, 자리수 초과는 서버/DB에서 한 번 더 검증)
  const handleUpdateRecipe = async (recipeId: number, newQty: number) => {
    if (!menu) return;
    if (newQty <= 0) return;
    try {
      await updateRecipeIngredient(recipeId, {
        consumptionQty: Number(newQty),
      });
      await loadRecipeList(menu.menuId);
      invalidateMenus();
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
      await loadRecipeList(menu.menuId);
      invalidateMenus();
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

  const handleClose = (openFlag: boolean) => {
    if (!openFlag) {
      setRecipeList([]);
      setRecipeError(null);
      setSelectedItemId("");
      setConsumptionQty("");
      setConsumptionQtyError(null);
    }
    onOpenChange(openFlag);
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

      {/* 🔽 여기부터 스크롤 되는 영역으로 감싸기 */}
      <div className="mt-4 space-y-4 max-h-[420px] overflow-y-auto pr-1">
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
            <div className="text-sm text-red-500">{recipeError}</div>
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
                    const inv = invOptions.find(
                      (o) => o.itemId === ri.itemId
                    );
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
                              if (
                                !isNaN(v) &&
                                v > 0 &&
                                v !== ri.consumptionQty
                              ) {
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
                type="text"
                inputMode="decimal"
                placeholder="예) 0.035"
                value={consumptionQty}
                onChange={handleConsumptionQtyChange}
              />
              {consumptionQtyError && (
                <p className="mt-1 text-xs text-red-500">
                  {consumptionQtyError}
                </p>
              )}
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
      </div>
      {/* 🔼 스크롤 영역 끝 */}

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          닫기
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
}

// features/menu/components/RecipeModal.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// paths updated from:
// "@/contexts/StoreContext" -> "../../../../contexts/StoreContext"
// "@/components/ui/..." -> "../../../../components/ui/..."
// "@/lib/types/database" -> "../../../../lib/types/database"
// "@/lib/api/menu.service" -> "../../menuService"

import { useStore } from "../../../contexts/StoreContext";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";
import type { MenuItem, Inventory, RecipeIngredient } from "../../../lib/types/database";
import {
  getRecipeIngredients,
  getInventoryOptionsForMenu,
  addRecipeIngredient,
  updateRecipeIngredient,
  deleteRecipeIngredient,
} from "../menuService"; 

// ... (내부 로직은 변경 없음)
interface RecipeModalProps {
  menu: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecipeModal({ menu, open, onOpenChange }: RecipeModalProps) {
  const { currentStoreId } = useStore();
  const queryClient = useQueryClient();

  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [consumptionQty, setConsumptionQty] = useState<number | "">("");

  const {
    data: recipeList = [],
    isLoading: isRecipeLoading,
    error: recipeError,
  } = useQuery({
    queryKey: ["recipeIngredients", menu?.menuId],
    queryFn: () => getRecipeIngredients(menu!.menuId),
    enabled: !!menu && open,
  });

  const { 
    data: inventoryOptionsData, 
    isLoading: isInvLoading 
  } = useQuery({
    queryKey: ["inventoryOptions", currentStoreId],
    queryFn: () => getInventoryOptionsForMenu(currentStoreId!),
    enabled: !!currentStoreId && open,
  });
  const invOptions = inventoryOptionsData?.content ?? [];

  const onMutationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["recipeIngredients", menu?.menuId] });
    queryClient.invalidateQueries({ queryKey: ["menus"] });
  };
  const onMutationError = (error: Error) => alert(error.message);

  const addMutation = useMutation({
    mutationFn: (body: { menuId: number; itemId: number; consumptionQty: number }) =>
      addRecipeIngredient(body.menuId, body),
    onSuccess: () => {
      onMutationSuccess();
      setSelectedItemId("");
      setConsumptionQty("");
    },
    onError: onMutationError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ recipeId, qty }: { recipeId: number; qty: number }) =>
      updateRecipeIngredient(recipeId, { consumptionQty: qty }),
    onSuccess: onMutationSuccess,
    onError: onMutationError,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecipeIngredient,
    onSuccess: onMutationSuccess,
    onError: onMutationError,
  });

  const handleAddRecipe = () => {
    if (!menu) return;
    const qty = Number(consumptionQty);
    const itemId = Number(selectedItemId);
    if (!itemId || isNaN(itemId) || qty <= 0 || isNaN(qty)) {
      alert("재료와 수량을 올바르게 입력하세요.");
      return;
    }
    addMutation.mutate({ menuId: menu.menuId, itemId, consumptionQty: qty });
  };

  const handleUpdateQty = (recipeId: number, newQty: number) => {
    if (newQty > 0) {
      updateMutation.mutate({ recipeId, qty: newQty });
    }
  };

  const handleDeleteRecipe = (recipeId: number) => {
    if (confirm("이 재료를 레시피에서 제거할까요?")) {
      deleteMutation.mutate(recipeId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>레시피 관리</DialogTitle>
          <DialogDescription>
            {menu ? `${menu.menuName} (ID: ${menu.menuId})` : "메뉴를 선택하세요"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-60 overflow-y-auto p-1">
          {isRecipeLoading && <div className="text-sm text-muted-foreground">레시피 불러오는 중…</div>}
          {recipeError && <div className="text-sm text-red-500">{(recipeError as Error).message}</div>}
          {!isRecipeLoading && !recipeError && (
            recipeList.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 text-center">등록된 재료가 없습니다.</div>
            ) : (
              recipeList.map((ri: RecipeIngredient) => { 
                const inv = invOptions.find((o: Inventory) => o.itemId === ri.itemId); 
                const invName = inv?.itemName ?? `#${ri.itemId}`;
                const unit = inv?.stockType ?? "";
                return (
                  <div key={ri.recipeId} className="flex items-center justify-between rounded-md border p-3 bg-card">
                    <div>
                      <div className="font-medium">{invName}</div>
                      <div className="text-sm text-muted-foreground">소모 수량: {ri.consumptionQty}{unit ? ` ${unit}` : ""}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="w-24"
                        defaultValue={ri.consumptionQty}
                        onBlur={(e) => {
                          const v = Number(e.currentTarget.value);
                          if (!isNaN(v) && v > 0 && v !== ri.consumptionQty) handleUpdateQty(ri.recipeId, v);
                        }}
                      />
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteRecipe(ri.recipeId)} disabled={deleteMutation.isPending}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>

        <div className="space-y-3 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>재료 선택</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId} disabled={isInvLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={isInvLoading ? "재고 로딩중..." : "-- 재료 선택 --"} />
                </SelectTrigger>
                <SelectContent>
                  {invOptions.map((opt: Inventory) => ( 
                    <SelectItem key={opt.itemId} value={String(opt.itemId)}>
                      {opt.itemName} ({opt.stockType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>소모 수량</Label>
              <Input
                type="number"
                placeholder="예) 0.035"
                value={consumptionQty}
                onChange={(e) => setConsumptionQty(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddRecipe} disabled={addMutation.isPending}>
              {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              재료 추가
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
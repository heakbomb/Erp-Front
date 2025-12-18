// modules/menuC/RecipeModal.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { Plus, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/contexts/StoreContext";
import { menuApi } from "./menuApi";
import type { InventoryItem, MenuItem, RecipeIngredient } from "./menuTypes";

type RecipeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menu: MenuItem | null;
  invOptions: InventoryItem[];
};

const QTY_MAX_INTEGER_DIGITS = 7;
const QTY_MAX_FRACTION_DIGITS = 3;

export default function RecipeModal({ open, onOpenChange, menu, invOptions }: RecipeModalProps) {
  const queryClient = useQueryClient();
  const { currentStoreId } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<RecipeIngredient[]>([]);

  const [selectedItemId, setSelectedItemId] = useState<number | "">("");
  const [qty, setQty] = useState("");
  const [qtyError, setQtyError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const loadList = async (menuId: number) => {
    setLoading(true); setError(null);
    try {
      const res = await menuApi.fetchRecipeIngredients(menuId);
      setList(res);
    } catch (e: any) { setError("레시피 로드 실패"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (open && menu) {
      loadList(menu.menuId);
      setSelectedItemId(""); setQty(""); setQtyError(null);
    }
  }, [open, menu]);

  const existingIds = useMemo(() => new Set(list.map(r => r.itemId)), [list]);
  const availableOptions = useMemo(() => invOptions.filter(o => o.status !== "INACTIVE" && !existingIds.has(o.itemId)), [invOptions, existingIds]);
  const hasInactive = useMemo(() => {
    const inactiveIds = new Set(invOptions.filter(o => o.status === "INACTIVE").map(o => o.itemId));
    return list.some(r => inactiveIds.has(r.itemId));
  }, [invOptions, list]);

  const handleQtyChange = (e: any) => {
    const val = e.target.value;
    if (val === "") { setQty(""); setQtyError(null); return; }
    if (!/^(?:\d+|\d+\.\d*|\.\d+)$/.test(val)) return;

    const [intP = "", fracP = ""] = val.split(".");
    if (intP.length > QTY_MAX_INTEGER_DIGITS) { setQtyError("정수부 자리수 초과"); return; }
    if (fracP.length > QTY_MAX_FRACTION_DIGITS) { setQtyError("소수부 자리수 초과"); return; }

    setQtyError(null); setQty(val);
  };

  const handleAdd = async () => {
    if (!menu || selectedItemId === "" || !qty || Number(qty) <= 0) return alert("입력값을 확인하세요.");
    
    try {
      setIsAdding(true);
      await menuApi.addRecipeIngredient(menu.menuId, {
        menuId: menu.menuId,
        itemId: Number(selectedItemId),
        consumptionQty: Number(qty)
      });
      setSelectedItemId(""); setQty("");
      await loadList(menu.menuId);
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    } catch (e: any) { alert(e.response?.data?.message || "추가 실패"); }
    finally { setIsAdding(false); }
  };

  const handleUpdate = async (recipeId: number, val: number) => {
    if (!menu || val <= 0) return;
    try {
      await menuApi.updateRecipeIngredient(recipeId, { consumptionQty: val });
      await loadList(menu.menuId);
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    } catch (e: any) { alert("수정 실패"); }
  };

  const handleDelete = async (recipeId: number) => {
    if (!menu || !confirm("제거하시겠습니까?")) return;
    try {
      await menuApi.deleteRecipeIngredient(recipeId);
      await loadList(menu.menuId);
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    } catch (e: any) { alert("삭제 실패"); }
  };

  if (!menu) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>레시피 관리 - {menu.menuName}</DialogTitle>
          <DialogDescription>메뉴 소모 재료를 등록하세요.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 mt-4">
          {hasInactive && <div className="p-3 border border-yellow-300 bg-yellow-50 text-sm">비활성 재고가 포함되어 있습니다.</div>}
          
          {loading ? <div className="text-sm">로딩 중...</div> : error ? <div className="text-red-500">{error}</div> : (
            <div className="space-y-2">
              {list.length === 0 ? <div className="text-muted-foreground text-sm">등록된 재료가 없습니다.</div> : list.map(ri => {
                const inv = invOptions.find(o => o.itemId === ri.itemId);
                return (
                  <div key={ri.recipeId} className="flex justify-between items-center p-3 border rounded-md bg-card">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {inv?.itemName ?? `#${ri.itemId}`}
                        {inv?.status === "INACTIVE" && <Badge variant="secondary">비활성</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground">현재 소모: {ri.consumptionQty} {inv?.stockType}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="number" className="w-24" defaultValue={ri.consumptionQty} onBlur={e => {
                         const v = Number(e.target.value);
                         if(!isNaN(v) && v > 0 && v !== ri.consumptionQty) handleUpdate(ri.recipeId, v);
                      }} />
                      <Button variant="outline" size="sm" onClick={() => handleDelete(ri.recipeId)}>제거</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-4 border-t grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>재료 선택</Label>
               <select className="h-9 w-full rounded-md border px-2 text-sm bg-background" value={selectedItemId} onChange={e => setSelectedItemId(e.target.value ? Number(e.target.value) : "")}>
                 <option value="">-- 선택 --</option>
                 {availableOptions.map(o => <option key={o.itemId} value={o.itemId}>{o.itemName} ({o.stockType}) - 재고 {o.stockQty}</option>)}
               </select>
             </div>
             <div className="space-y-2">
               <Label>소모 수량</Label>
               <Input value={qty} onChange={handleQtyChange} placeholder="0.05" />
               {qtyError && <p className="text-xs text-red-500">{qtyError}</p>}
             </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAdd} disabled={isAdding}>{isAdding ? <Loader2 className="animate-spin h-4 w-4"/> : <Plus className="h-4 w-4 mr-1"/>} 추가</Button>
          </div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>닫기</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
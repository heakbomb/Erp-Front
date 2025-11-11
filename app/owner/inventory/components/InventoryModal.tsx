// features/inventory/components/InventoryModal.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../../../components/ui/dialog"; // ⭐️ 경로 수정
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "../../../components/ui/form"; // ⭐️ 경로 수정
import { Button } from "../../../components/ui/button"; // ⭐️ 경로 수정
import { Input } from "../../../components/ui/input"; // ⭐️ 경로 수정
import { Label } from "../../../components/ui/label"; // ⭐️ 경로 수정
import type { InventoryFormValues } from "../hooks/useInventory"; // ⭐️ 훅에서 타입 임포트
import type { Inventory } from "../../../lib/types/database"; // ⭐️ 경로 수정

// ⭐️ 1. Zod 스키마 정의 (기존 수동 유효성 검사 대체)
const inventorySchema = z.object({
  itemName: z.string().min(1, "품목명은 필수입니다."),
  itemType: z.string().min(1, "품목 타입은 필수입니다."),
  stockType: z.string().min(1, "수량 타입은 필수입니다."),
  stockQty: z.preprocess(
    (val) => (val === "" ? "" : Number(val)),
    z.number({ invalid_type_error: "숫자를 입력하세요." }).min(0, "0 이상이어야 합니다.")
  ),
  safetyQty: z.preprocess(
    (val) => (val === "" ? "" : Number(val)),
    z.number({ invalid_type_error: "숫자를 입력하세요." }).min(0, "0 이상이어야 합니다.")
  ),
});

// ⭐️ 2. Props 정의 (MenuModal과 유사)
interface InventoryModalProps {
  mode: "add" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: InventoryFormValues) => void;
  isPending: boolean;
  defaultValues?: Inventory | null;
}

export function InventoryModal({
  mode,
  open,
  onOpenChange,
  onSubmit,
  isPending,
  defaultValues,
}: InventoryModalProps) {
  
  // ⭐️ 3. react-hook-form 설정 (기존 fItemName 등 useState 대체)
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      itemName: "",
      itemType: "",
      stockType: "",
      stockQty: "",
      safetyQty: "",
    },
  });

  // ⭐️ 4. 모달이 열리거나 defaultValues가 바뀔 때 폼 리셋
  useEffect(() => {
    if (open) {
      if (mode === "edit" && defaultValues) {
        form.reset({
          itemName: defaultValues.itemName,
          itemType: defaultValues.itemType,
          stockType: defaultValues.stockType,
          stockQty: Number(defaultValues.stockQty),
          safetyQty: Number(defaultValues.safetyQty),
        });
      } else if (mode === "add") {
        form.reset({
          itemName: "",
          itemType: "",
          stockType: "",
          stockQty: "",
          safetyQty: "",
        });
      }
    }
  }, [open, mode, defaultValues, form]);

  const title = mode === "add" ? "재고 추가" : "재고 수정";

  // ⭐️ 5. Form 컴포넌트 렌더링
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>필수 항목을 입력하세요</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* FormField: itemName */}
            <FormField
              control={form.control}
              name="itemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>품목명</FormLabel>
                  <FormControl>
                    <Input placeholder="예) Arabica Beans" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* FormField: itemType, stockType */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="itemType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>품목 타입</FormLabel>
                    <FormControl><Input placeholder="예) RAW" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stockType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>수량 타입</FormLabel>
                    <FormControl><Input placeholder="예) kg / L / ea" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* FormField: stockQty, safetyQty */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stockQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>현재 재고</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="safetyQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>안전 재고</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isPending}>
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "저장 중..." : (mode === "add" ? "추가" : "저장")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
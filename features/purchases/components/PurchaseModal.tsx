// features/purchases/components/PurchaseModal.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // ⭐️ Checkbox 임포트
import { Loader2 } from "lucide-react";
import { TODAY, PurchaseFormValues } from "../hooks/usePurchases";
import type { InventoryOption } from "../purchasesService";

// 1. Zod 스키마 정의
const purchaseSchema = z.object({
  formQty: z.preprocess(
    (val) => (val === "" ? "" : Number(val)),
    z.number({ invalid_type_error: "숫자를 입력하세요." }).gt(0, "수량은 0보다 커야 합니다.")
  ),
  formUnitPrice: z.preprocess(
    (val) => (val === "" ? "" : Number(val)),
    z.number({ invalid_type_error: "숫자를 입력하세요." }).gt(0, "단가는 0보다 커야 합니다.")
  ),
  formDate: z.string()
    .min(1, "매입일은 필수입니다.")
    .refine((date) => date <= TODAY, "매입일은 오늘 이후일 수 없습니다."),
  
  newItemMode: z.boolean(),
  
  // ⭐️ 조건부 검증
  formItemId: z.string(),
  newItemName: z.string(),
  newItemType: z.string(),
  newStockType: z.string(),
}).refine((data) => {
  // 새 품목 모드가 아닐 때, formItemId는 필수
  if (!data.newItemMode && !data.formItemId) return false;
  return true;
}, { message: "품목을 선택하세요.", path: ["formItemId"] })
.refine((data) => {
  // 새 품목 모드일 때, 새 품목 필드들 필수
  if (data.newItemMode && (!data.newItemName.trim() || !data.newItemType.trim() || !data.newStockType.trim())) return false;
  return true;
}, { message: "새 품목명/타입/단위를 모두 입력하세요.", path: ["newItemName"] }); // 대표로 하나만

// 2. Props 정의
interface PurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PurchaseFormValues) => void;
  isPending: boolean;
  inventoryOpts: InventoryOption[];
}

export function PurchaseModal({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  inventoryOpts,
}: PurchaseModalProps) {
  
  // 3. react-hook-form 설정
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      formItemId: "",
      formQty: "",
      formUnitPrice: "",
      formDate: TODAY, // ⭐️ 오늘 날짜 기본값
      newItemMode: false,
      newItemName: "",
      newItemType: "",
      newStockType: "",
    },
  });

  // 4. 모달이 열릴 때 폼 리셋
  useEffect(() => {
    if (open) {
      form.reset({
        formItemId: "",
        formQty: "",
        formUnitPrice: "",
        formDate: TODAY,
        newItemMode: false,
        newItemName: "",
        newItemType: "",
        newStockType: "",
      });
    }
  }, [open, form]);

  // 5. 'newItemMode' 상태 감시
  const newItemMode = form.watch("newItemMode");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>매입 기록 추가</DialogTitle>
          <DialogDescription>새로운 매입 내역을 등록하세요</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            
            <FormField
              control={form.control}
              name="newItemMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    재고에 없는 새 품목 추가
                  </FormLabel>
                </FormItem>
              )}
            />
            
            {!newItemMode ? (
              // --- 기존 품목 선택 ---
              <FormField
                control={form.control}
                name="formItemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>품목</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full h-9 rounded-md border px-3 text-sm bg-transparent"
                      >
                        <option value="">품목 선택</option>
                        {inventoryOpts.map((opt) => (
                          <option key={opt.itemId} value={opt.itemId}>
                            {opt.itemName} ({opt.stockType})
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              // --- 새 품목 입력 ---
              <>
                <FormField
                  control={form.control}
                  name="newItemName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>새 품목명</FormLabel>
                      <FormControl><Input placeholder="예: Kenya AA" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="newItemType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>품목 타입</FormLabel>
                        <FormControl><Input placeholder="예: RAW / PACK" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newStockType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>수량 단위</FormLabel>
                        <FormControl><Input placeholder="예: kg / L / ea" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormMessage>{form.formState.errors.newItemName?.message}</FormMessage>
              </>
            )}

            {/* --- 공통 입력 --- */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="formQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>수량</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="예: 20" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="formUnitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>단가</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="예: 25000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="formDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>매입일</FormLabel>
                  <FormControl><Input type="date" max={TODAY} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isPending}>
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "저장 중..." : "추가"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
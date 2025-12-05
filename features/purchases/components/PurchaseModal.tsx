"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { TODAY, PurchaseFormValues } from "../hooks/usePurchases";
import type {
  InventoryOption,
  PurchaseHistoryResponse,
} from "../purchasesService";

// ✅ 추가: Select + 카테고리 상수
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { INGREDIENT_CATEGORIES } from "@/features/inventory/constants/itemCategory";

const purchaseSchema = z
  .object({
    formQty: z.preprocess(
      (val) => (val === "" ? "" : Number(val)),
      z
        .number({ invalid_type_error: "숫자를 입력하세요." })
        .gt(0, "수량은 0보다 커야 합니다.")
    ),
    formUnitPrice: z.preprocess(
      (val) => (val === "" ? "" : Number(val)),
      z
        .number({ invalid_type_error: "숫자를 입력하세요." })
        .gt(0, "단가는 0보다 커야 합니다.")
    ),
    formDate: z
      .string()
      .min(1, "매입일은 필수입니다.")
      .refine((date) => date <= TODAY, "매입일은 오늘 이후일 수 없습니다."),

    newItemMode: z.boolean(),

    formItemId: z.string().optional(),
    newItemName: z.string().optional(),
    newItemType: z
      .enum(INGREDIENT_CATEGORIES.map((c) => c.value) as [string, ...string[]])
      .optional(), // 값은 enum 코드지만, 스키마는 string으로 둬도 됨
    newStockType: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.newItemMode && !data.formItemId) return false;
      return true;
    },
    { message: "품목을 선택하세요.", path: ["formItemId"] }
  )
  .refine(
    (data) => {
      if (
        data.newItemMode &&
        (!data.newItemName?.trim() ||
          !data.newItemType?.trim() ||
          !data.newStockType?.trim())
      )
        return false;
      return true;
    },
    {
      message: "새 품목명/타입/단위를 모두 입력하세요.",
      path: ["newItemName"],
    }
  );

interface PurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PurchaseFormValues) => void;
  isPending: boolean;
  inventoryOpts: InventoryOption[];
  initialData: PurchaseHistoryResponse | null;
}

export function PurchaseModal({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  inventoryOpts,
  initialData,
}: PurchaseModalProps) {
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      formItemId: "",
      formQty: "",
      formUnitPrice: "",
      formDate: TODAY,
      newItemMode: false,
      newItemName: "",
      newItemType: "",
      newStockType: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        // 수정 모드
        form.reset({
          formItemId: String(initialData.itemId),
          formQty: initialData.purchaseQty,
          formUnitPrice: initialData.unitPrice,
          formDate: initialData.purchaseDate,
          newItemMode: false,
          newItemName: "",
          newItemType: "",
          newStockType: "",
        });
      } else {
        // 생성 모드
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
    }
  }, [open, initialData, form]);

  const newItemMode = form.watch("newItemMode");
  const isEditMode = !!initialData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "매입 내역 수정" : "매입 기록 추가"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "매입 정보를 수정합니다."
              : "새로운 매입 내역을 등록하세요."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            {/* 수정 모드가 아닐 때만 '새 품목 추가' 체크박스 노출 */}
            {!isEditMode && (
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
            )}

            {/* 기존 재고 선택 vs 새 품목 추가 모드 */}
            {!newItemMode ? (
              <FormField
                control={form.control}
                name="formItemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>품목</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={isEditMode}
                        className="w-full h-9 rounded-md border px-3 text-sm bg-transparent disabled:opacity-50"
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
              <>
                <FormField
                  control={form.control}
                  name="newItemName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>새 품목명</FormLabel>
                      <FormControl>
                        <Input placeholder="예: Kenya AA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* 🔽 여기: Input → Select로 변경 */}
                  <FormField
                    control={form.control}
                    name="newItemType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>품목 타입</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="카테고리를 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                              {INGREDIENT_CATEGORIES.map((cat) => (
                                <SelectItem
                                  key={cat.value}
                                  value={cat.value}
                                >
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newStockType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>수량 단위</FormLabel>
                        <FormControl>
                          <Input placeholder="예: kg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 공통 에러 메시지 (새 품목명/타입/단위 미입력 시) */}
                <FormMessage>
                  {form.formState.errors.newItemName?.message}
                </FormMessage>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="formQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>수량</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="예: 20"
                        {...field}
                      />
                    </FormControl>
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
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="예: 25000"
                        {...field}
                      />
                    </FormControl>
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
                  <FormControl>
                    <Input type="date" max={TODAY} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? "수정" : "추가"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

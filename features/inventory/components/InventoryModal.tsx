// features/inventory/components/InventoryModal.tsx
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
import { Loader2 } from "lucide-react";
import type { InventoryFormValues } from "../hooks/useInventory";
import type { Inventory } from "../../../lib/types/database";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INGREDIENT_CATEGORIES } from "../constants/itemCategory";

// =====================
// DB 스펙 기반 상수
// =====================
const ITEM_NAME_MAX_LENGTH = 20;   // item_name length=20
const STOCK_TYPE_MAX_LENGTH = 10;  // stock_type length=20

// DECIMAL(10,3) → 정수부 7자리, 소수부 3자리
const QTY_MAX_INTEGER_DIGITS = 7;
const QTY_MAX_FRACTION_DIGITS = 3;

// 제출 시 자리수 검증용
const validateQtyDigits = (val: number) => {
  if (!Number.isFinite(val)) return false;

  const [integerPartRaw, fractionPart = ""] = val.toString().split(".");
  const integerPart = integerPartRaw.replace("-", "");

  if (integerPart.length > QTY_MAX_INTEGER_DIGITS) return false;
  if (fractionPart.length > QTY_MAX_FRACTION_DIGITS) return false;
  return true;
};

// =====================
// Zod 스키마
// =====================
const inventorySchema = z.object({
  itemName: z
    .string()
    .min(1, "품목명은 필수입니다.")
    .max(
      ITEM_NAME_MAX_LENGTH,
      `품목명은 최대 ${ITEM_NAME_MAX_LENGTH}자까지 입력할 수 있습니다.`
    ),

  itemType: z.enum(
    INGREDIENT_CATEGORIES.map((c) => c.value) as [string, ...string[]],
    { required_error: "품목 타입은 필수입니다." }
  ),

  stockType: z
    .string()
    .min(1, "수량 타입은 필수입니다.")
    .max(
      STOCK_TYPE_MAX_LENGTH,
      `수량 타입은 최대 ${STOCK_TYPE_MAX_LENGTH}자까지 입력할 수 있습니다.`
    ),

  stockQty: z.preprocess(
    (val) => (val === "" ? "" : Number(val)),
    z
      .number({ invalid_type_error: "숫자를 입력하세요." })
      .min(0, "0 이상이어야 합니다.")
      .refine(validateQtyDigits, {
        message: `현재 재고는 최대 ${QTY_MAX_INTEGER_DIGITS}자리 정수와 ${QTY_MAX_FRACTION_DIGITS}자리 소수까지 입력할 수 있습니다.`,
      })
  ),

  safetyQty: z.preprocess(
    (val) => (val === "" ? "" : Number(val)),
    z
      .number({ invalid_type_error: "숫자를 입력하세요." })
      .min(0, "0 이상이어야 합니다.")
      .refine(validateQtyDigits, {
        message: `안전 재고는 최대 ${QTY_MAX_INTEGER_DIGITS}자리 정수와 ${QTY_MAX_FRACTION_DIGITS}자리 소수까지 입력할 수 있습니다.`,
      })
  ),
});

// =====================
// Props
// =====================
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
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    mode: "onChange",
    defaultValues: {
      itemName: "",
      itemType: "",
      stockType: "",
      stockQty: "",
      safetyQty: "",
    },
  });

  // 모달 열릴 때 기본값 세팅
  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && defaultValues) {
      form.reset({
        itemName: defaultValues.itemName,
        itemType: defaultValues.itemType,
        stockType: defaultValues.stockType,
        // form 타입이 number | "" 라서 as any로 문자열 허용
        stockQty: defaultValues.stockQty?.toString() as any,
        safetyQty: defaultValues.safetyQty?.toString() as any,
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
  }, [open, mode, defaultValues, form]);

  const title = mode === "add" ? "재고 추가" : "재고 수정";

  // =====================
  // 렌더링
  // =====================
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>필수 항목을 입력하세요</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            {/* 품목명 */}
            <FormField
              control={form.control}
              name="itemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>품목명</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예) 아라비카 원두"
                      value={field.value ?? ""}
                      // ⛔ maxLength 제거
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value.length > ITEM_NAME_MAX_LENGTH) {
                          form.setError("itemName", {
                            type: "manual",
                            message: `품목명은 최대 ${ITEM_NAME_MAX_LENGTH}자까지 입력할 수 있습니다.`,
                          });
                          return; // ✅ 21자부터는 값 안 바뀜 + 에러만 뜸
                        }

                        form.clearErrors("itemName");
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 품목 타입, 수량 타입 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 품목 타입 */}
              <FormField
                control={form.control}
                name="itemType"
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
                            <SelectItem key={cat.value} value={cat.value}>
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

              {/* 수량 타입 */}
              <FormField
                control={form.control}
                name="stockType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>수량 타입</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예) kg / L / ea"
                        value={field.value ?? ""}
                        // ⛔ maxLength 제거
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value.length > STOCK_TYPE_MAX_LENGTH) {
                            form.setError("stockType", {
                              type: "manual",
                              message: `수량 타입은 최대 ${STOCK_TYPE_MAX_LENGTH}자까지 입력할 수 있습니다.`,
                            });
                            return;
                          }

                          form.clearErrors("stockType");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 재고 수량 / 안전 재고 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 현재 재고 */}
              <FormField
                control={form.control}
                name="stockQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>현재 재고</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={field.value?.toString() ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;

                          // 빈 값 허용
                          if (value === "") {
                            form.clearErrors("stockQty");
                            field.onChange("");
                            return;
                          }

                          // 숫자 + 소수점 1개만 허용
                          const decimalPattern =
                            /^(?:\d+|\d+\.\d*|\.\d+)$/;
                          if (!decimalPattern.test(value)) {
                            // ❌ 문자, 이상한 형식 → 입력 무시
                            return;
                          }

                          const [integerPart = "", fractionPart = ""] =
                            value.split(".");

                          if (integerPart.length > QTY_MAX_INTEGER_DIGITS) {
                            form.setError("stockQty", {
                              type: "manual",
                              message: `현재 재고는 정수부 최대 ${QTY_MAX_INTEGER_DIGITS}자리까지 입력할 수 있습니다.`,
                            });
                            return;
                          }

                          if (fractionPart.length > QTY_MAX_FRACTION_DIGITS) {
                            form.setError("stockQty", {
                              type: "manual",
                              message: `현재 재고는 소수부 최대 ${QTY_MAX_FRACTION_DIGITS}자리까지 입력할 수 있습니다.`,
                            });
                            return;
                          }

                          form.clearErrors("stockQty");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 안전 재고 */}
              <FormField
                control={form.control}
                name="safetyQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>안전 재고</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={field.value?.toString() ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === "") {
                            form.clearErrors("safetyQty");
                            field.onChange("");
                            return;
                          }

                          const decimalPattern =
                            /^(?:\d+|\d+\.\d*|\.\d+)$/;
                          if (!decimalPattern.test(value)) {
                            return; // ❌ 문자 등 → 무시
                          }

                          const [integerPart = "", fractionPart = ""] =
                            value.split(".");

                          if (integerPart.length > QTY_MAX_INTEGER_DIGITS) {
                            form.setError("safetyQty", {
                              type: "manual",
                              message: `안전 재고는 정수부 최대 ${QTY_MAX_INTEGER_DIGITS}자리까지 입력할 수 있습니다.`,
                            });
                            return;
                          }

                          if (fractionPart.length > QTY_MAX_FRACTION_DIGITS) {
                            form.setError("safetyQty", {
                              type: "manual",
                              message: `안전 재고는 소수부 최대 ${QTY_MAX_FRACTION_DIGITS}자리까지 입력할 수 있습니다.`,
                            });
                            return;
                          }

                          form.clearErrors("safetyQty");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                {isPending
                  ? "저장 중..."
                  : mode === "add"
                    ? "추가"
                    : "저장"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

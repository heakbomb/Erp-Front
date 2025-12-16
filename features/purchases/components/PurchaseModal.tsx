// features/purchases/components/PurchaseModal.tsx (경로만 맞게 조정해서 사용)

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
} from "@/shared/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
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
} from "@/shared/ui/select";
import { INGREDIENT_CATEGORIES } from "@/features/inventory/constants/itemCategory";

// =======================
// DB 스펙 기반 상수
// =======================

// Inventory와 동일
const ITEM_NAME_MAX_LENGTH = 20;
const STOCK_TYPE_MAX_LENGTH = 10;

// purchase_qty DECIMAL(10,3) → 정수부 7자리, 소수부 3자리
const QTY_MAX_INTEGER_DIGITS = 7;
const QTY_MAX_FRACTION_DIGITS = 3;

// unit_price DECIMAL(10,2) → 정수부 8자리, 소수부 2자리
const PRICE_MAX_INTEGER_DIGITS = 8;
const PRICE_MAX_FRACTION_DIGITS = 2;

const validateQtyDigits = (val: number) => {
  if (!Number.isFinite(val)) return false;
  const [integerRaw, fraction = ""] = val.toString().split(".");
  const integer = integerRaw.replace("-", "");
  if (integer.length > QTY_MAX_INTEGER_DIGITS) return false;
  if (fraction.length > QTY_MAX_FRACTION_DIGITS) return false;
  return true;
};

const validateUnitPriceDigits = (val: number) => {
  if (!Number.isFinite(val)) return false;
  const [integerRaw, fraction = ""] = val.toString().split(".");
  const integer = integerRaw.replace("-", "");
  if (integer.length > PRICE_MAX_INTEGER_DIGITS) return false;
  if (fraction.length > PRICE_MAX_FRACTION_DIGITS) return false;
  return true;
};

// =======================
// Zod 스키마
// =======================
const purchaseSchema = z
  .object({
    formQty: z.preprocess(
      (val) => (val === "" ? "" : Number(val)),
      z
        .number({ invalid_type_error: "숫자를 입력하세요." })
        .gt(0, "수량은 0보다 커야 합니다.")
        .refine(validateQtyDigits, {
          message: `수량은 정수부 최대 ${QTY_MAX_INTEGER_DIGITS}자리, 소수부 최대 ${QTY_MAX_FRACTION_DIGITS}자리까지 입력할 수 있습니다.`,
        })
    ),
    formUnitPrice: z.preprocess(
      (val) => (val === "" ? "" : Number(val)),
      z
        .number({ invalid_type_error: "숫자를 입력하세요." })
        .gt(0, "단가는 0보다 커야 합니다.")
        .refine(validateUnitPriceDigits, {
          message: `단가는 정수부 최대 ${PRICE_MAX_INTEGER_DIGITS}자리, 소수부 최대 ${PRICE_MAX_FRACTION_DIGITS}자리까지 입력할 수 있습니다.`,
        })
    ),
    formDate: z
      .string()
      .min(1, "매입일은 필수입니다.")
      .refine((date) => date <= TODAY, "매입일은 오늘 이후일 수 없습니다."),

    newItemMode: z.boolean(),

    formItemId: z.string().optional(),
    newItemName: z
      .string()
      .optional()
      .refine(
        (v) =>
          !v || v.length <= ITEM_NAME_MAX_LENGTH,
        `새 품목명은 최대 ${ITEM_NAME_MAX_LENGTH}자까지 입력할 수 있습니다.`
      ),
    newItemType: z.string().optional(),
    newStockType: z
      .string()
      .optional()
      .refine(
        (v) =>
          !v || v.length <= STOCK_TYPE_MAX_LENGTH,
        `수량 단위는 최대 ${STOCK_TYPE_MAX_LENGTH}자까지 입력할 수 있습니다.`
      ),
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
    mode: "onChange",
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
    if (!open) return;

    if (initialData) {
      // 수정 모드
      form.reset({
        formItemId: String(initialData.itemId),
        formQty: initialData.purchaseQty.toString() as any,
        formUnitPrice: initialData.unitPrice.toString() as any,
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
                        <Input
                          placeholder="예: Kenya AA"
                          value={field.value ?? ""}
                          // JS 쪽에서 길이 제한 + 에러
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length > ITEM_NAME_MAX_LENGTH) {
                              form.setError("newItemName", {
                                type: "manual",
                                message: `새 품목명은 최대 ${ITEM_NAME_MAX_LENGTH}자까지 입력할 수 있습니다.`,
                              });
                              return;
                            }
                            form.clearErrors("newItemName");
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* 품목 타입 (Select) */}
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

                  {/* 새 수량 단위 */}
                  <FormField
                    control={form.control}
                    name="newStockType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>수량 단위</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="예: kg"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length > STOCK_TYPE_MAX_LENGTH) {
                                form.setError("newStockType", {
                                  type: "manual",
                                  message: `수량 단위는 최대 ${STOCK_TYPE_MAX_LENGTH}자까지 입력할 수 있습니다.`,
                                });
                                return;
                              }
                              form.clearErrors("newStockType");
                              field.onChange(value);
                            }}
                          />
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

            {/* 수량 / 단가 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 수량 */}
              <FormField
                control={form.control}
                name="formQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>수량</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="예: 20 또는 1.234"
                        value={field.value?.toString() ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === "") {
                            form.clearErrors("formQty");
                            field.onChange("");
                            return;
                          }

                          // 숫자 + 소수점 1개만 허용
                          const decimalPattern =
                            /^(?:\d+|\d+\.\d*|\.\d+)$/;
                          if (!decimalPattern.test(value)) {
                            // 문자가 섞이면 입력 무시
                            return;
                          }

                          const [integerPart = "", fractionPart = ""] =
                            value.split(".");

                          if (integerPart.length > QTY_MAX_INTEGER_DIGITS) {
                            form.setError("formQty", {
                              type: "manual",
                              message: `수량은 정수부 최대 ${QTY_MAX_INTEGER_DIGITS}자리까지 입력할 수 있습니다.`,
                            });
                            return;
                          }

                          if (fractionPart.length > QTY_MAX_FRACTION_DIGITS) {
                            form.setError("formQty", {
                              type: "manual",
                              message: `수량은 소수부 최대 ${QTY_MAX_FRACTION_DIGITS}자리까지 입력할 수 있습니다.`,
                            });
                            return;
                          }

                          form.clearErrors("formQty");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 단가 */}
              <FormField
                control={form.control}
                name="formUnitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>단가</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="예: 25000 또는 1234.56"
                        value={field.value?.toString() ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === "") {
                            form.clearErrors("formUnitPrice");
                            field.onChange("");
                            return;
                          }

                          const decimalPattern =
                            /^(?:\d+|\d+\.\d*|\.\d+)$/;
                          if (!decimalPattern.test(value)) {
                            return; // 문자 입력 무시
                          }

                          const [integerPart = "", fractionPart = ""] =
                            value.split(".");

                          if (
                            integerPart.length > PRICE_MAX_INTEGER_DIGITS
                          ) {
                            form.setError("formUnitPrice", {
                              type: "manual",
                              message: `단가는 정수부 최대 ${PRICE_MAX_INTEGER_DIGITS}자리까지 입력할 수 있습니다.`,
                            });
                            return;
                          }

                          if (
                            fractionPart.length > PRICE_MAX_FRACTION_DIGITS
                          ) {
                            form.setError("formUnitPrice", {
                              type: "manual",
                              message: `단가는 소수부 최대 ${PRICE_MAX_FRACTION_DIGITS}자리까지 입력할 수 있습니다.`,
                            });
                            return;
                          }

                          form.clearErrors("formUnitPrice");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 매입일 */}
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

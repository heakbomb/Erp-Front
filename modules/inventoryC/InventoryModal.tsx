// modules/inventoryC/InventoryModal.tsx
"use client";
//테스트
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/commonUtils";
import { InventoryFormValues } from "./useInventory";
import { Inventory, INGREDIENT_CATEGORIES } from "./inventoryTypes";

const ITEM_NAME_MAX_LENGTH = 20;
const STOCK_TYPE_MAX_LENGTH = 10;
const QTY_MAX_INTEGER_DIGITS = 7;
const QTY_MAX_FRACTION_DIGITS = 3;

const validateQtyDigits = (val: number) => {
  if (!Number.isFinite(val)) return false;
  const [integerPartRaw, fractionPart = ""] = val.toString().split(".");
  const integerPart = integerPartRaw.replace("-", "");
  return integerPart.length <= QTY_MAX_INTEGER_DIGITS && fractionPart.length <= QTY_MAX_FRACTION_DIGITS;
};

/**
 * ✅ 숫자 입력을 "자리수 제한"에 맞게 필터링
 * - Input type="number"는 브라우저마다 문자열 입력이 애매해서
 *   일단 문자열로 받고, 허용되는 패턴만 form에 반영한다.
 *
 * 규칙:
 * - 빈값 "" 허용
 * - 숫자 + (소수점 한 번) 허용
 * - 정수부 최대 7자리, 소수부 최대 3자리
 * - 음수는 허용 안 함(0 이상)
 */
const filterQtyInput = (raw: string) => {
  if (raw === "") return "";

  // 숫자/점 외 문자 제거(안전)
  let s = raw.replace(/[^\d.]/g, "");

  // 점이 여러 개면 첫 번째만 남김
  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    const before = s.slice(0, firstDot + 1);
    const after = s.slice(firstDot + 1).replace(/\./g, "");
    s = before + after;
  }

  const [intPartRaw, fracPartRaw = ""] = s.split(".");
  // 앞 0 처리(예: 00012 -> 12) 단, "0" 단독은 유지
  let intPart = intPartRaw.replace(/^0+(?=\d)/, "");

  // 정수부 자리수 제한
  if (intPart.length > QTY_MAX_INTEGER_DIGITS) {
    intPart = intPart.slice(0, QTY_MAX_INTEGER_DIGITS);
  }

  // 소수부 자리수 제한
  let fracPart = fracPartRaw;
  if (fracPart.length > QTY_MAX_FRACTION_DIGITS) {
    fracPart = fracPart.slice(0, QTY_MAX_FRACTION_DIGITS);
  }

  // 사용자가 "."만 입력한 경우 -> "0."
  if (intPart === "" && firstDot !== -1) {
    intPart = "0";
  }

  // 최종 문자열 조립
  if (firstDot !== -1) {
    return `${intPart}.${fracPart}`;
  }
  return intPart;
};

const getQtyDigitsInfo = (raw: string) => {
  if (!raw) return { intDigits: 0, fracDigits: 0 };
  const [i, f = ""] = raw.split(".");
  return { intDigits: i.replace("-", "").length, fracDigits: f.length };
};

const toNumberOrUndefined = (val: unknown) => {
  // react-hook-form에서 input 값은 보통 string으로 들어옴
  if (val === "" || val === null || val === undefined) return undefined;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = Number(val);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
};

const inventorySchema = z.object({
  itemName: z.string().min(1, "품목명 필수").max(ITEM_NAME_MAX_LENGTH),
  itemType: z.string().min(1, "타입 필수"),
  stockType: z.string().min(1, "단위 필수").max(STOCK_TYPE_MAX_LENGTH),

  stockQty: z.preprocess(
    toNumberOrUndefined,
    z.number({ required_error: "현재 재고 필수", invalid_type_error: "숫자만 입력" })
      .min(0, "0 이상 입력")
      .refine(validateQtyDigits, "자리수 초과")
  ),

  safetyQty: z.preprocess(
    toNumberOrUndefined,
    z.number({ required_error: "안전 재고 필수", invalid_type_error: "숫자만 입력" })
      .min(0, "0 이상 입력")
      .refine(validateQtyDigits, "자리수 초과")
  ),
});

interface Props {
  mode: "add" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: InventoryFormValues) => void;
  isPending: boolean;
  defaultValues?: Inventory | null;
}

export default function InventoryModal({
  mode,
  open,
  onOpenChange,
  onSubmit,
  isPending,
  defaultValues,
}: Props) {
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

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && defaultValues) {
      form.reset({
        itemName: defaultValues.itemName,
        itemType: defaultValues.itemType,
        stockType: defaultValues.stockType,
        stockQty: defaultValues.stockQty,
        safetyQty: defaultValues.safetyQty,
      });
    } else {
      form.reset({ itemName: "", itemType: "", stockType: "", stockQty: "", safetyQty: "" });
    }
  }, [open, mode, defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "재고 추가" : "재고 수정"}</DialogTitle>
          <DialogDescription>필수 항목을 입력하세요</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.slice(0, ITEM_NAME_MAX_LENGTH))}
                    />
                  </FormControl>

                  <div className="text-right text-xs">
                    <span
                      className={cn(
                        (field.value?.length || 0) >= ITEM_NAME_MAX_LENGTH
                          ? "text-red-500 font-bold"
                          : "text-muted-foreground"
                      )}
                    >
                      {field.value?.length || 0} / {ITEM_NAME_MAX_LENGTH}
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* 품목 타입 */}
              <FormField
                control={form.control}
                name="itemType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>품목 타입</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INGREDIENT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 수량 타입(단위) */}
              <FormField
                control={form.control}
                name="stockType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>수량 타입</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예) kg, ea"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.slice(0, STOCK_TYPE_MAX_LENGTH))}
                      />
                    </FormControl>

                    <div className="text-right text-xs">
                      <span
                        className={cn(
                          (field.value?.length || 0) >= STOCK_TYPE_MAX_LENGTH
                            ? "text-red-500 font-bold"
                            : "text-muted-foreground"
                        )}
                      >
                        {field.value?.length || 0} / {STOCK_TYPE_MAX_LENGTH}
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* 현재 재고 */}
              <FormField
                control={form.control}
                name="stockQty"
                render={({ field }) => {
                  const raw = field.value === "" ? "" : String(field.value);
                  const { intDigits, fracDigits } = getQtyDigitsInfo(raw);

                  return (
                    <FormItem>
                      <FormLabel>현재 재고</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="decimal"
                          placeholder="예) 12.5"
                          value={raw}
                          onChange={(e) => {
                            const filtered = filterQtyInput(e.target.value);
                            field.onChange(filtered);
                          }}
                        />
                      </FormControl>

                      <div className="text-right text-xs">
                        <span
                          className={cn(
                            intDigits >= QTY_MAX_INTEGER_DIGITS || fracDigits >= QTY_MAX_FRACTION_DIGITS
                              ? "text-red-500 font-bold"
                              : "text-muted-foreground"
                          )}
                        >
                          정수 {intDigits}/{QTY_MAX_INTEGER_DIGITS} · 소수 {fracDigits}/{QTY_MAX_FRACTION_DIGITS}
                        </span>
                      </div>

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* 안전 재고 */}
              <FormField
                control={form.control}
                name="safetyQty"
                render={({ field }) => {
                  const raw = field.value === "" ? "" : String(field.value);
                  const { intDigits, fracDigits } = getQtyDigitsInfo(raw);

                  return (
                    <FormItem>
                      <FormLabel>안전 재고</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="decimal"
                          placeholder="예) 5"
                          value={raw}
                          onChange={(e) => {
                            const filtered = filterQtyInput(e.target.value);
                            field.onChange(filtered);
                          }}
                        />
                      </FormControl>

                      <div className="text-right text-xs">
                        <span
                          className={cn(
                            intDigits >= QTY_MAX_INTEGER_DIGITS || fracDigits >= QTY_MAX_FRACTION_DIGITS
                              ? "text-red-500 font-bold"
                              : "text-muted-foreground"
                          )}
                        >
                          정수 {intDigits}/{QTY_MAX_INTEGER_DIGITS} · 소수 {fracDigits}/{QTY_MAX_FRACTION_DIGITS}
                        </span>
                      </div>

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "add" ? "추가" : "저장"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// modules/inventoryC/InventoryModal.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Loader2 } from "lucide-react";
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

const inventorySchema = z.object({
  itemName: z.string().min(1, "품목명 필수").max(ITEM_NAME_MAX_LENGTH),
  itemType: z.string().min(1, "타입 필수"), // enum check는 select에서 보장됨
  stockType: z.string().min(1, "단위 필수").max(STOCK_TYPE_MAX_LENGTH),
  stockQty: z.preprocess((val) => (val === "" ? "" : Number(val)), z.number().min(0).refine(validateQtyDigits, "자리수 초과")),
  safetyQty: z.preprocess((val) => (val === "" ? "" : Number(val)), z.number().min(0).refine(validateQtyDigits, "자리수 초과")),
});

interface Props {
  mode: "add" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: InventoryFormValues) => void;
  isPending: boolean;
  defaultValues?: Inventory | null;
}

export default function InventoryModal({ mode, open, onOpenChange, onSubmit, isPending, defaultValues }: Props) {
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    mode: "onChange",
    defaultValues: {
      itemName: "", itemType: "", stockType: "", stockQty: "", safetyQty: ""
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
            <FormField control={form.control} name="itemName" render={({ field }) => (
              <FormItem>
                <FormLabel>품목명</FormLabel>
                <FormControl><Input placeholder="예) 아라비카 원두" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="itemType" render={({ field }) => (
                <FormItem>
                  <FormLabel>품목 타입</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {INGREDIENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="stockType" render={({ field }) => (
                <FormItem>
                  <FormLabel>수량 타입</FormLabel>
                  <FormControl><Input placeholder="예) kg, ea" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="stockQty" render={({ field }) => (
                <FormItem>
                  <FormLabel>현재 재고</FormLabel>
                  <FormControl><Input type="number" step="any" {...field} value={field.value === "" ? "" : field.value} onChange={e => field.onChange(e.target.value)} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="safetyQty" render={({ field }) => (
                <FormItem>
                  <FormLabel>안전 재고</FormLabel>
                  <FormControl><Input type="number" step="any" {...field} value={field.value === "" ? "" : field.value} onChange={e => field.onChange(e.target.value)} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>취소</Button>
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
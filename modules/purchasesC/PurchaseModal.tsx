// modules/purchasesC/PurchaseModal.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/ui/select";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/commonUtils";
import { PurchaseFormValues, TODAY } from "./usePurchases";
import { InventoryOption, PurchaseHistoryResponse } from "./purchasesTypes";
import { INGREDIENT_CATEGORIES } from "@/modules/inventoryC/inventoryTypes";

const ITEM_NAME_MAX_LENGTH = 20;
const STOCK_TYPE_MAX_LENGTH = 10;
const QTY_MAX_INTEGER_DIGITS = 7;
const QTY_MAX_FRACTION_DIGITS = 3;
const PRICE_MAX_INTEGER_DIGITS = 8;
const PRICE_MAX_FRACTION_DIGITS = 2;

const validateQtyDigits = (val: number) => {
  if (!Number.isFinite(val)) return false;
  const [integerRaw, fraction = ""] = val.toString().split(".");
  const integer = integerRaw.replace("-", "");
  return integer.length <= QTY_MAX_INTEGER_DIGITS && fraction.length <= QTY_MAX_FRACTION_DIGITS;
};

const validateUnitPriceDigits = (val: number) => {
  if (!Number.isFinite(val)) return false;
  const [integerRaw, fraction = ""] = val.toString().split(".");
  const integer = integerRaw.replace("-", "");
  return integer.length <= PRICE_MAX_INTEGER_DIGITS && fraction.length <= PRICE_MAX_FRACTION_DIGITS;
};

const purchaseSchema = z.object({
  formQty: z.preprocess((val) => (val === "" ? "" : Number(val)), z.number().gt(0).refine(validateQtyDigits, "자리수 초과")),
  formUnitPrice: z.preprocess((val) => (val === "" ? "" : Number(val)), z.number().gt(0).refine(validateUnitPriceDigits, "자리수 초과")),
  formDate: z.string().min(1).refine(date => date <= TODAY, "오늘 이후 날짜 불가"),
  newItemMode: z.boolean(),
  formItemId: z.string().optional(),
  newItemName: z.string().optional().refine(v => !v || v.length <= ITEM_NAME_MAX_LENGTH, "글자수 초과"),
  newItemType: z.string().optional(),
  newStockType: z.string().optional().refine(v => !v || v.length <= STOCK_TYPE_MAX_LENGTH, "글자수 초과"),
}).refine(data => !(!data.newItemMode && !data.formItemId), { message: "품목 선택 필수", path: ["formItemId"] })
  .refine(data => !(data.newItemMode && (!data.newItemName?.trim() || !data.newItemType?.trim() || !data.newStockType?.trim())), { message: "새 품목 정보 필수", path: ["newItemName"] });

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PurchaseFormValues) => void;
  isPending: boolean;
  inventoryOpts: InventoryOption[];
  initialData: PurchaseHistoryResponse | null;
}

export default function PurchaseModal({ open, onOpenChange, onSubmit, isPending, inventoryOpts, initialData }: Props) {
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    mode: "onChange",
    defaultValues: {
      formItemId: "", formQty: "", formUnitPrice: "", formDate: TODAY,
      newItemMode: false, newItemName: "", newItemType: "", newStockType: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      form.reset({
        formItemId: String(initialData.itemId),
        formQty: initialData.purchaseQty as any,
        formUnitPrice: initialData.unitPrice as any,
        formDate: initialData.purchaseDate,
        newItemMode: false, newItemName: "", newItemType: "", newStockType: "",
      });
    } else {
      form.reset({
        formItemId: "", formQty: "", formUnitPrice: "", formDate: TODAY,
        newItemMode: false, newItemName: "", newItemType: "", newStockType: "",
      });
    }
  }, [open, initialData, form]);

  const newItemMode = form.watch("newItemMode");
  const isEditMode = !!initialData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "매입 수정" : "매입 등록"}</DialogTitle>
          <DialogDescription>{isEditMode ? "매입 정보를 수정합니다." : "새로운 매입 내역을 등록하세요."}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {!isEditMode && (
              <FormField control={form.control} name="newItemMode" render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <FormLabel className="font-normal">새 품목 추가</FormLabel>
                </FormItem>
              )} />
            )}

            {!newItemMode ? (
              <FormField control={form.control} name="formItemId" render={({ field }) => (
                <FormItem>
                  <FormLabel>품목</FormLabel>
                  <FormControl>
                    <select {...field} disabled={isEditMode} className="w-full h-9 rounded-md border px-3 text-sm bg-background disabled:opacity-50">
                      <option value="">품목 선택</option>
                      {inventoryOpts.map(opt => <option key={opt.itemId} value={opt.itemId}>{opt.itemName} ({opt.stockType})</option>)}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            ) : (
              <>
                <FormField control={form.control} name="newItemName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>새 품목명</FormLabel>
                    <FormControl>
                      {/* [입력 제한] */}
                      <Input 
                        placeholder="예: 원두" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.slice(0, ITEM_NAME_MAX_LENGTH))}
                      />
                    </FormControl>
                    {/* [경고] */}
                    <div className="text-right text-xs">
                       <span className={cn((field.value?.length || 0) >= ITEM_NAME_MAX_LENGTH ? "text-red-500 font-bold" : "text-muted-foreground")}>
                         {field.value?.length || 0} / {ITEM_NAME_MAX_LENGTH}
                       </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="newItemType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>타입</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl><SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger></FormControl>
                        <SelectContent>{INGREDIENT_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="newStockType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>단위</FormLabel>
                      <FormControl>
                        {/* [입력 제한] */}
                        <Input 
                          placeholder="예: kg" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.slice(0, STOCK_TYPE_MAX_LENGTH))}
                        />
                      </FormControl>
                      {/* [경고] */}
                      <div className="text-right text-xs">
                        <span className={cn((field.value?.length || 0) >= STOCK_TYPE_MAX_LENGTH ? "text-red-500 font-bold" : "text-muted-foreground")}>
                          {field.value?.length || 0} / {STOCK_TYPE_MAX_LENGTH}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="formQty" render={({ field }) => (
                <FormItem><FormLabel>수량</FormLabel><FormControl><Input type="number" step="any" {...field} onChange={e=>field.onChange(e.target.value)} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="formUnitPrice" render={({ field }) => (
                <FormItem><FormLabel>단가</FormLabel><FormControl><Input type="number" step="any" {...field} onChange={e=>field.onChange(e.target.value)} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="formDate" render={({ field }) => (
              <FormItem><FormLabel>매입일</FormLabel><FormControl><Input type="date" max={TODAY} {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "수정" : "추가"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
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

// ✅ 추가: Select 컴포넌트 & 카테고리 상수
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INGREDIENT_CATEGORIES } from "../constants/itemCategory";

// 1. Zod 스키마 정의 (유효성 검사)
const inventorySchema = z.object({
  itemName: z.string().min(1, "품목명은 필수입니다."),
  itemType: z.enum(
    INGREDIENT_CATEGORIES.map((c) => c.value) as [string, ...string[]],
    { required_error: "품목 타입은 필수입니다." }
  ),
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

// 2. Props 정의
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
  // 3. react-hook-form 설정
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      itemName: "",
      itemType: "", // enum 코드 문자열 (예: "VEGETABLE")
      stockType: "",
      stockQty: "",
      safetyQty: "",
    },
  });

  // 4. 모달이 열리거나 defaultValues가 바뀔 때 폼 리셋
  useEffect(() => {
    if (open) {
      if (mode === "edit" && defaultValues) {
        form.reset({
          itemName: defaultValues.itemName,
          itemType: defaultValues.itemType, // 백에서 오는 enum 코드 그대로 사용
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

  // 5. Form 렌더링
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
                    <Input placeholder="예) 아라비카 원두" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 품목 타입, 수량 타입 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 🔽 여기: Input → Select로 변경 */}
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

              <FormField
                control={form.control}
                name="stockType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>수량 타입</FormLabel>
                    <FormControl>
                      <Input placeholder="예) kg / L / ea" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 재고 수량 / 안전 재고 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stockQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>현재 재고</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
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
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="0"
                        {...field}
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

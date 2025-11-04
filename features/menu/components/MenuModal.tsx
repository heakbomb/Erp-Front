// features/menu/components/MenuModal.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// paths updated from:
// "@/components/ui/..." -> "../../../../components/ui/..."
// "../hooks/useMenu" -> "../../useMenu"
// "@/lib/types/database" -> "../../../../lib/types/database"

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../../../components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "../../../components/ui/form";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import type { MenuFormValues } from "../hooks/useMenu"; 
import type { MenuItem } from "../../../lib/types/database";

// ... (내부 로직은 변경 없음)
const menuSchema = z.object({
  menuName: z.string().min(1, "메뉴명은 필수입니다."),
  price: z.preprocess(
    (val) => (val === "" ? "" : Number(val)),
    z.number({ invalid_type_error: "숫자를 입력하세요." }).min(0, "가격은 0 이상이어야 합니다.")
  ),
});

interface MenuModalProps {
  mode: "add" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: MenuFormValues) => void;
  isPending: boolean;
  defaultValues?: MenuItem | null;
}

export function MenuModal({
  mode,
  open,
  onOpenChange,
  onSubmit,
  isPending,
  defaultValues,
}: MenuModalProps) {
  
  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: { menuName: "", price: "" },
  });

  useEffect(() => {
    if (open && mode === "edit" && defaultValues) {
      form.reset({
        menuName: defaultValues.menuName,
        price: defaultValues.price,
      });
    } else if (open && mode === "add") {
      form.reset({ menuName: "", price: "" });
    }
  }, [open, mode, defaultValues, form]);

  const title = mode === "add" ? "메뉴 추가" : "메뉴 수정";
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>메뉴명과 판매가만 입력합니다.</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="menuName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>메뉴명</FormLabel>
                  <FormControl>
                    <Input placeholder="아메리카노" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>판매가</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="4500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
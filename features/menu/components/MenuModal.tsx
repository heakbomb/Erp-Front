// features/menu/components/MenuModal.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MenuFormValues } from "../hooks/useMenu";

type MenuModalProps = {
  mode: "add" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: { menuName: string; price: number };
  onSubmit: (values: MenuFormValues) => void;
};

export function MenuModal({
  mode,
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
}: MenuModalProps) {
  const [menuName, setMenuName] = useState("");
  const [price, setPrice] = useState<number | "">("");

  useEffect(() => {
    if (open && mode === "edit" && defaultValues) {
      setMenuName(defaultValues.menuName ?? "");
      setPrice(defaultValues.price ?? "");
    }
    if (open && mode === "add") {
      setMenuName("");
      setPrice("");
    }
  }, [open, mode, defaultValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      menuName: menuName,
      price,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            메뉴 {mode === "add" ? "추가" : "수정"}
          </DialogTitle>
          <DialogDescription>
            메뉴명과 판매가만 입력합니다.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4 py-4"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <Label htmlFor="menu-name">메뉴명</Label>
            <Input
              id="menu-name"
              placeholder="아메리카노"
              value={menuName}
              onChange={(e) =>
                setMenuName(e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">판매가</Label>
            <Input
              id="price"
              type="number"
              placeholder="4500"
              value={price}
              onChange={(e) =>
                setPrice(
                  e.target.value === ""
                    ? ""
                    : Number(e.target.value)
                )
              }
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={handleClose}
            >
              취소
            </Button>
            <Button type="submit">
              {mode === "add" ? "추가" : "수정"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
// modules/menuC/MenuModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import type { MenuFormValues } from "./useMenu";

type MenuModalProps = {
  mode: "add" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: { menuName: string; price: number };
  onSubmit: (values: MenuFormValues) => void;
};

const MENU_NAME_MAX_LENGTH = 20;
const PRICE_MAX_INTEGER_DIGITS = 8;
const PRICE_MAX_FRACTION_DIGITS = 2;

export default function MenuModal({ mode, open, onOpenChange, defaultValues, onSubmit }: MenuModalProps) {
  const [menuName, setMenuName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [menuNameError, setMenuNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && defaultValues) {
        setMenuName(defaultValues.menuName ?? "");
        setPrice(defaultValues.price !== undefined ? String(defaultValues.price) : "");
      } else {
        setMenuName("");
        setPrice("");
      }
      setMenuNameError(null);
      setPriceError(null);
    }
  }, [open, mode, defaultValues]);

  const handleMenuNameChange = (e: any) => {
    const value = e.target.value;
    if (value.length > MENU_NAME_MAX_LENGTH) {
      setMenuNameError(`메뉴명은 최대 ${MENU_NAME_MAX_LENGTH}자까지 입력 가능합니다.`);
      return;
    }
    setMenuNameError(null);
    setMenuName(value);
  };

  const handlePriceChange = (e: any) => {
    const value = e.target.value;
    if (value === "") { setPrice(""); setPriceError(null); return; }

    if (!/^(\d+(\.\d*)?|\.\d*)$/.test(value)) return;

    const [intPart = "", fracPart = ""] = value.split(".");
    if (intPart.length > PRICE_MAX_INTEGER_DIGITS) {
      setPriceError(`정수부는 최대 ${PRICE_MAX_INTEGER_DIGITS}자리입니다.`);
      return;
    }
    if (fracPart.length > PRICE_MAX_FRACTION_DIGITS) {
      setPriceError(`소수부는 최대 ${PRICE_MAX_FRACTION_DIGITS}자리입니다.`);
      return;
    }
    setPriceError(null);
    setPrice(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!menuName.trim()) { setMenuNameError("메뉴명을 입력해주세요."); hasError = true; }
    if (!price.trim()) { setPriceError("판매가를 입력해주세요."); hasError = true; }
    
    const numPrice = Number(price);
    if (Number.isNaN(numPrice) || numPrice <= 0) {
      setPriceError("0보다 큰 숫자를 입력해주세요.");
      hasError = true;
    }

    if (hasError) return;
    onSubmit({ menuName, price: numPrice });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>메뉴 {mode === "add" ? "추가" : "수정"}</DialogTitle>
          <DialogDescription>메뉴명과 판매가를 입력하세요.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4 py-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label htmlFor="menu-name">메뉴명</Label>
            <Input id="menu-name" value={menuName} onChange={handleMenuNameChange} placeholder="아메리카노" />
            {menuNameError && <p className="mt-1 text-xs text-red-500">{menuNameError}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="price">판매가</Label>
            <Input id="price" inputMode="decimal" value={price} onChange={handlePriceChange} placeholder="4500" />
            {priceError && <p className="mt-1 text-xs text-red-500">{priceError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>취소</Button>
            <Button type="submit">{mode === "add" ? "추가" : "수정"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
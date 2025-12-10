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

// ✅ DB 스펙 기준
const MENU_NAME_MAX_LENGTH = 20;          // @Column(length = 20)
const PRICE_MAX_INTEGER_DIGITS = 8;       // DECIMAL(10,2) → 정수부 최대 8자리
const PRICE_MAX_FRACTION_DIGITS = 2;      // 소수부 최대 2자리

export function MenuModal({
  mode,
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
}: MenuModalProps) {
  const [menuName, setMenuName] = useState("");
  const [price, setPrice] = useState<string>("");

  // 에러 메시지 상태
  const [menuNameError, setMenuNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  useEffect(() => {
    if (open && mode === "edit" && defaultValues) {
      setMenuName(defaultValues.menuName ?? "");
      setPrice(
        defaultValues.price !== undefined && defaultValues.price !== null
          ? String(defaultValues.price)
          : ""
      );
    }
    if (open && mode === "add") {
      setMenuName("");
      setPrice("");
    }
    if (open) {
      setMenuNameError(null);
      setPriceError(null);
    }
  }, [open, mode, defaultValues]);

  // 메뉴명 변경 (20글자 제한 + 에러 표시)
  const handleMenuNameChange = (e: any) => {
    const value = e.target.value;

    if (value.length > MENU_NAME_MAX_LENGTH) {
      setMenuNameError(`메뉴명은 최대 ${MENU_NAME_MAX_LENGTH}자까지 입력할 수 있습니다.`);
      return; // 기존 값 유지
    }

    setMenuNameError(null);
    setMenuName(value);
  };

  // 판매가 변경 (소수점 포함, 정수부/소수부 자리수 제한 + 에러 표시)
  const handlePriceChange = (e: any) => {
    const value = e.target.value;

    // 빈 값 허용
    if (value === "") {
      setPrice("");
      setPriceError(null);
      return;
    }

    // 숫자 + 소수점 1개만 허용
    // 허용 예: "123", "123.", "123.4", "123.45", ".5", "0.5"
    const decimalPattern = /^(\d+(\.\d*)?|\.\d*)$/;
    if (!decimalPattern.test(value)) {
      // 잘못된 문자면 입력 무시
      return;
    }

    const [integerPart = "", fractionPart = ""] = value.split(".");

    if (integerPart && integerPart.length > PRICE_MAX_INTEGER_DIGITS) {
      setPriceError(
        `정수 부분은 최대 ${PRICE_MAX_INTEGER_DIGITS}자리까지 입력할 수 있습니다.`
      );
      return;
    }

    if (fractionPart && fractionPart.length > PRICE_MAX_FRACTION_DIGITS) {
      setPriceError(
        `소수 부분은 최대 ${PRICE_MAX_FRACTION_DIGITS}자리까지 입력할 수 있습니다.`
      );
      return;
    }

    setPriceError(null);
    setPrice(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

    if (!menuName.trim()) {
      setMenuNameError("메뉴명을 입력해주세요.");
      hasError = true;
    }

    if (!price.trim()) {
      setPriceError("판매가를 입력해주세요.");
      hasError = true;
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setPriceError("판매가를 0보다 큰 숫자로 입력해주세요.");
      hasError = true;
    }

    if (hasError) return;

    onSubmit({
      menuName,
      price: numericPrice,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>메뉴 {mode === "add" ? "추가" : "수정"}</DialogTitle>
          <DialogDescription>
            메뉴명과 판매가만 입력합니다.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 py-4" onSubmit={handleSubmit}>
          {/* 메뉴명 */}
          <div className="space-y-1">
            <Label htmlFor="menu-name">메뉴명</Label>
            <Input
              id="menu-name"
              placeholder="아메리카노"
              value={menuName}
              maxLength={MENU_NAME_MAX_LENGTH}
              onChange={handleMenuNameChange}
            />
            {menuNameError && (
              <p className="mt-1 text-xs text-red-500">{menuNameError}</p>
            )}
          </div>

          {/* 판매가 */}
          <div className="space-y-1">
            <Label htmlFor="price">판매가</Label>
            <Input
              id="price"
              type="text"
              inputMode="decimal"
              placeholder="4500 또는 4500.50"
              value={price}
              onChange={handlePriceChange}
            />
            {priceError && (
              <p className="mt-1 text-xs text-red-500">{priceError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={handleClose}>
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

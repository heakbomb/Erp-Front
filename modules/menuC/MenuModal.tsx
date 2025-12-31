"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import type { MenuFormValues } from "./useMenu";
import { menuApi } from "./menuApi";
import { useStore } from "@/contexts/StoreContext";
import { cn } from "@/shared/utils/commonUtils";

type MenuModalProps = {
  mode: "add" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: {
    menuName: string;
    price: number;
    categoryName?: string;
    subCategoryName?: string;
  };
  onSubmit: (values: MenuFormValues) => void;
};

const MENU_NAME_MAX_LENGTH = 20;
const PRICE_MAX_INTEGER_DIGITS = 8;
const PRICE_MAX_FRACTION_DIGITS = 2;

export default function MenuModal({
  mode,
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
}: MenuModalProps) {
  /* =========================
     Store / Industry
     ========================= */
  const { currentStore } = useStore();
  const currentStoreIndustry = currentStore?.industry;

  // ✅ enum(StoreIndustry) → string literal 변환 (타입 에러 해결용)
  const industryParam =
    currentStoreIndustry === "KOREAN"
      ? "KOREAN"
      : currentStoreIndustry === "CHICKEN"
      ? "CHICKEN"
      : undefined;

  /* =========================
     State
     ========================= */
  const [menuName, setMenuName] = useState("");
  const [price, setPrice] = useState<string>("");

  const [menuNameError, setMenuNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  // 카테고리
  const [categoryName, setCategoryName] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);

  /* =========================
     초기화 (모달 열릴 때)
     ========================= */
  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && defaultValues) {
      setMenuName(defaultValues.menuName ?? "");
      setPrice(defaultValues.price !== undefined ? String(defaultValues.price) : "");
      setCategoryName(defaultValues.categoryName ?? "");
      setSubCategoryName(defaultValues.subCategoryName ?? "");
    } else {
      setMenuName("");
      setPrice("");
      setCategoryName("");
      setSubCategoryName("");
    }

    setMenuNameError(null);
    setPriceError(null);
  }, [open, mode, defaultValues]);

  /* =========================
     중분류 조회
     ========================= */
  useEffect(() => {
    if (!open || !industryParam) return;

    menuApi
      .fetchMenuCategories(industryParam)
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [open, industryParam]);

  /* =========================
     소분류 조회
     ========================= */
  useEffect(() => {
    if (!categoryName || !industryParam) {
      setSubCategories([]);
      setSubCategoryName("");
      return;
    }

    menuApi
      .fetchMenuSubCategories(industryParam, categoryName)
      .then(setSubCategories)
      .catch(() => setSubCategories([]));
  }, [categoryName, industryParam]);

  /* =========================
     Handlers
     ========================= */
  const handleMenuNameChange = (e: any) => {
    const value = e.target.value;

    if (value.length > MENU_NAME_MAX_LENGTH) {
      setMenuName(value.slice(0, MENU_NAME_MAX_LENGTH));
      setMenuNameError(`메뉴명은 최대 ${MENU_NAME_MAX_LENGTH}자까지 입력 가능합니다.`);
      return;
    }

    setMenuNameError(null);
    setMenuName(value);
  };

  const handlePriceChange = (e: any) => {
    const value = e.target.value;

    if (value === "") {
      setPrice("");
      setPriceError(null);
      return;
    }

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

    if (!menuName.trim()) {
      setMenuNameError("메뉴명을 입력해주세요.");
      return;
    }

    if (!price.trim()) {
      setPriceError("판매가를 입력해주세요.");
      return;
    }

    if (!categoryName || !subCategoryName) {
      alert("중분류/소분류를 선택해주세요.");
      return;
    }

    const numPrice = Number(price);
    if (Number.isNaN(numPrice) || numPrice <= 0) {
      setPriceError("0보다 큰 숫자를 입력해주세요.");
      return;
    }

    onSubmit({
      menuName,
      price: numPrice,
      categoryName,
      subCategoryName,
    });
  };

  /* =========================
     Render
     ========================= */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>메뉴 {mode === "add" ? "추가" : "수정"}</DialogTitle>
          <DialogDescription>메뉴명과 판매가를 입력하세요.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4 py-4" onSubmit={handleSubmit}>
          {/* 메뉴명 */}
          <div className="space-y-1">
            <Label>메뉴명</Label>
            <Input value={menuName} onChange={handleMenuNameChange} />
            <div className="flex justify-between mt-1">
              {menuNameError ? (
                <p className="text-xs text-red-500">{menuNameError}</p>
              ) : (
                <span />
              )}
              <p
                className={cn(
                  "text-xs",
                  menuName.length >= MENU_NAME_MAX_LENGTH
                    ? "text-red-500"
                    : "text-muted-foreground",
                )}
              >
                {menuName.length} / {MENU_NAME_MAX_LENGTH}
              </p>
            </div>
          </div>

          {/* 중분류 */}
          <div className="space-y-1">
            <Label>중분류</Label>
            <select
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="h-10 w-full rounded-md border px-3 text-sm"
            >
              <option value="">선택</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 소분류 */}
          <div className="space-y-1">
            <Label>소분류</Label>
            <select
              value={subCategoryName}
              onChange={(e) => setSubCategoryName(e.target.value)}
              disabled={!categoryName}
              className="h-10 w-full rounded-md border px-3 text-sm disabled:opacity-50"
            >
              <option value="">선택</option>
              {subCategories.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* 판매가 */}
          <div className="space-y-1">
            <Label>판매가</Label>
            <Input inputMode="decimal" value={price} onChange={handlePriceChange} />
            {priceError && <p className="text-xs text-red-500">{priceError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit">{mode === "add" ? "추가" : "수정"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
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
  const { currentStore } = useStore();
  const currentStoreIndustry = currentStore?.industry;

  const industryParam =
    currentStoreIndustry === "KOREAN"
      ? "KOREAN"
      : currentStoreIndustry === "CHICKEN"
        ? "CHICKEN"
        : undefined;

  const [menuName, setMenuName] = useState("");
  const [price, setPrice] = useState<string>("");

  const [menuNameError, setMenuNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  const [categoryName, setCategoryName] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);

  const [needRestoreSubCategory, setNeedRestoreSubCategory] = useState(false);

  /* =========================
     초기화 (모달 열릴 때)
     ========================= */
  useEffect(() => {
    if (!open) return;

    if (mode === "edit") {
      setMenuName(defaultValues?.menuName ?? "");
      setPrice(defaultValues?.price !== undefined ? String(defaultValues.price) : "");

      // ✅ edit 초기에는 defaultValues가 늦게 올 수 있으니 일단 값 주입(없으면 "")
      const dvCat = (defaultValues?.categoryName ?? "").trim();
      const dvSub = (defaultValues?.subCategoryName ?? "").trim();

      setCategoryName(dvCat);
      setSubCategoryName(dvSub);

      // ✅ category가 있으면 sub 목록 로딩 후 복원 필요
      setNeedRestoreSubCategory(!!dvCat);
    } else {
      setMenuName("");
      setPrice("");
      setCategoryName("");
      setSubCategoryName("");
      setNeedRestoreSubCategory(false);
    }

    setMenuNameError(null);
    setPriceError(null);
  }, [open, mode]); // ✅ defaultValues는 여기 의존성에서 빼서 "늦게 들어오는 값"은 아래 useEffect에서 처리

  /* ==========================================================
     ✅ [핵심] open된 상태에서 defaultValues가 늦게 들어오면 다시 주입
     ========================================================== */
  useEffect(() => {
    if (!open) return;
    if (mode !== "edit") return;
    if (!defaultValues) return;

    const dvCat = (defaultValues.categoryName ?? "").trim();
    const dvSub = (defaultValues.subCategoryName ?? "").trim();

    // ✅ 현재 state가 비어있을 때만 "뒤늦게" 들어온 defaultValues로 채움
    if (!categoryName && dvCat) {
      setCategoryName(dvCat);
      setNeedRestoreSubCategory(true);
    }

    // subCategory는 목록 로딩 후 includes 체크하고 세팅해야 안정적
    if (dvSub && categoryName && !subCategoryName) {
      setNeedRestoreSubCategory(true);
    }
  }, [open, mode, defaultValues, categoryName, subCategoryName]);

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
      // edit 복원 단계가 아니면 소분류 선택 초기화
      if (!needRestoreSubCategory) setSubCategoryName("");
      return;
    }

    menuApi
      .fetchMenuSubCategories(industryParam, categoryName)
      .then((list) => {
        setSubCategories(list);

        if (needRestoreSubCategory) {
          const dv = (defaultValues?.subCategoryName ?? "").trim();
          if (dv && list.includes(dv)) setSubCategoryName(dv);
          else setSubCategoryName("");
          setNeedRestoreSubCategory(false);
        }
      })
      .catch(() => {
        setSubCategories([]);
        setNeedRestoreSubCategory(false);
      });
  }, [categoryName, industryParam, needRestoreSubCategory, defaultValues?.subCategoryName]);

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
              onChange={(e) => {
                setCategoryName(e.target.value);
                setSubCategoryName("");
                setNeedRestoreSubCategory(false);
              }}
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
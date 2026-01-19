// src/modules/aiInsightsC/usePriceOpt.ts
"use client";

import { useState, useEffect } from "react";
import { aiInsightsApi } from "./aiInsightsApi";
import type { MenuItem } from "./aiInsightsTypes";

// ✅ storeId를 인자로 받도록 수정 (기본값 101)
export default function usePriceOpt(storeId: number = 101) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!storeId) return; // storeId가 없으면 실행하지 않음

      try {
        setIsLoading(true);
        // ✅ 에러 해결: storeId를 인자로 전달
        const items = await aiInsightsApi.getMenuItems(storeId);
        setMenuItems(items);
        
        if (items.length > 0) {
          setSelectedMenu(items[0]);
        }
      } catch (error) {
        console.error("Menu items fetch failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [storeId]); // ✅ storeId가 변경될 때마다 재실행

  return {
    menuItems,
    selectedMenu,
    setSelectedMenu,
    isLoading,
  };
}
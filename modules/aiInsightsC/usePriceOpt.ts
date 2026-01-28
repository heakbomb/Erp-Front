// src/modules/aiInsightsC/usePriceOpt.ts
"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/contexts/StoreContext"; // ✅ Context import
import { aiInsightsApi } from "./aiInsightsApi";
import type { MenuItem } from "./aiInsightsTypes";

export default function usePriceOpt() { // ❌ storeId 인자 제거
  const { currentStoreId } = useStore(); // ✅ 동적 Store ID 사용
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentStoreId) return; // ID 없으면 중단

      try {
        setIsLoading(true);
        // ✅ API 호출 시 동적 ID 사용
        const items = await aiInsightsApi.getMenuItems(currentStoreId);
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
  }, [currentStoreId]); 

  return {
    menuItems,
    selectedMenu,
    setSelectedMenu,
    isLoading,
  };
}
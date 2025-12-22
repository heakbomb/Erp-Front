// src/modules/aiInsights/usePriceOpt.ts
"use client";

import { useState, useEffect } from "react";
import { aiInsightsApi } from "./aiInsightsApi";
import type { MenuItem } from "./aiInsightsTypes";

export default function usePriceOpt() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const items = await aiInsightsApi.getMenuItems();
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
  }, []);

  return {
    menuItems,
    selectedMenu,
    setSelectedMenu,
    isLoading,
  };
}
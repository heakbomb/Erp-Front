// contexts/StoreContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Store } from "../lib/types/database";
import { useAuth } from "./AuthContext"; 
// ✅ 1. 올바른 경로에서 fetchStores 임포트
import { fetchStores } from "@/features/owner/stores/services/storesService"; 

interface StoreContextType {
  currentStoreId: number | null; 
  setCurrentStoreId: (id: number | null) => void;
  stores: Store[]; 
  isLoading: boolean; 
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth(); 

  const [stores, setStores] = useState<Store[]>([]);
  const [currentStoreId, setCurrentStoreId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn && user?.role === "OWNER") {
      setIsLoading(true);
      
      fetchStores() // ✅ 2. getMyStores -> fetchStores로 변경
        .then((data) => {
          // ✅ 3. data는 이제 Store[] 타입이므로 타입 에러가 없습니다.
          setStores(data); 
          
          if (data.length > 0 && currentStoreId === null) {
            setCurrentStoreId(data[0].storeId);
          }
        })
        .catch((err) => {
          console.error("StoreContext: 가게 목록 조회 실패", err);
          setStores([]); 
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setStores([]);
      setCurrentStoreId(null);
      setIsLoading(false);
    }
  }, [user, isLoggedIn, currentStoreId]); // ✅ currentStoreId 의존성 추가

  if (user?.role === "OWNER" && isLoading) {
    return null; // 또는 전체 페이지 로딩 스피너
  }
  
  return (
    <StoreContext.Provider 
      value={{ currentStoreId, setCurrentStoreId, stores, isLoading }}
    >
      {children}
    </StoreContext.Provider>
  );
}

/**
 * 사장님 페이지에서 현재 선택된 사업장 ID를 가져오는 훅
 */
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
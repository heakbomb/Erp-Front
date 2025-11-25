// contexts/StoreContext.tsx
"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,          // ✅ 추가
} from "react";
import { Store } from "../lib/types/database";
import { useAuth } from "./AuthContext";
import { fetchStores } from "@/features/owner/stores/services/storesService";

interface StoreContextType {
  // 새 구조
  currentStoreId: number | null;
  setCurrentStoreId: (id: number | null) => void;
  stores: Store[];
  isLoading: boolean;

  // ✅ 예전 코드와 호환용 필드들
  currentStore: Store | null;
  setCurrentStore: (store: Store | null) => void;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth();

  const [stores, setStores] = useState<Store[]>([]);
  const [currentStoreId, setCurrentStoreId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ✅ 로그인 구현 전이라도 항상 한 번은 사업장 목록을 불러온다.
    setIsLoading(true);

    fetchStores()
      .then((data) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStoreId]);

  // ✅ 현재 선택된 store 객체 (예전 currentStore 용)
  const currentStore = useMemo(
    () =>
      currentStoreId != null
        ? stores.find((s) => s.storeId === currentStoreId) ?? null
        : null,
    [stores, currentStoreId]
  );

  // ✅ 예전 setCurrentStore 형태를 currentStoreId 로 연결
  const setCurrentStore = (store: Store | null) => {
    setCurrentStoreId(store ? store.storeId : null);
  };

  if (user?.role === "OWNER" && isLoading) {
    return null; // 또는 전체 페이지 로딩 스피너
  }

  return (
    <StoreContext.Provider
      value={{
        currentStoreId,
        setCurrentStoreId,
        stores,
        isLoading,
        // ✅ 호환용 필드
        currentStore,
        setCurrentStore,
        loading: isLoading,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

/**
 * 사장님 페이지에서 현재 선택된 사업장 정보/ID를 가져오는 훅
 */
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
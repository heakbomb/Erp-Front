// contexts/StoreContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
} from "react";

// ✅ [수정] features -> modules로 경로 변경
import { Store } from "@/modules/storeC/storeTypes";
import { storeApi } from "@/modules/storeC/storeApi";
import { useAuth } from "./AuthContext";

interface StoreContextType {
  currentStoreId: number | null;
  setCurrentStoreId: (id: number | null) => void;
  stores: Store[];
  isLoading: boolean;

  // 예전 코드와 호환용 필드
  currentStore: Store | null;
  setCurrentStore: (store: Store | null) => void;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// 🔹 localStorage key 통일
const STORAGE_KEY = "currentStoreId";

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); // isLoggedIn 제거 (사용 안 함)

  const [stores, setStores] = useState<Store[]>([]);
  const [currentStoreIdState, _setCurrentStoreIdState] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ setter 래핑: state + localStorage 동기화
  const setCurrentStoreId = (id: number | null) => {
    _setCurrentStoreIdState(id);

    if (typeof window !== "undefined") {
      if (id == null) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, String(id));
      }
    }
  };

  useEffect(() => {
    setIsLoading(true);

    // ✅ [수정] storeApi.fetchMyStores 사용
    // user.id가 있으면 사용하고, 없으면 기본값 1 (또는 로직에 맞게 수정)
    // 여기서는 기존 동작 유지를 위해 인자 없이 호출 (기본값 1 사용)하거나 user?.id를 전달
    storeApi.fetchMyStores((user as any)?.id)
      .then((data) => {
        setStores(data);

        if (data.length === 0) {
          // 사업장이 하나도 없으면 선택도 없음
          setCurrentStoreId(null);
          return;
        }

        // ✅ 1) localStorage 에 저장된 선택값 우선 적용
        let restoredId: number | null = null;
        if (typeof window !== "undefined") {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const n = Number(raw);
            if (!Number.isNaN(n) && data.some((s) => s.storeId === n)) {
              restoredId = n;
            }
          }
        }

        if (restoredId != null) {
          setCurrentStoreId(restoredId);
          return;
        }

        // ✅ 2) state 에 남아있던 값이 리스트에 존재하면 그 값 유지
        if (
          currentStoreIdState != null &&
          data.some((s) => s.storeId === currentStoreIdState)
        ) {
          setCurrentStoreId(currentStoreIdState);
          return;
        }

        // ✅ 3) 위 두 가지 모두 아니면 첫 번째 사업장으로 기본 설정
        setCurrentStoreId(data[0].storeId);
      })
      .catch((err) => {
        console.error("StoreContext: 가게 목록 조회 실패", err);
        setStores([]);
        setCurrentStoreId(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // ✅ 현재 선택된 store 객체
  const currentStore = useMemo(
    () =>
      currentStoreIdState != null
        ? stores.find((s) => s.storeId === currentStoreIdState) ?? null
        : null,
    [stores, currentStoreIdState],
  );

  // ✅ 예전 setCurrentStore 형태를 currentStoreId 로 연결
  const setCurrentStore = (store: Store | null) => {
    setCurrentStoreId(store ? store.storeId : null);
  };

  if (user?.role === "OWNER" && isLoading) {
    return null; // 필요하면 로딩 스피너로 교체 가능
  }

  return (
    <StoreContext.Provider
      value={{
        currentStoreId: currentStoreIdState,
        setCurrentStoreId,
        stores,
        isLoading,
        // 호환용
        currentStore,
        setCurrentStore,
        loading: isLoading,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
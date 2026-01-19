"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
} from "react";

import { Store } from "@/modules/storeC/storeTypes";
import { storeApi } from "@/modules/storeC/storeApi";
import { useAuth } from "./AuthContext";

interface StoreContextType {
  currentStoreId: number | null;
  setCurrentStoreId: (id: number | null) => void;
  stores: Store[];
  isLoading: boolean;

  // 호환용
  currentStore: Store | null;
  setCurrentStore: (store: Store | null) => void;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = "currentStoreId";

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [stores, setStores] = useState<Store[]>([]);
  const [currentStoreIdState, _setCurrentStoreIdState] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const setCurrentStoreId = (id: number | null) => {
    _setCurrentStoreIdState(id);

    if (typeof window !== "undefined") {
      if (id == null) window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, String(id));
    }
  };

  useEffect(() => {
    // ✅ OWNER가 아니거나 user가 없으면 조회하지 않음 + 상태 초기화
    if (!user || user.role !== "OWNER") {
      setStores([]);
      setCurrentStoreId(null);
      setIsLoading(false);
      return;
    }

    // ✅ 핵심: id 말고 ownerId 사용 (AuthContext에서 정규화됨)
    const ownerId = (user as any).ownerId;

    // ✅ ownerId가 없으면 무한로딩 방지: 로딩 끄고 종료
    if (!ownerId) {
      setStores([]);
      setCurrentStoreId(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    storeApi
      .fetchMyStores(ownerId)
      .then((data) => {
        setStores(data);

        if (data.length === 0) {
          setCurrentStoreId(null);
          return;
        }

        // 1) localStorage 우선
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

        // 2) 기존 state 유지
        if (
          currentStoreIdState != null &&
          data.some((s) => s.storeId === currentStoreIdState)
        ) {
          setCurrentStoreId(currentStoreIdState);
          return;
        }

        // 3) 기본값 첫 번째
        setCurrentStoreId(data[0].storeId);
      })
      .catch((err) => {
        console.error("StoreContext: 가게 목록 조회 실패", err);
        setStores([]);
        setCurrentStoreId(null);

        // ✅ 사용자 알림(콘솔 오류만 나고 끝나는 것 방지)
        if (typeof window !== "undefined") {
          alert("사업장 목록을 불러오지 못했습니다. 로그인 상태를 확인해주세요.");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    // ✅ 로그인 직후 ownerId가 세팅되는 타이밍을 잡기 위해 deps에 ownerId/role
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(user as any)?.ownerId, user?.role]);

  const currentStore = useMemo(
    () =>
      currentStoreIdState != null
        ? stores.find((s) => s.storeId === currentStoreIdState) ?? null
        : null,
    [stores, currentStoreIdState]
  );

  const setCurrentStore = (store: Store | null) => {
    setCurrentStoreId(store ? store.storeId : null);
  };

  // 기존 동작 유지
  if (user?.role === "OWNER" && isLoading) return null;

  return (
    <StoreContext.Provider
      value={{
        currentStoreId: currentStoreIdState,
        setCurrentStoreId,
        stores,
        isLoading,
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
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import { Store } from "@/modules/storeC/storeTypes";
import { storeApi } from "@/modules/storeC/storeApi";
import { apiClient } from "@/shared/api/apiClient";
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

/**
 * ✅ 변경 포인트(최소):
 * - localStorage 키를 역할/사용자별로 분리해서 OWNER/EMPLOYEE가 서로 storeId를 덮어쓰지 않게 함
 * - 기존 로직/UX는 그대로 유지
 */
const toUpperRole = (r: any) => String(r ?? "").toUpperCase();

const toNumberOrNull = (v: any): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const getStorageKey = (role: string, ownerId: number | null, employeeId: number | null) => {
  // 역할/사용자 단위로 분리 (충돌 방지)
  if (role === "OWNER" && ownerId) return `ownerCurrentStoreId:${ownerId}`;
  if (role === "EMPLOYEE" && employeeId) return `employeeCurrentStoreId:${employeeId}`;
  return null;
};

// ✅ 직원 매장 목록 조회: 네트워크에 찍히던 엔드포인트 기준
async function fetchEmployeeStores(employeeId: number): Promise<Store[]> {
  const res = await apiClient.get<Store[]>(`/employees/${employeeId}/stores`);
  return res.data ?? [];
}

function restoreStoreIdByKey(key: string | null, candidates: Store[]): number | null {
  if (typeof window === "undefined") return null;
  if (!key) return null;

  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  const n = Number(raw);
  if (Number.isNaN(n)) return null;

  return candidates.some((s: any) => (s as any).storeId === n) ? n : null;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, role, ownerId, employeeId, isLoading: authLoading } = useAuth();

  const [stores, setStores] = useState<Store[]>([]);
  const [currentStoreIdState, _setCurrentStoreIdState] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ role/id 추출 (기존 검증 로직 유지하면서, storageKey 계산에만 사용)
  const resolvedRole = useMemo(() => toUpperRole(role ?? user?.role), [role, user?.role]);

  const resolvedOwnerId = useMemo(
    () => toNumberOrNull(ownerId ?? (user as any)?.ownerId),
    [ownerId, user]
  );

  const resolvedEmployeeId = useMemo(
    () => toNumberOrNull(employeeId ?? (user as any)?.employeeId),
    [employeeId, user]
  );

  const storageKey = useMemo(
    () => getStorageKey(resolvedRole, resolvedOwnerId, resolvedEmployeeId),
    [resolvedRole, resolvedOwnerId, resolvedEmployeeId]
  );

  const setCurrentStoreId = useCallback(
    (id: number | null) => {
      _setCurrentStoreIdState(id);

      if (typeof window === "undefined") return;
      if (!storageKey) return;

      if (id == null) window.localStorage.removeItem(storageKey);
      else window.localStorage.setItem(storageKey, String(id));
    },
    [storageKey]
  );

  useEffect(() => {
    // ✅ Auth 로딩 중에는 Store 로딩을 확정하지 않음
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    // ✅ user 없으면 초기화
    if (!user) {
      setStores([]);
      setCurrentStoreId(null);
      setIsLoading(false);
      return;
    }

    const r = resolvedRole;

    // ✅ OWNER / EMPLOYEE 외에는 여기서 매장 조회 대상 아님 (ADMIN 등)
    if (r !== "OWNER" && r !== "EMPLOYEE") {
      setStores([]);
      setCurrentStoreId(null);
      setIsLoading(false);
      return;
    }

    // ✅ role별 식별자 검증 (기존 로직 유지)
    const oid = resolvedOwnerId;
    const eid = resolvedEmployeeId;

    if (r === "OWNER" && !oid) {
      setStores([]);
      setCurrentStoreId(null);
      setIsLoading(false);
      return;
    }
    if (r === "EMPLOYEE" && !eid) {
      setStores([]);
      setCurrentStoreId(null);
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);

    const run = async () => {
      try {
        // ✅ 1) stores 로드
        const data =
          r === "OWNER"
            ? await storeApi.fetchMyStores(oid as number) // 기존 로직 유지
            : await fetchEmployeeStores(eid as number); // 직원용 추가

        if (!mounted) return;

        setStores(data ?? []);

        if (!data || data.length === 0) {
          setCurrentStoreId(null);
          return;
        }

        // ✅ 2) localStorage 우선 (역할/사용자별 키로 복원)
        const restoredId = restoreStoreIdByKey(storageKey, data);
        if (restoredId != null) {
          setCurrentStoreId(restoredId);
          return;
        }

        // ✅ 3) 기존 state 유지(유효할 때만)
        if (
          currentStoreIdState != null &&
          data.some((s: any) => (s as any).storeId === currentStoreIdState)
        ) {
          setCurrentStoreId(currentStoreIdState);
          return;
        }

        // ✅ 4) 기본값 첫 번째
        setCurrentStoreId((data as any)[0].storeId);
      } catch (err) {
        console.error("StoreContext: 가게 목록 조회 실패", err);
        if (!mounted) return;

        setStores([]);
        setCurrentStoreId(null);

        // 기존 OWNER만 alert하던 흐름을 깨고 싶지 않으면 OWNER에서만 alert
        if (typeof window !== "undefined" && r === "OWNER") {
          alert("사업장 목록을 불러오지 못했습니다. 로그인 상태를 확인해주세요.");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
    // ✅ currentStoreIdState는 “유지 판단”에만 쓰고, deps에 넣으면 불필요 재조회 가능
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    authLoading,
    user,
    resolvedRole,
    resolvedOwnerId,
    resolvedEmployeeId,
    storageKey,
    setCurrentStoreId,
  ]);

  const currentStore = useMemo(() => {
    if (currentStoreIdState == null) return null;
    return stores.find((s: any) => (s as any).storeId === currentStoreIdState) ?? null;
  }, [stores, currentStoreIdState]);

  const setCurrentStore = (store: Store | null) => {
    setCurrentStoreId(store ? (store as any).storeId : null);
  };

  // ✅ 기존 동작 유지: OWNER는 store 로딩 완료 전에는 렌더를 막았음
  if (toUpperRole(user?.role) === "OWNER" && isLoading) return null;

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
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};
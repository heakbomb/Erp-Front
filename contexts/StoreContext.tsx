"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Store } from "../lib/types/database";
import { useAuth } from "./AuthContext"; // ✅ 1. AuthContext 훅 임포트
import { getMyStores } from "@/lib/api/store.service"; // ✅ 2. store API 임포트

interface StoreContextType {
  currentStoreId: number | null; 
  setCurrentStoreId: (id: number | null) => void;
  stores: Store[]; // ✅ 3. 사장님의 전체 가게 목록 상태 추가
  isLoading: boolean; // ✅ 4. 데이터 로딩 상태 추가
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth(); // ✅ 5. AuthContext에서 사용자 정보 가져오기

  const [stores, setStores] = useState<Store[]>([]);
  const [currentStoreId, setCurrentStoreId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ 6. 로그인 상태(user)가 변경될 때 API 호출
  useEffect(() => {
    // 로그인했고, 역할이 'OWNER'일 때만 가게 목록을 불러옵니다.
    if (isLoggedIn && user?.role === "OWNER") {
      setIsLoading(true);
      
      getMyStores()
        .then((data) => {
          setStores(data); // API로 불러온 가게 목록을 상태에 저장
          
          // ✅ 7. 현재 선택된 가게가 없으면, 목록의 첫 번째 가게를 기본값으로 설정
          // (주신 DB 데이터 기준 '11'번 가게가 첫 번째가 됩니다)
          if (data.length > 0 && currentStoreId === null) {
            setCurrentStoreId(data[0].storeId);
          }
        })
        .catch((err) => {
          console.error("StoreContext: 가게 목록 조회 실패", err);
          setStores([]); // 실패 시 초기화
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // 로그아웃했거나 사장님이 아니면 초기화
      setStores([]);
      setCurrentStoreId(null);
      setIsLoading(false);
    }
    // currentStoreId는 의존성 배열에서 제외 (사용자가 직접 스토어를 변경할 때 리페치 방지)
  }, [user, isLoggedIn]); 

  // 사장님인데 가게 정보 로딩 중일 때는 하위 페이지(재고, 메뉴 등) 렌더링을 보류
  // (API 호출 시 storeId=null 방지)
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
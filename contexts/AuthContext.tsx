"use client";

import { createContext, useContext, useState, ReactNode } from "react"; // useEffect 제거
import { Employee, Owner } from "../lib/types/database";

// (Admin 타입은 lib/types/database.ts에 추가 필요)
type User = (Owner & { role: "OWNER" }) | (Employee & { role: "EMPLOYEE" });

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ 1. 제공해주신 DB 데이터로 MOCK_OWNER 객체를 생성합니다.
const MOCK_OWNER: User = {
  owner_id: 1,                          // [1]
  username: "dev-owner",                // [6]
  email: "dev@example.com",             // [3]
  created_at: "2025-10-28 18:02:30.000000", // [2]
  role: "OWNER", // (프론트엔드에서 사장님/직원 구분용)
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // ✅ 2. user 상태의 기본값으로 MOCK_OWNER를 즉시 주입
  const [user, setUser] = useState<User | null>(MOCK_OWNER);
  
  // (토큰, login/logout, useEffect 로직 모두 불필요)

  return (
    // ✅ 3. isLoggedIn은 user가 있는지 여부만 판단
    <AuthContext.Provider value={{ user, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 로그인한 사용자 정보를 가져오는 훅
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
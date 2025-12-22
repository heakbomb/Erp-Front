// modules/employeeC/employeeTypes.ts

// 공통 Employee 타입 (shared/types/database가 있다고 가정하거나 여기서 간소화 정의)
export interface Employee {
  employeeId: number;
  name?: string;
  email?: string;
  phone?: string;
  provider?: string;
  provider_id?: string | null;
  createdAt?: string | null;
  // 필요한 경우 추가 필드
}

// 🔹 이 모듈에서만 쓰는 확장 타입: assignmentId 포함
export type StoreEmployee = Employee & { assignmentId?: number | null };

/** 직원-사업장 배정 신청 응답 */
export type PendingRequest = {
  assignmentId: number;
  employeeId: number;
  storeId: number;
  role?: string;
  status?: string;
  name?: string;
  email?: string;
  phone?: string;
  requestedAt?: string;
};

// UI용 배너 타입
export type Banner = { type: "success" | "error"; message: string } | null;
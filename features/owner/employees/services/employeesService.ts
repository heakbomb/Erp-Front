// features/owner/employees/services/employeesService.ts
import axios from "axios"

export const API_BASE = "http://localhost:8080"

export type Employee = {
  employeeId: number
  name: string
  email: string
  phone: string
  provider: string
  createdAt: string
}

/** 직원-사업장 배정 신청 응답(대기/승인/거절 공통) */
export type PendingRequest = {
  assignmentId: number
  employeeId: number
  storeId: number
  role?: string
  status?: string
  name?: string
  email?: string
  phone?: string
  requestedAt?: string
}

export async function fetchEmployees(): Promise<Employee[]> {
  const res = await axios.get<Employee[]>(`${API_BASE}/employees`)
  return res.data || []
}

export async function updateEmployee(payload: {
  employeeId: number
  name: string
  email: string
  phone: string
  provider: string
}) {
  const { employeeId, ...body } = payload
  await axios.put(`${API_BASE}/employees/${employeeId}`, body)
}

export async function deleteEmployee(employeeId: number) {
  await axios.delete(`${API_BASE}/employees/${employeeId}`)
}

/* ───────── Pending(신청/승인/거절) ───────── */
export async function fetchPendingAssignments(storeId: number): Promise<PendingRequest[]> {
  // ✅ 백엔드 컨트롤러: @RequestMapping("/assignments")
  const res = await axios.get<PendingRequest[]>(`${API_BASE}/assignments/pending`, {
    params: { storeId },
  })
  return res.data || []
}

export async function approveAssignment(assignmentId: number) {
  // ✅ POST /assignments/{assignmentId}/approve
  await axios.post(`${API_BASE}/assignments/${assignmentId}/approve`)
}

export async function rejectAssignment(assignmentId: number) {
  // ✅ POST /assignments/{assignmentId}/reject
  await axios.post(`${API_BASE}/assignments/${assignmentId}/reject`)
}

/* ───────── QR(사업장) ───────── */
export async function fetchStoreQr(storeId: number, refresh = false) {
  // (QR 엔드포인트는 기존 페이지와 호환 유지)
  const res = await axios.get(`${API_BASE}/api/store/${storeId}/qr`, {
    params: { refresh },
  })
  return res.data
}

/* ───────── 공용 에러 메시지 ───────── */
export function extractErrorMessage(e: any): string {
  const data = e?.response?.data
  if (typeof data === "string") return data
  if (typeof data?.message === "string") return data.message
  if (typeof data?.error === "string") return data.error
  if (typeof data?.detail === "string") return data.detail
  if (typeof e?.message === "string") return e.message
  return "오류가 발생했습니다."
}
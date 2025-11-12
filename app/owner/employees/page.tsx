"use client"

import EmployeesAll from "@/features/owner/employees/components/EmployeesAll"
import EmployeesAttendance from "@/features/owner/employees/components/EmployeesAttendance"
import EmployeesPending from "@/features/owner/employees/components/EmployeesPending"
import EmployeesQr from "@/features/owner/employees/components/EmployeesQr"

export default function OwnerEmployeesPage() {
  return (
    <div className="space-y-8">
      {/* 상단에 QR 버튼 배치(네 컴포넌트 그대로 사용) */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">직원 관리</h1>
          <p className="text-muted-foreground">직원 정보, 승인/거절, 출결 QR까지 한 화면에서 관리</p>
        </div>
        <EmployeesQr />
      </div>

      {/* 직원 목록(수정/삭제) */}
      <EmployeesAll />

      {/* 신청 대기/최근 승인·거절 */}
      <EmployeesPending />

      {/* 오늘의 출결 현황(준비중 카드) */}
      <EmployeesAttendance />
    </div>
  )
}
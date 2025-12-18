"use client"

import AttendanceDashboard from "@/modules/attendanceC/AttendanceDashboard"

export default function AttendancePage() {
  // modules의 AttendanceDashboard는 사장님/직원 공용으로 사용 가능하도록 설계됨
  // (내부에서 useStore를 통해 현재 매장 ID를 가져와 처리)
  return <AttendanceDashboard />
}
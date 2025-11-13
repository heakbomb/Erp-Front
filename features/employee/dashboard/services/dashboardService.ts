// features/employee/dashboard/services/dashboardService.ts

export type WorkRecord = {
  date: string
  start: string
  end: string
  hours: string
}

export type QuickStats = {
  todayWorkTime: string
  todayStartTime: string
  monthWorkDays: string
  monthWorkHours: string
  expectedSalary: string
  hourlyWage: string
  workStatus: string
  expectedLeaveTime: string
}

export type EmployeeDashboardData = {
  currentWorkplace: string
  quickStats: QuickStats
  recentRecords: WorkRecord[]
}

// 아직은 하드코딩된 더미 데이터 (원래 page.tsx에 있던 값 그대로)
export function getMockEmployeeDashboardData(): EmployeeDashboardData {
  return {
    currentWorkplace: "김사장님의 카페",
    quickStats: {
      todayWorkTime: "5시간 30분",
      todayStartTime: "09:00 출근",
      monthWorkDays: "18일",
      monthWorkHours: "총 144시간",
      expectedSalary: "₩1,440,000",
      hourlyWage: "시급 ₩10,000",
      workStatus: "근무중",
      expectedLeaveTime: "퇴근 예정 18:00",
    },
    recentRecords: [
      { date: "2024-04-19", start: "09:00", end: "18:00", hours: "8시간" },
      { date: "2024-04-18", start: "09:00", end: "18:00", hours: "8시간" },
      { date: "2024-04-17", start: "09:15", end: "18:00", hours: "7시간 45분" },
      { date: "2024-04-16", start: "09:00", end: "17:30", hours: "7시간 30분" },
    ],
  }
}
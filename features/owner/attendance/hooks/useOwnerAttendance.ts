"use client"

import { useState, useMemo } from "react"

export type TodayAttendanceRecord = {
  id: number
  name: string
  role: string
  checkIn: string
  checkOut: string
  status: "근무중" | "휴무" | "퇴근"
  hours: string
}

export type MonthlyStat = {
  name: string
  workDays: number
  totalHours: number
  lateCount: number
  earlyLeaveCount: number
}

export type AttendanceRecord = {
  date: string // YYYY-MM-DD
  employees: number
  status: "normal" | "late" | "early"
}

// ───── 더미 데이터 (원래 page.tsx에 있던 하드코딩 그대로) ─────
const TODAY_ATTENDANCE: TodayAttendanceRecord[] = [
  { id: 1, name: "김직원", role: "주방", checkIn: "09:00", checkOut: "-", status: "근무중", hours: "5.5" },
  { id: 2, name: "이직원", role: "홀", checkIn: "-", checkOut: "-", status: "휴무", hours: "-" },
  { id: 3, name: "박직원", role: "주방", checkIn: "09:15", checkOut: "-", status: "근무중", hours: "5.25" },
  { id: 4, name: "최직원", role: "홀", checkIn: "10:00", checkOut: "-", status: "근무중", hours: "4.5" },
  { id: 5, name: "정직원", role: "주방", checkIn: "09:00", checkOut: "14:00", status: "퇴근", hours: "5" },
]

const MONTHLY_STATS: MonthlyStat[] = [
  { name: "김직원", workDays: 22, totalHours: 176, lateCount: 0, earlyLeaveCount: 0 },
  { name: "이직원", workDays: 20, totalHours: 160, lateCount: 1, earlyLeaveCount: 0 },
  { name: "박직원", workDays: 18, totalHours: 144, lateCount: 2, earlyLeaveCount: 1 },
  { name: "최직원", workDays: 21, totalHours: 168, lateCount: 0, earlyLeaveCount: 0 },
  { name: "정직원", workDays: 19, totalHours: 152, lateCount: 1, earlyLeaveCount: 0 },
]

const ATTENDANCE_RECORDS: AttendanceRecord[] = [
  { date: "2024-04-19", employees: 4, status: "normal" },
  { date: "2024-04-18", employees: 5, status: "normal" },
  { date: "2024-04-17", employees: 4, status: "late" },
  { date: "2024-04-16", employees: 5, status: "normal" },
  { date: "2024-04-15", employees: 4, status: "normal" },
  { date: "2024-04-12", employees: 5, status: "normal" },
  { date: "2024-04-11", employees: 4, status: "early" },
  { date: "2024-04-10", employees: 5, status: "normal" },
]

// 날짜 관련 유틸
function dateToKey(date: Date): string {
  return date.toISOString().split("T")[0]
}

function hasAttendance(date: Date): boolean {
  const key = dateToKey(date)
  return ATTENDANCE_RECORDS.some((r) => r.date === key)
}

function getAttendanceStatus(date: Date): AttendanceRecord["status"] | undefined {
  const key = dateToKey(date)
  return ATTENDANCE_RECORDS.find((r) => r.date === key)?.status
}

export default function useOwnerAttendance() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  const workingNow = useMemo(
    () => TODAY_ATTENDANCE.filter((a) => a.status === "근무중").length,
    []
  )

  return {
    date,
    setDate,
    workingNow,
    todayAttendance: TODAY_ATTENDANCE,
    monthlyStats: MONTHLY_STATS,
    attendanceRecords: ATTENDANCE_RECORDS,
    hasAttendance,
    getAttendanceStatus,
  }
}
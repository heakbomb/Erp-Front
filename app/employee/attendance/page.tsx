"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"
import type { DayContentProps } from "react-day-picker"

const mockAttendance = [
  { date: "2024-04-19", start: "09:00", end: "18:00", hours: "8시간", status: "정상" },
  { date: "2024-04-18", start: "09:00", end: "18:00", hours: "8시간", status: "정상" },
  { date: "2024-04-17", start: "09:15", end: "18:00", hours: "7시간 45분", status: "지각" },
  { date: "2024-04-16", start: "09:00", end: "17:30", hours: "7시간 30분", status: "조퇴" },
  { date: "2024-04-15", start: "09:00", end: "18:00", hours: "8시간", status: "정상" },
  { date: "2024-04-12", start: "09:00", end: "18:00", hours: "8시간", status: "정상" },
  { date: "2024-04-11", start: "09:00", end: "18:00", hours: "8시간", status: "정상" },
  { date: "2024-04-10", start: "09:00", end: "18:00", hours: "8시간", status: "정상" },
]

const hasAttendance = (date: Date) => {
  const dateStr = date.toISOString().split("T")[0]
  return mockAttendance.some((record) => record.date === dateStr)
}

const getAttendanceStatus = (date: Date) => {
  const dateStr = date.toISOString().split("T")[0]
  const record = mockAttendance.find((r) => r.date === dateStr)
  return record?.status
}

export default function AttendancePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  const renderDayContent = (day: Date) => {
    const hasRecord = hasAttendance(day)
    const status = getAttendanceStatus(day)

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{day.getDate()}</span>
        {hasRecord && (
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
            <div
              className={`w-1 h-1 rounded-full ${
                status === "정상" ? "bg-green-500" : status === "지각" ? "bg-amber-500" : "bg-red-500"
              }`}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">근태 관리</h1>
        <p className="text-muted-foreground">출퇴근 기록을 확인하세요</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>근무 달력</CardTitle>
            <CardDescription>날짜를 선택하여 상세 기록을 확인하세요</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              components={{
                DayContent: ({ date }: DayContentProps) => renderDayContent(date),
              }}
            />
            <div className="w-full p-3 rounded-lg bg-muted space-y-2">
              <p className="text-sm font-medium mb-2">출근 상태 표시</p>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>정상</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>지각</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span>조퇴</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card>
          <CardHeader>
            <CardTitle>이번 달 요약</CardTitle>
            <CardDescription>2024년 4월</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">총 근무일</p>
                <p className="text-2xl font-bold mt-1">18일</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">총 근무시간</p>
                <p className="text-2xl font-bold mt-1">144시간</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">지각</p>
                <p className="text-2xl font-bold mt-1">1회</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">조퇴</p>
                <p className="text-2xl font-bold mt-1">1회</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">예상 급여</p>
              <p className="text-3xl font-bold">₩1,440,000</p>
              <p className="text-xs text-muted-foreground mt-1">시급 ₩10,000 기준</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>최근 출퇴근 기록</CardTitle>
          <CardDescription>최근 30일간의 출퇴근 기록입니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockAttendance.map((record, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm font-medium">{record.date}</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <p className="text-sm font-medium">
                      {record.start} - {record.end}
                    </p>
                    <p className="text-xs text-muted-foreground">{record.hours}</p>
                  </div>
                </div>
                <Badge
                  variant={record.status === "정상" ? "default" : record.status === "지각" ? "secondary" : "outline"}
                >
                  {record.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

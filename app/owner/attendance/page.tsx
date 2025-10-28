"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Clock, Users, AlertCircle, Download, FileText } from "lucide-react"
import type { DayContentProps } from "react-day-picker"

const todayAttendance = [
  { id: 1, name: "김직원", role: "주방", checkIn: "09:00", checkOut: "-", status: "근무중", hours: "5.5" },
  { id: 2, name: "이직원", role: "홀", checkIn: "-", checkOut: "-", status: "휴무", hours: "-" },
  { id: 3, name: "박직원", role: "주방", checkIn: "09:15", checkOut: "-", status: "근무중", hours: "5.25" },
  { id: 4, name: "최직원", role: "홀", checkIn: "10:00", checkOut: "-", status: "근무중", hours: "4.5" },
  { id: 5, name: "정직원", role: "주방", checkIn: "09:00", checkOut: "14:00", status: "퇴근", hours: "5" },
]

const monthlyStats = [
  { name: "김직원", workDays: 22, totalHours: 176, lateCount: 0, earlyLeaveCount: 0 },
  { name: "이직원", workDays: 20, totalHours: 160, lateCount: 1, earlyLeaveCount: 0 },
  { name: "박직원", workDays: 18, totalHours: 144, lateCount: 2, earlyLeaveCount: 1 },
  { name: "최직원", workDays: 21, totalHours: 168, lateCount: 0, earlyLeaveCount: 0 },
  { name: "정직원", workDays: 19, totalHours: 152, lateCount: 1, earlyLeaveCount: 0 },
]

const attendanceRecords = [
  { date: "2024-04-19", employees: 4, status: "normal" },
  { date: "2024-04-18", employees: 5, status: "normal" },
  { date: "2024-04-17", employees: 4, status: "late" },
  { date: "2024-04-16", employees: 5, status: "normal" },
  { date: "2024-04-15", employees: 4, status: "normal" },
  { date: "2024-04-12", employees: 5, status: "normal" },
  { date: "2024-04-11", employees: 4, status: "early" },
  { date: "2024-04-10", employees: 5, status: "normal" },
]

const hasAttendance = (date: Date) => {
  const dateStr = date.toISOString().split("T")[0]
  return attendanceRecords.some((record) => record.date === dateStr)
}

const getAttendanceStatus = (date: Date) => {
  const dateStr = date.toISOString().split("T")[0]
  const record = attendanceRecords.find((r) => r.date === dateStr)
  return record?.status
}

export default function AttendancePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  const workingNow = todayAttendance.filter((a) => a.status === "근무중").length

  const renderDayContent = (day: Date) => {
    const hasRecord = hasAttendance(day)
    const status = getAttendanceStatus(day)

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{day.getDate()}</span>
        {hasRecord && (
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                status === "normal" ? "bg-green-500" : status === "late" ? "bg-amber-500" : "bg-red-500"
              }`}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">근태 관리</h1>
          <p className="text-muted-foreground">직원 출퇴근 현황을 확인하세요</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-transparent">
            <FileText className="mr-2 h-4 w-4" />
            근태 보고서
          </Button>
          <Button variant="outline" className="bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Excel 내보내기
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">현재 근무 중</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workingNow}명</div>
            <p className="text-xs text-muted-foreground">전체 {todayAttendance.length}명</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 출근</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAttendance.filter((a) => a.checkIn !== "-").length}명</div>
            <p className="text-xs text-muted-foreground">출근 완료</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 지각</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4건</div>
            <p className="text-xs text-muted-foreground">전월 대비 -2건</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 근무시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2시간</div>
            <p className="text-xs text-muted-foreground">1일 평균</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">오늘 출결</TabsTrigger>
          <TabsTrigger value="monthly">월간 통계</TabsTrigger>
          <TabsTrigger value="calendar">근무 달력</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>오늘의 출퇴근 현황</CardTitle>
              <CardDescription>2024년 4월 20일 (토)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>출근 시간</TableHead>
                    <TableHead>퇴근 시간</TableHead>
                    <TableHead>근무 시간</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayAttendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.name}</TableCell>
                      <TableCell>{record.role}</TableCell>
                      <TableCell>{record.checkIn}</TableCell>
                      <TableCell>{record.checkOut}</TableCell>
                      <TableCell>{record.hours === "-" ? "-" : `${record.hours}시간`}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.status === "근무중" ? "default" : record.status === "퇴근" ? "secondary" : "outline"
                          }
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>이번 달 근태 통계</CardTitle>
              <CardDescription>2024년 4월 기준</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>근무일수</TableHead>
                    <TableHead>총 근무시간</TableHead>
                    <TableHead>지각</TableHead>
                    <TableHead>조퇴</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyStats.map((stat, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{stat.name}</TableCell>
                      <TableCell>{stat.workDays}일</TableCell>
                      <TableCell>{stat.totalHours}시간</TableCell>
                      <TableCell>
                        {stat.lateCount > 0 ? (
                          <span className="text-amber-600">{stat.lateCount}회</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {stat.earlyLeaveCount > 0 ? (
                          <span className="text-amber-600">{stat.earlyLeaveCount}회</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
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
                      <span>정상 출근</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>지각 발생</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span>조퇴 발생</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>선택한 날짜</CardTitle>
                <CardDescription>{date?.toLocaleDateString("ko-KR")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">김직원</span>
                      <Badge variant="default">정상</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">09:00 - 18:00 (8시간)</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">박직원</span>
                      <Badge variant="secondary">지각</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">09:15 - 18:00 (7시간 45분)</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">최직원</span>
                      <Badge variant="default">정상</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">10:00 - 19:00 (8시간)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

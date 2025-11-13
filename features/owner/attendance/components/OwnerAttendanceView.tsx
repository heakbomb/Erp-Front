
"use client"

import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Clock, Download, FileText, Users } from "lucide-react"
import useOwnerAttendance from "@/features/owner/attendance/hooks/useOwnerAttendance"

export default function OwnerAttendanceView() {
  const {
    date,
    setDate,
    workingNow,
    todayAttendance,
    monthlyStats,
    hasAttendance,
    getAttendanceStatus,
  } = useOwnerAttendance()

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
      {/* 헤더 */}
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

      {/* 상단 카드 통계 */}
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
            <div className="text-2xl font-bold">
              {todayAttendance.filter((a) => a.checkIn !== "-").length}명
            </div>
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

      {/* 탭 */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">오늘 출결</TabsTrigger>
          <TabsTrigger value="monthly">월간 통계</TabsTrigger>
          <TabsTrigger value="calendar">근무 달력</TabsTrigger>
        </TabsList>

        {/* 오늘 출결 */}
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
                            record.status === "근무중"
                              ? "default"
                              : record.status === "퇴근"
                                ? "secondary"
                                : "outline"
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

        {/* 월간 통계 */}
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

        {/* 근무 달력 */}
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
                  // 나중에 dayContent 커스터마이징 필요하면 여기서 renderDayContent 활용 가능
                  // components={{ DayContent: renderDayContent }} 같은 형태(캘린더 구현체에 따라)
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
                {/* 하드코딩 예시 그대로 유지 */}
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
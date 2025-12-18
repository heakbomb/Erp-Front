// modules/attendanceC/AttendanceDashboard.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useAttendance } from "./useAttendance";
import { useStore } from "@/contexts/StoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Calendar } from "@/shared/ui/calendar"; 
import ScheduleGrid from "./ScheduleGrid"; 
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";
import { useShifts } from "./useShifts";
import useEmployeeList from "@/modules/employeeC/useEmployeeList";

// Date 객체를 YYYY-MM-DD 문자열로 변환하는 로컬 헬퍼 함수
const formatYMD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AttendanceDashboard() {
  const { currentStoreId } = useStore();
  const { daily, date, setDate, setStoreId } = useAttendance();

  // ✅ [수정] 스토어 ID 동기화 로직을 useEffect로 이동
  useEffect(() => {
    if (currentStoreId) {
      setStoreId(String(currentStoreId));
    }
  }, [currentStoreId, setStoreId]);

  // --- 스케줄 탭 데이터 준비 ---
  const viewDate = date || new Date();
  
  // 1. 현재 달의 날짜 배열 생성
  const days = useMemo(() => {
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);
    return eachDayOfInterval({ start, end });
  }, [viewDate]);

  // 2. 해당 기간의 시프트 조회
  const range = useMemo(() => ({
    from: format(startOfMonth(viewDate), "yyyy-MM-dd"),
    to: format(endOfMonth(viewDate), "yyyy-MM-dd"),
  }), [viewDate]);
  
  const { data: shifts = [] } = useShifts(range);

  // 3. 직원 목록 조회 (이름 표시용)
  const { employees } = useEmployeeList();

  if (!currentStoreId) return <div>매장을 선택해주세요.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">근태 관리</h1>
        <p className="text-muted-foreground">직원들의 출퇴근 기록과 근무 일정을 관리합니다.</p>
      </div>

      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">일별 출퇴근</TabsTrigger>
          <TabsTrigger value="schedule">근무 스케줄</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-[300px_1fr]">
            <Card>
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader>
                <CardTitle>
                  {date ? formatYMD(date) : "날짜 선택"} 근무 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                {daily.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    기록이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {daily.map((rec) => (
                      <div key={rec.logId} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {rec.employeeId}
                          </div>
                          <div>
                            <p className="font-medium">직원 #{rec.employeeId}</p>
                            <p className="text-sm text-muted-foreground">
                              {rec.recordTime ? new Date(rec.recordTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : "-"} 
                              {rec.recordType === "IN" ? " (출근)" : " (퇴근)"}
                            </p>
                          </div>
                        </div>
                        <div className={`text-sm px-3 py-1 rounded-full ${
                          rec.recordType === "IN" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}>
                          {rec.recordType === "IN" ? "출근" : "퇴근"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          {/* ✅ [수정] 필수 Props 전달 */}
          <ScheduleGrid 
            days={days}
            shifts={shifts}
            employees={employees}
            readOnly={true} // 대시보드에서는 조회 전용
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
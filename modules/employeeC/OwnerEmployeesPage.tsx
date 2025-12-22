"use client";

import Link from "next/link";
import { Users, Clock, UserPlus, CalendarDays } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";

// 하위 컴포넌트들
import EmployeeList from "./EmployeeList";
import EmployeePendingList from "./EmployeePendingList";
// ✅ [복구] EmployeesAttendance 컴포넌트 임포트 (attendanceC 모듈에서 가져옴)
import EmployeesAttendance from "../attendanceC/EmployeesAttendance";

export default function OwnerEmployeesPage() {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* 1. 상단 헤더 영역 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">직원 관리</h1>
          <p className="text-muted-foreground mt-1">
            매장 직원의 목록을 조회하고 배정 신청을 승인하거나 관리합니다.
          </p>
        </div>
        
        {/* 근무 시간표 버튼 */}
        <Link href="/owner/employees/schedule">
          <Button className="w-full sm:w-auto gap-2 shadow-sm">
            <CalendarDays className="h-4 w-4" />
            근무 시간표 관리
          </Button>
        </Link>
      </div>

      {/* 2. 메인 탭 영역 */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="h-auto w-full justify-start gap-2 bg-transparent p-0">
          <TabsTrigger 
            value="list" 
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm border bg-muted/40 px-4 py-2"
          >
            <Users className="mr-2 h-4 w-4" />
            직원 목록
          </TabsTrigger>
          <TabsTrigger 
            value="attendance" 
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm border bg-muted/40 px-4 py-2"
          >
            <Clock className="mr-2 h-4 w-4" />
            출결 현황
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm border bg-muted/40 px-4 py-2"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            신청 대기
          </TabsTrigger>
        </TabsList>

        {/* 탭 컨텐츠 1: 직원 목록 */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>직원 목록</CardTitle>
              <CardDescription>현재 매장에 등록된 직원들의 정보를 확인하고 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeeList />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 탭 컨텐츠 2: 출결 현황 */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>오늘의 출결</CardTitle>
              <CardDescription>실시간 출근/퇴근 현황을 확인합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* ✅ [복구] 컴포넌트 사용 */}
              <EmployeesAttendance />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 탭 컨텐츠 3: 신청 대기 */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>가입 신청 대기</CardTitle>
              <CardDescription>직원이 보낸 매장 합류 요청을 승인하거나 거절합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeePendingList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
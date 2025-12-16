"use client"

import { Card, CardContent } from "@/shared/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs"
import Link from "next/link" // ✅ 추가

import EmployeesAll from "@/features/owner/employees/components/EmployeesAll"
import EmployeesAttendance from "@/features/owner/employees/components/EmployeesAttendance"
import EmployeesPending from "@/features/owner/employees/components/EmployeesPending"
import EmployeesQr from "@/features/owner/employees/components/EmployeesQr"

export default function OwnerEmployeesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-4 lg:space-y-6">
      {/* 페이지 타이틀 영역 + 근무 시간표 버튼 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">직원 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            직원 정보, 승인/거절, 출결, QR 체크인을 한 화면에서 관리하세요.
          </p>
        </div>

        {/* 오른쪽 상단 근무 시간표 버튼 */}
        <Link
          href="/owner/employees/schedule"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
        >
          근무 시간표
        </Link>
      </div>

      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <Tabs defaultValue="employees" className="space-y-3">
            {/* 탭 리스트 - 모바일에서 가로 스크롤 */}
            <div className="flex justify-between items-center">
              <TabsList className="w-full justify-start gap-2 overflow-x-auto">
                <TabsTrigger value="employees" className="whitespace-nowrap">
                  직원 목록
                </TabsTrigger>
                <TabsTrigger value="attendance" className="whitespace-nowrap">
                  출결 현황
                </TabsTrigger>
                <TabsTrigger value="pending" className="whitespace-nowrap">
                  신청 대기
                </TabsTrigger>
              </TabsList>
            </div>

            {/* 직원 목록 */}
            <TabsContent value="employees" className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold sm:text-xl">직원 목록</h2>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  사업장에 등록된 모든 직원 정보를 확인할 수 있습니다.
                </p>
              </div>
              {/* 실제 목록 컴포넌트 */}
              <EmployeesAll />
            </TabsContent>

            {/* 출결 현황 */}
            <TabsContent value="attendance" className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold sm:text-xl">출결 현황</h2>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  직원들의 출근/퇴근 기록과 근무 상태를 확인할 수 있습니다.
                </p>
              </div>
              <EmployeesAttendance />
            </TabsContent>

            {/* 신청 대기 */}
            <TabsContent value="pending" className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold sm:text-xl">신청 대기</h2>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  직원이 사업장 코드를 입력해 신청한 내역입니다. 여기에서 승인 또는 거절을 처리할 수 있습니다.
                </p>
              </div>
              <EmployeesPending />
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
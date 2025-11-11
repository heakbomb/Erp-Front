"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EmployeesAll from "./EmployeesAll"
import EmployeesPending from "./EmployeesPending"
import EmployeesQr from "./EmployeesQr"
import EmployeesAttendance from "./EmployeesAttendance"

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      {/* 위에 제목/설명은 각 컴포넌트에 있어서 여기서는 탭만 */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">전체 직원</TabsTrigger>
          <TabsTrigger value="pending">신청 대기</TabsTrigger>
          <TabsTrigger value="attendance">출결 현황</TabsTrigger>
          <TabsTrigger value="qr">QR 코드</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <EmployeesAll />
        </TabsContent>

        <TabsContent value="pending">
          <EmployeesPending />
        </TabsContent>

        <TabsContent value="attendance">
          <EmployeesAttendance />
        </TabsContent>

        <TabsContent value="qr">
          <EmployeesQr />
        </TabsContent>
      </Tabs>
    </div>
  )
}
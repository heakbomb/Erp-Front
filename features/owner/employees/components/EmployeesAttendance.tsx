"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function EmployeesAttendance() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>오늘의 출결 현황</CardTitle>
          <CardDescription>출결 API 구현 후 연동 예정</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">준비 중…</div>
        </CardContent>
      </Card>
    </div>
  )
}
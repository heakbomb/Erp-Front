"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

const mockPayrollHistory = [
  {
    month: "2024년 3월",
    basePay: 1440000,
    bonus: 100000,
    deductions: 50000,
    netPay: 1490000,
    status: "지급완료",
    paidDate: "2024-04-05",
  },
  {
    month: "2024년 2월",
    basePay: 1360000,
    bonus: 0,
    deductions: 45000,
    netPay: 1315000,
    status: "지급완료",
    paidDate: "2024-03-05",
  },
  {
    month: "2024년 1월",
    basePay: 1520000,
    bonus: 150000,
    deductions: 55000,
    netPay: 1615000,
    status: "지급완료",
    paidDate: "2024-02-05",
  },
]

export default function PayrollPage() {
  const currentWorkplace = "김사장님의 카페"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">급여 내역</h1>
        <p className="text-muted-foreground">급여 지급 내역을 확인하세요 - {currentWorkplace}</p>
      </div>

      {/* Current Month */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>이번 달 예상 급여</CardTitle>
              <CardDescription>2024년 4월 (진행중)</CardDescription>
            </div>
            <Badge variant="secondary">예상</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <span className="text-sm text-muted-foreground">기본급</span>
              <span className="font-medium">₩1,440,000</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <span className="text-sm text-muted-foreground">상여금</span>
              <span className="font-medium">₩0</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <span className="text-sm text-muted-foreground">공제액</span>
              <span className="font-medium text-red-600">-₩50,000</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">예상 실수령액</span>
                <span className="text-2xl font-bold text-primary">₩1,390,000</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>급여 지급 내역</CardTitle>
          <CardDescription>과거 급여 지급 기록입니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockPayrollHistory.map((record, i) => (
              <div key={i} className="p-4 rounded-lg border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{record.month}</h3>
                    <p className="text-sm text-muted-foreground">지급일: {record.paidDate}</p>
                  </div>
                  <Badge variant="default">{record.status}</Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">기본급</span>
                    <span>₩{record.basePay.toLocaleString()}</span>
                  </div>
                  {record.bonus > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">상여금</span>
                      <span className="text-green-600">+₩{record.bonus.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">공제액</span>
                    <span className="text-red-600">-₩{record.deductions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-medium">
                    <span>실수령액</span>
                    <span className="text-primary">₩{record.netPay.toLocaleString()}</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full mt-3 bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  급여명세서 다운로드
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

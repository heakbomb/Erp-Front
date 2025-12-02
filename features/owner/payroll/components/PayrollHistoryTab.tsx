"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type HistoryRecord = {
  month: string
  totalPaid: number
  employees: number
  status: string
}

type Props = {
  history: HistoryRecord[]
}

export default function PayrollHistoryTab({ history }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>급여 지급 내역</CardTitle>
        <CardDescription>과거 급여 지급 기록</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((record, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <h3 className="font-medium">{record.month}</h3>
                <p className="text-sm text-muted-foreground">{record.employees}명 지급</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  ₩{record.totalPaid.toLocaleString()}
                </p>
                <Badge variant="default" className="mt-1">
                  {record.status}
                </Badge>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-sm text-muted-foreground">
              아직 지급 내역이 없습니다.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
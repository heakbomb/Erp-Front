"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import useEmployeesPending from "@/features/owner/employees/hooks/useEmployeesPending"

export default function EmployeesPending() {
  const {
    pending, loadingPending, storeIdForPending,
    recentApproved, recentRejected, banner,
    setStoreIdForPending,
    fetchPending, approve, reject,
  } = useEmployeesPending()

  return (
    <div className="space-y-6">
      {banner && (
        <div
          className={`rounded-md border p-3 text-sm ${
            banner.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {banner.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>신청 대기 중인 직원</CardTitle>
          <CardDescription>사업장 코드로 근무 신청한 직원 목록입니다</CardDescription>

          <div className="mt-3 flex gap-2 items-center">
            <Input
              placeholder="사업장 ID (예: 1)"
              value={storeIdForPending}
              onChange={(e) => setStoreIdForPending(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-40"
            />
            <Button onClick={() => fetchPending()}>조회</Button>
            <Badge variant="secondary" className="ml-2">
              대기 {pending.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loadingPending ? (
            <div className="text-sm text-muted-foreground">불러오는 중…</div>
          ) : pending.length === 0 ? (
            <div className="text-sm text-muted-foreground">신청 대기 내역이 없습니다.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>전화번호</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((r) => (
                  <TableRow key={r.assignmentId}>
                    <TableCell className="font-medium">{r.name ?? `EMP#${r.employeeId}`}</TableCell>
                    <TableCell>{r.email ?? "-"}</TableCell>
                    <TableCell>{r.phone ?? "-"}</TableCell>
                    <TableCell>{r.role ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{r.status ?? "PENDING"}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" onClick={() => approve(r.assignmentId)}>
                        승인
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => reject(r.assignmentId)}>
                        거절
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {(recentApproved.length > 0 || recentRejected.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {recentApproved.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">최근 승인</CardTitle>
                <CardDescription>방금 승인한 직원</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentApproved.map((r) => (
                  <div key={`ap-${r.assignmentId}`} className="flex items-center justify-between rounded border p-3">
                    <div>
                      <div className="font-medium">{r.name ?? `EMP#${r.employeeId}`}</div>
                      <div className="text-xs text-muted-foreground">{r.email ?? "-"}</div>
                    </div>
                    <Badge>APPROVED</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {recentRejected.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">최근 거절</CardTitle>
                <CardDescription>방금 거절한 신청</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentRejected.map((r) => (
                  <div key={`rj-${r.assignmentId}`} className="flex items-center justify-between rounded border p-3">
                    <div>
                      <div className="font-medium">{r.name ?? `EMP#${r.employeeId}`}</div>
                      <div className="text-xs text-muted-foreground">{r.email ?? "-"}</div>
                    </div>
                    <Badge variant="destructive">REJECTED</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
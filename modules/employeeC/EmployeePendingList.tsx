// modules/employeeC/EmployeePendingList.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import useEmployeePending from "./useEmployeePending";

export default function EmployeePendingList() {
  const {
    pending, loadingPending, storeIdForPending, setStoreIdForPending,
    fetchPending, approve, reject, recentApproved, recentRejected, banner
  } = useEmployeePending();

  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="space-y-6">
      {banner && <div className={`p-3 text-sm rounded border ${banner.type==="success"?"bg-green-50 text-green-700":"bg-red-50 text-red-700"}`}>{banner.message}</div>}

      <Card>
        <CardHeader>
          <CardTitle>신청 대기 중인 직원</CardTitle>
          <CardDescription>근무 신청한 직원 목록입니다.</CardDescription>
          <div className="mt-3 flex gap-2 items-center">
            <Input className="w-40" placeholder="사업장 ID" value={storeIdForPending} onChange={e => setStoreIdForPending(e.target.value.replace(/[^0-9]/g, ""))} />
            <Button onClick={() => fetchPending()}>조회</Button>
            <Badge variant="secondary">대기 {pending.length}</Badge>
            <Button variant="outline" size="sm" className="ml-auto" onClick={() => setShowHistory(!showHistory)}>신청 이력 조회</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingPending ? <div>로딩 중...</div> : pending.length === 0 ? <div className="text-sm text-muted-foreground">대기 내역 없음</div> : (
            <Table>
              <TableHeader><TableRow><TableHead>이름</TableHead><TableHead>이메일</TableHead><TableHead>전화</TableHead><TableHead>상태</TableHead><TableHead className="text-right">작업</TableHead></TableRow></TableHeader>
              <TableBody>
                {pending.map(r => (
                  <TableRow key={r.assignmentId}>
                    <TableCell>{r.name || `EMP#${r.employeeId}`}</TableCell>
                    <TableCell>{r.email || "-"}</TableCell>
                    <TableCell>{r.phone || "-"}</TableCell>
                    <TableCell><Badge variant="secondary">{r.status || "PENDING"}</Badge></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" onClick={() => approve(r.assignmentId)}>승인</Button>
                      <Button size="sm" variant="outline" onClick={() => reject(r.assignmentId)}>거절</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showHistory && (recentApproved.length > 0 || recentRejected.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {recentApproved.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">최근 승인</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {recentApproved.map(r => (
                  <div key={r.assignmentId} className="flex justify-between border p-3 rounded">
                    <div><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.email}</div></div>
                    <Badge>APPROVED</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {recentRejected.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">최근 거절</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {recentRejected.map(r => (
                  <div key={r.assignmentId} className="flex justify-between border p-3 rounded">
                    <div><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.email}</div></div>
                    <Badge variant="destructive">REJECTED</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
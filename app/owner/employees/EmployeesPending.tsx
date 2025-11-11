"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const API_BASE = "http://localhost:8080"

type PendingRequest = {
  assignmentId: number
  employeeId: number
  storeId: number
  role?: string
  status?: string
  name?: string
  email?: string
  phone?: string
  requestedAt?: string
}

type Banner = { type: "success" | "error"; message: string } | null

export default function EmployeesPending() {
  const [pending, setPending] = useState<PendingRequest[]>([])
  const [loadingPending, setLoadingPending] = useState(false)
  const [storeIdForPending, setStoreIdForPending] = useState<string>("1")

  const [recentApproved, setRecentApproved] = useState<PendingRequest[]>([])
  const [recentRejected, setRecentRejected] = useState<PendingRequest[]>([])
  const [banner, setBanner] = useState<Banner>(null)

  const bannerShow = (b: Banner) => {
    setBanner(b)
    setTimeout(() => setBanner(null), 2400)
  }

  const fetchPending = async (storeId?: number) => {
    const target = typeof storeId === "number" ? storeId : Number(storeIdForPending)
    if (Number.isNaN(target)) {
      setPending([])
      return
    }
    try {
      setLoadingPending(true)
      const res = await axios.get<PendingRequest[]>(`${API_BASE}/api/assignments/pending`, {
        params: { storeId: target },
      })
      setPending(res.data || [])
    } catch (e: any) {
      console.warn("신청 대기 목록 불러오기 실패, 무시:", e?.response?.data || e?.message)
      setPending([])
    } finally {
      setLoadingPending(false)
    }
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const approve = async (assignmentId: number) => {
    const target = pending.find((p) => p.assignmentId === assignmentId)
    if (!target) return
    setPending((prev) => prev.filter((p) => p.assignmentId !== assignmentId))
    try {
      await axios.post(`${API_BASE}/api/assignments/${assignmentId}/approve`)
      setRecentApproved((prev) => [{ ...target, status: "APPROVED" }, ...prev].slice(0, 8))
      bannerShow({ type: "success", message: `${target.name ?? "직원"} 승인 완료` })
    } catch (e) {
      setPending((prev) => [target, ...prev])
      console.error("승인 실패:", e)
      bannerShow({ type: "error", message: "승인 중 오류가 발생했습니다." })
    }
  }

  const reject = async (assignmentId: number) => {
    const target = pending.find((p) => p.assignmentId === assignmentId)
    if (!target) return
    setPending((prev) => prev.filter((p) => p.assignmentId !== assignmentId))
    try {
      await axios.post(`${API_BASE}/api/assignments/${assignmentId}/reject`)
      setRecentRejected((prev) => [{ ...target, status: "REJECTED" }, ...prev].slice(0, 8))
      bannerShow({ type: "success", message: `${target.name ?? "직원"} 거절 처리` })
    } catch (e) {
      setPending((prev) => [target, ...prev])
      console.error("거절 실패:", e)
      bannerShow({ type: "error", message: "거절 중 오류가 발생했습니다." })
    }
  }

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
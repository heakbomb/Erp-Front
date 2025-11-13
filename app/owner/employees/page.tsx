"use client"

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const API_BASE = "http://localhost:8080"

type Employee = {
  employeeId: number
  name: string
  email: string
  phone: string
  provider: string
  createdAt: string
}

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

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)

  // 신청 대기
  const [pending, setPending] = useState<PendingRequest[]>([])
  const [loadingPending, setLoadingPending] = useState(false)

  // 🔹 사업장별 조회 입력 (테스트용)
  const [storeIdForPending, setStoreIdForPending] = useState<string>("1")

  // ✅ 최근 처리 내역
  const [recentApproved, setRecentApproved] = useState<PendingRequest[]>([])
  const [recentRejected, setRecentRejected] = useState<PendingRequest[]>([])

  // ✅ 화면 상단 배너
  const [banner, setBanner] = useState<Banner>(null)

  // 수정/삭제 관련 상태
  const [openEdit, setOpenEdit] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", provider: "" })
  const [saving, setSaving] = useState(false)

  const [openDelete, setOpenDelete] = useState(false)
  const [targetToDelete, setTargetToDelete] = useState<Employee | null>(null)

  // 직원 목록 조회
  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const res = await axios.get<Employee[]>(`${API_BASE}/employees`)
      setEmployees(res.data || [])
    } catch (e) {
      console.error("직원 목록 불러오기 실패:", e)
      alert("직원 목록을 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }

  // 신청 대기 목록 조회 (사업장별)
  const fetchPending = async (storeId?: number) => {
    const target = typeof storeId === "number" ? storeId : Number(storeIdForPending)
    if (Number.isNaN(target)) {
      setPending([])
      return
    }
    try {
      setLoadingPending(true)
      const res = await axios.get<PendingRequest[]>(`${API_BASE}/assignments/pending`, { params: { storeId: target } })
      setPending(res.data || [])
    } catch (e) {
      console.error("신청 대기 목록 불러오기 실패:", e)
      setPending([])
    } finally {
      setLoadingPending(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
    fetchPending()
  }, [])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return employees
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.phone.toLowerCase().includes(q) ||
        (e.provider || "").toLowerCase().includes(q),
    )
  }, [employees, searchQuery])

  const openEditDialog = (emp: Employee) => {
    setEditingId(emp.employeeId)
    setEditForm({
      name: emp.name ?? "",
      email: emp.email ?? "",
      phone: emp.phone ?? "",
      provider: emp.provider ?? "",
    })
    setOpenEdit(true)
  }

  const handleUpdate = async () => {
    if (!editingId) return
    if (!editForm.name.trim() || !editForm.email.trim() || !editForm.phone.trim() || !editForm.provider.trim()) {
      alert("이름/이메일/전화/Provider는 필수입니다.")
      return
    }
    try {
      setSaving(true)
      await axios.put(`${API_BASE}/api/employees/${editingId}`, {
        employeeId: editingId,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        provider: editForm.provider,
      })
      setOpenEdit(false)
      setEditingId(null)
      await fetchEmployees()
      bannerShow({ type: "success", message: "직원 정보가 수정되었습니다." })
    } catch (e: any) {
      console.error("직원 수정 실패:", e)
      const msg = e?.response?.data?.message || e?.message || "수정 중 오류가 발생했습니다."
      bannerShow({ type: "error", message: String(msg) })
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!targetToDelete) return
    try {
      await axios.delete(`${API_BASE}/employees/${targetToDelete.employeeId}`)
      setOpenDelete(false)
      await fetchEmployees()
      bannerShow({ type: "success", message: "직원이 삭제되었습니다." })
    } catch (e) {
      console.error("직원 삭제 실패:", e)
      bannerShow({ type: "error", message: "삭제 중 오류가 발생했습니다." })
    }
  }

  // ✅ 간단 배너 헬퍼
  const bannerShow = (b: Banner) => {
    setBanner(b)
    setTimeout(() => setBanner(null), 2400)
  }

  // ✅ 승인/거절 (낙관적 업데이트 + 롤백)
  const approve = async (assignmentId: number) => {
    const target = pending.find((p) => p.assignmentId === assignmentId)
    if (!target) return
    // 낙관적 제거
    setPending((prev) => prev.filter((p) => p.assignmentId !== assignmentId))
    try {
      await axios.post(`${API_BASE}/assignments/${assignmentId}/approve`)
      setRecentApproved((prev) => [{ ...target, status: "APPROVED" }, ...prev].slice(0, 8))
      // 직원 목록도 갱신(선택)
      fetchEmployees()
      bannerShow({ type: "success", message: `${target.name ?? "직원"} 승인 완료` })
    } catch (e) {
      // 롤백
      setPending((prev) => [target, ...prev])
      console.error("승인 실패:", e)
      bannerShow({ type: "error", message: "승인 중 오류가 발생했습니다." })
    }
  }

  const reject = async (assignmentId: number) => {
    const target = pending.find((p) => p.assignmentId === assignmentId)
    if (!target) return
    // 낙관적 제거
    setPending((prev) => prev.filter((p) => p.assignmentId !== assignmentId))
    try {
      await axios.post(`${API_BASE}/assignments/${assignmentId}/reject`)
      setRecentRejected((prev) => [{ ...target, status: "REJECTED" }, ...prev].slice(0, 8))
      bannerShow({ type: "success", message: `${target.name ?? "직원"} 거절 처리` })
    } catch (e) {
      // 롤백
      setPending((prev) => [target, ...prev])
      console.error("거절 실패:", e)
      bannerShow({ type: "error", message: "거절 중 오류가 발생했습니다." })
    }
  }

  const formatDate = (iso?: string) => (iso ? iso.slice(0, 10) : "-")

  return (
    <div className="space-y-6">
      {/* ✅ 상단 배너 */}
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">직원 관리</h1>
          <p className="text-muted-foreground">직원 정보와 출결 현황을 관리하세요</p>
        </div>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">전체 직원</TabsTrigger>
          <TabsTrigger value="pending">
            신청 대기
            <Badge variant="destructive" className="ml-2">
              {pending.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="attendance">출결 현황</TabsTrigger>
        </TabsList>

        {/* 직원 목록 */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>직원 목록</CardTitle>
                  <CardDescription>전체 {employees.length}명의 직원이 등록되어 있습니다</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="직원 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-muted-foreground">불러오는 중…</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>전화번호</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>가입일</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((e) => (
                      <TableRow key={e.employeeId}>
                        <TableCell className="font-medium">{e.name}</TableCell>
                        <TableCell>{e.email}</TableCell>
                        <TableCell>{e.phone}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{e.provider}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(e.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="작업 메뉴 열기">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-28">
                              <DropdownMenuItem onClick={() => openEditDialog(e)}>수정</DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => {
                                  setTargetToDelete(e)
                                  setOpenDelete(true)
                                }}
                              >
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                          검색 결과가 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 신청 대기 (사업장별) */}
        <TabsContent value="pending" className="space-y-4">
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
                <Badge variant="secondary" className="ml-2">대기 {pending.length}</Badge>
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
                          <Button size="sm" onClick={() => approve(r.assignmentId)}>승인</Button>
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

          {/* ✅ 최근 처리 내역 */}
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
        </TabsContent>

        {/* 출결 탭(보류) */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>오늘의 출결 현황</CardTitle>
              <CardDescription>출결 API 구현 후 연동 예정</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">준비 중…</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 수정 다이얼로그 */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>직원 정보 수정</DialogTitle>
            <DialogDescription>이름, 이메일, 전화번호, Provider를 변경할 수 있습니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>이름</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>이메일</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>전화번호</Label>
              <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Provider</Label>
              <Input
                value={editForm.provider}
                onChange={(e) => setEditForm({ ...editForm, provider: e.target.value })}
                placeholder="google / kakao / naver ..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              취소
            </Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>직원 삭제</DialogTitle>
            <DialogDescription>
              {targetToDelete ? (
                <>
                  <span className="font-medium">{targetToDelete.name}</span> ({targetToDelete.email}) 직원을 정말
                  삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </>
              ) : (
                "선택한 직원을 삭제하시겠습니까?"
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              취소
            </Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={confirmDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
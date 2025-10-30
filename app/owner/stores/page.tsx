"use client"

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Store, MapPin, Phone, Mail, Edit, Trash2, Copy } from "lucide-react"

type StoreType = {
  storeId: number
  bizId?: number
  storeName: string
  industry: string
  posVendor: string | null
  status: string
  approvedAt?: string | null
}

const API_BASE = "http://localhost:8080"

function statusToKorean(status?: string) {
  switch (status) {
    case "APPROVED":
      return "승인됨"
    case "PENDING":
      return "대기"
    case "REJECTED":
      return "거절됨"
    case "ACTIVE":
    case "OPERATING":
      return "운영중"
    default:
      return status ?? "-"
  }
}

// 에러 메시지 안전 추출
function extractErrorMessage(e: any): string {
  const data = e?.response?.data
  if (typeof data === "string") return data
  if (typeof data?.message === "string") return data.message
  if (typeof data?.error === "string") return data.error
  if (typeof data?.detail === "string") return data.detail
  if (data && typeof data === "object") {
    try {
      return JSON.stringify(data)
    } catch {
      /* noop */
    }
  }
  if (typeof e?.message === "string") return e.message
  return "유효하지 않은 사업자번호이거나 서버 오류가 발생했습니다."
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreType[]>([])
  const [loading, setLoading] = useState(false)

  // 추가 모달
  const [openAdd, setOpenAdd] = useState(false)
  const [addForm, setAddForm] = useState({
    bizId: "",
    storeName: "",
    industry: "",
    posVendor: "",
  })
  const [savingAdd, setSavingAdd] = useState(false)

  // 수정 모달
  const [openEdit, setOpenEdit] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    bizId: "",
    storeName: "",
    industry: "",
    posVendor: "",
  })
  const [savingEdit, setSavingEdit] = useState(false)

  // 사업자 인증
  const [openVerify, setOpenVerify] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifyForm, setVerifyForm] = useState({ bizNo: "", phone: "" })
  const [verifiedInfo, setVerifiedInfo] = useState<any | null>(null)
  const [verifyError, setVerifyError] = useState<string>("")

  const fetchStores = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_BASE}/api/store`)
      setStores(res.data)
    } catch (e) {
      console.error("사업장 목록 불러오기 실패:", e)
      alert("사업장 목록을 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStores()
  }, [])

  // 사업자번호 인증
  const handleVerifyBiz = async () => {
    if (!verifyForm.bizNo.trim()) {
      alert("사업자번호를 입력하세요. (‘-’ 없이 10자리)")
      return
    }
    try {
      setVerifying(true)
      setVerifyError("")
      const res = await axios.post(`${API_BASE}/api/business-number/verify`, {
        bizNo: verifyForm.bizNo,
        phone: verifyForm.phone || "",
      })
      const bn = res.data
      if (!bn || typeof bn.bizId !== "number") {
        setVerifyError("인증은 완료됐지만 응답 형식이 예상과 다릅니다.")
      } else {
        setAddForm((p) => ({ ...p, bizId: String(bn.bizId) }))
        setVerifiedInfo(bn)
        alert("✅ 사업자 인증이 완료되었습니다.")
        setOpenVerify(false)
      }
    } catch (e: any) {
      const msg = extractErrorMessage(e)
      setVerifyError(msg)
      setVerifiedInfo(null)
    } finally {
      setVerifying(false)
    }
  }

  // CRUD
  const handleCopyCode = (id: number) => {
    navigator.clipboard.writeText(String(id))
    alert("사업장 코드가 복사되었습니다!")
  }

  // ✅ 삭제 호출 개선: id 정규화 + query param(force) 사용 + 상세 에러 표시
  const handleDelete = async (id: number) => {
    if (!confirm("정말로 삭제하시겠습니까?")) return
    try {
      // 혹시 문자열로 넘어온 경우 대비(16:1 같은 형태 방지)
      const storeId = Number(String(id).replace(/[^0-9]/g, ""))
      if (!Number.isFinite(storeId)) {
        alert("잘못된 사업장 ID 입니다.")
        return
      }

      // 우선 안전 삭제(자식 있으면 409 메시지 받음)
      try {
        await axios.delete(`${API_BASE}/api/store/${storeId}`, { params: { force: false } })
      } catch (err: any) {
        // 자식 레코드로 인해 차단되면 안내 후 강제 삭제 선택
        const status = err?.response?.status
        const msg = extractErrorMessage(err)
        if (status === 409) {
          const goForce = confirm(`${msg}\n\n강제 삭제를 진행할까요? (관련 신청/배정 먼저 정리 후 삭제)`)
          if (!goForce) return
          await axios.delete(`${API_BASE}/api/store/${storeId}`, { params: { force: true } })
        } else {
          throw err
        }
      }

      await fetchStores()
      alert("삭제되었습니다.")
    } catch (e: any) {
      console.error("사업장 삭제 실패:", e)
      const msg = extractErrorMessage(e)
      alert(msg)
    }
  }

  const handleCreate = async () => {
    if (!addForm.bizId.trim() || !addForm.storeName.trim() || !addForm.industry.trim()) {
      alert("사업자 ID, 사업장명, 업종은 필수입니다.")
      return
    }
    try {
      setSavingAdd(true)
      await axios.post(`${API_BASE}/api/store`, {
        bizId: Number(addForm.bizId),
        storeName: addForm.storeName,
        industry: addForm.industry,
        posVendor: addForm.posVendor || null,
      })
      setOpenAdd(false)
      setAddForm({ bizId: "", storeName: "", industry: "", posVendor: "" })
      await fetchStores()
      alert("사업장이 추가되었습니다.")
    } catch (e) {
      console.error("사업장 추가 실패:", e)
      alert("추가 중 오류가 발생했습니다.")
    } finally {
      setSavingAdd(false)
    }
  }

  const openEditModal = (s: StoreType) => {
    setEditingId(s.storeId)
    setEditForm({
      bizId: s.bizId ? String(s.bizId) : "",
      storeName: s.storeName ?? "",
      industry: s.industry ?? "",
      posVendor: s.posVendor ?? "",
    })
    setOpenEdit(true)
  }

  const handleUpdate = async () => {
    if (!editingId) return
    if (!editForm.bizId.trim() || !editForm.storeName.trim() || !editForm.industry.trim()) {
      alert("사업자 ID, 사업장명, 업종은 필수입니다.")
      return
    }
    try {
      setSavingEdit(true)
      await axios.put(`${API_BASE}/api/store/${editingId}`, {
        bizId: Number(editForm.bizId),
        storeName: editForm.storeName,
        industry: editForm.industry,
        posVendor: editForm.posVendor || null,
      })
      setOpenEdit(false)
      setEditingId(null)
      await fetchStores()
      alert("수정되었습니다.")
    } catch (e) {
      console.error("사업장 수정 실패:", e)
      alert("수정 중 오류가 발생했습니다.")
    } finally {
      setSavingEdit(false)
    }
  }

  const hasData = useMemo(() => stores && stores.length > 0, [stores])

  return (
    <div className="space-y-6">
      {/* 인증 결과 카드 */}
      {verifiedInfo && (
        <Card className="border border-green-500/40 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700">사업자 인증 결과</CardTitle>
            <CardDescription>국세청 인증을 통해 확인된 사업자 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><b>사업자번호:</b> {verifiedInfo.bizNo}</p>
            <p><b>상태:</b> {verifiedInfo.openStatus}</p>
            <p><b>과세유형:</b> {verifiedInfo.taxType}</p>
            <p className="text-xs text-muted-foreground">(사업자 ID: {verifiedInfo.bizId})</p>
          </CardContent>
        </Card>
      )}

      {/* 헤더 + 버튼들 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">사업장 관리</h1>
          <p className="text-muted-foreground">등록된 사업장 정보를 관리하세요</p>
        </div>

        <div className="flex items-center gap-2">
          {/* 사업자 인증 다이얼로그 */}
          <Dialog open={openVerify} onOpenChange={setOpenVerify}>
            <DialogTrigger asChild>
              <Button variant="outline">사업자 인증</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>사업자 번호 인증</DialogTitle>
                <DialogDescription>
                  국세청 Open API로 진위여부 검증 후 DB에 저장합니다.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="verify-bizNo">사업자번호(‘-’ 없이 10자리)</Label>
                  <Input
                    id="verify-bizNo"
                    inputMode="numeric"
                    value={verifyForm.bizNo}
                    onChange={(e) =>
                      setVerifyForm((p) => ({
                        ...p,
                        bizNo: e.target.value.replace(/[^0-9]/g, ""),
                      }))
                    }
                    placeholder="예) 1234567890"
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verify-phone">전화번호</Label>
                  <Input
                    id="verify-phone"
                    value={verifyForm.phone}
                    onChange={(e) =>
                      setVerifyForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="예) 010-1234-5678"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  ✅ 인증 성공 시 DB에 저장되고, 추가 폼의 사업자 ID가 자동으로 채워집니다.
                </p>

                {verifyError && (
                  <p className="text-sm text-red-600 whitespace-pre-wrap">
                    {verifyError}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenVerify(false)}>
                  닫기
                </Button>
                <Button onClick={handleVerifyBiz} disabled={verifying}>
                  {verifying ? "인증 중..." : "인증 후 저장"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* 사업장 추가 다이얼로그 */}
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button>
                <Store className="mr-2 h-4 w-4" />
                사업장 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>사업장 추가</DialogTitle>
                <DialogDescription>새로운 사업장 정보를 입력하세요</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="add-bizId">사업자 ID</Label>
                  <Input
                    id="add-bizId"
                    type="number"
                    value={addForm.bizId}
                    onChange={(e) => setAddForm((p) => ({ ...p, bizId: e.target.value }))}
                    placeholder="예) 1001"
                  />
                  <p className="text-xs text-muted-foreground">
                    사업자 번호를 아직 인증하지 않았다면 <span className="font-medium">오른쪽 상단의 ‘사업자 인증’</span>을 먼저 진행하세요.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-storeName">사업장명</Label>
                  <Input
                    id="add-storeName"
                    value={addForm.storeName}
                    onChange={(e) => setAddForm((p) => ({ ...p, storeName: e.target.value }))}
                    placeholder="예) DEV 기본 매장"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-industry">업종</Label>
                  <Input
                    id="add-industry"
                    value={addForm.industry}
                    onChange={(e) => setAddForm((p) => ({ ...p, industry: e.target.value }))}
                    placeholder="예) CAFE / KOREAN / etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-posVendor">POS 시스템(선택)</Label>
                  <Input
                    id="add-posVendor"
                    value={addForm.posVendor}
                    onChange={(e) => setAddForm((p) => ({ ...p, posVendor: e.target.value }))}
                    placeholder="예) 포스시스템A"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenAdd(false)}>
                  취소
                </Button>
                <Button onClick={handleCreate} disabled={savingAdd}>
                  {savingAdd ? "저장 중..." : "추가"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 카드 리스트 */}
      <div className="grid gap-6 md:grid-cols-2">
        {hasData &&
          stores.map((store) => (
            <Card key={store.storeId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{store.storeName}</CardTitle>
                      <CardDescription>{store.industry}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="default">{statusToKorean(store.status)}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 사업장 코드 */}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">사업장 코드</p>
                      <p className="font-mono font-bold text-primary">{store.storeId}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleCopyCode(store.storeId)}>
                      <Copy className="h-4 w-4 mr-1" />
                      복사
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 직원에게 이 코드를 공유하여 근무 신청을 받으세요
                  </p>
                </div>

                {/* 간단 정보 (주소/전화/메일은 아직 없음 → POS만) */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">POS {store.posVendor ? store.posVendor : "미등록"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm opacity-50">
                    <Phone className="h-4 w-4" />
                    <span className="text-muted-foreground">전화번호 필드 없음</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm opacity-50">
                    <Mail className="h-4 w-4" />
                    <span className="text-muted-foreground">이메일 필드 없음</span>
                  </div>
                </div>

                {/* 액션 */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => openEditModal(store)}>
                    <Edit className="mr-2 h-4 w-4" />
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => handleDelete(store.storeId)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

        {!hasData && !loading && (
          <div className="text-sm text-muted-foreground">등록된 사업장이 없습니다. 오른쪽 상단에서 추가하세요.</div>
        )}
        {loading && <div className="text-sm text-muted-foreground">불러오는 중…</div>}
      </div>

      {/* 수정 모달 */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사업장 수정</DialogTitle>
            <DialogDescription>사업장 정보를 변경합니다</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-bizId">사업자 ID</Label>
              <Input
                id="edit-bizId"
                type="number"
                value={editForm.bizId}
                onChange={(e) => setEditForm((p) => ({ ...p, bizId: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-storeName">사업장명</Label>
              <Input
                id="edit-storeName"
                value={editForm.storeName}
                onChange={(e) => setEditForm((p) => ({ ...p, storeName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-industry">업종</Label>
              <Input
                id="edit-industry"
                value={editForm.industry}
                onChange={(e) => setEditForm((p) => ({ ...p, industry: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-posVendor">POS 시스템(선택)</Label>
              <Input
                id="edit-posVendor"
                value={editForm.posVendor}
                onChange={(e) => setEditForm((p) => ({ ...p, posVendor: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              취소
            </Button>
            <Button onClick={handleUpdate} disabled={savingEdit}>
              {savingEdit ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
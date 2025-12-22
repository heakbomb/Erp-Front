// modules/storeC/StoreList.tsx
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Store, MapPin, Edit, Trash2, Copy, RefreshCcw, Plus, ShieldCheck } from "lucide-react"

import { useStores } from "./useStores"
import NaverMapPicker from "./NaverMapPicker"
import { extractErrorMessage } from "./storeApi"
import type { StoreType } from "./storeTypes"
import StoreAdd from "./StoreAdd"
import StoreVerifyDialog from "./StoreVerifyDialog"

const formatStoreStatus = (status: string) => {
  switch (status) {
    case "APPROVED": return "승인됨";
    case "PENDING": return "승인 대기";
    case "REJECTED": return "거절됨";
    default: return status;
  }
};

export default function StoreList({
  version,
  onChangedAction,
}: {
  version?: number
  onChangedAction?: () => void
}) {
  const {
    stores,
    loading,
    hasData,
    softDelete,
    reactivate,
    patch,
    reload
  } = useStores(version)

  const isInactive = (s: StoreType) => s.active === false
  const [showInactiveOnly, setShowInactiveOnly] = useState(false)

  const visibleStores = useMemo(
    () =>
      showInactiveOnly
        ? stores.filter((s) => isInactive(s))
        : stores.filter((s) => !isInactive(s)),
    [stores, showInactiveOnly],
  )

  const hasVisible = visibleStores.length > 0

  const [openEdit, setOpenEdit] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    bizId: "",
    storeName: "",
    industry: "",
    posVendor: "",
    latitude: "",
    longitude: "",
  })
  const [savingEdit, setSavingEdit] = useState(false)
  const [openEditMap, setOpenEditMap] = useState(false)

  const maxLen = 20

  const handleCopy = (id: number) => {
    navigator.clipboard.writeText(String(id))
    alert("사업장 코드가 복사되었습니다!")
  }

  const handleDelete = async (id: number) => {
    if (!confirm("정말로 이 사업장을 비활성화하시겠습니까?")) return

    try {
      await softDelete(id)
      alert("사업장이 비활성화되었습니다.")
      onChangedAction?.()
    } catch (err: any) {
      console.error("사업장 비활성화 실패:", err)
      const status = err?.response?.status

      if (status === 409) {
        alert(
          "이 사업장에는 근무배정(직원 연결) 정보가 있어 비활성화할 수 없습니다.\n" +
            "근무 기록 보호를 위해 관리자에게 요청해 주세요.",
        )
        return
      }
      alert(extractErrorMessage(err))
    }
  }

  const handleActivate = async (id: number) => {
    if (!confirm("이 사업장을 다시 활성화하시겠습니까?")) return

    try {
      await reactivate(id)
      alert("사업장이 다시 활성화되었습니다.")
      onChangedAction?.()
    } catch (err: any) {
      console.error("사업장 활성화 실패:", err)
      alert(extractErrorMessage(err))
    }
  }

  const openEditModal = (s: StoreType) => {
    setEditingId(s.storeId)
    setEditForm({
      bizId: s.bizId ? String(s.bizId) : "",
      storeName: s.storeName ?? "",
      industry: s.industry ?? "",
      posVendor: s.posVendor ?? "",
      latitude: s.latitude != null ? String(s.latitude) : "",
      longitude: s.longitude != null ? String(s.longitude) : "",
    })
    setOpenEdit(true)
  }

  const handleUpdate = async () => {
    if (!editingId) return

    const missing: string[] = []
    if (!editForm.storeName.trim()) missing.push("사업장명")
    if (!editForm.industry.trim()) missing.push("업종")
    if (!editForm.latitude.trim()) missing.push("위도")
    if (!editForm.longitude.trim()) missing.push("경도")

    if (missing.length > 0) {
      alert(`다음 항목을 입력해 주세요:\n\n- ${missing.join("\n- ")}`)
      return
    }

    try {
      setSavingEdit(true)
      await patch(editingId, {
        bizId: Number(editForm.bizId),
        storeName: editForm.storeName,
        industry: editForm.industry,
        posVendor: editForm.posVendor || null,
        latitude: Number(editForm.latitude),
        longitude: Number(editForm.longitude),
      })
      setOpenEdit(false)
      setEditingId(null)
      onChangedAction?.()
    } catch (e) {
      console.error("사업장 수정 실패:", e)
      alert(`수정 중 오류가 발생했습니다: ${extractErrorMessage(e)}`)
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <>
      {/* ✅ [수정] 버튼 배치 변경
          1. flex-col, items-end로 우측 정렬 및 세로 배치
          2. 필터 버튼을 위로(첫 번째 요소)
          3. 기능 버튼 그룹을 아래로(두 번째 요소)
      */}
      <div className="flex flex-col items-end gap-2 mb-6">
        {/* 1. 필터 버튼 (상단) */}
        <Button
          variant={showInactiveOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowInactiveOnly((prev) => !prev)}
        >
          {showInactiveOnly ? "활성 사업장 보기" : "비활성화된 사업장 보기"}
        </Button>

        {/* 2. 기능 버튼 그룹 (하단) */}
        <div className="flex gap-2">
            <StoreVerifyDialog 
                trigger={
                    <Button variant="outline">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        사업자 인증
                    </Button>
                }
            />
            <StoreAdd 
                trigger={
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        매장 추가
                    </Button>
                }
                onCreatedAction={() => {
                    reload();
                    onChangedAction?.();
                }}
            />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {hasVisible &&
          visibleStores.map((store) => (
            <Card
              key={store.storeId}
              className={isInactive(store) ? "opacity-60" : ""}
            >
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
                  <Badge
                    variant="outline"
                    className={
                      store.status === "APPROVED"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : store.status === "REJECTED"
                        ? "bg-red-100 text-red-700 border-red-300"
                        : "bg-yellow-100 text-yellow-700 border-yellow-300"
                    }
                  >
                    {formatStoreStatus(store.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">사업장 코드</p>
                      <p className="font-mono font-bold text-primary">{store.storeId}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleCopy(store.storeId)}>
                      <Copy className="h-4 w-4 mr-1" />
                      복사
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 직원에게 이 코드를 공유하여 근무 신청을 받으세요
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Store className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">
                      사업자번호: {store.bizNum ?? "-"}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">
                      POS {store.posVendor ? store.posVendor : "미등록"}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">
                      lat: {store.latitude ?? "-"}, lng: {store.longitude ?? "-"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => openEditModal(store)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    수정
                  </Button>

                  {isInactive(store) ? (
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => handleActivate(store.storeId)}
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      활성화
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => handleDelete(store.storeId)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      비활성화
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

        {!hasVisible && !loading && (
          <div className="text-sm text-muted-foreground">
            {showInactiveOnly
              ? "비활성화된 사업장이 없습니다."
              : "등록된 사업장이 없습니다. 오른쪽 상단에서 추가하세요."}
          </div>
        )}
        {loading && <div className="text-sm text-muted-foreground">불러오는 중…</div>}
      </div>
      
      {/* 수정 다이얼로그 */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사업장 수정</DialogTitle>
            <DialogDescription>사업장 정보를 변경합니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="edit-storeName">사업장명</Label>
              <Input
                id="edit-storeName"
                value={editForm.storeName}
                onChange={(e) =>
                  setEditForm((p) => ({
                    ...p,
                    storeName: e.target.value.slice(0, maxLen),
                  }))
                }
                maxLength={maxLen}
                className={editForm.storeName.length >= maxLen ? "border-red-500" : ""}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-industry">업종</Label>
              <Input
                id="edit-industry"
                value={editForm.industry}
                onChange={(e) =>
                  setEditForm((p) => ({
                    ...p,
                    industry: e.target.value.slice(0, maxLen),
                  }))
                }
                maxLength={maxLen}
                className={editForm.industry.length >= maxLen ? "border-red-500" : ""}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-posVendor">POS 시스템</Label>
              <Input
                id="edit-posVendor"
                value={editForm.posVendor}
                onChange={(e) =>
                  setEditForm((p) => ({
                    ...p,
                    posVendor: e.target.value.slice(0, maxLen),
                  }))
                }
                maxLength={maxLen}
                className={editForm.posVendor.length >= maxLen ? "border-red-500" : ""}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-lat">위도</Label>
                <Input
                  id="edit-lat"
                  value={editForm.latitude}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, latitude: e.target.value }))
                  }
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lng">경도</Label>
                <Input
                  id="edit-lng"
                  value={editForm.longitude}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, longitude: e.target.value }))
                  }
                  readOnly
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!navigator.geolocation) {
                    alert("이 브라우저에서는 위치를 사용할 수 없습니다.")
                    return
                  }
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setEditForm((p) => ({
                        ...p,
                        latitude: String(pos.coords.latitude),
                        longitude: String(pos.coords.longitude),
                      }))
                    },
                    () => alert("위치를 가져오지 못했습니다."),
                    { enableHighAccuracy: true, timeout: 5000 },
                  )
                }}
              >
                현재 위치 가져오기
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpenEditMap(true)}>
                지도에서 선택
              </Button>
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

      {/* 위치 선택 다이얼로그 */}
      <Dialog open={openEditMap} onOpenChange={setOpenEditMap}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>지도에서 위치 선택</DialogTitle>
            <DialogDescription>
              지도를 클릭하면 위도/경도가 수정 폼에 들어갑니다.
            </DialogDescription>
          </DialogHeader>
          <NaverMapPicker
            mapId="naver-map-picker-edit"
            onSelect={(lat, lng) =>
              setEditForm((p) => ({
                ...p,
                latitude: String(lat),
                longitude: String(lng),
              }))
            }
            defaultLat={editForm.latitude ? Number(editForm.latitude) : 37.5665}
            defaultLng={editForm.longitude ? Number(editForm.longitude) : 126.978}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditMap(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
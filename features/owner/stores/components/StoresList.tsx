"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
} from "@/components/ui/dialog"
import { Store, MapPin, Phone, Edit, Trash2, Copy, RefreshCcw } from "lucide-react"

import { useStores } from "@/features/owner/stores/hooks/useStores"
import { NaverMapPicker } from "./NaverMapPicker"
import { formatStoreStatus, extractErrorMessage } from "@/lib/utils"
import type { StoreType } from "../services/storesService"

export default function StoresList({
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
    hardDelete,
    softDelete,
    reactivate,
    patch,
  } = useStores(version)

  // ✅ 활성/비활성 구분은 이제 active 플래그로만 판단
  const isInactive = (s: StoreType) => s.active === false

  // ✅ 활성 / 비활성 필터 상태
  const [showInactiveOnly, setShowInactiveOnly] = useState(false)

  // ✅ 필터된 목록 (status 말고 active 기준)
  const visibleStores = useMemo(
    () =>
      showInactiveOnly
        ? stores.filter((s) => isInactive(s))      // 비활성만
        : stores.filter((s) => !isInactive(s)),    // 활성만
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

  // ✅ 비활성화
  const handleDelete = async (id: number) => {
    if (!confirm("정말로 이 사업장을 비활성화하시겠습니까?")) return

    try {
      await softDelete(id)
      alert("사업장이 비활성화되었습니다.")

      if (typeof window !== "undefined") {
        window.location.reload()
      }

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

      const msg = extractErrorMessage(err)
      alert(msg)
    }
  }

  // ✅ 활성화
  const handleActivate = async (id: number) => {
    if (!confirm("이 사업장을 다시 활성화하시겠습니까?")) return

    try {
      await reactivate(id)
      alert("사업장이 다시 활성화되었습니다.")

      if (typeof window !== "undefined") {
        window.location.reload()
      }

      onChangedAction?.()
    } catch (err: any) {
      console.error("사업장 활성화 실패:", err)
      const msg = extractErrorMessage(err)
      alert(msg)
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

    // ✅ 필수값 체크 (추가와 동일하게 이름/업종/위도/경도 필수)
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
      {/* ✅ 상단 필터 버튼 */}
      <div className="flex justify-end mb-4">
        <Button
          variant={showInactiveOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowInactiveOnly((prev) => !prev)}
        >
          {showInactiveOnly ? "활성 사업장 보기" : "비활성화된 사업장 보기"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {hasVisible &&
          visibleStores.map((store) => (
            <Card
              key={store.storeId}
              className={isInactive(store) ? "opacity-60" : ""}  // 🔍 비활성은 살짝 흐리게(선택사항)
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
                  {/* ✅ 여기 status는 그대로: 승인/대기/거절만 담당 */}
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

                  {/* ✅ 활성/비활성 버튼도 active 기준으로만 동작 */}
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
            {/* 🔻 사업자 ID 필드는 상태에는 남겨두되, 화면에서는 완전히 숨김 */}

            {/* 사업장명 */}
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
              <p className="text-xs text-muted-foreground px-1">
                최대 {maxLen}자까지 입력 가능합니다. ({editForm.storeName.length}/{maxLen})
              </p>
              {editForm.storeName.length >= maxLen && (
                <p className="text-xs text-red-500 px-1">
                  글자 수 한도(최대 {maxLen}자)에 도달했습니다.
                </p>
              )}
            </div>

            {/* 업종 */}
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
              <p className="text-xs text-muted-foreground px-1">
                최대 {maxLen}자까지 입력 가능합니다. ({editForm.industry.length}/{maxLen})
              </p>
              {editForm.industry.length >= maxLen && (
                <p className="text-xs text-red-500 px-1">
                  글자 수 한도(최대 {maxLen}자)에 도달했습니다.
                </p>
              )}
            </div>

            {/* POS 시스템 */}
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
              <p className="text-xs text-muted-foreground px-1">
                최대 {maxLen}자까지 입력 가능합니다. ({editForm.posVendor.length}/{maxLen})
              </p>
              {editForm.posVendor.length >= maxLen && (
                <p className="text-xs text-red-500 px-1">
                  글자 수 한도(최대 {maxLen}자)에 도달했습니다.
                </p>
              )}
            </div>

            {/* 위도 / 경도 (읽기 전용, 버튼으로만 설정) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-lat">위도</Label>
                <Input
                  id="edit-lat"
                  value={editForm.latitude}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, latitude: e.target.value }))
                  }
                  placeholder="예) 37.5665"
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
                  placeholder="예) 126.9780"
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
                    () => alert("위를 가져오지 못했습니다."),
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
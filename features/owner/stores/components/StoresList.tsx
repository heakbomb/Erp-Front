// features/owner/stores/components/StoresList.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
// UI 컴포넌트 임포트
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
import { Store, MapPin, Phone, Edit, Trash2, Copy } from "lucide-react"

// ✅ 1. 로직을 처리할 훅 임포트
import { useStores } from "@/features/owner/stores/hooks/useStores"
// ✅ 2. 분리된 NaverMapPicker 컴포넌트 임포트
import { NaverMapPicker } from "./NaverMapPicker" // (이 파일은 이전 단계에서 생성했습니다)
// ✅ 3. 전역 유틸리티 함수 임포트
import { formatStoreStatus, extractErrorMessage } from "@/lib/utils"
// ✅ 4. StoreType 임포트 (서비스 파일에서)
import type { StoreType } from "../services/storesService"

export default function StoresList({
  version,
  onChangedAction,
}: {
  version?: number
  onChangedAction?: () => void
}) {
  // ✅ 5. 훅을 호출하여 상태와 로직(핸들러)을 가져옴
  const { 
    stores, 
    loading, 
    hasData, 
    hardDelete, 
    softDelete, 
    patch 
  } = useStores(version);

  // ✅ 6. 모달 관련 상태는 UI 컴포넌트가 직접 관리
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

  // handleCopy는 UI 로직이므로 그대로 둠
  const handleCopy = (id: number) => {
    navigator.clipboard.writeText(String(id))
    alert("사업장 코드가 복사되었습니다!")
  }

  // ✅ 7. handleDelete를 훅의 핸들러(softDelete, hardDelete)를 사용하도록 수정
     const handleDelete = async (id: number) => {
      // 1차 확인
      if (!confirm("정말로 이 사업장을 삭제하시겠습니까?")) return;

      try {
        // ✅ 항상 일반 삭제만 시도 (force=false)
        await softDelete(id);
        alert("사업장이 삭제되었습니다.");
        onChangedAction?.();
      } catch (err: any) {
        console.error("사업장 삭제 실패:", err);
        const status = err?.response?.status;

        // ✅ 근무배정 / 직원 연결이 있는 경우 (백엔드에서 409 로 응답)
        if (status === 409) {
          alert(
            "이 사업장에는 근무배정(직원 연결) 정보가 있어 삭제할 수 없습니다.\n" +
            "근무 기록 보호를 위해 관리자에게 삭제를 요청해 주세요."
          );
          return;
        }

        // ✅ 그 외 에러는 기존 전역 유틸 그대로 사용
        const msg = extractErrorMessage(err);
        alert(msg);
      }
    };

  // openEditModal은 UI 로직이므로 그대로 둠
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

  // ✅ 8. handleUpdate를 훅의 핸들러(patch)를 사용하도록 수정
  const handleUpdate = async () => {
    if (!editingId) return
    if (!editForm.bizId.trim() || !editForm.storeName.trim() || !editForm.industry.trim()) {
      alert("사업자 ID, 사업장명, 업종은 필수입니다.")
      return
    }
    try {
      setSavingEdit(true)
      await patch(editingId, { // 훅의 patch 호출
        bizId: Number(editForm.bizId),
        storeName: editForm.storeName,
        industry: editForm.industry,
        posVendor: editForm.posVendor || null,
        latitude: editForm.latitude ? Number(editForm.latitude) : null,
        longitude: editForm.longitude ? Number(editForm.longitude) : null,
      })
      setOpenEdit(false)
      setEditingId(null)
      onChangedAction?.()
    } catch (e) {
      console.error("사업장 수정 실패:", e)
      alert(`수정 중 오류가 발생했습니다: ${extractErrorMessage(e)}`) // 전역 유틸 사용
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <>
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
                  {/* ✅ 상태에 따라 색상 달라지는 뱃지 */}
                  <Badge
                    variant="outline"
                    className={
                      store.status === "APPROVED"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : store.status === "REJECTED"
                        ? "bg-red-100 text-red-700 border-red-300"
                        : "bg-yellow-100 text-yellow-700 border-yellow-300" // PENDING 또는 기타
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

                  {/* 사업자번호 표시 */}
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

      {/* 수정 다이얼로그 (UI 로직은 동일) */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사업장 수정</DialogTitle>
            <DialogDescription>사업장 정보를 변경합니다.</DialogDescription>
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
              <Label htmlFor="edit-posVendor">POS 시스템</Label>
              <Input
                id="edit-posVendor"
                value={editForm.posVendor}
                onChange={(e) => setEditForm((p) => ({ ...p, posVendor: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-lat">위도</Label>
                <Input
                  id="edit-lat"
                  value={editForm.latitude}
                  onChange={(e) => setEditForm((p) => ({ ...p, latitude: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lng">경도</Label>
                <Input
                  id="edit-lng"
                  value={editForm.longitude}
                  onChange={(e) => setEditForm((p) => ({ ...p, longitude: e.target.value }))}
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
                    { enableHighAccuracy: true, timeout: 5000 }
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

      {/* 수정 지도 다이얼로그 (NaverMapPicker 컴포넌트 사용) */}
      <Dialog open={openEditMap} onOpenChange={setOpenEditMap}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>지도에서 위치 선택</DialogTitle>
            <DialogDescription>지도를 클릭하면 위도/경도가 수정 폼에 들어갑니다.</DialogDescription>
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
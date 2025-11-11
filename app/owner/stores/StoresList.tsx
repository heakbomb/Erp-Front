"use client"

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
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

const API_BASE = "http://localhost:8080"
const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID

type StoreType = {
  storeId: number
  bizId?: number
  storeName: string
  industry: string
  posVendor: string | null
  status: string
  latitude?: number | null
  longitude?: number | null
}

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

function extractErrorMessage(e: any): string {
  const data = e?.response?.data
  if (typeof data === "string") return data
  if (typeof data?.message === "string") return data.message
  if (typeof data?.error === "string") return data.error
  if (typeof data?.detail === "string") return data.detail
  if (typeof e?.message === "string") return e.message
  return "오류가 발생했습니다."
}

// 네이버 지도 로더
function useNaverLoader() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined") return
    if ((window as any).naver?.maps) {
      setLoaded(true)
      return
    }
    if (!NAVER_CLIENT_ID) return
    const script = document.createElement("script")
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(
      NAVER_CLIENT_ID
    )}`
    script.async = true
    script.onload = () => setLoaded(true)
    document.head.appendChild(script)
  }, [])
  return loaded
}

function NaverMapPicker({
  onSelect,
  mapId,
  defaultLat = 37.5665,
  defaultLng = 126.978,
}: {
  onSelect: (lat: number, lng: number) => void
  mapId: string
  defaultLat?: number
  defaultLng?: number
}) {
  const loaded = useNaverLoader()
  const [inited, setInited] = useState(false)

  useEffect(() => {
    if (!loaded || inited) return
    const el = document.getElementById(mapId)
    if (!el) return
    const { naver } = window as any
    const map = new naver.maps.Map(el, {
      center: new naver.maps.LatLng(defaultLat, defaultLng),
      zoom: 15,
    })
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(defaultLat, defaultLng),
      map,
    })
    naver.maps.Event.addListener(map, "click", (e: any) => {
      const lat = e.coord.lat()
      const lng = e.coord.lng()
      marker.setPosition(e.coord)
      onSelect(lat, lng)
    })
    setInited(true)
  }, [loaded, inited, mapId, onSelect, defaultLat, defaultLng])

  return (
    <div
      id={mapId}
      style={{
        width: "100%",
        height: 320,
        borderRadius: "0.5rem",
        background: loaded ? "#eee" : "#f3f4f6",
      }}
    >
      {!loaded && <p className="p-2 text-xs text-muted-foreground">지도를 불러오는 중…</p>}
    </div>
  )
}

export default function StoresList({
  version,
  onChangedAction,
}: {
  version?: number
  onChangedAction?: () => void
}) {
  const [stores, setStores] = useState<StoreType[]>([])
  const [loading, setLoading] = useState(false)

  // 수정 모달
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

  const fetchStores = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_BASE}/api/store`)
      setStores(res.data)
    } catch (e) {
      console.error("사업장 목록 불러오기 실패:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStores()
  }, [version])

  const hasData = useMemo(() => stores && stores.length > 0, [stores])

  const handleCopy = (id: number) => {
    navigator.clipboard.writeText(String(id))
    alert("사업장 코드가 복사되었습니다!")
  }

  const handleDelete = async (id: number) => {
    if (!confirm("정말로 삭제하시겠습니까?")) return
    try {
      await axios.delete(`${API_BASE}/api/store/${id}`, { params: { force: false } })
    } catch (err: any) {
      const status = err?.response?.status
      const msg = extractErrorMessage(err)
      if (status === 409) {
        const go = confirm(`${msg}\n\n강제 삭제를 진행할까요?`)
        if (go) {
          await axios.delete(`${API_BASE}/api/store/${id}`, { params: { force: true } })
        } else {
          return
        }
      } else {
        alert(msg)
        return
      }
    }
    await fetchStores()
    onChangedAction?.()
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
        latitude: editForm.latitude ? Number(editForm.latitude) : null,
        longitude: editForm.longitude ? Number(editForm.longitude) : null,
      })
      setOpenEdit(false)
      setEditingId(null)
      await fetchStores()
      onChangedAction?.()
    } catch (e) {
      console.error("사업장 수정 실패:", e)
      alert("수정 중 오류가 발생했습니다.")
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
                  <Badge variant="default">{statusToKorean(store.status)}</Badge>
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
                  <div className="flex items-center gap-2 text-sm opacity-50">
                    <Phone className="h-4 w-4" />
                    <span className="text-muted-foreground">전화번호 필드 없음</span>
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

      {/* 수정 다이얼로그 */}
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
                    () => alert("위치를 가져오지 못했습니다."),
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

      {/* 수정 지도 다이얼로그 */}
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
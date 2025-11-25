"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Store as StoreIcon } from "lucide-react"

// ✅ Select 컴포넌트 추가
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ✅ hooks/services로 분리
import useNaverLoader from "@/features/owner/stores/hooks/useNaverLoader"
import {
  createStore,
  fetchBusinessNumbersByOwner,
  type BusinessNumber,
} from "@/features/owner/stores/services/storesService"

// 지도 컴포넌트 (로더는 훅으로 교체)
function NaverMapPicker({
  onSelect,
  mapId = "naver-map-picker-add",
  defaultLat = 37.5665,
  defaultLng = 126.978,
}: {
  onSelect: (lat: number, lng: number) => void
  mapId?: string
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

export default function StoresAdd({
  verifiedInfo,
  onCreatedAction,
}: {
  verifiedInfo?: any | null
  onCreatedAction?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    bizId: "",
    storeName: "",
    industry: "",
    posVendor: "",
    latitude: "",
    longitude: "",
  })
  const [saving, setSaving] = useState(false)
  const [openMap, setOpenMap] = useState(false)

  // ✅ 사업자번호 목록 상태
  const [bizList, setBizList] = useState<BusinessNumber[]>([])
  const [bizLoading, setBizLoading] = useState(false)

  // ⚠️ 로그인 붙기 전까지 임시 Owner ID
  const OWNER_ID = 1

  // ✅ 모달이 열릴 때 해당 Owner 의 사업자번호 목록 로드
  useEffect(() => {
    if (!open) return
    if (bizList.length > 0) return

    const loadBizNumbers = async () => {
      try {
        setBizLoading(true)
        const data = await fetchBusinessNumbersByOwner(OWNER_ID)
        setBizList(data)
      } catch (e) {
        console.error("사업자번호 목록 조회 실패:", e)
      } finally {
        setBizLoading(false)
      }
    }

    loadBizNumbers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // ✅ 인증이 새로 되면 bizId를 자동으로 채워줌
  useEffect(() => {
    if (verifiedInfo?.bizId) {
      setForm((p) => ({ ...p, bizId: String(verifiedInfo.bizId) }))
    }
  }, [verifiedInfo])

  const getCurrent = () => {
    if (!navigator.geolocation) {
      alert("이 브라우저에서는 위치를 사용할 수 없습니다.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((p) => ({
          ...p,
          latitude: String(pos.coords.latitude),
          longitude: String(pos.coords.longitude),
        }))
      },
      () => alert("위치를 가져오지 못했습니다."),
      { enableHighAccuracy: true, timeout: 5000 }
    )
  }

  const handleCreate = async () => {
    if (!form.bizId.trim() || !form.storeName.trim() || !form.industry.trim()) {
      alert("사업자 ID, 사업장명, 업종은 필수입니다.")
      return
    }
    try {
      setSaving(true)
      // ✅ services 사용 (UI/UX 변화 없음)
      await createStore({
        bizId: Number(form.bizId),
        storeName: form.storeName,
        industry: form.industry,
        posVendor: form.posVendor || null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      })
      alert("사업장이 추가되었습니다.")
      setOpen(false)
      setForm({
        bizId: verifiedInfo?.bizId ? String(verifiedInfo.bizId) : "",
        storeName: "",
        industry: "",
        posVendor: "",
        latitude: "",
        longitude: "",
      })
      onCreatedAction?.()
    } catch (e) {
      console.error("사업장 추가 실패:", e)
      alert("추가 중 오류가 발생했습니다.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <StoreIcon className="mr-2 h-4 w-4" />
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
              <Label htmlFor="add-bizId">사업자번호</Label>
              {bizLoading ? (
                <p className="text-xs text-muted-foreground px-1">
                  사업자번호 목록을 불러오는 중…
                </p>
              ) : (
                <Select
                  value={form.bizId}
                  onValueChange={(value) =>
                    setForm((p) => ({
                      ...p,
                      bizId: value,
                    }))
                  }
                >
                  <SelectTrigger id="add-bizId">
                    <SelectValue placeholder="사업자번호 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {bizList.map((bn) => (
                      <SelectItem key={bn.bizId} value={String(bn.bizId)}>
                        {bn.bizNum} ({bn.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {(!bizLoading && bizList.length === 0) && (
                <p className="text-xs text-muted-foreground px-1">
                  등록된 사업자번호가 없습니다. 먼저 사업자번호를 인증해 주세요.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-storeName">사업장명</Label>
              <Input
                id="add-storeName"
                value={form.storeName}
                onChange={(e) => setForm((p) => ({ ...p, storeName: e.target.value }))}
                placeholder="예) 홍대카페" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-industry">업종</Label>
              <Input
                id="add-industry"
                value={form.industry}
                onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))}
                placeholder="예) 카페 / 한식 / 분식"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-posVendor">POS 시스템(선택)</Label>
              <Input
                id="add-posVendor"
                value={form.posVendor}
                onChange={(e) => setForm((p) => ({ ...p, posVendor: e.target.value }))}
                placeholder="예) 포스시스템A"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="add-lat">위도</Label>
                <Input
                  id="add-lat"
                  value={form.latitude}
                  onChange={(e) => setForm((p) => ({ ...p, latitude: e.target.value }))}
                  placeholder="예) 37.5665"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-lng">경도</Label>
                <Input
                  id="add-lng"
                  value={form.longitude}
                  onChange={(e) => setForm((p) => ({ ...p, longitude: e.target.value }))}
                  placeholder="예) 126.9780" 
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={getCurrent}>
                현재 위치 가져오기
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpenMap(true)}>
                지도에서 선택
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "저장 중..." : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 지도 다이얼로그 */}
      <Dialog open={openMap} onOpenChange={setOpenMap}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>지도에서 위치 선택</DialogTitle>
            <DialogDescription>지도를 클릭하면 위도/경도가 폼에 들어갑니다.</DialogDescription>
          </DialogHeader>
          <NaverMapPicker
            onSelect={(lat, lng) =>
              setForm((p) => ({
                ...p,
                latitude: String(lat),
                longitude: String(lng),
              }))
            }
            mapId="naver-map-picker-add"
            defaultLat={form.latitude ? Number(form.latitude) : 37.5665}
            defaultLng={form.longitude ? Number(form.longitude) : 126.978}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenMap(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
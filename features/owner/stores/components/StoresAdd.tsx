// features/owner/stores/components/StoresAdd.tsx
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Store as StoreIcon } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

import useNaverLoader from "@/features/owner/stores/hooks/useNaverLoader"
import {
  createStore,
  fetchBusinessNumbersByOwner,
  type BusinessNumber,
} from "@/features/owner/stores/services/storesService"

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

  const [bizList, setBizList] = useState<BusinessNumber[]>([])
  const [bizLoading, setBizLoading] = useState(false)

  const OWNER_ID = 1
  const maxLen = 20

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
    const missing: string[] = []

    if (!form.bizId.trim()) missing.push("사업자번호")
    if (!form.storeName.trim()) missing.push("사업장명")
    if (!form.industry.trim()) missing.push("업종")
    if (!form.latitude.trim()) missing.push("위도")
    if (!form.longitude.trim()) missing.push("경도")

    if (missing.length > 0) {
      alert(
        `다음 항목을 입력해 주세요:\n\n- ${missing.join("\n- ")}`
      )
      return
    }

    try {
      setSaving(true)
      await createStore({
        bizId: Number(form.bizId),
        storeName: form.storeName,
        industry: form.industry,
        posVendor: form.posVendor || null,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
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
            {/* 사업자번호 */}
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
              {!bizLoading && bizList.length === 0 && (
                <p className="text-xs text-muted-foreground px-1">
                  등록된 사업자번호가 없습니다. 먼저 사업자번호를 인증해 주세요.
                </p>
              )}
            </div>

            {/* 사업장명 */}
            <div className="space-y-1">
              <Label htmlFor="add-storeName">사업장명</Label>
              <Input
                id="add-storeName"
                value={form.storeName}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    storeName: e.target.value.slice(0, maxLen),
                  }))
                }
                placeholder="예) 홍대카페"
                maxLength={maxLen}
                className={form.storeName.length >= maxLen ? "border-red-500" : ""}
              />
              <p className="text-xs text-muted-foreground px-1">
                최대 {maxLen}자까지 입력 가능합니다. ({form.storeName.length}/{maxLen})
              </p>
              {form.storeName.length >= maxLen && (
                <p className="text-xs text-red-500 px-1">
                  글자 수 한도(최대 {maxLen}자)에 도달했습니다.
                </p>
              )}
            </div>

            {/* 업종 */}
            <div className="space-y-1">
              <Label htmlFor="add-industry">업종</Label>
              <Input
                id="add-industry"
                value={form.industry}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    industry: e.target.value.slice(0, maxLen),
                  }))
                }
                placeholder="예) 카페 / 한식 / 분식"
                maxLength={maxLen}
                className={form.industry.length >= maxLen ? "border-red-500" : ""}
              />
              <p className="text-xs text-muted-foreground px-1">
                최대 {maxLen}자까지 입력 가능합니다. ({form.industry.length}/{maxLen})
              </p>
              {form.industry.length >= maxLen && (
                <p className="text-xs text-red-500 px-1">
                  글자 수 한도(최대 {maxLen}자)에 도달했습니다.
                </p>
              )}
            </div>

            {/* POS 시스템(선택) */}
            <div className="space-y-1">
              <Label htmlFor="add-posVendor">POS 시스템(선택)</Label>
              <Input
                id="add-posVendor"
                value={form.posVendor}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    posVendor: e.target.value.slice(0, maxLen),
                  }))
                }
                placeholder="예) 포스시스템A"
                maxLength={maxLen}
                className={form.posVendor.length >= maxLen ? "border-red-500" : ""}
              />
              <p className="text-xs text-muted-foreground px-1">
                최대 {maxLen}자까지 입력 가능합니다. ({form.posVendor.length}/{maxLen})
              </p>
              {form.posVendor.length >= maxLen && (
                <p className="text-xs text-red-500 px-1">
                  글자 수 한도(최대 {maxLen}자)에 도달했습니다.
                </p>
              )}
            </div>

            {/* 위도/경도 (직접 입력 불가, 읽기 전용) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="add-lat">위도</Label>
                <Input
                  id="add-lat"
                  value={form.latitude}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, latitude: e.target.value }))
                  }
                  placeholder="예) 37.5665"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-lng">경도</Label>
                <Input
                  id="add-lng"
                  value={form.longitude}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, longitude: e.target.value }))
                  }
                  placeholder="예) 126.9780"
                  readOnly
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

      {/* 지도 선택 다이얼로그 */}
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

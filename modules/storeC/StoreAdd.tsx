"use client"

import { useEffect, useMemo, useState } from "react"
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

import { storeApi } from "./storeApi"
import { BusinessNumber, StoreIndustry, STORE_INDUSTRY_LABELS } from "./storeTypes"
import NaverMapPicker from "./NaverMapPicker"
import { useAuth } from "@/contexts/AuthContext"

export default function StoreAdd({
  verifiedInfo,
  onCreatedAction,
  trigger,
}: {
  verifiedInfo?: any | null
  onCreatedAction?: () => void
  trigger?: React.ReactNode
}) {
  const { user } = useAuth()
  const ownerIdRaw = (user as any)?.ownerId
  const ownerId = useMemo(() => {
    const n = Number(ownerIdRaw)
    return Number.isFinite(n) && n > 0 ? n : null
  }, [ownerIdRaw])

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<{
    bizId: string
    storeName: string
    industry: StoreIndustry
    posVendor: string
    latitude: string
    longitude: string
  }>({
    bizId: "",
    storeName: "",
    industry: StoreIndustry.KOREAN,
    posVendor: "",
    latitude: "",
    longitude: "",
  })

  const [saving, setSaving] = useState(false)
  const [openMap, setOpenMap] = useState(false)

  const [bizList, setBizList] = useState<BusinessNumber[]>([])
  const [bizLoading, setBizLoading] = useState(false)

  const maxLen = 20

  // ✅ 모달 열릴 때 + ownerId 있을 때 사업자번호 목록 로드
  useEffect(() => {
    if (!open) return
    if (!ownerId) {
      setBizList([])
      return
    }

    const loadBizNumbers = async () => {
      try {
        setBizLoading(true)
        const data = await storeApi.fetchBusinessNumbers(ownerId)
        setBizList(data)
      } catch (e) {
        console.error("사업자번호 목록 조회 실패:", e)
        setBizList([])
      } finally {
        setBizLoading(false)
      }
    }

    loadBizNumbers()
  }, [open, ownerId])

  // ✅ 인증 완료 시 bizId 자동 세팅
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
    if (!form.industry) missing.push("업종")
    if (!form.latitude.trim()) missing.push("위도")
    if (!form.longitude.trim()) missing.push("경도")

    if (missing.length > 0) {
      alert(`다음 항목을 입력해 주세요:\n\n- ${missing.join("\n- ")}`)
      return
    }

    try {
      setSaving(true)
      await storeApi.createStore({
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
        industry: StoreIndustry.KOREAN,
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
          {trigger ? (
            trigger
          ) : (
            <Button>
              <StoreIcon className="mr-2 h-4 w-4" />
              사업장 추가
            </Button>
          )}
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
                  onValueChange={(value) => setForm((p) => ({ ...p, bizId: value }))}
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="add-storeName">사업장명</Label>
                <span className="text-xs text-muted-foreground">
                  {form.storeName.length}/{maxLen}
                </span>
              </div>
              <Input
                id="add-storeName"
                value={form.storeName}
                onChange={(e) => {
                  const v = e.target.value
                  if (v.length <= maxLen) setForm((p) => ({ ...p, storeName: v }))
                }}
                placeholder="예) 홍대 라멘집"
                maxLength={maxLen}
              />
            </div>

            {/* 업종 */}
            <div className="space-y-2">
              <Label htmlFor="add-industry">업종</Label>
              <Select
                value={form.industry}
                onValueChange={(value) =>
                  setForm((p) => ({ ...p, industry: value as StoreIndustry }))
                }
              >
                <SelectTrigger id="add-industry">
                  <SelectValue placeholder="업종 선택" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(StoreIndustry).map((key) => (
                    <SelectItem key={key} value={key}>
                      {STORE_INDUSTRY_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* POS 공급사 (선택) */}
            <div className="space-y-2">
              <Label htmlFor="add-posVendor">POS 공급사 (선택)</Label>
              <Input
                id="add-posVendor"
                value={form.posVendor}
                onChange={(e) => setForm((p) => ({ ...p, posVendor: e.target.value }))}
                placeholder="예) 포스원 / 키오스크사명"
              />
            </div>

            {/* 위치 */}
            <div className="space-y-2">
              <Label>사업장 위치</Label>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="add-lat" className="text-xs text-muted-foreground">
                    위도
                  </Label>
                  <Input
                    id="add-lat"
                    value={form.latitude}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        latitude: e.target.value.replace(/[^0-9.-]/g, ""),
                      }))
                    }
                    placeholder="예) 37.5665"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-lng" className="text-xs text-muted-foreground">
                    경도
                  </Label>
                  <Input
                    id="add-lng"
                    value={form.longitude}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        longitude: e.target.value.replace(/[^0-9.-]/g, ""),
                      }))
                    }
                    placeholder="예) 126.9780"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" onClick={getCurrent}>
                  내 위치 가져오기
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpenMap(true)}>
                  지도에서 선택
                </Button>
              </div>
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
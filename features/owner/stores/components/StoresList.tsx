"use client"

import { useState, useEffect, useMemo } from "react"
import { MoreHorizontal, Store as StoreIcon, MapPin, Edit, Trash2, RefreshCcw, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useStores } from "@/features/owner/stores/hooks/useStores"
import useNaverLoader from "@/features/owner/stores/hooks/useNaverLoader"
import { 
  fetchBusinessNumbersByOwner, 
  type BusinessNumber,
  type StoreResponse 
} from "@/features/owner/stores/services/storesService"
import { formatStoreStatus, extractErrorMessage } from "@/lib/utils"

// 내부 지도 컴포넌트
function NaverMapPicker({
  onSelect,
  mapId = "naver-map-picker-edit",
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
    
    const centerLat = isNaN(defaultLat) ? 37.5665 : defaultLat
    const centerLng = isNaN(defaultLng) ? 126.978 : defaultLng

    const map = new naver.maps.Map(el, {
      center: new naver.maps.LatLng(centerLat, centerLng),
      zoom: 15,
    })
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(centerLat, centerLng),
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
  const { 
    stores, 
    loading, 
    // hasData, 
    softDelete, 
    reactivate, 
    patch 
  } = useStores(version);

  const [showInactiveOnly, setShowInactiveOnly] = useState(false);

  const visibleStores = useMemo(
    () =>
      showInactiveOnly
        ? stores.filter((s) => s.status === "INACTIVE")
        : stores.filter((s) => s.status !== "INACTIVE"),
    [stores, showInactiveOnly]
  );

  const hasVisible = visibleStores.length > 0;

  // 수정 모달 상태
  const [editOpen, setEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    bizId: "",
    storeName: "",
    industry: "",
    posVendor: "",
    latitude: "",
    longitude: "",
    gpsRadiusM: "80",
  })
  const [savingEdit, setSavingEdit] = useState(false)
  const [openEditMap, setOpenEditMap] = useState(false)
  const [bizList, setBizList] = useState<BusinessNumber[]>([])

  const OWNER_ID = 1

  const handleCopy = (id: number) => {
    navigator.clipboard.writeText(String(id))
    alert("사업장 코드가 복사되었습니다!")
  }

  const handleDelete = async (id: number) => {
    if (!confirm("정말로 이 사업장을 비활성화하시겠습니까?")) return;
    try {
      await softDelete(id);
      alert("사업장이 비활성화되었습니다.");
      onChangedAction?.();
    } catch (err: any) {
      console.error(err);
      const msg = extractErrorMessage(err);
      alert(msg);
    }
  };

  const handleActivate = async (id: number) => {
    if (!confirm("이 사업장을 다시 활성화하시겠습니까?")) return;
    try {
      await reactivate(id);
      alert("사업장이 다시 활성화되었습니다.");
      onChangedAction?.();
    } catch (err: any) {
      console.error(err);
      const msg = extractErrorMessage(err);
      alert(msg);
    }
  };

  const openEditModal = async (s: StoreResponse) => {
    setEditingId(s.storeId)
    setEditForm({
      bizId: s.bizId ? String(s.bizId) : "",
      storeName: s.storeName ?? "",
      industry: s.industry ?? "",
      posVendor: s.posVendor ?? "",
      latitude: s.latitude != null ? String(s.latitude) : "",
      longitude: s.longitude != null ? String(s.longitude) : "",
      gpsRadiusM: s.gpsRadiusM != null ? String(s.gpsRadiusM) : "80",
    })
    
    // 사업자번호 목록 로드
    try {
      const data = await fetchBusinessNumbersByOwner(OWNER_ID)
      setBizList(data)
    } catch (e) {
      console.error(e)
    }

    setEditOpen(true)
  }

  const getCurrent = () => {
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
  }

  const handleUpdate = async () => {
    if (!editingId) return
    if (!editForm.storeName.trim() || !editForm.industry.trim()) {
      alert("필수 항목을 입력하세요.")
      return
    }
    
    // 위도/경도 필수 체크
    if (!editForm.latitude || !editForm.longitude) {
      alert("사업장 위치(위도/경도)는 필수입니다. 지도 버튼을 눌러 위치를 선택해주세요.")
      setOpenEditMap(true) 
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
        gpsRadiusM: Number(editForm.gpsRadiusM),
      })
      alert("수정되었습니다.")
      setEditOpen(false)
      setEditingId(null)
      onChangedAction?.()
    } catch (e) {
      console.error(e)
      alert("수정 실패")
    } finally {
      setSavingEdit(false)
    }
  }

  if (loading) return <div>로딩 중...</div>

  return (
    <>
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
            <Card key={store.storeId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <StoreIcon className="h-6 w-6 text-primary" />
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
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <StoreIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">
                      사업자번호: {store.bizNum ?? "-"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">
                      {store.latitude ?? "-"}, {store.longitude ?? "-"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => openEditModal(store)}>
                    <Edit className="mr-2 h-4 w-4" />
                    수정
                  </Button>
                  {store.status === "INACTIVE" ? (
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
          <div className="text-sm text-muted-foreground col-span-2 text-center py-8">
            {showInactiveOnly
              ? "비활성화된 사업장이 없습니다."
              : "등록된 사업장이 없습니다. 오른쪽 상단에서 추가하세요."}
          </div>
        )}
      </div>

      {/* 수정 다이얼로그 */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사업장 정보 수정</DialogTitle>
            <DialogDescription>
              변경할 정보를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            
            <div className="space-y-2">
              <Label>사업자번호</Label>
              <Select
                value={editForm.bizId}
                onValueChange={(val) => setEditForm(p => ({ ...p, bizId: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="사업자번호 선택" />
                </SelectTrigger>
                <SelectContent>
                  {bizList.map(bn => (
                    <SelectItem key={bn.bizId} value={String(bn.bizId)}>
                      {bn.bizNum}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>사업장명</Label>
              <Input
                value={editForm.storeName}
                onChange={(e) => setEditForm(p => ({ ...p, storeName: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>업종</Label>
              <Input
                value={editForm.industry}
                onChange={(e) => setEditForm(p => ({ ...p, industry: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>POS 시스템</Label>
              <Input
                value={editForm.posVendor}
                onChange={(e) => setEditForm(p => ({ ...p, posVendor: e.target.value }))}
              />
            </div>

            {/* ⭐️ [수정] 위도/경도 직접 입력 차단 (disabled & onChange 제거) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>위도</Label>
                <Input
                  value={editForm.latitude}
                  disabled
                  className="bg-gray-100 disabled:opacity-100 disabled:cursor-not-allowed text-foreground"
                  placeholder="지도 버튼을 사용하세요"
                />
              </div>
              <div className="space-y-2">
                <Label>경도</Label>
                <Input
                  value={editForm.longitude}
                  disabled
                  className="bg-gray-100 disabled:opacity-100 disabled:cursor-not-allowed text-foreground"
                  placeholder="지도 버튼을 사용하세요"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={getCurrent}>
                현재 위치 갱신
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpenEditMap(true)}>
                지도에서 변경
              </Button>
            </div>
            
            <div className="space-y-2">
               <Label>근무지 허용 반경(m)</Label>
               <Input 
                 type="number"
                 value={editForm.gpsRadiusM}
                 onChange={(e) => setEditForm(p => ({ ...p, gpsRadiusM: e.target.value }))}
                 placeholder="기본 80m"
               />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>취소</Button>
            <Button onClick={handleUpdate} disabled={savingEdit}>
              {savingEdit ? "저장 중..." : "수정 저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 지도 선택 모달 (수정용) */}
      <Dialog open={openEditMap} onOpenChange={setOpenEditMap}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사업장 위치 변경</DialogTitle>
            <DialogDescription>지도를 클릭하여 위치를 변경하세요.</DialogDescription>
          </DialogHeader>
          <NaverMapPicker
            mapId="naver-map-picker-edit"
            defaultLat={Number(editForm.latitude) || 37.5665}
            defaultLng={Number(editForm.longitude) || 126.978}
            onSelect={(lat, lng) => 
               setEditForm(p => ({
                 ...p,
                 latitude: String(lat),
                 longitude: String(lng)
               }))
            }
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditMap(false)}>
              선택 완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
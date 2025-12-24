// modules/storeC/SearchStoresView.tsx
"use client";

import { useMemo, useState } from "react";
import { useSearchStores } from "./useSearchStores";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Search, MapPin, Store as StoreIcon } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import NaverMapPicker from "./NaverMapPicker";
import { extractErrorMessage } from "./storeApi";

type StoreGps = {
  storeId: number;
  latitude: number;
  longitude: number;
  gpsRadiusM?: number | null;
};

export default function SearchStoresView() {
  const {
    workplaceCode,
    setWorkplaceCode,
    handleSearch,
    handleKeyDown,
    searchResult,
    submitting,
    searching,
    assignmentStatus,
    handleApply,
    fetchStoreGps,
  } = useSearchStores();

  const [openMap, setOpenMap] = useState(false);
  const [gps, setGps] = useState<StoreGps | null>(null);
  const [loadingGps, setLoadingGps] = useState(false);

  const renderBadge = () => {
    if (assignmentStatus === "PENDING") return <Badge variant="secondary">승인 대기</Badge>;
    if (assignmentStatus === "ACCEPTED") return <Badge variant="default">승인 완료</Badge>;
    if (assignmentStatus === "REJECTED") return <Badge variant="destructive">거절됨</Badge>;
    return null;
  };

  const renderButtonText = () => {
    if (assignmentStatus === "PENDING") return "승인 대기 중";
    if (assignmentStatus === "ACCEPTED") return "이미 소속됨";
    if (assignmentStatus === "REJECTED") return "다시 등록 신청";
    return "직원 등록 신청";
  };

  const isApplyDisabled =
    submitting || searching || assignmentStatus === "PENDING" || assignmentStatus === "ACCEPTED";

  const { hasCoords, lat, lng } = useMemo(() => {
    const nLat = gps?.latitude;
    const nLng = gps?.longitude;
    const ok = Number.isFinite(nLat) && Number.isFinite(nLng);
    return {
      hasCoords: !!ok,
      lat: ok ? (nLat as number) : 37.5665,
      lng: ok ? (nLng as number) : 126.978,
    };
  }, [gps]);

  const handleOpenMap = async () => {
    if (!searchResult) return;
    try {
      setLoadingGps(true);
      const data = await fetchStoreGps(searchResult.storeId);
      setGps({
        storeId: data.storeId,
        latitude: data.latitude,
        longitude: data.longitude,
        gpsRadiusM: data.gpsRadiusM ?? null,
      });
      setOpenMap(true);
    } catch (e: any) {
      setGps(null);
      alert(extractErrorMessage(e) || "매장 위치 정보를 불러오지 못했습니다.");
    } finally {
      setLoadingGps(false);
    }
  };

  // ✅ 주소가 "-", "", null이면 아예 숨김 처리
  const addressText =
    (searchResult as any)?.address && (searchResult as any).address !== "-"
      ? (searchResult as any).address
      : "";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">사업장 찾기</h2>
        <p className="text-muted-foreground">사장님이 공유해주신 사업장 코드를 입력하세요.</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="사업장 코드 (숫자)"
            className="pl-10 h-10 text-lg"
            value={workplaceCode}
            onChange={setWorkplaceCode}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button size="lg" onClick={handleSearch} disabled={searching}>
          {searching ? "검색 중..." : "검색"}
        </Button>
      </div>

      {searchResult && (
        <>
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <StoreIcon className="h-5 w-5 text-primary" />
                    {searchResult.storeName}
                  </CardTitle>
                  <CardDescription>{searchResult.industry}</CardDescription>
                </div>
                {renderBadge()}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* ✅ 주소가 없으면(현재 '-' 같은 값) 이 라인 자체를 렌더링하지 않음 */}
              {addressText ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {addressText}
                </div>
              ) : null}

              <div className="pt-2 space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleOpenMap}
                  disabled={loadingGps}
                >
                  {loadingGps ? "지도 불러오는 중..." : "매장 지도 보기"}
                </Button>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleApply(searchResult.storeId)}
                  disabled={isApplyDisabled}
                >
                  {submitting ? "처리 중..." : renderButtonText()}
                </Button>

                {/* 좌표 없을 때만 안내 */}
                {!hasCoords && gps === null && (
                  <p className="text-xs text-muted-foreground">
                    "매장 지도 보기"를 통해 정확한 위치를 확인할 수 있습니다.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Dialog open={openMap} onOpenChange={setOpenMap}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>매장 위치</DialogTitle>
                <DialogDescription>저장된 좌표 기준으로 지도를 표시합니다.</DialogDescription>
              </DialogHeader>

              <NaverMapPicker
                mapId={`naver-map-store-view-${searchResult.storeId}`}
                defaultLat={lat}
                defaultLng={lng}
                onSelect={() => {}}
                readOnly // ✅ 보기 전용
              />

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenMap(false)}>
                  닫기
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
// features/owner/stores/components/NaverMapPicker.tsx
"use client"

import { useEffect, useState } from "react";
import useNaverLoader from "@/features/owner/stores/hooks/useNaverLoader";

// 지도 픽커 (로더는 훅으로 교체)
export function NaverMapPicker({
  onSelect,
  mapId,
  defaultLat = 37.5665,
  defaultLng = 126.978,
}: {
  onSelect: (lat: number, lng: number) => void;
  mapId: string;
  defaultLat?: number;
  defaultLng?: number;
}) {
  const loaded = useNaverLoader();
  const [inited, setInited] = useState(false);

  useEffect(() => {
    if (!loaded || inited) return;
    const el = document.getElementById(mapId);
    if (!el) return;
    const { naver } = window as any;
    if (!naver?.maps) { // naver.maps 객체가 있는지 확인
        console.warn("Naver Maps API is not fully loaded yet.");
        return;
    }

    const map = new naver.maps.Map(el, {
      center: new naver.maps.LatLng(defaultLat, defaultLng),
      zoom: 15,
    });
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(defaultLat, defaultLng),
      map,
    });
    naver.maps.Event.addListener(map, "click", (e: any) => {
      const lat = e.coord.lat();
      const lng = e.coord.lng();
      marker.setPosition(e.coord);
      onSelect(lat, lng);
    });
    setInited(true);
  }, [loaded, inited, mapId, onSelect, defaultLat, defaultLng]);

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
      {!loaded && (
        <p className="p-2 text-xs text-muted-foreground">지도를 불러오는 중…</p>
      )}
    </div>
  );
}
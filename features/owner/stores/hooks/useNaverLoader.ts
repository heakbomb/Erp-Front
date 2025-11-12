import { useEffect, useState } from "react";

export default function useNaverLoader() {
  const [loaded, setLoaded] = useState(false);
  const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).naver?.maps) {
      setLoaded(true);
      return;
    }
    if (!NAVER_CLIENT_ID) {
      console.warn("NEXT_PUBLIC_NAVER_MAP_CLIENT_ID가 없습니다.");
      return;
    }
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(
      NAVER_CLIENT_ID
    )}`;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, [NAVER_CLIENT_ID]);

  return loaded;
}
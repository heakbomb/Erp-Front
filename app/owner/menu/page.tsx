
"use client";

// ⭐️ 1. features 폴더에서 실제 페이지 UI를 가져옵니다.
// (경로는 직접 수정하신다고 하셨으니, 임시로 "@/features/..."로 표기합니다.)
import MenuPageFeature from "@/features/menu/MenuPage"; 

export default function MenuPage() {
  // ⭐️ 2. 실제 UI 컴포넌트를 렌더링합니다.
  return <MenuPageFeature />;
}


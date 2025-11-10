// app/owner/documents/page.tsx
"use client";

// 1. 우리가 방금 만든 'features' 폴더의 실제 페이지 UI를 가져옵니다.
// (경로는 @/ 별칭을 사용한다고 가정합니다)
import DocumentPageFeature from "@/features/document/DocumentPage";

export default function DocumentPage() {
  // 2. 실제 UI 컴포넌트를 렌더링합니다.
  return <DocumentPageFeature />;
}
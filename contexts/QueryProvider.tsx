"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 쿼리 클라이언트를 생성하고 Provider로 children을 감싸는 컴포넌트
export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // 쿼리 클라이언트 인스턴스를 생성
  // useState를 사용해 컴포넌트가 리렌더링되어도 인스턴스가 유지되도록 함
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
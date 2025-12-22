// types/react-to-print.d.ts
declare module "react-to-print" {
  import * as React from "react"

  export interface UseReactToPrintOptions {
    content: () => React.ReactInstance | null
    documentTitle?: string
    onAfterPrint?: () => void
    onBeforePrint?: () => void
    removeAfterPrint?: boolean
  }

  // 우리가 쓰는 훅 타입 최소 정의
  export function useReactToPrint(
    options: UseReactToPrintOptions,
  ): () => void
}
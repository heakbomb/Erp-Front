// app/owner/stores/page.tsx
"use client"

import { useState } from "react"
import StoresVerify from "@/features/owner/stores/components/StoresVerify"
import StoresAdd from "@/features/owner/stores/components/StoresAdd"
import StoresList from "@/features/owner/stores/components/StoresList"

export default function StoresPage() {
  const [listVersion, setListVersion] = useState(0)
  const [verifiedInfo, setVerifiedInfo] = useState<any | null>(null)

  return (
    <div className="space-y-8">
      {/* 상단 헤더 영역 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">사업장 관리</h1>
          <p className="text-muted-foreground">사업장을 한눈에 관리하세요!</p>
        </div>

        <div className="flex items-center gap-2">
          <StoresVerify
            onVerifiedAction={(info) => {
              setVerifiedInfo(info)
            }}
          />
          <StoresAdd
            verifiedInfo={verifiedInfo}
            onCreatedAction={() => setListVersion((v) => v + 1)}
          />
        </div>
      </div>

      {/* 등록된 사업장 목록 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">등록된 사업장</h2>
        <StoresList
          version={listVersion}
          onChangedAction={() => setListVersion((v) => v + 1)}
        />
      </div>
    </div>
  )
}
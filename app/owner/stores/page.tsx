"use client"

import { useState } from "react"
import StoresVerify from "./StoresVerify"
import StoresAdd from "./StoresAdd"
import StoresList from "./StoresList"

export default function StoresPage() {
  const [verifiedInfo, setVerifiedInfo] = useState<any | null>(null)
  const [listVersion, setListVersion] = useState(0)

  return (
    <div className="space-y-8">
      {/* 상단 헤더 영역 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">사업장 관리</h1>
          <p className="text-muted-foreground">
            사업장을 한눈에 관리하세요!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StoresVerify onVerifiedAction={(info) => setVerifiedInfo(info)} />
          <StoresAdd
            verifiedInfo={verifiedInfo}
            onCreatedAction={() => setListVersion((v) => v + 1)}
          />
        </div>
      </div>

      
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
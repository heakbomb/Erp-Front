"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Store } from "lucide-react"
import StoresList from "./StoresList"

// 백엔드 기본 주소
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080"

// 공통 에러 메시지 추출
function extractErrorMessage(e: any): string {
  const data = e?.response?.data
  if (typeof data === "string") return data
  if (typeof data?.message === "string") return data.message
  if (typeof data?.error === "string") return data.error
  if (typeof data?.detail === "string") return data.detail
  if (typeof e?.message === "string") return e.message
  return "요청 처리 중 오류가 발생했습니다."
}

export default function StoresPage() {
  // 등록된 사업장을 다시 불러오게 하기 위한 버전
  const [listVersion, setListVersion] = useState(0)

  // 사업장 추가 모달
  const [openAdd, setOpenAdd] = useState(false)
  const [addForm, setAddForm] = useState({
    bizId: "",
    storeName: "",
    industry: "",
    posVendor: "",
  })
  const [savingAdd, setSavingAdd] = useState(false)

  // 사업자 인증 모달
  const [openVerify, setOpenVerify] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifyForm, setVerifyForm] = useState({ bizNo: "", phone: "" })
  const [verifyStep, setVerifyStep] = useState<"PHONE" | "CODE" | "BIZNO">("PHONE")
  const [authCode, setAuthCode] = useState<string | null>(null)
  const [pollingIntervalId, setPollingIntervalId] = useState<NodeJS.Timeout | null>(null)
  const [verifiedInfo, setVerifiedInfo] = useState<any | null>(null)
  const [verifyError, setVerifyError] = useState<string>("")

  // 처음 마운트때 한 번은 리스트 새로고침 되도록
  useEffect(() => {
    setListVersion((v) => v + 1)
  }, [])

  // 1단계: 전화번호로 인증 요청
  const handleRequestCode = async () => {
    setVerifying(true)
    setVerifyError("")
    try {
      const res = await axios.post(`${API_BASE}/phone-verify/request`, {
        phoneNumber: verifyForm.phone,
      })

      setAuthCode(res.data.authCode)
      setVerifyStep("CODE")

      // 3초마다 상태 확인
      const intervalId = setInterval(() => {
        checkAuthStatus(res.data.authCode)
      }, 3000)
      setPollingIntervalId(intervalId)
    } catch (e: any) {
      setVerifyError(extractErrorMessage(e))
    } finally {
      setVerifying(false)
    }
  }

  // 2단계: 인증 메일이 왔는지 폴링
  const checkAuthStatus = async (code: string) => {
    try {
      const res = await axios.get(`${API_BASE}/phone-verify/status`, {
        params: { code },
      })
      const status = res.data.status
      if (status === "VERIFIED") {
        if (pollingIntervalId) clearInterval(pollingIntervalId)
        setPollingIntervalId(null)
        setAuthCode(null)
        setVerifyStep("BIZNO")
      }
    } catch (e: any) {
      if (pollingIntervalId) clearInterval(pollingIntervalId)
      setVerifyError("인증이 만료되었거나 실패했습니다.")
      setVerifyStep("PHONE")
    }
  }

  // 3단계: 사업자번호까지 입력해서 실제 DB에 저장
  const handleFinalVerify = async () => {
    if (!verifyForm.bizNo) {
      alert("사업자번호를 입력하세요.")
      return
    }
    setVerifying(true)
    setVerifyError("")
    try {
      const res = await axios.post(`${API_BASE}/api/business-number/verify`, {
        bizNo: verifyForm.bizNo,
        phone: verifyForm.phone,
      })
      setVerifiedInfo(res.data)
      setOpenVerify(false)
      // 인증 끝났으니 리스트 한 번 새로고침
      setListVersion((v) => v + 1)
    } catch (e: any) {
      setVerifyError(extractErrorMessage(e))
    } finally {
      setVerifying(false)
    }
  }

  // 인증 모달 닫힐 때 초기화
  const handleModalClose = (open: boolean) => {
    if (!open) {
      if (pollingIntervalId) clearInterval(pollingIntervalId)
      setPollingIntervalId(null)
      setVerifyStep("PHONE")
      setAuthCode(null)
      setVerifyForm({ bizNo: "", phone: "" })
      setVerifyError("")
    }
    setOpenVerify(open)
  }

  // 사업장 추가
  const handleCreate = async () => {
    if (!addForm.bizId.trim() || !addForm.storeName.trim() || !addForm.industry.trim()) {
      alert("사업자 ID, 사업장명, 업종은 필수입니다.")
      return
    }
    try {
      setSavingAdd(true)
      await axios.post(`${API_BASE}/api/store`, {
        bizId: Number(addForm.bizId),
        storeName: addForm.storeName,
        industry: addForm.industry,
        posVendor: addForm.posVendor || null,
      })
      setOpenAdd(false)
      setAddForm({ bizId: "", storeName: "", industry: "", posVendor: "" })
      // 리스트 새로고침
      setListVersion((v) => v + 1)
      alert("사업장이 추가되었습니다.")
    } catch (e) {
      console.error("사업장 추가 실패:", e)
      alert("추가 중 오류가 발생했습니다.")
    } finally {
      setSavingAdd(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* 상단 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">사업장 관리</h1>
          <p className="text-muted-foreground">사업장을 한눈에 관리하세요!</p>
        </div>

        <div className="flex items-center gap-2">
          {/* 사업자 인증 다이얼로그 */}
          <Dialog open={openVerify} onOpenChange={handleModalClose}>
            <DialogTrigger asChild>
              <Button variant="outline">사업자 인증</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>사업자 인증</DialogTitle>
                <DialogDescription>본인 확인 및 사업자 정보 인증을 시작합니다.</DialogDescription>
              </DialogHeader>

              {/* 1. 전화번호 입력 */}
              <div className="space-y-2">
                <Label htmlFor="verify-phone">전화번호</Label>
                <Input
                  id="verify-phone"
                  value={verifyForm.phone}
                  onChange={(e) => setVerifyForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="예) 010-1234-5678"
                  disabled={verifyStep !== "PHONE"}
                />
              </div>

              {/* 2. 인증 문자열 표시 */}
              {verifyStep === "CODE" && authCode && (
                <div className="p-3 rounded-lg bg-gray-100 text-center">
                  <p className="text-sm text-gray-600">csmtask@gmail.com으로 아래 문자열을 전송해주세요.</p>
                  <p className="text-lg font-bold text-blue-600 my-2">{authCode}</p>
                  <p className="text-xs text-gray-500">(이메일 확인 후 자동으로 다음 단계로 이동합니다)</p>
                </div>
              )}

              {/* 3. 사업자 번호 입력 */}
              {verifyStep === "BIZNO" && (
                <div className="space-y-2">
                  <Label htmlFor="verify-bizNo">사업자번호(‘-’ 없이 10자리)</Label>
                  <Input
                    id="verify-bizNo"
                    value={verifyForm.bizNo}
                    onChange={(e) =>
                      setVerifyForm((p) => ({ ...p, bizNo: e.target.value.replace(/[^0-9]/g, "") }))
                    }
                    placeholder="예) 1234567890"
                    maxLength={10}
                  />
                </div>
              )}

              {verifyError && (
                <p className="text-sm text-red-600 whitespace-pre-wrap">{verifyError}</p>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleModalClose(false)}
                  disabled={verifying && verifyStep !== "CODE"}
                >
                  취소
                </Button>
                <Button
                  onClick={
                    verifyStep === "PHONE"
                      ? handleRequestCode
                      : verifyStep === "BIZNO"
                        ? handleFinalVerify
                        : undefined
                  }
                  disabled={verifying || verifyStep === "CODE"}
                >
                  {verifying
                    ? "처리 중..."
                    : verifyStep === "PHONE"
                      ? "인증 요청"
                      : verifyStep === "CODE"
                        ? "인증 대기 중..."
                        : "최종 인증"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* 사업장 추가 다이얼로그 */}
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button>
                <Store className="mr-2 h-4 w-4" />
                사업장 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>사업장 추가</DialogTitle>
                <DialogDescription>새로운 사업장 정보를 입력하세요</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="add-bizId">사업자 ID</Label>
                  <Input
                    id="add-bizId"
                    type="number"
                    value={addForm.bizId}
                    onChange={(e) => setAddForm((p) => ({ ...p, bizId: e.target.value }))}
                    placeholder="예) 1001"
                  />
                  <p className="text-xs text-muted-foreground">
                    사업자 번호를 아직 인증하지 않았다면{" "}
                    <span className="font-medium">오른쪽 상단의 ‘사업자 인증’</span>을 먼저 진행하세요.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-storeName">사업장명</Label>
                  <Input
                    id="add-storeName"
                    value={addForm.storeName}
                    onChange={(e) => setAddForm((p) => ({ ...p, storeName: e.target.value }))}
                    placeholder="예) DEV 기본 매장"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-industry">업종</Label>
                  <Input
                    id="add-industry"
                    value={addForm.industry}
                    onChange={(e) => setAddForm((p) => ({ ...p, industry: e.target.value }))}
                    placeholder="예) CAFE / KOREAN / etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-posVendor">POS 시스템(선택)</Label>
                  <Input
                    id="add-posVendor"
                    value={addForm.posVendor}
                    onChange={(e) => setAddForm((p) => ({ ...p, posVendor: e.target.value }))}
                    placeholder="예) 포스시스템A"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenAdd(false)}>
                  취소
                </Button>
                <Button onClick={handleCreate} disabled={savingAdd}>
                  {savingAdd ? "저장 중..." : "추가"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 등록된 사업장 리스트 */}
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
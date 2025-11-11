"use client"

import { useState } from "react"
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

const API_BASE = "http://localhost:8080"

function extractErrorMessage(e: any): string {
  const data = e?.response?.data
  if (typeof data === "string") return data
  if (typeof data?.message === "string") return data.message
  if (typeof data?.error === "string") return data.error
  if (typeof data?.detail === "string") return data.detail
  if (typeof e?.message === "string") return e.message
  return "인증 중 오류가 발생했습니다."
}

export default function StoresVerify({
  onVerifiedAction,
}: {
  onVerifiedAction?: (info: any) => void
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ bizNo: "", phone: "" })
  const [error, setError] = useState("")

  // 🔹 전화번호 인증 관련
  const [phoneStep, setPhoneStep] = useState<"IDLE" | "CODE" | "VERIFIED">("IDLE")
  const [authCode, setAuthCode] = useState<string | null>(null)
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [pollingId, setPollingId] = useState<NodeJS.Timeout | null>(null)

  // 🔹 최종 저장 로딩
  const [saving, setSaving] = useState(false)

  // 전화번호 인증 요청
  const handlePhoneVerify = async () => {
    if (!form.phone.trim()) {
      alert("전화번호를 먼저 입력하세요.")
      return
    }
    try {
      setPhoneLoading(true)
      setError("")
      // 백엔드에 인증 요청
      const res = await axios.post(`${API_BASE}/phone-verify/request`, {
        phoneNumber: form.phone,
      })

      // 코드 표시 단계로 전환
      const code = res.data.authCode
      setAuthCode(code)
      setPhoneStep("CODE")

      // 폴링 시작
      const timer = setInterval(async () => {
        try {
          const statusRes = await axios.get(`${API_BASE}/phone-verify/status`, {
            params: { code },
          })
          if (statusRes.data.status === "VERIFIED") {
            setPhoneStep("VERIFIED")
            setAuthCode(null)
            if (pollingId) clearInterval(pollingId)
            setPollingId(null)
          } else if (statusRes.data.status === "EXPIRED") {
            setError("인증이 만료되었습니다. 다시 요청해주세요.")
            setPhoneStep("IDLE")
            setAuthCode(null)
            if (pollingId) clearInterval(pollingId)
            setPollingId(null)
          }
        } catch (e) {
          // 폴링 중 오류는 그냥 표시만
          console.warn(e)
        }
      }, 3000)

      setPollingId(timer)
    } catch (e: any) {
      setError(extractErrorMessage(e))
      setPhoneStep("IDLE")
      setAuthCode(null)
    } finally {
      setPhoneLoading(false)
    }
  }

  // 최종 DB 저장 (원래 하던 /api/business-number/verify)
  const handleSave = async () => {
    if (!form.bizNo.trim()) {
      alert("사업자번호를 입력하세요. (‘-’ 없이 10자리)")
      return
    }
    if (!form.phone.trim()) {
      alert("전화번호를 입력하세요.")
      return
    }
    try {
      setSaving(true)
      setError("")
      const res = await axios.post(`${API_BASE}/api/business-number/verify`, {
        bizNo: form.bizNo,
        phone: form.phone || "",
      })
      const bn = res.data
      onVerifiedAction?.(bn)
      alert("✅ 사업자 인증이 완료되었습니다.")
      // 성공했으면 닫기 + 초기화
      handleClose()
    } catch (e: any) {
      const msg = extractErrorMessage(e)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  // 다이얼로그 닫힐 때 정리
  const handleClose = () => {
    if (pollingId) {
      clearInterval(pollingId)
    }
    setPollingId(null)
    setOpen(false)
    setForm({ bizNo: "", phone: "" })
    setError("")
    setAuthCode(null)
    setPhoneStep("IDLE")
    setPhoneLoading(false)
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button variant="outline">사업자 인증</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>사업자 번호 인증</DialogTitle>
          <DialogDescription>전화번호 인증 → 사업자번호 입력 → DB 저장 순서로 진행하세요.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* 전화번호 */}
          <div className="space-y-2">
            <Label htmlFor="verify-phone">전화번호</Label>
            <Input
              id="verify-phone"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="예) 010-1234-5678"
              disabled={phoneStep === "CODE" || phoneStep === "VERIFIED"}
            />
            {phoneStep === "VERIFIED" && (
              <p className="text-xs text-green-600">전화번호 인증이 완료되었습니다.</p>
            )}
          </div>

          {/* 인증코드 안내 */}
          {phoneStep === "CODE" && authCode && (
            <div className="p-3 rounded bg-gray-100 text-sm">
              <p className="mb-1">아래 인증 문자열을 지정된 메일로 전송하면 자동으로 인증됩니다.</p>
              <p className="font-mono font-bold text-blue-600">{authCode}</p>
              <p className="text-xs text-muted-foreground mt-1">인증이 완료되면 다음 단계로 이동합니다.</p>
            </div>
          )}

          {/* 사업자번호 */}
          <div className="space-y-2">
            <Label htmlFor="verify-bizNo">사업자번호(‘-’ 없이 10자리)</Label>
            <Input
              id="verify-bizNo"
              inputMode="numeric"
              value={form.bizNo}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  bizNo: e.target.value.replace(/[^0-9]/g, ""),
                }))
              }
              placeholder="예) 1234567890"
              maxLength={10}
            />
          </div>

          {error && <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>}
        </div>
        <DialogFooter className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleClose}>
            닫기
          </Button>
          <Button
            variant="outline"
            onClick={handlePhoneVerify}
            disabled={phoneLoading || phoneStep === "CODE" || phoneStep === "VERIFIED"}
          >
            {phoneLoading ? "전화번호 인증 중..." : phoneStep === "VERIFIED" ? "전화번호 인증 완료" : "전화번호 인증"}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
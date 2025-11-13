"use client"

import { useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Store, Send, CheckCircle, Key } from "lucide-react"
import { Label } from "@/components/ui/label"

const API_BASE = "http://localhost:8080"
const MOCK_EMPLOYEE_ID = 3          // ✅ 로그인 전 임시 직원 ID (DB에 존재해야 함)
const DEFAULT_ROLE = "STAFF"        // ✅ 기본 역할

type PreviewStore = {
  id: number
  name: string
  code: string
  address?: string
  industry?: string
  employees?: number
}

export default function SearchStoresPage() {
  const [workplaceCode, setWorkplaceCode] = useState("")
  const [searchResult, setSearchResult] = useState<PreviewStore | null>(null)
  const [appliedStores, setAppliedStores] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [searching, setSearching] = useState(false)

  // ✅ 숫자 storeId 기반 조회 (예: 11)
  const handleSearch = async () => {
    const trimmed = workplaceCode.trim()
    if (!trimmed) {
      alert("사업장 코드를 입력하세요.")
      return
    }
    const id = Number(trimmed)
    if (Number.isNaN(id)) {
      alert("사업장 코드는 숫자 형태여야 합니다. (예: 11)")
      return
    }

    try {
      setSearching(true)
      // 백엔드 Store 단건 조회 (엔드포인트는 프로젝트에 맞게 조정)
      const { data } = await axios.get(`${API_BASE}/api/store/${id}`)
      // 예상 응답: { storeId, storeName, industry, posVendor, status, approvedAt, bizId }
      setSearchResult({
        id: data.storeId,
        name: data.storeName ?? `사업장 #${id}`,
        code: String(data.storeId),
        address: "-",              // 아직 주소 필드 없으면 임시
        industry: data.industry ?? "-",
        employees: undefined,      // 인원 수 API 없으니 일단 미표시
      })
    } catch (e) {
      setSearchResult(null)
      alert("사업장 코드를 찾을 수 없습니다.")
    } finally {
      setSearching(false)
    }
  }

  // ✅ 신청: DB에 저장(status = PENDING)
  const handleApply = async (storeId: number) => {
    if (appliedStores.includes(storeId)) {
      alert("이미 신청한 사업장입니다.")
      return
    }
    try {
      setSubmitting(true)
      await axios.post(`${API_BASE}/api/assignments/apply`, {
        employeeId: MOCK_EMPLOYEE_ID,
        storeId,
        role: DEFAULT_ROLE,
      })
      setAppliedStores((prev) => [...prev, storeId])
      alert("신청이 접수되었습니다. 사장님 승인 대기 중입니다.")
      setSearchResult(null)
      setWorkplaceCode("")
    } catch (e: any) {
      const msg =
        e?.response?.data ??
        e?.message ??
        "신청 중 오류가 발생했습니다. (직원/사업장 존재 여부 또는 중복 신청 여부 확인)"
      alert(String(msg))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">사업장 검색</h1>
        <p className="text-muted-foreground">사업장 코드를 입력하여 근무 신청하세요</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>사업장 코드 입력</CardTitle>
          <CardDescription>사장님께 받은 사업장 코드를 입력하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workplace-code">사업장 코드</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Key className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="workplace-code"
                  placeholder="예: 11"
                  value={workplaceCode}
                  onChange={(e) => setWorkplaceCode(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button size="lg" onClick={handleSearch} disabled={searching}>
                {searching ? "검색 중..." : "검색"}
              </Button>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">
              💡 현재는 숫자 형태의 사업장 코드(예: <span className="font-mono">11</span>)를 사용합니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {searchResult && !appliedStores.includes(searchResult.id) && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>검색 결과</CardTitle>
            <CardDescription>아래 사업장이 맞다면 신청하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-start gap-3 flex-1">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{searchResult.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{searchResult.address}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{searchResult.industry}</Badge>
                    {typeof searchResult.employees === "number" && (
                      <span className="text-xs text-muted-foreground">직원 {searchResult.employees}명</span>
                    )}
                  </div>
                  <div className="mt-2 p-2 rounded bg-muted">
                    <p className="text-xs text-muted-foreground">
                      사업장 코드: <span className="font-mono font-medium">{searchResult.code}</span>
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleApply(searchResult.id)} disabled={submitting}>
                <Send className="mr-2 h-4 w-4" />
                {submitting ? "신청 중..." : "신청하기"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {appliedStores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>신청한 사업장</CardTitle>
            <CardDescription>승인 대기 중인 사업장입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appliedStores.map((id) => (
                <div key={id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">사업장 #{id}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">주소 정보 없음</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">업종 정보 없음</Badge>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    승인 대기
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
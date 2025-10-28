"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Store, Send, CheckCircle, Key } from "lucide-react"
import { Label } from "@/components/ui/label"

const mockStores = [
  {
    id: 1,
    name: "홍길동 식당 본점",
    code: "HONG-2024-001",
    address: "서울시 강남구 테헤란로 123",
    industry: "한식당",
    employees: 8,
    status: "모집중",
  },
  {
    id: 2,
    name: "카페 모카",
    code: "MOCA-2024-042",
    address: "서울시 강남구 역삼동 456",
    industry: "카페",
    employees: 5,
    status: "모집중",
  },
  {
    id: 3,
    name: "이탈리안 레스토랑",
    code: "ITAL-2024-089",
    address: "서울시 서초구 서초대로 789",
    industry: "양식당",
    employees: 12,
    status: "모집중",
  },
]

export default function SearchStoresPage() {
  const [workplaceCode, setWorkplaceCode] = useState("")
  const [searchResult, setSearchResult] = useState<any>(null)
  const [appliedStores, setAppliedStores] = useState<number[]>([])

  const handleSearch = () => {
    const found = mockStores.find((store) => store.code === workplaceCode.toUpperCase())
    setSearchResult(found || null)
    if (!found) {
      alert("사업장 코드를 찾을 수 없습니다. 코드를 확인해주세요.")
    }
  }

  const handleApply = (storeId: number) => {
    setAppliedStores([...appliedStores, storeId])
    setSearchResult(null)
    setWorkplaceCode("")
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
                  placeholder="예: HONG-2024-001"
                  value={workplaceCode}
                  onChange={(e) => setWorkplaceCode(e.target.value.toUpperCase())}
                  className="pl-10 h-12"
                />
              </div>
              <Button size="lg" onClick={handleSearch}>
                검색
              </Button>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">
              💡 사업장 코드는 사장님이 제공합니다. 코드를 모르시면 사장님께 문의하세요.
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
                    <span className="text-xs text-muted-foreground">직원 {searchResult.employees}명</span>
                  </div>
                  <div className="mt-2 p-2 rounded bg-muted">
                    <p className="text-xs text-muted-foreground">
                      사업장 코드: <span className="font-mono font-medium">{searchResult.code}</span>
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleApply(searchResult.id)}>
                <Send className="mr-2 h-4 w-4" />
                신청하기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applied Stores */}
      {appliedStores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>신청한 사업장</CardTitle>
            <CardDescription>승인 대기 중인 사업장입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockStores
                .filter((store) => appliedStores.includes(store.id))
                .map((store) => (
                  <div key={store.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{store.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{store.address}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{store.industry}</Badge>
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

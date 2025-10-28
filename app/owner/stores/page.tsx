"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Store, MapPin, Phone, Mail, Edit, Trash2, Copy } from "lucide-react"

const mockStores = [
  {
    id: 1,
    name: "홍길동 식당 본점",
    code: "HONG-2024-001",
    address: "서울시 강남구 테헤란로 123",
    phone: "02-1234-5678",
    email: "main@hongrestaurant.com",
    industry: "한식당",
    posVendor: "포스시스템A",
    status: "운영중",
  },
  {
    id: 2,
    name: "홍길동 식당 2호점",
    code: "HONG-2024-002",
    address: "서울시 서초구 서초대로 456",
    phone: "02-2345-6789",
    email: "branch2@hongrestaurant.com",
    industry: "한식당",
    posVendor: "포스시스템A",
    status: "운영중",
  },
]

export default function StoresPage() {
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert("사업장 코드가 복사되었습니다!")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">사업장 관리</h1>
          <p className="text-muted-foreground">등록된 사업장 정보를 관리하세요</p>
        </div>
        <Button>
          <Store className="mr-2 h-4 w-4" />
          사업장 추가
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {mockStores.map((store) => (
          <Card key={store.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{store.name}</CardTitle>
                    <CardDescription>{store.industry}</CardDescription>
                  </div>
                </div>
                <Badge variant="default">{store.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">사업장 코드</p>
                    <p className="font-mono font-bold text-primary">{store.code}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleCopyCode(store.code)}>
                    <Copy className="h-4 w-4 mr-1" />
                    복사
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 직원에게 이 코드를 공유하여 근무 신청을 받으세요
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">{store.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{store.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{store.email}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    POS 시스템: <span className="font-medium text-foreground">{store.posVendor}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Edit className="mr-2 h-4 w-4" />
                  수정
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Store, MapPin, Phone, Mail, Calendar, Users, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default function StoreDetailPage({ params }: { params: { id: string } }) {
  // Mock data - in real app, fetch based on params.id
  const store = {
    id: params.id,
    name: "맛있는 카페",
    code: "CAFE-2024-001",
    owner: "김사장",
    ownerEmail: "kim@example.com",
    ownerPhone: "010-1234-5678",
    type: "카페",
    address: "서울시 강남구 테헤란로 123",
    phone: "02-1234-5678",
    email: "cafe@example.com",
    businessNumber: "123-45-67890",
    employees: 5,
    status: "운영중",
    registeredDate: "2024-01-15",
    approvedDate: "2024-01-16",
    posVendor: "포스시스템A",
  }

  const employees = [
    { id: 1, name: "박직원", role: "바리스타", joinDate: "2024-01-20", status: "활성" },
    { id: 2, name: "이직원", role: "서빙", joinDate: "2024-02-01", status: "활성" },
    { id: 3, name: "최직원", role: "주방", joinDate: "2024-02-15", status: "활성" },
  ]

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">사업장 상세 정보</h1>
          <p className="text-muted-foreground">사업장의 모든 정보를 확인하고 관리합니다</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/stores">목록으로</Link>
          </Button>
          {store.status === "대기" && (
            <>
              <Button variant="default">
                <CheckCircle className="mr-2 h-4 w-4" />
                승인
              </Button>
              <Button variant="destructive">
                <XCircle className="mr-2 h-4 w-4" />
                거부
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{store.name}</CardTitle>
                  <CardDescription>{store.type}</CardDescription>
                </div>
              </div>
              <Badge variant={store.status === "운영중" ? "default" : "outline"}>{store.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">기본 정보</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">주소</p>
                    <p className="text-sm text-muted-foreground">{store.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">전화번호</p>
                    <p className="text-sm text-muted-foreground">{store.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">이메일</p>
                    <p className="text-sm text-muted-foreground">{store.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">사업자 정보</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">사업자등록번호</span>
                  <span className="font-medium">{store.businessNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">사업장 코드</span>
                  <span className="font-mono font-medium">{store.code}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">POS 시스템</span>
                  <span className="font-medium">{store.posVendor}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">등록 정보</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">등록일:</span>
                  <span className="font-medium">{store.registeredDate}</span>
                </div>
                {store.approvedDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">승인일:</span>
                    <span className="font-medium">{store.approvedDate}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Owner Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>사장님 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">이름</p>
                <p className="font-medium">{store.owner}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">이메일</p>
                <p className="font-medium">{store.ownerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">전화번호</p>
                <p className="font-medium">{store.ownerPhone}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                직원 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">{store.employees}명</div>
              <div className="space-y-2">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                    <div>
                      <p className="text-sm font-medium">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">{employee.role}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {employee.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

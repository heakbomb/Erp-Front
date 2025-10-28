"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Search, Check, X, MoreVertical } from "lucide-react"

const mockEmployees = [
  {
    id: 1,
    name: "김직원",
    email: "kim@example.com",
    phone: "010-1234-5678",
    role: "주방",
    status: "근무중",
    joinDate: "2024-01-15",
  },
  {
    id: 2,
    name: "이직원",
    email: "lee@example.com",
    phone: "010-2345-6789",
    role: "홀",
    status: "휴무",
    joinDate: "2024-02-01",
  },
  {
    id: 3,
    name: "박직원",
    email: "park@example.com",
    phone: "010-3456-7890",
    role: "주방",
    status: "근무중",
    joinDate: "2024-03-10",
  },
]

const mockPendingRequests = [
  { id: 1, name: "최신청", email: "choi@example.com", phone: "010-4567-8901", requestDate: "2024-04-15" },
  { id: 2, name: "정신청", email: "jung@example.com", phone: "010-5678-9012", requestDate: "2024-04-16" },
  { id: 3, name: "강신청", email: "kang@example.com", phone: "010-6789-0123", requestDate: "2024-04-17" },
]

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">직원 관리</h1>
          <p className="text-muted-foreground">직원 정보와 출결 현황을 관리하세요</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              직원 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>직원 추가</DialogTitle>
              <DialogDescription>새로운 직원 정보를 입력하세요</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input id="name" placeholder="홍길동" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" type="email" placeholder="example@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">전화번호</Label>
                <Input id="phone" placeholder="010-1234-5678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">역할</Label>
                <Input id="role" placeholder="주방, 홀 등" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>추가</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">전체 직원</TabsTrigger>
          <TabsTrigger value="pending">
            신청 대기
            <Badge variant="destructive" className="ml-2">
              {mockPendingRequests.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="attendance">출결 현황</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>직원 목록</CardTitle>
                  <CardDescription>전체 {mockEmployees.length}명의 직원이 등록되어 있습니다</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="직원 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>전화번호</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>입사일</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.phone}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>
                        <Badge variant={employee.status === "근무중" ? "default" : "secondary"}>
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{employee.joinDate}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>신청 대기 중인 직원</CardTitle>
              <CardDescription>사업장 가입을 신청한 직원들입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>전화번호</TableHead>
                    <TableHead>신청일</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>{request.email}</TableCell>
                      <TableCell>{request.phone}</TableCell>
                      <TableCell>{request.requestDate}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="default">
                          <Check className="mr-1 h-3 w-3" />
                          승인
                        </Button>
                        <Button size="sm" variant="outline">
                          <X className="mr-1 h-3 w-3" />
                          거절
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>오늘의 출결 현황</CardTitle>
              <CardDescription>2024년 4월 20일 기준</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>출근 시간</TableHead>
                    <TableHead>퇴근 시간</TableHead>
                    <TableHead>근무 시간</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">김직원</TableCell>
                    <TableCell>09:00</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>진행중</TableCell>
                    <TableCell>
                      <Badge variant="default">근무중</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">이직원</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <Badge variant="secondary">휴무</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">박직원</TableCell>
                    <TableCell>09:15</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>진행중</TableCell>
                    <TableCell>
                      <Badge variant="default">근무중</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

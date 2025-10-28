"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Store, MoreVertical, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function AdminStoresPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const stores = [
    {
      id: 1,
      name: "맛있는 카페",
      owner: "김사장",
      type: "카페",
      employees: 5,
      status: "운영중",
      registeredDate: "2024-01-15",
    },
    {
      id: 2,
      name: "행복한 식당",
      owner: "이사장",
      type: "음식점",
      employees: 8,
      status: "운영중",
      registeredDate: "2024-02-20",
    },
    {
      id: 3,
      name: "즐거운 베이커리",
      owner: "김사장",
      type: "베이커리",
      employees: 3,
      status: "운영중",
      registeredDate: "2024-03-10",
    },
    {
      id: 4,
      name: "신선한 주스바",
      owner: "박사장",
      type: "카페",
      employees: 2,
      status: "대기",
      registeredDate: "2024-03-25",
    },
    {
      id: 5,
      name: "프리미엄 스테이크",
      owner: "최사장",
      type: "음식점",
      employees: 0,
      status: "대기",
      registeredDate: "2024-04-01",
    },
  ]

  const activeStores = stores.filter((s) => s.status === "운영중")
  const pendingStores = stores.filter((s) => s.status === "대기")

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">사업장 관리</h1>
        <p className="text-muted-foreground">등록된 모든 사업장을 관리합니다</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>전체 사업장</CardDescription>
            <CardTitle className="text-3xl">{stores.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>운영중</CardDescription>
            <CardTitle className="text-3xl">{activeStores.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>승인 대기</CardDescription>
            <CardTitle className="text-3xl">{pendingStores.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>신규 등록 (이번 달)</CardDescription>
            <CardTitle className="text-3xl">2</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>사업장 목록</CardTitle>
              <CardDescription>운영중 및 승인 대기 사업장 관리</CardDescription>
            </div>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="사업장명, 사장님 이름으로 검색..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="active">운영중</TabsTrigger>
              <TabsTrigger value="pending">
                승인 대기
                {pendingStores.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingStores.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사업장명</TableHead>
                    <TableHead>사장님</TableHead>
                    <TableHead>업종</TableHead>
                    <TableHead>직원 수</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Store className="mr-2 h-4 w-4 text-muted-foreground" />
                          {store.name}
                        </div>
                      </TableCell>
                      <TableCell>{store.owner}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{store.type}</Badge>
                      </TableCell>
                      <TableCell>{store.employees}명</TableCell>
                      <TableCell>
                        <Badge variant={store.status === "운영중" ? "default" : "outline"}>{store.status}</Badge>
                      </TableCell>
                      <TableCell>{store.registeredDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/stores/${store.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/stores/${store.id}`}>상세 보기</Link>
                              </DropdownMenuItem>
                              {store.status === "대기" && <DropdownMenuItem>승인</DropdownMenuItem>}
                              <DropdownMenuItem className="text-destructive">정지</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="active" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사업장명</TableHead>
                    <TableHead>사장님</TableHead>
                    <TableHead>업종</TableHead>
                    <TableHead>직원 수</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeStores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Store className="mr-2 h-4 w-4 text-muted-foreground" />
                          {store.name}
                        </div>
                      </TableCell>
                      <TableCell>{store.owner}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{store.type}</Badge>
                      </TableCell>
                      <TableCell>{store.employees}명</TableCell>
                      <TableCell>{store.registeredDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/stores/${store.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/stores/${store.id}`}>상세 보기</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">정지</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사업장명</TableHead>
                    <TableHead>사장님</TableHead>
                    <TableHead>업종</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingStores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Store className="mr-2 h-4 w-4 text-muted-foreground" />
                          {store.name}
                        </div>
                      </TableCell>
                      <TableCell>{store.owner}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{store.type}</Badge>
                      </TableCell>
                      <TableCell>{store.registeredDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="default" size="sm">
                            승인
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/stores/${store.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/stores/${store.id}`}>상세 보기</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>승인</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">거부</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

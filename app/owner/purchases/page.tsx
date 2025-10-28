"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Plus, Search, Upload, Download, FileText } from "lucide-react"

const mockPurchases = [
  {
    id: 1,
    date: "2024-04-20",
    supplier: "커피 도매상",
    item: "커피 원두",
    quantity: 20,
    unit: "kg",
    unitPrice: 25000,
    totalPrice: 500000,
    status: "완료",
  },
  {
    id: 2,
    date: "2024-04-19",
    supplier: "유제품 공급업체",
    item: "우유",
    quantity: 50,
    unit: "L",
    unitPrice: 3000,
    totalPrice: 150000,
    status: "완료",
  },
  {
    id: 3,
    date: "2024-04-18",
    supplier: "식자재 마트",
    item: "밀가루",
    quantity: 30,
    unit: "kg",
    unitPrice: 2000,
    totalPrice: 60000,
    status: "완료",
  },
  {
    id: 4,
    date: "2024-04-17",
    supplier: "농산물 도매시장",
    item: "계란",
    quantity: 200,
    unit: "개",
    unitPrice: 300,
    totalPrice: 60000,
    status: "완료",
  },
  {
    id: 5,
    date: "2024-04-16",
    supplier: "커피 도매상",
    item: "설탕",
    quantity: 15,
    unit: "kg",
    unitPrice: 5000,
    totalPrice: 75000,
    status: "완료",
  },
]

export default function PurchasesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const totalPurchases = mockPurchases.reduce((sum, p) => sum + p.totalPrice, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">매입 관리</h1>
          <p className="text-muted-foreground">매입 내역을 기록하고 관리하세요</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-transparent">
            <Upload className="mr-2 h-4 w-4" />
            Excel 가져오기
          </Button>
          <Button variant="outline" className="bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Excel 내보내기
          </Button>
          <Button variant="outline" className="bg-transparent">
            <FileText className="mr-2 h-4 w-4" />
            PDF 내보내기
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                매입 기록
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>매입 기록 추가</DialogTitle>
                <DialogDescription>새로운 매입 내역을 등록하세요</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">공급업체</Label>
                  <Input id="supplier" placeholder="커피 도매상" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item">품목</Label>
                  <Input id="item" placeholder="커피 원두" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">수량</Label>
                    <Input id="quantity" type="number" placeholder="20" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">단위</Label>
                    <Input id="unit" placeholder="kg" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit-price">단가</Label>
                  <Input id="unit-price" type="number" placeholder="25000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase-date">매입일</Label>
                  <Input id="purchase-date" type="date" />
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
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">이번 달 총 매입</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{totalPurchases.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-red-600">+15.3%</span> 전월 대비
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">매입 건수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPurchases.length}건</div>
            <p className="text-xs text-muted-foreground mt-1">이번 달 기준</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">주요 공급업체</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4곳</div>
            <p className="text-xs text-muted-foreground mt-1">거래 중인 업체</p>
          </CardContent>
        </Card>
      </div>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>매입 내역</CardTitle>
              <CardDescription>최근 매입 기록</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="품목 또는 공급업체 검색..."
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
                <TableHead>날짜</TableHead>
                <TableHead>공급업체</TableHead>
                <TableHead>품목</TableHead>
                <TableHead>수량</TableHead>
                <TableHead>단가</TableHead>
                <TableHead>총액</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{purchase.date}</TableCell>
                  <TableCell className="font-medium">{purchase.supplier}</TableCell>
                  <TableCell>{purchase.item}</TableCell>
                  <TableCell>
                    {purchase.quantity} {purchase.unit}
                  </TableCell>
                  <TableCell>₩{purchase.unitPrice.toLocaleString()}</TableCell>
                  <TableCell className="font-medium">₩{purchase.totalPrice.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{purchase.status}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

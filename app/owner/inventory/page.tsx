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
import { Plus, Search, AlertTriangle, Upload, Download, Edit, Trash2 } from "lucide-react"

const mockInventory = [
  {
    id: 1,
    name: "커피 원두",
    category: "음료",
    currentStock: 15,
    safetyStock: 20,
    unit: "kg",
    unitPrice: 25000,
    expiryDate: "2024-06-30",
    status: "부족",
  },
  {
    id: 2,
    name: "우유",
    category: "음료",
    currentStock: 50,
    safetyStock: 30,
    unit: "L",
    unitPrice: 3000,
    expiryDate: "2024-04-25",
    status: "정상",
  },
  {
    id: 3,
    name: "설탕",
    category: "음료",
    currentStock: 8,
    safetyStock: 10,
    unit: "kg",
    unitPrice: 5000,
    expiryDate: "2025-12-31",
    status: "부족",
  },
  {
    id: 4,
    name: "밀가루",
    category: "식재료",
    currentStock: 45,
    safetyStock: 20,
    unit: "kg",
    unitPrice: 2000,
    expiryDate: "2024-08-15",
    status: "정상",
  },
  {
    id: 5,
    name: "계란",
    category: "식재료",
    currentStock: 120,
    safetyStock: 100,
    unit: "개",
    unitPrice: 300,
    expiryDate: "2024-04-28",
    status: "정상",
  },
]

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  const lowStockItems = mockInventory.filter((item) => item.status === "부족")

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (itemId: number) => {
    if (confirm("정말 이 품목을 삭제하시겠습니까?")) {
      console.log("Deleting item:", itemId)
      // TODO: Implement delete logic
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">재고 관리</h1>
          <p className="text-muted-foreground">재고 현황을 확인하고 관리하세요</p>
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                재고 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>재고 추가</DialogTitle>
                <DialogDescription>새로운 재고 품목을 등록하세요</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">품목명</Label>
                  <Input id="item-name" placeholder="커피 원두" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">카테고리</Label>
                    <Input id="category" placeholder="음료" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">단위</Label>
                    <Input id="unit" placeholder="kg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-stock">현재 재고</Label>
                    <Input id="current-stock" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="safety-stock">안전 재고</Label>
                    <Input id="safety-stock" type="number" placeholder="0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit-price">단가</Label>
                  <Input id="unit-price" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry-date">유통기한</Label>
                  <Input id="expiry-date" type="date" />
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

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-900 dark:text-amber-100">재고 부족 알림</CardTitle>
            </div>
            <CardDescription className="text-amber-700 dark:text-amber-200">
              {lowStockItems.length}개 품목이 안전 재고 수준 이하입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-card">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      현재: {item.currentStock}
                      {item.unit} / 안전: {item.safetyStock}
                      {item.unit}
                    </p>
                  </div>
                  <Button size="sm">발주하기</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>재고 목록</CardTitle>
              <CardDescription>전체 {mockInventory.length}개 품목</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="품목 검색..."
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
                <TableHead>품목명</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>현재 재고</TableHead>
                <TableHead>안전 재고</TableHead>
                <TableHead>단가</TableHead>
                <TableHead>유통기한</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    {item.currentStock} {item.unit}
                  </TableCell>
                  <TableCell>
                    {item.safetyStock} {item.unit}
                  </TableCell>
                  <TableCell>₩{item.unitPrice.toLocaleString()}</TableCell>
                  <TableCell>{item.expiryDate}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "정상" ? "default" : "destructive"}>{item.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>재고 수정</DialogTitle>
            <DialogDescription>재고 품목 정보를 수정하세요</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-item-name">품목명</Label>
                <Input id="edit-item-name" defaultValue={editingItem.name} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">카테고리</Label>
                  <Input id="edit-category" defaultValue={editingItem.category} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-unit">단위</Label>
                  <Input id="edit-unit" defaultValue={editingItem.unit} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-current-stock">현재 재고</Label>
                  <Input id="edit-current-stock" type="number" defaultValue={editingItem.currentStock} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-safety-stock">안전 재고</Label>
                  <Input id="edit-safety-stock" type="number" defaultValue={editingItem.safetyStock} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit-price">단가</Label>
                <Input id="edit-unit-price" type="number" defaultValue={editingItem.unitPrice} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-expiry-date">유통기한</Label>
                <Input id="edit-expiry-date" type="date" defaultValue={editingItem.expiryDate} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

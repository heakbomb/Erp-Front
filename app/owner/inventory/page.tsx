"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, Upload, Download, Edit, AlertTriangle } from "lucide-react"

const API_BASE = "http://localhost:8080"
const STORE_ID = 11
const PAGE_WINDOW = 10

type ActiveStatus = "ACTIVE" | "INACTIVE"

type InventoryResponse = {
  itemId: number
  storeId: number
  itemName: string
  itemType: string
  stockType: string
  stockQty: number
  safetyQty: number
  status: ActiveStatus
}

type PageResponse<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export default function InventoryPage() {
  // 목록 상태
  const [items, setItems] = useState<InventoryResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 검색/필터/페이지
  const [searchQuery, setSearchQuery] = useState("")
  const [showInactiveOnly, setShowInactiveOnly] = useState(false) // ✅ 꺼짐=ACTIVE만, 켜짐=INACTIVE만
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const sort = "itemName,asc"

  // 다이얼로그 & 폼
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)

  const [fItemName, setFItemName] = useState("")
  const [fItemType, setFItemType] = useState("")
  const [fStockType, setFStockType] = useState("")
  const [fStockQty, setFStockQty] = useState<number | "">("")
  const [fSafetyQty, setFSafetyQty] = useState<number | "">("")

  // ===== 목록 조회 =====
  const fetchInventory = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = {
        storeId: STORE_ID,
        q: searchQuery || undefined,
        page,
        size: pageSize,
        sort,
        // ✅ 항상 status를 보낸다 (기본 ACTIVE, 토글 시 INACTIVE)
        status: showInactiveOnly ? "INACTIVE" : "ACTIVE",
      }
      const res = await axios.get<PageResponse<InventoryResponse>>(`${API_BASE}/owner/inventory`, { params })
      setItems(res.data.content ?? [])
      setTotalPages(res.data.totalPages ?? 0)
    } catch (e: any) {
      console.error(e)
      setError(e?.response?.data?.message || "재고 목록을 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, page, pageSize, showInactiveOnly])

  const resetForm = () => {
    setFItemName("")
    setFItemType("")
    setFStockType("")
    setFStockQty("")
    setFSafetyQty("")
  }

  // ===== 생성 =====
  const handleCreate = async () => {
    if (!fItemName.trim() || !fItemType.trim() || !fStockType.trim()) return alert("필수값을 입력하세요.")
    if (fStockQty === "" || Number(fStockQty) < 0) return alert("현재 재고는 0 이상이어야 합니다.")
    if (fSafetyQty === "" || Number(fSafetyQty) < 0) return alert("안전 재고는 0 이상이어야 합니다.")
    try {
      const body = {
        storeId: STORE_ID,
        itemName: fItemName.trim(),
        itemType: fItemType.trim(),
        stockType: fStockType.trim(),
        stockQty: Number(fStockQty),
        safetyQty: Number(fSafetyQty),
      }
      await axios.post<InventoryResponse>(`${API_BASE}/owner/inventory`, body)
      setIsAddOpen(false)
      resetForm()
      setPage(0)
      await fetchInventory()
    } catch (e: any) {
      console.error(e)
      alert(e?.response?.data?.message || "재고 등록 중 오류가 발생했습니다.")
    }
  }

  // ===== 수정 =====
  const openEdit = (row: InventoryResponse) => {
    setEditingItemId(row.itemId)
    setFItemName(row.itemName)
    setFItemType(row.itemType)
    setFStockType(row.stockType)
    setFStockQty(Number(row.stockQty))
    setFSafetyQty(Number(row.safetyQty))
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    if (editingItemId == null) return
    if (!fItemName.trim() || !fItemType.trim() || !fStockType.trim()) return alert("필수값을 입력하세요.")
    if (fStockQty === "" || Number(fStockQty) < 0) return alert("현재 재고는 0 이상이어야 합니다.")
    if (fSafetyQty === "" || Number(fSafetyQty) < 0) return alert("안전 재고는 0 이상이어야 합니다.")
    try {
      const body = {
        storeId: STORE_ID,
        itemName: fItemName.trim(),
        itemType: fItemType.trim(),
        stockType: fStockType.trim(),
        stockQty: Number(fStockQty),
        safetyQty: Number(fSafetyQty),
      }
      await axios.patch<InventoryResponse>(`${API_BASE}/owner/inventory/${editingItemId}`, body, {
        params: { storeId: STORE_ID },
      })
      setIsEditOpen(false)
      setEditingItemId(null)
      resetForm()
      await fetchInventory()
    } catch (e: any) {
      console.error(e)
      alert(e?.response?.data?.message || "재고 수정 중 오류가 발생했습니다.")
    }
  }

  // ===== 활성/비활성 =====
  const deactivate = async (row: InventoryResponse) => {
    if (!confirm("이 품목을 비활성화할까요?")) return
    await axios.post(`${API_BASE}/owner/inventory/${row.itemId}/deactivate`, null, {
      params: { storeId: STORE_ID },
    })
    await fetchInventory()
  }

  const reactivate = async (row: InventoryResponse) => {
    if (!confirm("이 품목을 활성화(해제)할까요?")) return
    await axios.post(`${API_BASE}/owner/inventory/${row.itemId}/reactivate`, null, {
      params: { storeId: STORE_ID },
    })
    await fetchInventory()
  }

  // 페이지네이션 계산
  const start = Math.floor(page / PAGE_WINDOW) * PAGE_WINDOW
  const end = Math.min(start + PAGE_WINDOW - 1, Math.max(totalPages - 1, 0))
  const goToPage = (p: number) => {
    if (p < 0 || p > Math.max(totalPages - 1, 0)) return
    setPage(p)
  }

  // 부족 표시
  const isLow = (i: InventoryResponse) => Number(i.stockQty) < Number(i.safetyQty)

  return (
    <div className="space-y-6">
      {/* 헤더 */}
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

          {/* 추가 다이얼로그 */}
          <Dialog
            open={isAddOpen}
            onOpenChange={(o) => {
              setIsAddOpen(o)
              if (!o) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                재고 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>재고 추가</DialogTitle>
                <DialogDescription>필수 항목을 입력하세요</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">품목명</Label>
                  <Input id="item-name" placeholder="예) Arabica Beans"
                         value={fItemName} onChange={(e) => setFItemName(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-type">품목 타입</Label>
                    <Input id="item-type" placeholder="예) RAW"
                           value={fItemType} onChange={(e) => setFItemType(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock-type">수량 단위</Label>
                    <Input id="stock-type" placeholder="예) kg / L / ea"
                           value={fStockType} onChange={(e) => setFStockType(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock-qty">현재 재고</Label>
                    <Input id="stock-qty" type="number" placeholder="0"
                           value={fStockQty} onChange={(e) => setFStockQty(e.target.value === "" ? "" : Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="safety-qty">안전 재고</Label>
                    <Input id="safety-qty" type="number" placeholder="0"
                           value={fSafetyQty} onChange={(e) => setFSafetyQty(e.target.value === "" ? "" : Number(e.target.value))} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsAddOpen(false); resetForm() }}>
                  취소
                </Button>
                <Button onClick={handleCreate}>추가</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 검색/필터 바 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="품목 검색…"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(0) }}
                  className="pl-8"
                />
              </div>

              {/* ✅ 토글: 꺼짐=활성만, 켜짐=비활성만 */}
              <label className="ml-3 inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showInactiveOnly}
                  onChange={(e) => { setShowInactiveOnly(e.target.checked); setPage(0) }}
                />
                비활성만 보기
              </label>

              <label className="text-sm text-muted-foreground ml-3">표시 개수</label>
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0) }}
              >
                {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/페이지</option>)}
              </select>
            </div>

            {/* 페이지네이션(상단 간단 버튼) */}
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page === 0} onClick={() => goToPage(0)}>« 처음</Button>
              <Button variant="outline" disabled={page <= 0} onClick={() => goToPage(page - 1)}>‹ 이전</Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i).map((p) => (
                  <Button key={p} variant={p === page ? "default" : "outline"} onClick={() => goToPage(p)}>
                    {p + 1}
                  </Button>
                ))}
              </div>
              <Button variant="outline" disabled={page >= totalPages - 1} onClick={() => goToPage(page + 1)}>다음 ›</Button>
              <Button variant="outline" disabled={page >= totalPages - 1} onClick={() => goToPage(Math.max(totalPages - 1, 0))}>마지막 »</Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading && <div className="text-sm text-muted-foreground">불러오는 중…</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>품목명</TableHead>
                  <TableHead>품목 타입</TableHead>
                  <TableHead>현재 재고</TableHead>
                  <TableHead>안전 재고</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((i) => {
                  const low = Number(i.stockQty) < Number(i.safetyQty)
                  return (
                    <TableRow
                      key={i.itemId}
                      className={low ? "bg-red-50/70 dark:bg-red-950/20" : ""}
                    >
                      <TableCell className="font-medium">{i.itemName}</TableCell>
                      <TableCell>{i.itemType}</TableCell>
                      <TableCell>
                        {i.stockQty} {i.stockType}
                        {low && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-300">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>안전재고 미만</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{i.safetyQty} {i.stockType}</TableCell>
                      <TableCell>
                        <Badge variant={i.status === "INACTIVE" ? "secondary" : low ? "destructive" : "default"}>
                          {i.status === "INACTIVE" ? "비활성" : low ? "부족" : "정상"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(i)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {i.status === "ACTIVE" ? (
                            <Button variant="outline" size="sm" className="bg-transparent" onClick={() => deactivate(i)}>
                              비활성화
                            </Button>
                          ) : (
                            <Button variant="default" size="sm" onClick={() => reactivate(i)}>
                              비활성 해제
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {!items.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 수정 다이얼로그 */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(o) => {
          setIsEditOpen(o)
          if (!o) { setEditingItemId(null); resetForm() }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>재고 수정</DialogTitle>
            <DialogDescription>필수 항목을 수정하세요</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-item-name">품목명</Label>
              <Input id="edit-item-name" value={fItemName} onChange={(e) => setFItemName(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-item-type">품목 타입</Label>
                <Input id="edit-item-type" value={fItemType} onChange={(e) => setFItemType(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock-type">수량 단위</Label>
                <Input id="edit-stock-type" value={fStockType} onChange={(e) => setFStockType(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-current-stock">현재 재고</Label>
                <Input id="edit-current-stock" type="number"
                       value={fStockQty} onChange={(e) => setFStockQty(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-safety-stock">안전 재고</Label>
                <Input id="edit-safety-stock" type="number"
                       value={fSafetyQty} onChange={(e) => setFSafetyQty(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditingItemId(null); resetForm() }}>
              취소
            </Button>
            <Button onClick={handleUpdate}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

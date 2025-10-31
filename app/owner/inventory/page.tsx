"use client"

import { useEffect, useMemo, useState } from "react"
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
import { Plus, Search, AlertTriangle, Upload, Download, Edit, Trash2 } from "lucide-react"

const API_BASE = "http://localhost:8080" // 스프링 서버 포트
const STORE_ID = 11                      // 테스트용 storeId
const PAGE_WINDOW = 10                   // 페이지 번호 묶음 크기
const LOW_STOCK_FETCH_SIZE = 1000        // 부족 알림용 전체 조회 사이즈(필요시 조정)

type InventoryResponse = {
  itemId: number
  storeId: number
  itemName: string
  itemType: string
  stockType: string
  stockQty: number
  safetyQty: number
  // expiryDate 제거됨 (엔티티/DTO에서 삭제)
}

type PageResponse<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number // 0-based 현재 페이지
}

export default function InventoryPage() {
  // 목록(페이징)
  const [items, setItems] = useState<InventoryResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // “전체 페이지 합산” 부족 품목 전용 상태
  const [lowStockAll, setLowStockAll] = useState<InventoryResponse[]>([])
  const [lowStockLoading, setLowStockLoading] = useState(false)

  // 검색 & 다이얼로그
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)

  // 폼(등록/수정 공용) — DTO와 1:1
  const [fItemName, setFItemName] = useState("")
  const [fItemType, setFItemType] = useState("")     // 예: RAW / PACKED …
  const [fStockType, setFStockType] = useState("")   // 예: kg / L / ea
  const [fStockQty, setFStockQty] = useState<number | "">("")
  const [fSafetyQty, setFSafetyQty] = useState<number | "">("")

  // 페이지네이션
  const [page, setPage] = useState(0)          // 0-based
  const [pageSize, setPageSize] = useState(10) // 드롭다운
  const [totalPages, setTotalPages] = useState(0)
  const sort = "itemName,asc"

  // ===== 목록 조회 (현재 페이지) =====
  const fetchInventory = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get<PageResponse<InventoryResponse>>(`${API_BASE}/owner/inventory`, {
        params: { storeId: STORE_ID, q: searchQuery, page, size: pageSize, sort },
      })
      setItems(res.data.content ?? [])
      setTotalPages(res.data.totalPages ?? 0)
    } catch (e: any) {
      console.error(e)
      setError(e?.response?.data?.message || "재고 목록을 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  // ===== 부족 알림용 전체 조회 =====
  // 검색어와 상관없이 “전체 매장” 기준으로 부족 품목을 계산해서 모든 페이지에 동일하게 표시
  const fetchLowStockAll = async () => {
    setLowStockLoading(true)
    try {
      const res = await axios.get<PageResponse<InventoryResponse>>(`${API_BASE}/owner/inventory`, {
        params: { storeId: STORE_ID, page: 0, size: LOW_STOCK_FETCH_SIZE, sort: "itemName,asc" },
      })
      const all = res.data.content ?? []
      const lows = all.filter((i) => Number(i.stockQty) < Number(i.safetyQty))
      setLowStockAll(lows)
    } catch (e) {
      console.error(e)
      // 실패 시 조용히 무시(배너만 사라지도록)
      setLowStockAll([])
    } finally {
      setLowStockLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, page, pageSize])

  // 부족 알림은 페이지/검색과 독립적으로 주기적(또는 마운트/변경 시) 갱신
  useEffect(() => {
    fetchLowStockAll()
  }, [STORE_ID]) // eslint-disable-line react-hooks/exhaustive-deps

  // 검색어 변경 → 1페이지로
  const onChangeSearch = (v: string) => {
    setSearchQuery(v)
    setPage(0)
  }

  // 등록
  const handleCreate = async () => {
    if (!fItemName.trim() || !fItemType.trim() || !fStockType.trim()) {
      alert("품목명/품목타입/수량타입은 필수입니다.")
      return
    }
    if (fStockQty === "" || isNaN(Number(fStockQty)) || Number(fStockQty) < 0) {
      alert("현재 재고는 0 이상 숫자여야 합니다.")
      return
    }
    if (fSafetyQty === "" || isNaN(Number(fSafetyQty)) || Number(fSafetyQty) < 0) {
      alert("안전 재고는 0 이상 숫자여야 합니다.")
      return
    }

    try {
      const body = {
        storeId: STORE_ID,
        itemName: fItemName.trim(),
        itemType: fItemType.trim(),
        stockType: fStockType.trim(),
        stockQty: Number(fStockQty),
        safetyQty: Number(fSafetyQty)
      }
      await axios.post<InventoryResponse>(`${API_BASE}/owner/inventory`, body)
      setIsAddDialogOpen(false)
      resetForm()
      setPage(0)             // 새로 등록 시 첫 페이지로
      await fetchInventory() // 현재 페이지 갱신
      await fetchLowStockAll() // 부족 알림 재계산
    } catch (e: any) {
      console.error(e)
      alert(e?.response?.data?.message || "재고 등록 중 오류가 발생했습니다.")
    }
  }

  // 수정 모드 진입
  const openEdit = (row: InventoryResponse) => {
    setEditingItemId(row.itemId)
    setFItemName(row.itemName)
    setFItemType(row.itemType)
    setFStockType(row.stockType)
    setFStockQty(Number(row.stockQty))
    setFSafetyQty(Number(row.safetyQty))
    setIsEditDialogOpen(true)
  }

  // 수정 저장
  const handleUpdate = async () => {
    if (editingItemId == null) return
    if (!fItemName.trim() || !fItemType.trim() || !fStockType.trim()) {
      alert("품목명/품목타입/수량타입은 필수입니다.")
      return
    }
    if (fStockQty === "" || isNaN(Number(fStockQty)) || Number(fStockQty) < 0) {
      alert("현재 재고는 0 이상 숫자여야 합니다.")
      return
    }
    if (fSafetyQty === "" || isNaN(Number(fSafetyQty)) || Number(fSafetyQty) < 0) {
      alert("안전 재고는 0 이상 숫자여야 합니다.")
      return
    }

    try {
      const body = {
        storeId: STORE_ID,
        itemName: fItemName.trim(),
        itemType: fItemType.trim(),
        stockType: fStockType.trim(),
        stockQty: Number(fStockQty),
        safetyQty: Number(fSafetyQty)
      }
      await axios.patch<InventoryResponse>(`${API_BASE}/owner/inventory/${editingItemId}`, body)
      setIsEditDialogOpen(false)
      setEditingItemId(null)
      resetForm()
      await fetchInventory()
      await fetchLowStockAll()
    } catch (e: any) {
      console.error(e)
      alert(e?.response?.data?.message || "재고 수정 중 오류가 발생했습니다.")
    }
  }

  // 삭제
  const handleDelete = async (itemId: number) => {
    if (!confirm("정말 이 품목을 삭제하시겠습니까?")) return
    try {
      await axios.delete(`${API_BASE}/owner/inventory/${itemId}`)
      const after = items.length - 1
      if (after === 0 && page > 0) setPage(page - 1) // 빈 페이지 방지
      await fetchInventory()
      await fetchLowStockAll()
    } catch (e: any) {
      console.error(e)
      alert(e?.response?.data?.message || "삭제 중 오류가 발생했습니다.")
    }
  }

  // 폼 리셋
  const resetForm = () => {
    setFItemName("")
    setFItemType("")
    setFStockType("")
    setFStockQty("")
    setFSafetyQty("")
  }

  // “현재 페이지”의 부족 계산이 아니라, 전체 합산(lowStockAll) 사용
  const lowStockItems = useMemo(() => lowStockAll, [lowStockAll])

  // 페이지네이션 계산값
  const start = Math.floor(page / PAGE_WINDOW) * PAGE_WINDOW
  const end = Math.min(start + PAGE_WINDOW - 1, Math.max(totalPages - 1, 0))

  const goToPage = (p: number) => {
    if (p < 0 || p > Math.max(totalPages - 1, 0)) return
    setPage(p)
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
          <Dialog open={isAddDialogOpen} onOpenChange={(o) => {
            setIsAddDialogOpen(o)
            if (!o) resetForm()
          }}>
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
                    <Label htmlFor="stock-type">수량 타입</Label>
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
                <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm() }}>
                  취소
                </Button>
                <Button onClick={handleCreate}>추가</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 전체 페이지 합산: 재고 부족 알림 */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-2 00 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-900 dark:text-amber-100">재고 부족 알림 (전체)</CardTitle>
            </div>
            <CardDescription className="text-amber-700 dark:text-amber-200">
              {lowStockLoading ? "계산 중…" : `${lowStockItems.length}개 품목이 안전 재고 이하입니다`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((i) => (
                <div key={i.itemId} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-card">
                  <div>
                    <p className="font-medium">{i.itemName}</p>
                    <p className="text-sm text-muted-foreground">
                      현재: {i.stockQty}{i.stockType} / 안전: {i.safetyQty}{i.stockType}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 재고 표 + 헤더(검색/사이즈) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle>재고 목록</CardTitle>
              <CardDescription>페이지 {page + 1} / {Math.max(totalPages, 1)}</CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="품목 검색..."
                  value={searchQuery}
                  onChange={(e) => onChangeSearch(e.target.value)}
                  className="pl-8"
                />
              </div>

              <label className="text-sm text-muted-foreground ml-2">표시 개수</label>
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
              >
                {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/페이지</option>)}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading && <div className="text-sm text-muted-foreground">불러오는 중…</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}
          {!loading && !error && (
            <>
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
                    const isLow = Number(i.stockQty) < Number(i.safetyQty)
                    return (
                      <TableRow key={i.itemId}>
                        <TableCell className="font-medium">{i.itemName}</TableCell>
                        <TableCell>{i.itemType}</TableCell>
                        <TableCell>{i.stockQty} {i.stockType}</TableCell>
                        <TableCell>{i.safetyQty} {i.stockType}</TableCell>
                        <TableCell>
                          <Badge variant={isLow ? "destructive" : "default"}>
                            {isLow ? "부족" : "정상"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(i)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(i.itemId)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* 페이지네이션 컨트롤 (번호/묶음 이동) */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  페이지 {page + 1} / {Math.max(totalPages, 1)} · {pageSize}/페이지
                </div>

                <div className="flex items-center gap-2">
                  {/* 처음/이전 묶음 */}
                  <Button variant="outline" disabled={page === 0} onClick={() => goToPage(0)}>
                    « 처음
                  </Button>
                  <Button variant="outline" disabled={start === 0} onClick={() => goToPage(Math.max(start - 1, 0))}>
                    ‹ 10-
                  </Button>

                  {/* 이전 페이지 */}
                  <Button variant="outline" disabled={page <= 0} onClick={() => goToPage(page - 1)}>
                    ‹ 이전
                  </Button>

                  {/* 번호 버튼 */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) => (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        onClick={() => goToPage(p)}
                      >
                        {p + 1}
                      </Button>
                    ))}
                  </div>

                  {/* 다음 페이지 */}
                  <Button variant="outline" disabled={page >= totalPages - 1} onClick={() => goToPage(page + 1)}>
                    다음 ›
                  </Button>

                  {/* 다음 묶음/마지막 */}
                  <Button
                    variant="outline"
                    disabled={end >= totalPages - 1}
                    onClick={() => goToPage(Math.min(end + 1, totalPages - 1))}
                  >
                    10+ ›
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages - 1}
                    onClick={() => goToPage(Math.max(totalPages - 1, 0))}
                  >
                    마지막 »
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={(o) => {
        setIsEditDialogOpen(o)
        if (!o) { setEditingItemId(null); resetForm() }
      }}>
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
                <Label htmlFor="edit-stock-type">수량 타입</Label>
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
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingItemId(null); resetForm() }}>
              취소
            </Button>
            <Button onClick={handleUpdate}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

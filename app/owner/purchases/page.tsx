// app/owner/purchases/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import axios, { Method, AxiosRequestConfig } from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, Upload, Download, FileText } from "lucide-react"

const API_BASE = "http://localhost:8080"
const STORE_ID = 11
const KR = new Intl.NumberFormat("ko-KR")
// ✅ 오늘 날짜(YYYY-MM-DD). 매입일 date input에 max로 사용
const TODAY = new Date().toISOString().slice(0, 10)

/** ====== 타입 ====== */
type PurchaseHistoryResponse = {
  purchaseId: number
  storeId: number
  itemId: number
  purchaseQty: number
  unitPrice: number
  purchaseDate: string // YYYY-MM-DD
}

type PageResponse<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

type InventoryOption = { itemId: number; itemName: string; stockType: string }

/** 공통: 여러 엔드포인트 후보를 순차 시도 */
async function tryEndpoints<T>(
  method: Method,
  candidates: string[],
  config?: AxiosRequestConfig
): Promise<T> {
  let lastErr: any = null
  for (const url of candidates) {
    try {
      const res = await axios.request<T>({ url, method, ...(config || {}) })
      return res.data
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr
}

/** 후보 목록 (불필요 후보 제거) */
const endpoints = {
  purchasesList: `${API_BASE}/owner/purchases`,
  purchasesAlt: [
    `${API_BASE}/owner/purchases`, // 실제 백엔드 매핑에 맞춰 하나만 사용 권장
    // 필요시 아래 예비 경로 사용 (백엔드 매핑이 다를 때만)
    // `${API_BASE}/owner/purchaseHistory`,
    // `${API_BASE}/owner/purchase-history`,
    // `${API_BASE}/owner/purchase-histories`,
  ],
  inventoryList: [
    `${API_BASE}/owner/inventory`, // ✅ /owner/items 제거
  ],
  inventoryCreate: [
    `${API_BASE}/owner/inventory`, // ✅ /owner/items 제거
  ],
}

export default function PurchasesPage() {
  // 목록 상태
  const [rows, setRows] = useState<PurchaseHistoryResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 필터/페이지
  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [searchText, setSearchText] = useState("")

  // 인벤토리 드롭다운
  const [inventoryOpts, setInventoryOpts] = useState<InventoryOption[]>([])

  // 추가 다이얼로그
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [formItemId, setFormItemId] = useState<string>("")
  const [formQty, setFormQty] = useState<string>("")
  const [formUnitPrice, setFormUnitPrice] = useState<string>("")
  const [formDate, setFormDate] = useState<string>("")

  // ✅ 새 품목 추가 모드
  const [newItemMode, setNewItemMode] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [newItemType, setNewItemType] = useState("")   // 예: RAW / PACK
  const [newStockType, setNewStockType] = useState("") // 예: kg / L / ea

  // 목록 조회
  const fetchList = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, any> = {
        storeId: STORE_ID,
        page,
        size,
        sort: "purchaseDate,desc",
      }
      if (selectedItemId) params.itemId = Number(selectedItemId)
      // ✅ 백엔드 파라미터명 통일 (from/to)
      if (startDate) params.from = startDate
      if (endDate) params.to = endDate

      const data = await tryEndpoints<PageResponse<PurchaseHistoryResponse>>(
        "GET",
        endpoints.purchasesAlt,
        { params }
      )
      setRows(data.content ?? [])
      setTotalPages(data.totalPages ?? 0)
      setTotalElements(data.totalElements ?? 0)
    } catch (e: any) {
      console.error(e)
      setError(e?.response?.data?.message || e?.message || "목록 조회 중 오류가 발생했어요.")
    } finally {
      setLoading(false)
    }
  }

  // 인벤토리 옵션 조회
  const fetchInventoryOptions = async () => {
    try {
      const data = await tryEndpoints<PageResponse<any>>(
        "GET",
        endpoints.inventoryList,
        { params: { storeId: STORE_ID, page: 0, size: 1000, sort: "itemName,asc" } }
      )
      const opts: InventoryOption[] = (data.content ?? []).map((x: any) => ({
        itemId: x.itemId,
        itemName: x.itemName,
        stockType: x.stockType,
      }))
      setInventoryOpts(opts)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { fetchInventoryOptions() }, [])
  useEffect(() => { fetchList() }, [page, size, selectedItemId, startDate, endDate])

  // 간단 합계
  const totalAmount = useMemo(() => {
    return rows.reduce((sum, r) => sum + Number(r.purchaseQty) * Number(r.unitPrice), 0)
  }, [rows])

  // 표시용 텍스트 필터(옵션)
  const filteredRows = useMemo(() => {
    if (!searchText.trim()) return rows
    const t = searchText.trim().toLowerCase()
    return rows.filter((r) => {
      const inv = inventoryOpts.find((i) => i.itemId === r.itemId)
      const name = inv?.itemName?.toLowerCase() || ""
      return name.includes(t)
    })
  }, [rows, searchText, inventoryOpts])

  // ⏬ 교체: PurchasesPage 컴포넌트 안의 handleCreate 함수만 이걸로 바꿔주세요.
const handleCreate = async () => {
  if (!formQty || Number(formQty) <= 0) return alert("수량을 올바르게 입력하세요.")
  if (!formUnitPrice || Number(formUnitPrice) <= 0) return alert("단가를 올바르게 입력하세요.")
  if (!formDate) return alert("매입일을 선택하세요.")
  if (formDate > TODAY) return alert("매입일은 오늘 이후일 수 없습니다.")

  // 입력값 정규화(공백·대소문자)
  const norm = (s: string) => s.trim().toLowerCase()

  try {
    let itemIdToUse: number | null = null

    if (newItemMode) {
      // 1) 새 품목명/타입/단위 검증
      if (!newItemName.trim() || !newItemType.trim() || !newStockType.trim()) {
        return alert("새 품목명/타입/수량단위를 모두 입력하세요.")
      }

      // 2) 이미 존재하는 이름이면 생성하지 말고 기존 itemId 사용
      const exist = inventoryOpts.find(
        (i) => norm(i.itemName) === norm(newItemName)
      )
      if (exist) {
        itemIdToUse = exist.itemId
      } else {
        // 3) 진짜 새 품목일 때만 생성
        const invBody = {
          storeId: STORE_ID,
          itemName: newItemName.trim(),
          itemType: newItemType.trim(),
          stockType: newStockType.trim(),
          stockQty: 0,
          safetyQty: 0,
          status: "ACTIVE",
        }

        try {
          const createdInv = await tryEndpoints<any>("POST", endpoints.inventoryCreate, { data: invBody })
          itemIdToUse = createdInv?.itemId
          if (!itemIdToUse) throw new Error("새 품목 생성에 실패했습니다. (itemId 없음)")
          await fetchInventoryOptions() // 드롭다운 즉시 반영
        } catch (e: any) {
          // 4) 백엔드가 중복을 500/409로 주는 경우 대비: 이름으로 찾고 있으면 기존 사용
          const maybe = inventoryOpts.find(
            (i) => norm(i.itemName) === norm(newItemName)
          )
          if (maybe) {
            itemIdToUse = maybe.itemId
          } else {
            throw e
          }
        }
      }
    } else {
      // 기존 품목 선택
      if (!formItemId) return alert("품목을 선택하세요.")
      itemIdToUse = Number(formItemId)
    }

    // 매입 등록
    const body = {
      storeId: STORE_ID,
      itemId: itemIdToUse,
      purchaseQty: Number(formQty),
      unitPrice: Number(formUnitPrice),
      purchaseDate: formDate,
    }
    await tryEndpoints<PurchaseHistoryResponse>("POST", endpoints.purchasesAlt, { data: body })

    setIsAddOpen(false)
    resetForm()
    setPage(0)
    await fetchList()
  } catch (e: any) {
    console.error(e)
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      "등록 중 오류가 발생했습니다."
    alert(msg)
  }
}

  const resetForm = () => {
    setFormItemId("")
    setFormQty("")
    setFormUnitPrice("")
    setFormDate("")
    setNewItemMode(false)
    setNewItemName("")
    setNewItemType("")
    setNewStockType("")
  }

  // 페이지네이션 UI
  const PageButtons = () => {
    if (totalPages <= 1) return null
    const groupSize = 5
    const currentGroup = Math.floor(page / groupSize)
    const start = currentGroup * groupSize
    const end = Math.min(totalPages, start + groupSize)

    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="bg-transparent"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          이전
        </Button>

        {Array.from({ length: end - start }, (_, idx) => {
          const p = start + idx
          const active = p === page
          return (
            <Button
              key={p}
              variant={active ? "default" : "outline"}
              className={active ? "" : "bg-transparent"}
              onClick={() => setPage(p)}
            >
              {p + 1}
            </Button>
          )
        })}

        <Button
          variant="outline"
          className="bg-transparent"
          disabled={page >= totalPages - 1}
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        >
          다음
        </Button>

        <div className="ml-2 text-sm text-muted-foreground">
          총 {KR.format(totalElements)}건 / {totalPages}페이지
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
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

          {/* 추가 다이얼로그 */}
          <Dialog
            open={isAddOpen}
            onOpenChange={(open) => {
              setIsAddOpen(open)
              if (!open) resetForm()
            }}
          >
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
                {/* ✅ 새 품목 추가 토글 */}
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newItemMode}
                    onChange={(e) => setNewItemMode(e.target.checked)}
                  />
                  재고에 없는 새 품목 추가
                </label>

                {!newItemMode ? (
                  // 기존 품목 선택
                  <div className="space-y-2">
                    <Label htmlFor="item">품목</Label>
                    <select
                      id="item"
                      className="w-full h-9 rounded-md border px-3 text-sm bg-transparent"
                      value={formItemId}
                      onChange={(e) => setFormItemId(e.target.value)}
                    >
                      <option value="">품목 선택</option>
                      {inventoryOpts.map((opt) => (
                        <option key={opt.itemId} value={opt.itemId}>
                          {opt.itemName} ({opt.stockType})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  // ✅ 새 품목 입력 폼
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="new-name">새 품목명</Label>
                      <Input
                        id="new-name"
                        placeholder="예: Kenya AA"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-type">품목 타입</Label>
                        <Input
                          id="new-type"
                          placeholder="예: RAW / PACK"
                          value={newItemType}
                          onChange={(e) => setNewItemType(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-unit">수량 단위</Label>
                        <Input
                          id="new-unit"
                          placeholder="예: kg / L / ea"
                          value={newStockType}
                          onChange={(e) => setNewStockType(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qty">수량</Label>
                    <Input
                      id="qty"
                      type="number"
                      placeholder="예: 20"
                      value={formQty}
                      onChange={(e) => setFormQty(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit-price">단가</Label>
                    <Input
                      id="unit-price"
                      type="number"
                      placeholder="예: 25000"
                      value={formUnitPrice}
                      onChange={(e) => setFormUnitPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchase-date">매입일</Label>
                  <Input
                    id="purchase-date"
                    type="date"
                    value={formDate}
                    max={TODAY} // ✅ 오늘 이후 날짜 선택 불가
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleCreate}>추가</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 검색/필터 바 */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-sm">필터</CardTitle>
          <CardDescription>기간/품목으로 필터링하세요</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="space-y-1">
            <Label>시작일</Label>
            <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(0) }} />
          </div>
          <div className="space-y-1">
            <Label>종료일</Label>
            <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(0) }} />
          </div>
          <div className="space-y-1">
            <Label>품목</Label>
            <select
              className="w-full h-9 rounded-md border px-3 text-sm bg-transparent"
              value={selectedItemId}
              onChange={(e) => { setSelectedItemId(e.target.value); setPage(0) }}
            >
              <option value="">전체</option>
              {inventoryOpts.map((opt) => (
                <option key={opt.itemId} value={opt.itemId}>
                  {opt.itemName} ({opt.stockType})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>검색(표시용)</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="품목명 검색…"
                className="pl-8"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>페이지 크기</Label>
            <select
              className="w-full h-9 rounded-md border px-3 text-sm bg-transparent"
              value={size}
              onChange={(e) => { setSize(Number(e.target.value)); setPage(0) }}
            >
              {[10, 20, 30, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 통계 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">현재 페이지 총 매입</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{KR.format(totalAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">리스트에 표시된 합계</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">건수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRows.length}건</div>
            <p className="text-xs text-muted-foreground mt-1">현재 페이지 기준</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">총 건수(전체)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{KR.format(totalElements)}건</div>
            <p className="text-xs text-muted-foreground mt-1">필터 조건 반영</p>
          </CardContent>
        </Card>
      </div>

      {/* 테이블 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>매입 내역</CardTitle>
              <CardDescription>필터·페이지 적용된 결과</CardDescription>
            </div>
            <PageButtons />
          </div>
        </CardHeader>
        <CardContent>
          {loading && <div className="text-sm text-muted-foreground">불러오는 중…</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead>품목</TableHead>
                  <TableHead>수량</TableHead>
                  <TableHead>단가</TableHead>
                  <TableHead>총액</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((r) => {
                  const inv = inventoryOpts.find((i) => i.itemId === r.itemId)
                  const unit = inv?.stockType ? ` ${inv.stockType}` : ""
                  const total = Number(r.purchaseQty) * Number(r.unitPrice)
                  return (
                    <TableRow key={r.purchaseId}>
                      <TableCell>{r.purchaseDate}</TableCell>
                      <TableCell className="font-medium">{inv?.itemName ?? `#${r.itemId}`}</TableCell>
                      <TableCell>{KR.format(Number(r.purchaseQty))}{unit}</TableCell>
                      <TableCell>₩{KR.format(Number(r.unitPrice))}</TableCell>
                      <TableCell className="font-medium">₩{KR.format(total)}</TableCell>
                    </TableRow>
                  )
                })}
                {!filteredRows.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

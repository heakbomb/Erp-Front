"use client"

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, Edit } from "lucide-react"

const API_BASE = "http://localhost:8080"
const STORE_ID = 11
const formatKR = new Intl.NumberFormat("ko-KR")

type ActiveStatus = "ACTIVE" | "INACTIVE"
type CostingMethod = "AVERAGE" | "LAST"

type MenuItemResponse = {
  menuId: number
  storeId: number
  menuName: string
  price: number
  // 백엔드 계산값이 있다면 사용 가능하지만, 여기서는 프론트에서 다시 계산함
  calculatedCost?: number
  status: ActiveStatus
}
type PageResponse<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
type RecipeIngredientResponse = {
  recipeId: number
  menuId: number
  itemId: number
  consumptionQty: number
}
type InventoryResponse = {
  itemId: number
  storeId: number
  itemName: string
  itemType: string
  stockType: string
  stockQty: number
  safetyQty: number
  status: ActiveStatus
  // ✅ 원가 계산에 필요 (백엔드 DTO에 포함되어 있어야 함)
  avgUnitCost?: number
  lastUnitCost?: number
}

export default function MenuPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // 목록/상태
  const [items, setItems] = useState<MenuItemResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 검색/필터
  const [searchQuery, setSearchQuery] = useState("")
  const [showInactiveOnly, setShowInactiveOnly] = useState(false)

  // 원가 계산 방식 (UI 토글)
  const [costingMethod, setCostingMethod] = useState<CostingMethod>("AVERAGE")

  // 레시피 캐시: menuId -> RecipeIngredientResponse[]
  const [recipeMap, setRecipeMap] = useState<Record<number, RecipeIngredientResponse[]>>({})

  // 인벤토리(원가정보 포함)
  const [invOptions, setInvOptions] = useState<InventoryResponse[]>([])

  // 생성/수정 다이얼로그
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formName, setFormName] = useState("")
  const [formPrice, setFormPrice] = useState<number | "">("")

  const page = 0, size = 50, sort = "menuName,asc"

  // ===== 인벤토리(원가 포함) 로드 =====
  const fetchInventoryOptions = async () => {
    try {
      const res = await axios.get<PageResponse<InventoryResponse>>(`${API_BASE}/owner/inventory`, {
        params: { storeId: STORE_ID, page: 0, size: 1000, sort: "itemName,asc" },
      })
      setInvOptions(res.data.content ?? [])
    } catch {
      setInvOptions([])
    }
  }
  useEffect(() => { fetchInventoryOptions() }, [])

  // ===== 메뉴 로드 + 레시피 일괄 로드 =====
  const fetchMenus = async () => {
    setLoading(true); setError(null)
    try {
      const status: ActiveStatus | undefined = showInactiveOnly ? "INACTIVE" : "ACTIVE"
      const res = await axios.get<PageResponse<MenuItemResponse>>(`${API_BASE}/owner/menu`, {
        params: { storeId: STORE_ID, q: searchQuery || undefined, status, page, size, sort },
      })
      const list = res.data.content ?? []
      setItems(list)

      // 메뉴별 레시피 병렬 로드 → recipeMap 구성
      const menuIds = list.map(m => m.menuId)
      const recipeEntries = await Promise.all(
  menuIds.map(async (id) => {
    try {
      const r = await axios.get<RecipeIngredientResponse[]>(
        `${API_BASE}/owner/menu/${id}/recipeIngredients`
      )
      // readonly 방지: 가변 배열로 복사
      const arr: RecipeIngredientResponse[] = Array.isArray(r.data) ? [...r.data] : []
      return { id, arr }
    } catch {
      return { id, arr: [] as RecipeIngredientResponse[] }
    }
  })
)

const newMap: Record<number, RecipeIngredientResponse[]> = {}
for (const { id, arr } of recipeEntries) newMap[id] = arr
setRecipeMap(newMap)
    } catch (e: any) {
      console.error(e)
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "목록을 불러오는 중 오류가 발생했습니다."
      setError(msg)
    } finally { setLoading(false) }
  }
  useEffect(() => { fetchMenus() }, [searchQuery, showInactiveOnly])

  // ===== 프론트 계산: 메뉴별 원가 =====
  const invCostMap = useMemo(() => {
    const m = new Map<number, { avg?: number; last?: number }>()
    for (const inv of invOptions) {
      m.set(inv.itemId, {
        avg: inv.avgUnitCost ?? 0,
        last: inv.lastUnitCost ?? 0,
      })
    }
    return m
  }, [invOptions])

  const calculatedCostMap = useMemo(() => {
    // menuId -> sum(consumptionQty * unitCost)
    const map: Record<number, number> = {}
    for (const menu of items) {
      const recipe = recipeMap[menu.menuId] || []
      let sum = 0
      for (const ri of recipe) {
        const c = invCostMap.get(ri.itemId)
        const unit = costingMethod === "AVERAGE" ? (c?.avg ?? 0) : (c?.last ?? 0)
        sum += Number(ri.consumptionQty) * Number(unit || 0)
      }
      map[menu.menuId] = +sum.toFixed(2) // 소수 2자리로 표시
    }
    return map
  }, [items, recipeMap, invCostMap, costingMethod])

  // ===== 생성/수정 =====
  const handleCreate = async () => {
    if (!formName.trim() || formPrice === "" || isNaN(Number(formPrice))) {
      alert("메뉴명과 판매가를 올바르게 입력하세요."); return
    }
    try {
      const body = { storeId: STORE_ID, menuName: formName.trim(), price: Number(formPrice) }
      await axios.post<MenuItemResponse>(`${API_BASE}/owner/menu`, body)
      setIsAddDialogOpen(false); resetForm(); await fetchMenus()
    } catch (e: any) {
      console.error(e)
      const hint =
        e?.response?.status === 404 ? "지정한 매장이 존재하는지 확인하세요." :
        e?.response?.status === 409 ? "동일한 메뉴명이 이미 존재합니다." :
        e?.response?.status === 400 ? "입력값을 확인하세요." : ""
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "생성 중 오류가 발생했습니다."
      alert([msg, hint].filter(Boolean).join("\n"))
    }
  }

  const openEdit = (row: MenuItemResponse) => {
    setIsEditMode(true); setEditingId(row.menuId); setFormName(row.menuName); setFormPrice(Number(row.price)); setIsAddDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (editingId == null) return
    if (!formName.trim() || formPrice === "" || isNaN(Number(formPrice))) { alert("메뉴명과 판매가를 올바르게 입력하세요."); return }
    try {
      const body = { storeId: STORE_ID, menuName: formName.trim(), price: Number(formPrice) }
      await axios.patch<MenuItemResponse>(`${API_BASE}/owner/menu/${editingId}`, body, {
        params: { storeId: STORE_ID },
      })
      setIsAddDialogOpen(false); resetForm(); setIsEditMode(false); setEditingId(null); await fetchMenus()
    } catch (e: any) {
      console.error(e)
      const hint =
        e?.response?.status === 404 ? "메뉴ID/매장ID를 확인하세요." :
        e?.response?.status === 409 ? "변경하려는 이름이 이미 존재합니다." :
        e?.response?.status === 400 ? "storeId 쿼리 파라미터가 필요한지 확인하세요." : ""
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "수정 중 오류가 발생했습니다."
      alert([msg, hint].filter(Boolean).join("\n"))
    }
  }

  // ===== 상태 토글 =====
  const toggleStatus = async (row: MenuItemResponse) => {
    const isActive = row.status === "ACTIVE"
    const ok = confirm(isActive ? "이 메뉴를 비활성화할까요?" : "이 메뉴를 활성화할까요?")
    if (!ok) return
    try {
      if (isActive) {
        await axios.post(`${API_BASE}/owner/menu/${row.menuId}/deactivate`, null, { params: { storeId: STORE_ID } })
      } else {
        await axios.post(`${API_BASE}/owner/menu/${row.menuId}/reactivate`, null, { params: { storeId: STORE_ID } })
      }
      await fetchMenus()
    } catch (e: any) {
      console.error(e)
      const hint =
        e?.response?.status === 400 ? "storeId 쿼리 파라미터가 누락되지 않았는지 확인하세요." :
        e?.response?.status === 404 ? "해당 메뉴가 존재하는지 확인하세요." : ""
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "상태 변경 중 오류가 발생했습니다."
      alert([msg, hint].filter(Boolean).join("\n"))
    }
  }

  const resetForm = () => { setFormName(""); setFormPrice("") }

  // 통계(프론트 계산 원가 반영)
  const stats = useMemo(() => {
    if (!items.length) return { total: 0, avgMargin: 0, inactive: 0 }
    const margins = items.map((m) => {
      const price = Number(m.price || 0)
      const cost = calculatedCostMap[m.menuId] ?? 0
      if (price <= 0) return 0
      return ((price - cost) / price) * 100
    })
    return {
      total: items.length,
      avgMargin: margins.reduce((a, b) => a + b, 0) / Math.max(1, margins.length),
      inactive: items.filter(i => i.status === "INACTIVE").length,
    }
  }, [items, calculatedCostMap])

  // ===== 레시피 관리 =====
  const [isRecipeOpen, setIsRecipeOpen] = useState(false)
  const [recipeMenu, setRecipeMenu] = useState<MenuItemResponse | null>(null)
  const [recipeLoading, setRecipeLoading] = useState(false)
  const [recipeError, setRecipeError] = useState<string | null>(null)
  const [recipeList, setRecipeList] = useState<RecipeIngredientResponse[]>([])

  const openRecipe = async (menu: MenuItemResponse) => {
    setRecipeMenu(menu); setIsRecipeOpen(true); setSelectedItemId(""); setConsumptionQty("")
    await fetchRecipeList(menu.menuId)
  }

  const fetchRecipeList = async (menuId: number) => {
    setRecipeLoading(true); setRecipeError(null)
    try {
      const res = await axios.get<RecipeIngredientResponse[]>(`${API_BASE}/owner/menu/${menuId}/recipeIngredients`)
      const list: RecipeIngredientResponse[] = Array.isArray(res.data) ? [...res.data] : []
      setRecipeList(list)
      setRecipeMap(prev => ({ ...prev, [menuId]: list }))
    } catch (e: any) {
      console.error(e)
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "레시피를 불러오는 중 오류가 발생했습니다."
      setRecipeError(msg)
    } finally { setRecipeLoading(false) }
  }

  const [selectedItemId, setSelectedItemId] = useState<number | "">("")
  const [consumptionQty, setConsumptionQty] = useState<number | "">("")

  const existingItemIds = useMemo(
    () => new Set(recipeList.map(r => r.itemId)),
    [recipeList]
  )
  const availableInvOptions = useMemo(
    () => invOptions.filter(opt => opt.status !== "INACTIVE" && !existingItemIds.has(opt.itemId)),
    [invOptions, existingItemIds]
  )

  const handleAddRecipe = async () => {
    if (!recipeMenu) return
    if (selectedItemId === "" || consumptionQty === "" || Number(consumptionQty) <= 0) {
      alert("재료와 수량을 올바르게 입력하세요."); return
    }
    try {
      const body = { menuId: recipeMenu.menuId, itemId: Number(selectedItemId), consumptionQty: Number(consumptionQty) }
      await axios.post<RecipeIngredientResponse>(`${API_BASE}/owner/menu/${recipeMenu.menuId}/recipeIngredients`, body)
      setSelectedItemId(""); setConsumptionQty("")
      await fetchRecipeList(recipeMenu.menuId) // 캐시 및 원가 재계산 반영
    } catch (e: any) {
      console.error(e)
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "레시피 추가 중 오류가 발생했습니다."
      alert(msg)
    }
  }

  const handleUpdateRecipe = async (recipeId: number, newQty: number) => {
    if (!recipeMenu) return
    try {
      await axios.patch<RecipeIngredientResponse>(`${API_BASE}/owner/menu/recipeIngredients/${recipeId}`, {
        consumptionQty: Number(newQty),
      })
      await fetchRecipeList(recipeMenu.menuId) // 캐시 및 원가 재계산 반영
    } catch (e: any) {
      console.error(e)
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "레시피 수정 중 오류가 발생했습니다."
      alert(msg)
    }
  }

  const handleDeleteRecipe = async (recipeId: number) => {
    if (!recipeMenu) return
    if (!confirm("이 재료를 레시피에서 제거할까요?")) return
    try {
      await axios.delete(`${API_BASE}/owner/menu/recipeIngredients/${recipeId}`)
      await fetchRecipeList(recipeMenu.menuId) // 캐시 및 원가 재계산 반영
    } catch (e: any) {
      console.error(e)
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "삭제 중 오류가 발생했습니다."
      alert(msg)
    }
  }

  // 레시피에 비활성 재고가 포함되어 있는지
  const hasInactiveInRecipe = useMemo(() => {
    const inactiveSet = new Set(invOptions.filter(o => o.status === "INACTIVE").map(o => o.itemId))
    const menuId = recipeMenu?.menuId
    const list = (menuId ? recipeMap[menuId] : []) ?? []
    return list.some(ri => inactiveSet.has(ri.itemId))
  }, [invOptions, recipeMenu, recipeMap])

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">메뉴 관리</h1>
          <p className="text-muted-foreground">메뉴/가격 및 레시피를 관리하세요</p>
        </div>

        {/* 우측 컨트롤 */}
        {mounted && (
          <div className="flex items-center gap-3">
            {/* 검색 */}
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="메뉴 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* 비활성만 보기 */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={showInactiveOnly}
                onChange={(e) => setShowInactiveOnly(e.target.checked)}
              />
              비활성만 보기
            </label>

            {/* 원가 계산 방식 토글 */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">원가방식</span>
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={costingMethod}
                onChange={(e) => setCostingMethod(e.target.value as CostingMethod)}
                title="평균가(가중평균) 또는 최신매입가 기준 원가"
              >
                <option value="AVERAGE">평균가</option>
                <option value="LAST">최신가</option>
              </select>
            </div>

            {/* 추가/수정 다이얼로그 */}
            <Dialog
              open={isAddDialogOpen}
              onOpenChange={(open) => {
                setIsAddDialogOpen(open)
                if (!open) { setIsEditMode(false); setEditingId(null); resetForm() }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  메뉴 {isEditMode ? "수정" : "추가"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>메뉴 {isEditMode ? "수정" : "추가"}</DialogTitle>
                  <DialogDescription>메뉴명과 판매가만 입력합니다.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="menu-name">메뉴명</Label>
                    <Input id="menu-name" placeholder="아메리카노" value={formName}
                      onChange={(e) => setFormName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">판매가</Label>
                    <Input id="price" type="number" placeholder="4500" value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value === "" ? "" : Number(e.target.value))} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setIsEditMode(false); setEditingId(null); resetForm() }}>
                    취소
                  </Button>
                  {isEditMode ? <Button onClick={handleUpdate}>수정</Button> : <Button onClick={handleCreate}>추가</Button>}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* 메뉴 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>메뉴 목록</CardTitle><CardDescription>등록된 메뉴를 관리하세요</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <div className="text-sm text-muted-foreground">불러오는 중…</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}
          {!loading && !error && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const cost = calculatedCostMap[item.menuId] ?? 0
                const price = Number(item.price || 0)
                const margin = price > 0 ? ((price - cost) / price) * 100 : 0
                const isInactive = item.status === "INACTIVE"
                return (
                  <Card key={item.menuId} className={isInactive ? "opacity-70" : ""}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{item.menuName}</CardTitle>
                          <Badge variant={isInactive ? "secondary" : "default"}>{item.status}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">판매가</span>
                          <span className="font-medium">₩{formatKR.format(price)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">원가({costingMethod === "AVERAGE" ? "평균" : "최신"})</span>
                          <span className="font-medium">₩{formatKR.format(cost)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">마진율</span>
                          <span className="font-medium text-primary">{margin.toFixed(1)}%</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => openEdit(item)}
                          disabled={isInactive}
                        >
                          <Edit className="mr-1 h-3 w-3" />수정
                        </Button>
                        <Button
                          variant={isInactive ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => toggleStatus(item)}
                        >
                          {isInactive ? "활성화" : "비활성화"}
                        </Button>
                      </div>

                      {mounted && !isInactive && (
                        <div className="pt-2">
                          <Button variant="secondary" size="sm" className="w-full" onClick={() => openRecipe(item)}>
                            레시피 관리
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
              {!items.length && (
                <div className="text-sm text-muted-foreground">표시할 데이터가 없습니다.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 레시피 다이얼로그 */}
      {mounted && (
        <Dialog
          open={isRecipeOpen}
          onOpenChange={(open) => {
            setIsRecipeOpen(open)
            if (!open) {
              setRecipeMenu(null); setRecipeList([]); setSelectedItemId(""); setConsumptionQty(""); setRecipeError(null)
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>레시피 관리</DialogTitle>
              <DialogDescription>
                {recipeMenu ? `${recipeMenu.menuName} (ID: ${recipeMenu.menuId})` : "메뉴를 선택하세요"}
              </DialogDescription>
            </DialogHeader>

            {/* 비활성 재고 경고 배너 */}
            {(() => {
              const menuId = recipeMenu?.menuId
              const list = (menuId ? recipeMap[menuId] : []) ?? []
              const inactiveSet = new Set(invOptions.filter(o => o.status === "INACTIVE").map(o => o.itemId))
              const hasInactive = list.some(ri => inactiveSet.has(ri.itemId))
              return hasInactive ? (
                <div className="rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20 p-3 text-sm">
                  비활성 재고가 포함되어 있습니다. 대체 재고로 교체해 주세요.
                </div>
              ) : null
            })()}

            <div className="space-y-3">
              {recipeLoading && <div className="text-sm text-muted-foreground">불러오는 중…</div>}
              {recipeError && <div className="text-sm text-red-500">{recipeError}</div>}
              {!recipeLoading && !recipeError && (
                <>
                  {recipeList.length === 0 ? (
                    <div className="text-sm text-muted-foreground">등록된 재료가 없습니다. 아래에서 추가하세요.</div>
                  ) : (
                    <div className="space-y-2">
                      {recipeList.map((ri) => {
                        const inv = invOptions.find((o) => o.itemId === ri.itemId)
                        const invName = inv?.itemName ?? `#${ri.itemId}`
                        const unit = inv?.stockType ?? ""
                        const invInactive = inv?.status === "INACTIVE"
                        return (
                          <div key={ri.recipeId} className="flex items-center justify-between rounded-md border p-3 bg-card">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {invName}
                                {invInactive && <Badge variant="secondary">비활성</Badge>}
                              </div>
                              <div className="text-sm text-muted-foreground">소모 수량: {ri.consumptionQty}{unit ? ` ${unit}` : ""}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                className="w-24"
                                defaultValue={ri.consumptionQty}
                                onBlur={(e) => {
                                  const v = Number(e.currentTarget.value)
                                  if (!isNaN(v) && v > 0 && v !== ri.consumptionQty) handleUpdateRecipe(ri.recipeId, v)
                                }}
                              />
                              <Button variant="outline" size="sm" onClick={() => handleDeleteRecipe(ri.recipeId)}>
                                제거
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>재료 선택</Label>
                  <select
                    className="h-9 rounded-md border bg-background px-2 text-sm w-full"
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value === "" ? "" : Number(e.target.value))}
                  >
                    <option value="">-- 재료 선택 --</option>
                    {availableInvOptions.map((opt) => (
                      <option key={opt.itemId} value={opt.itemId}>
                        {opt.itemName} ({opt.stockType}) • 재고 {opt.stockQty}{opt.stockType}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>소모 수량</Label>
                  <Input type="number" placeholder="예) 0.035" value={consumptionQty}
                    onChange={(e) => setConsumptionQty(e.target.value === "" ? "" : Number(e.target.value))} />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleAddRecipe}><Plus className="h-4 w-4 mr-1" />재료 추가</Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRecipeOpen(false)}>닫기</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

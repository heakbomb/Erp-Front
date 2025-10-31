// app/owner/menu/page.tsx
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
import { Plus, Search, Edit, Trash2, Sparkles, TrendingUp, TrendingDown } from "lucide-react"

/** 연결 설정 */
const API_BASE = "http://localhost:8080"
const STORE_ID = 11

/** 숫자 포맷(SSR/CSR 동일 출력 보장) */
const formatKR = new Intl.NumberFormat("ko-KR")

/** 타입 */
type MenuItemResponse = {
  menuId: number; storeId: number; menuName: string; price: number; calculatedCost: number;
}
type PageResponse<T> = {
  content: T[]; totalElements: number; totalPages: number; size: number; number: number;
}
type RecipeIngredientResponse = {
  recipeId: number; menuId: number; itemId: number; consumptionQty: number;
}
type InventoryResponse = {
  itemId: number; storeId: number; itemName: string; itemType: string; stockType: string; stockQty: number; safetyQty: number;
}

export default function MenuPage() {
  const [mounted, setMounted] = useState(false)            // ✅ Dialog SSR 가드(라딕스 id 불일치 방지)
  useEffect(() => { setMounted(true) }, [])

  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [items, setItems] = useState<MenuItemResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formName, setFormName] = useState("")
  const [formPrice, setFormPrice] = useState<number | "">("")

  const page = 0, size = 50, sort = "menuName,asc"

  const fetchMenus = async () => {
    setLoading(true); setError(null)
    try {
      const res = await axios.get<PageResponse<MenuItemResponse>>(`${API_BASE}/owner/menu`, {
        params: { storeId: STORE_ID, q: searchQuery, page, size, sort },
      })
      setItems(res.data.content ?? [])
    } catch (e: any) {
      console.error(e)
      const msg = e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message ?? "목록을 불러오는 중 오류가 발생했습니다."
      setError(msg)
    } finally { setLoading(false) }
  }
  useEffect(() => { fetchMenus() }, [searchQuery])

  const handleCreate = async () => {
    if (!formName.trim() || formPrice === "" || isNaN(Number(formPrice))) { alert("메뉴명과 판매가를 올바르게 입력하세요."); return }
    try {
      const body = { storeId: STORE_ID, menuName: formName.trim(), price: Number(formPrice) }
      await axios.post<MenuItemResponse>(`${API_BASE}/owner/menu`, body)
      setIsAddDialogOpen(false); resetForm(); await fetchMenus()
    } catch (e: any) {
      console.error(e)
      const msg = e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message ?? "생성 중 오류가 발생했습니다."
      alert(msg)
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
      await axios.patch<MenuItemResponse>(`${API_BASE}/owner/menu/${editingId}`, body)
      setIsAddDialogOpen(false); resetForm(); setIsEditMode(false); setEditingId(null); await fetchMenus()
    } catch (e: any) {
      console.error(e)
      const msg = e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message ?? "수정 중 오류가 발생했습니다."
      alert(msg)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠어요?")) return
    try { await axios.delete(`${API_BASE}/owner/menu/${id}`); await fetchMenus() }
    catch (e: any) {
      console.error(e)
      const msg = e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message ?? "삭제 중 오류가 발생했습니다."
      alert(msg)
    }
  }

  const resetForm = () => { setFormName(""); setFormPrice("") }

  const stats = useMemo(() => {
    if (!items.length) return { total: 0, avgMargin: 0 }
    const margins = items.map((m) => {
      const price = Number(m.price || 0), cost = Number(m.calculatedCost || 0)
      if (price <= 0) return 0
      return ((price - cost) / price) * 100
    })
    return { total: items.length, avgMargin: margins.reduce((a, b) => a + b, 0) / margins.length }
  }, [items])

  // ===== 레시피 관리 =====
  const [isRecipeOpen, setIsRecipeOpen] = useState(false)
  const [recipeMenu, setRecipeMenu] = useState<MenuItemResponse | null>(null)
  const [recipeLoading, setRecipeLoading] = useState(false)
  const [recipeError, setRecipeError] = useState<string | null>(null)
  const [recipeList, setRecipeList] = useState<RecipeIngredientResponse[]>([])

  const [invOptions, setInvOptions] = useState<InventoryResponse[]>([])
  const [selectedItemId, setSelectedItemId] = useState<number | "">("")
  const [consumptionQty, setConsumptionQty] = useState<number | "">("")

  const fetchInventoryOptions = async () => {
    try {
      const res = await axios.get<PageResponse<InventoryResponse>>(`${API_BASE}/owner/inventory`, {
        params: { storeId: STORE_ID, page: 0, size: 1000, sort: "itemName,asc" },
      })
      setInvOptions(res.data.content ?? [])
    } catch { setInvOptions([]) }
  }

  const fetchRecipeList = async (menuId: number) => {
    setRecipeLoading(true); setRecipeError(null)
    try {
      // ✅ camelCase 경로
      const res = await axios.get<RecipeIngredientResponse[]>(`${API_BASE}/owner/menu/${menuId}/recipeIngredients`)
      setRecipeList(res.data ?? [])
    } catch (e: any) {
      console.error(e)
      const msg = e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message ?? "레시피를 불러오는 중 오류가 발생했습니다."
      setRecipeError(msg)
    } finally { setRecipeLoading(false) }
  }

  const openRecipe = async (menu: MenuItemResponse) => {
    setRecipeMenu(menu); setIsRecipeOpen(true); setSelectedItemId(""); setConsumptionQty("")
    await Promise.all([fetchInventoryOptions(), fetchRecipeList(menu.menuId)])
  }

  const handleAddRecipe = async () => {
    if (!recipeMenu) return
    if (selectedItemId === "" || consumptionQty === "" || Number(consumptionQty) <= 0) {
      alert("재료와 수량을 올바르게 입력하세요."); return
    }
    try {
      const body = { menuId: recipeMenu.menuId, itemId: Number(selectedItemId), consumptionQty: Number(consumptionQty) }
      // ✅ camelCase 경로
      await axios.post<RecipeIngredientResponse>(`${API_BASE}/owner/menu/${recipeMenu.menuId}/recipeIngredients`, body)
      setSelectedItemId(""); setConsumptionQty(""); await fetchRecipeList(recipeMenu.menuId); await fetchMenus()
    } catch (e: any) {
      console.error(e)
      const msg = e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message ?? "레시피 추가 중 오류가 발생했습니다."
      alert(msg)
    }
  }

  const handleUpdateRecipe = async (recipeId: number, newQty: number) => {
    try {
      // PATCH body는 consumptionQty만 전달(권장)
      await axios.patch<RecipeIngredientResponse>(`${API_BASE}/owner/menu/recipeIngredients/${recipeId}`, {
        consumptionQty: Number(newQty),
      })
      if (recipeMenu) { await fetchRecipeList(recipeMenu.menuId); await fetchMenus() }
    } catch (e: any) {
      console.error(e)
      const msg = e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message ?? "레시피 수정 중 오류가 발생했습니다."
      alert(msg)
    }
  }

  const handleDeleteRecipe = async (recipeId: number) => {
    if (!recipeMenu) return
    if (!confirm("이 재료를 레시피에서 제거할까요?")) return
    try {
      // ✅ camelCase 경로
      await axios.delete(`${API_BASE}/owner/menu/recipeIngredients/${recipeId}`)
      await fetchRecipeList(recipeMenu.menuId); await fetchMenus()
    } catch (e: any) {
      console.error(e)
      const msg = e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message ?? "삭제 중 오류가 발생했습니다."
      alert(msg)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">메뉴 관리</h1>
          <p className="text-muted-foreground">메뉴/가격 및 레시피를 관리하세요</p>
        </div>

        {/* Dialog는 클라 마운트 이후에만 렌더 → SSR id 불일치 방지 */}
        {mounted && (
          <div className="flex gap-2">
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

      {/* (데모) 추천가 */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900 dark:text-blue-100">AI 가격 최적화 추천(데모)</CardTitle>
          </div>
          <CardDescription className="text-blue-700 dark:text-blue-200">
            서버의 price/calculatedCost만으로 단순 추천가를 계산합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items
              .map((m) => {
                const price = Number(m.price || 0), cost = Number(m.calculatedCost || 0)
                if (price <= 0) return null
                const marginPct = ((price - cost) / price) * 100
                const recommended = Math.max(0, Math.round((price * (1 + marginPct / 100)) / 100) * 100)
                const priceChange = Math.round((recommended - price) / Math.max(1, price) * 1000) / 10
                return { id: m.menuId, name: m.menuName, price, recommended, priceChange }
              })
              .filter(Boolean)
              .slice(0, 5)
              .map((it) => (
                <div key={it!.id} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-card">
                  <div className="flex-1">
                    <p className="font-medium">{it!.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-muted-foreground">현재: ₩{formatKR.format(it!.price)}</span>
                      <span className="text-sm font-medium text-primary">추천: ₩{formatKR.format(it!.recommended)}</span>
                      <Badge variant={it!.priceChange > 0 ? "default" : "secondary"} className="flex items-center gap-1">
                        {it!.priceChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {it!.priceChange > 0 ? "+" : ""}{it!.priceChange.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  {mounted && (
                    <Button size="sm" onClick={() => {
                      setIsEditMode(true); setEditingId(it!.id)
                      const target = items.find((x) => x.menuId === it!.id)
                      if (target) { setFormName(target.menuName); setFormPrice(it!.recommended); setIsAddDialogOpen(true) }
                    }}>
                      적용하기
                    </Button>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* 통계 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">전체 메뉴</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}개</div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">평균 마진율</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.avgMargin.toFixed(1)}%</div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">품절 메뉴</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">0개</div></CardContent></Card>
      </div>

      {/* 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>메뉴 목록</CardTitle><CardDescription>등록된 메뉴를 관리하세요</CardDescription></div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="메뉴 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <div className="text-sm text-muted-foreground">불러오는 중…</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}
          {!loading && !error && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const margin = Number(item.price || 0) > 0
                  ? ((Number(item.price) - Number(item.calculatedCost || 0)) / Number(item.price)) * 100 : 0
                return (
                  <Card key={item.menuId}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.menuName}</CardTitle>                 
                        </div>
                      </div> 
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">판매가</span>
                          <span className="font-medium">₩{formatKR.format(Number(item.price))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">원가</span>
                          <span className="font-medium">₩{formatKR.format(Number(item.calculatedCost || 0))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">마진율</span>
                          <span className="font-medium text-primary">{margin.toFixed(1)}%</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => openEdit(item)}>
                          <Edit className="mr-1 h-3 w-3" />수정
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => handleDelete(item.menuId)}>
                          <Trash2 className="mr-1 h-3 w-3" />삭제
                        </Button>
                      </div>

                      {/* 레시피 관리 버튼 */}
                      {mounted && (
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* 레시피 다이얼로그: mounted 후에만 렌더 */}
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
                        return (
                          <div key={ri.recipeId} className="flex items-center justify-between rounded-md border p-3 bg-card">
                            <div>
                              <div className="font-medium">{invName}</div>
                              <div className="text-sm text-muted-foreground">소모 수량: {ri.consumptionQty}{unit ? ` ${unit}` : ""}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* 수량 간이 수정 */}
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
                                <Trash2 className="h-4 w-4 mr-1" />제거
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
                    {invOptions.map((opt) => (
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

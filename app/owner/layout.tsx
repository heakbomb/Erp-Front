"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  FileText,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ===== 추가: 백엔드 베이스 & 타입 =====
const API_BASE = "http://localhost:8080"
type StoreLite = { storeId: number; storeName: string; status?: string; industry?: string; posVendor?: string | null }

// ✅ 나중에 인증 붙이면 토큰에서 ownerId를 뽑아 쓰면 됩니다. (지금은 테스트용 고정값)
const MOCK_OWNER_ID = 1

const navigation = [
  { name: "대시보드", href: "/owner/dashboard", icon: LayoutDashboard },
  { name: "사업장 관리", href: "/owner/stores", icon: Store },
  { name: "직원 관리", href: "/owner/employees", icon: Users },
  { name: "문서 관리", href: "/owner/documents" },
  { name: "재고 관리", href: "/owner/inventory", icon: Package },
  { name: "메뉴 관리", href: "/owner/menu", icon: FileText },
  { name: "매출 관리", href: "/owner/sales", icon: DollarSign },
  { name: "매입 관리", href: "/owner/purchases", icon: ShoppingCart },
  { name: "급여 관리", href: "/owner/payroll", icon: DollarSign },
  { name: "AI 인사이트", href: "/owner/ai-insights", icon: TrendingUp },
  { name: "설정", href: "/owner/settings", icon: Settings },
]

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ===== 추가: 사업장 목록/선택 상태 =====
  const [stores, setStores] = useState<StoreLite[]>([])
  const [activeStoreId, setActiveStoreId] = useState<number | null>(null)
  const activeStoreName = useMemo(
    () => stores.find((s) => s.storeId === activeStoreId)?.storeName ?? "",
    [stores, activeStoreId],
  )

  // ✅ 여기만 새로: 마운트 여부
  const [mounted, setMounted] = useState(false)

  // 처음 진입 시 저장된 선택값 로드 + 목록 조회
  useEffect(() => {
    setMounted(true) // 👈 브라우저에서만 true

    const savedId = Number(localStorage.getItem("activeStoreId"))
    if (!Number.isNaN(savedId)) setActiveStoreId(savedId)

    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/store/by-owner/${MOCK_OWNER_ID}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: StoreLite[] = await res.json()
        setStores(data || [])
        if ((savedId == null || Number.isNaN(savedId)) && data?.length) {
          setActiveStoreId(data[0].storeId)
          localStorage.setItem("activeStoreId", String(data[0].storeId))
          localStorage.setItem("activeStoreName", data[0].storeName)
        } else if (data?.length) {
          const found = data.find((s) => s.storeId === savedId)
          if (found) localStorage.setItem("activeStoreName", found.storeName)
        }
      } catch (e) {
        console.error("사업장 목록 조회 실패:", e)
        setStores([])
      }
    })()
  }, [])

  // 선택 변경 핸들러
  const selectStore = (s: StoreLite) => {
    setActiveStoreId(s.storeId)
    localStorage.setItem("activeStoreId", String(s.storeId))
    localStorage.setItem("activeStoreName", s.storeName)
  }

  // 링크에 storeId 자동 부착
  const withStore = (href: string) => {
    if (!activeStoreId) return href
    const hasQuery = href.includes("?")
    return `${href}${hasQuery ? "&" : "?"}storeId=${activeStoreId}`
  }

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link
              href={withStore("/owner/dashboard")}
              className="flex items-center gap-2"
              onClick={() => setSidebarOpen(false)}
            >
              <Store className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">요식업 ERP</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4 border-b border-border">
            {mounted ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">홍</span>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium truncate">홍길동 사장님</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {activeStoreName ? activeStoreName : "사업장 선택"}
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="start">
                  <DropdownMenuLabel>내 사업장</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {stores.length === 0 && <DropdownMenuItem disabled>등록된 사업장이 없습니다</DropdownMenuItem>}
                  {stores.map((s) => (
                    <DropdownMenuItem
                      key={s.storeId}
                      onClick={() => selectStore(s)}
                      className={cn(activeStoreId === s.storeId && "font-semibold")}
                    >
                      <div className="flex flex-col">
                        <span className="truncate">{s.storeName}</span>
                        <span className="text-xs text-muted-foreground">코드: {s.storeId}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  {stores.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/owner/stores" onClick={() => setSidebarOpen(false)}>
                          사업장 관리로 이동
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // 서버에서 먼저 그릴 때는 단순한 모양만 그려서 id 안 바뀌게
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">홍</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">홍길동 사장님</p>
                  <p className="text-xs text-muted-foreground truncate">사업장 선택</p>
                </div>
              </div>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              const href = withStore(item.href)

              return (
                <Link
                  key={item.name}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    !Icon && "pl-[2.75rem]",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/login">
                <LogOut className="mr-3 h-5 w-5" />
                로그아웃
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600" />
          </Button>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
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
  Search,
  Clock,
  Building2,
} from "lucide-react";

//
export const ownerNavigation = [
  { name: "대시보드", href: "/owner/dashboard", icon: LayoutDashboard },
  { name: "사업장 관리", href: "/owner/stores", icon: Store },
  { name: "직원 관리", href: "/owner/employees", icon: Users },
  { name: "문서 관리", href: "/owner/documents", icon: FileText }, // 아이콘 할당
  { name: "재고 관리", href: "/owner/inventory", icon: Package },
  { name: "메뉴 관리", href: "/owner/menu", icon: FileText },
  { name: "매출 관리", href: "/owner/sales", icon: DollarSign },
  { name: "매입 관리", href: "/owner/purchases", icon: ShoppingCart },
  { name: "급여 관리", href: "/owner/payroll", icon: DollarSign },
  { name: "AI 인사이트", href: "/owner/ai-insights", icon: TrendingUp },
  { name: "설정", href: "/owner/settings", icon: Settings },
];

//
export const employeeNavigation = [
  { name: "대시보드", href: "/employee/dashboard", icon: LayoutDashboard },
  { name: "사업장 검색", href: "/employee/search-stores", icon: Search },
  { name: "근태 관리", href: "/employee/attendance", icon: Clock },
  { name: "급여 내역", href: "/employee/payroll", icon: FileText },
  { name: "설정", href: "/employee/settings", icon: Settings },
];

//
export const adminNavigation = [
  { name: "대시보드", href: "/admin/dashboard", icon: TrendingUp },
  { name: "사용자 관리", href: "/admin/users", icon: Users },
  { name: "사업장 관리", href: "/admin/stores", icon: Store },
  { name: "시스템 설정", href: "/admin/settings", icon: Settings },
];
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  Settings,
  Store,
  BarChart3,
  Package,
  FileText,
  MessageSquare,
  FileSpreadsheet,
  ShoppingCart,
  Utensils,
  BrainCircuit,
} from "lucide-react";

export const OWNER_NAV_ITEMS = [
  { name: "대시보드", href: "/owner/dashboard", icon: LayoutDashboard },
  { name: "매장 관리", href: "/owner/stores", icon: Store }, 
  { name: "직원 관리", href: "/owner/employees", icon: Users },
  { name: "급여 관리", href: "/owner/payroll", icon: FileSpreadsheet },
  { name: "매입 관리", href: "/owner/purchases", icon: ShoppingCart },
  { name: "재고 관리", href: "/owner/inventory", icon: Package }, 
  { name: "메뉴 관리", href: "/owner/menu", icon: Utensils },  
  { name: "매출 관리", href: "/owner/sales", icon: BarChart3 },  
  { name: "AI 인사이트", href: "/owner/ai-insights", icon: BrainCircuit }, 
  { name: "문의 내역", href: "/owner/inquiries", icon: MessageSquare },
  { name: "설정", href: "/owner/settings", icon: Settings },
];

export const EMPLOYEE_NAV_ITEMS = [
  { name: "대시보드", href: "/employee/dashboard", icon: LayoutDashboard },
  { name: "출퇴근", href: "/employee/attendance", icon: CalendarCheck },
  { name: "급여 명세서", href: "/employee/payroll", icon: FileSpreadsheet },
  { name: "사업장 검색", href: "/employee/search-stores", icon: Store },
];

export const ADMIN_NAV_ITEMS = [
  { name: "대시보드", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "회원 관리", href: "/admin/users", icon: Users },
  { name: "사업장 승인", href: "/admin/stores", icon: Store },
  { name: "구독 현황", href: "/admin/subscriptions", icon: CreditCard },
  { name: "문의 관리", href: "/admin/inquiries", icon: MessageSquare },
];
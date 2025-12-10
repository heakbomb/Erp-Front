import {
  LayoutDashboard,
  Store,
  Users,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  MessageCircleQuestion, // ✅ 아이콘 확인
  Clock,
  CalendarDays,
  Search,
  Receipt,
  Utensils,
  Package,
  FileSpreadsheet,
  Bot
} from "lucide-react";

// ✅ [수정] 사장님 메뉴: '1:1 문의' 추가
export const OWNER_NAV_ITEMS = [
  { name: "대시보드", href: "/owner/dashboard", icon: LayoutDashboard },
  { name: "매장 관리", href: "/owner/stores", icon: Store },
  { name: "직원 관리", href: "/owner/employees", icon: Users },
  { name: "급여 관리", href: "/owner/payroll", icon: FileText },
  { name: "매출 관리", href: "/owner/sales", icon: Receipt },
  { name: "메뉴 관리", href: "/owner/menu", icon: Utensils },
  { name: "재고 관리", href: "/owner/inventory", icon: Package },
  { name: "매입 관리", href: "/owner/purchases", icon: FileSpreadsheet },
  { name: "AI 인사이트", href: "/owner/ai-insights", icon: Bot },
  { name: "문서 관리", href: "/owner/documents", icon: FileText },
  { name: "1:1 문의", href: "/owner/inquiries", icon: MessageCircleQuestion }, // ⭐️ 여기 추가됨
  { name: "설정", href: "/owner/settings", icon: Settings },
];

// 직원 메뉴 (기존과 동일)
export const EMPLOYEE_NAV_ITEMS = [
  { name: "대시보드", href: "/employee/dashboard", icon: LayoutDashboard },
  { name: "매장 검색", href: "/employee/search-stores", icon: Search },
  { name: "출퇴근", href: "/employee/attendance", icon: Clock },
  { name: "급여 명세서", href: "/employee/payroll", icon: Receipt },
];

// 관리자 메뉴 (기존과 동일)
export const ADMIN_NAV_ITEMS = [
  { name: "대시보드", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "사용자 관리", href: "/admin/users", icon: Users },
  { name: "사업장 승인", href: "/admin/stores", icon: Store },
  { name: "구독 관리", href: "/admin/subscriptions", icon: CreditCard },
  { name: "로그 감사", href: "/admin/logs", icon: FileText },
  { name: "문의 관리", href: "/admin/inquiries", icon: MessageCircleQuestion },
];
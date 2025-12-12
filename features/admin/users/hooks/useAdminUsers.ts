"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// ✅ [수정] 삭제 함수 import 제거
import { getOwners, getEmployees } from "../adminUsersService";

// 탭 상태 정의
export type UserTab = "ALL" | "OWNERS" | "EMPLOYEES";

export function useAdminUsers() {
  const queryClient = useQueryClient();

  // 1. 목록 필터링 상태 (기본 탭 'ALL')
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [tab, setTab] = useState<UserTab>("ALL"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  // 2. API 요청 파라미터
  const queryParams = {
    page,
    size: pageSize,
    q: submittedSearch,
  };

  // 3. (Query) '사장님' 목록 조회
  const ownersQuery = useQuery({
    queryKey: ["adminUsers", "owners", queryParams],
    queryFn: () => getOwners(queryParams),
    enabled: tab === "OWNERS" || tab === "ALL", 
  });

  // 4. (Query) '직원' 목록 조회
  const employeesQuery = useQuery({
    queryKey: ["adminUsers", "employees", queryParams],
    queryFn: () => getEmployees(queryParams),
    enabled: tab === "EMPLOYEES" || tab === "ALL", 
  });

  // 5. 이벤트 핸들러: 탭, 검색, 페이지
  const handleTabChange = (value: string) => {
    setTab(value as UserTab);
    setPage(0); 
  };

  const handleSearch = () => {
    setSubmittedSearch(searchQuery);
    setPage(0); 
  };
  
  // 6. 페이지 변경 핸들러 (활성 탭 기준)
  const handlePageChange = (p: number) => {
    const ownerPages = ownersQuery.data?.totalPages ?? 0;
    const employeePages = employeesQuery.data?.totalPages ?? 0;
    // 'ALL' 탭일 경우, 두 목록 중 더 큰 페이지 수를 기준으로 함
    const totalPages = (tab === "OWNERS") ? ownerPages :
                       (tab === "EMPLOYEES") ? employeePages :
                       Math.max(ownerPages, employeePages);
    
    if (p >= 0 && p < totalPages) {
      setPage(p);
    }
  };

  // 7. UI 컴포넌트에 전달할 값 (삭제 관련 반환값 제거됨)
  return {
    tab,
    handleTabChange,
    searchQuery,
    setSearchQuery,
    handleSearch,
    page,
    handlePageChange,
    
    // 두 쿼리를 모두 반환
    ownersQuery,
    employeesQuery,
  };
}
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOwners, getEmployees, deleteOwner, deleteEmployee } from "../adminUsersService";

// 탭 상태 정의 (ALL 추가)
export type UserTab = "ALL" | "OWNERS" | "EMPLOYEES";

export function useAdminUsers() {
  const queryClient = useQueryClient();

  // 1. 목록 필터링 상태 (기본 탭 'ALL'로 변경)
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [tab, setTab] = useState<UserTab>("ALL"); // ⭐️ 기본 탭: 전체
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  // 2. API 요청 파라미터 (공용)
  const queryParams = {
    page,
    size: pageSize,
    q: submittedSearch,
  };

  // 3. (Query) '사장님' 목록 조회
  const ownersQuery = useQuery({
    queryKey: ["adminUsers", "owners", queryParams],
    queryFn: () => getOwners(queryParams),
    enabled: tab === "OWNERS" || tab === "ALL", // ⭐️ 'ALL' 탭일 때도 실행
  });

  // 4. (Query) '직원' 목록 조회
  const employeesQuery = useQuery({
    queryKey: ["adminUsers", "employees", queryParams],
    queryFn: () => getEmployees(queryParams),
    enabled: tab === "EMPLOYEES" || tab === "ALL", // ⭐️ 'ALL' 탭일 때도 실행
  });

  // 5. (Mutation) 사장님 삭제
  const deleteOwnerMutation = useMutation({
    mutationFn: deleteOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers", "owners"] });
    },
    onError: (error) => alert(error.message),
  });

  // 6. (Mutation) 직원 삭제
  const deleteEmployeeMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers", "employees"] });
    },
    onError: (error) => alert(error.message),
  });

  // 7. ⭐️ 이벤트 핸들러: 삭제 (어떤 타입인지 명시적으로 받음)
  const handleDelete = (id: number, userType: "OWNERS" | "EMPLOYEES") => {
    if (userType === "OWNERS") {
      if (confirm(`사장님(Owner ID ${id}) 계정을 삭제하시겠습니까?`)) {
        deleteOwnerMutation.mutate(id);
      }
    } else {
      if (confirm(`직원(Employee ID ${id}) 계정을 삭제하시겠습니까?`)) {
        deleteEmployeeMutation.mutate(id);
      }
    }
  };

  // 8. 이벤트 핸들러: 탭, 검색, 페이지
  const handleTabChange = (value: string) => {
    setTab(value as UserTab);
    setPage(0); 
  };

  const handleSearch = () => {
    setSubmittedSearch(searchQuery);
    setPage(0); 
  };
  
  // 9. 페이지 변경 핸들러 (활성 탭 기준)
  const handlePageChange = (p: number) => {
    const ownerPages = ownersQuery.data?.totalPages ?? 0;
    const employeePages = employeesQuery.data?.totalPages ?? 0;
    // ⭐️ 'ALL' 탭일 경우, 두 목록 중 더 큰 페이지 수를 기준으로 함
    const totalPages = (tab === "OWNERS") ? ownerPages :
                       (tab === "EMPLOYEES") ? employeePages :
                       Math.max(ownerPages, employeePages);
    
    if (p >= 0 && p < totalPages) {
      setPage(p);
    }
  };

  // 10. UI 컴포넌트에 전달할 값
  return {
    tab,
    handleTabChange,
    searchQuery,
    setSearchQuery,
    handleSearch,
    page,
    handlePageChange,
    
    // ⭐️ 두 쿼리를 모두 반환
    ownersQuery,
    employeesQuery,

    handleDelete,
    isDeletingUser: deleteOwnerMutation.isPending || deleteEmployeeMutation.isPending,
  };
}
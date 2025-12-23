"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";
import { Search, Loader2, Eye } from "lucide-react"; 

import { useAdminUsers } from "./useAdminUsers";
import { UserDetailDialog } from "./UserDetailDialog";
import { getUserDetail } from "./adminApi";
import type { OwnerDetailResponse } from "./adminTypes";
import { CommonPagination } from "@/shared/ui/CommonPagination"; // ✅ 추가

export default function AdminUserList() {
  const {
    tab,
    handleTabChange,
    ownersQuery,
    employeesQuery,
    searchQuery,
    setSearchQuery,
    page,
    handlePageChange,
    handleSearch
  } = useAdminUsers();

  // 상세 모달 상태
  const [selectedUser, setSelectedUser] = useState<OwnerDetailResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // 상세 보기 핸들러
  const handleViewDetail = async (ownerId: number) => {
    try {
      setIsLoadingDetail(true);
      const detail = await getUserDetail(ownerId);
      setSelectedUser(detail);
      setIsDetailOpen(true);
    } catch (error) {
      console.error("Failed to fetch user detail", error);
      alert("사용자 상세 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // 현재 탭에 따른 데이터 결정
  const activeQuery = tab === "EMPLOYEES" ? employeesQuery : ownersQuery;
  const users = activeQuery.data?.content || [];
  const totalPages = activeQuery.data?.totalPages || 0;
  const isLoading = activeQuery.isLoading;
  const totalElements = activeQuery.data?.totalElements || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>사용자 목록 ({totalElements}명)</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="이름, 이메일 검색"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} variant="secondary">검색</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab === "ALL" ? "OWNERS" : tab} onValueChange={(val) => handleTabChange(val)}>
            <TabsList className="mb-4">
              <TabsTrigger value="OWNERS">사장님 (Owners)</TabsTrigger>
              <TabsTrigger value="EMPLOYEES">직원 (Employees)</TabsTrigger>
            </TabsList>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        검색 결과가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user: any) => (
                      <TableRow key={tab === "EMPLOYEES" ? user.employeeId : user.ownerId} className="hover:bg-slate-50">
                        <TableCell>{tab === "EMPLOYEES" ? user.employeeId : user.ownerId}</TableCell>
                        <TableCell className="font-medium">
                          {user.username || user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {tab !== "EMPLOYEES" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewDetail(user.ownerId)}
                              disabled={isLoadingDetail}
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                              <span className="sr-only">상세보기</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* ✅ 공통 페이징 컴포넌트 적용 */}
            <CommonPagination 
              page={page} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </Tabs>
        </CardContent>
      </Card>

      <UserDetailDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        user={selectedUser}
      />
    </div>
  );
}
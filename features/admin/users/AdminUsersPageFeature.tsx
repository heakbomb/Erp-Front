"use client"

import React, { useState } from "react";
// ⭐️ shadcn/ui 컴포넌트
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Loader2, MoreVertical, UserPlus, Trash2 } from "lucide-react"; 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// ⭐️ 훅 및 타입 임포트
import { useAdminUsers } from "./hooks/useAdminUsers";
import type { AdminOwner, AdminEmployee } from "./adminUsersService";

// ⭐️ AdminUsersPage 'Feature' 컴포넌트
export default function AdminUsersPageFeature() {
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => { setMounted(true) }, []);

  // 1. 훅 호출
  const {
    tab,
    handleTabChange,
    searchQuery,
    setSearchQuery,
    handleSearch,
    page,
    handlePageChange,
    ownersQuery,
    employeesQuery,
    handleDelete,
    isDeletingUser,
  } = useAdminUsers();

  // 2. Hydration Mismatch 방지용 스켈레톤 (변경 없음)
  if (!mounted) {
    return (
      <div className="p-8 space-y-6">
        {/* ... (스켈레톤 UI 코드는 동일) ... */}
        <div className="mb-2">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-48 dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-64 mt-2 dark:bg-gray-700"></div>
        </div>
        <Card>
          <CardHeader>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-32 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-48 mt-2 dark:bg-gray-700"></div>
            <div className="flex justify-end mt-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse w-32 dark:bg-gray-700"></div>
            </div>
            <div className="mt-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse w-full dark:bg-gray-700"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 border-b">
              {/* '전체' 탭 스켈레톤 추가 */}
              <div className="h-10 bg-gray-200 rounded-t-md animate-pulse w-24 dark:bg-gray-700"></div>
              <div className="h-10 bg-gray-200 rounded-t-md animate-pulse w-24 dark:bg-gray-700"></div>
              <div className="h-10 bg-gray-200 rounded-t-md animate-pulse w-24 dark:bg-gray-700"></div>
            </div>
            <div className="flex justify-center p-4 mt-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. ⭐️ 페이지네이션 계산 (훅에서 로직 이동)
  const ownerPages = ownersQuery.data?.totalPages ?? 0;
  const employeePages = employeesQuery.data?.totalPages ?? 0;
  const totalPages = (tab === "OWNERS") ? ownerPages :
                     (tab === "EMPLOYEES") ? employeePages :
                     Math.max(ownerPages, employeePages);
  const isLoading = ownersQuery.isLoading || employeesQuery.isLoading;


  // 4. 실제 UI (Mounted 이후)
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">사용자 관리</h1>
        <p className="text-muted-foreground">사장님 및 직원 계정을 관리합니다.</p>
      </div>

      {/* Stats (목업 유지) */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
         {/* ... (Card 4개) ... */}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>사용자 목록</CardTitle>
              <CardDescription>사장님과 직원 계정을 구분하여 관리</CardDescription>
            </div>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="이름, 이메일, 연락처로 검색..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="ALL">전체</TabsTrigger> {/* ⭐️ '전체' 탭 추가 */}
              <TabsTrigger value="OWNERS">사장님</TabsTrigger>
              <TabsTrigger value="EMPLOYEES">직원</TabsTrigger>
            </TabsList>

            <div className="mt-4">
              {/* ⭐️ '전체' 탭 컨텐츠 */}
              <TabsContent value="ALL">
                <div className="space-y-6">
                  {/* --- 사장님 섹션 --- */}
                  <div>
                    <h2 className="text-xl font-semibold mb-2">사장님 (Owners)</h2>
                    {ownersQuery.isLoading && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                    {ownersQuery.error && <div className="text-red-500 text-center p-4">{(ownersQuery.error as Error).message}</div>}
                    {!ownersQuery.isLoading && !ownersQuery.error && (
                      <OwnersTable
                        data={ownersQuery.data?.content ?? []}
                        onDelete={(id) => handleDelete(id, "OWNERS")} // ⭐️ 타입 명시
                        isDeleting={isDeletingUser}
                      />
                    )}
                  </div>
                  
                  {/* --- 직원 섹션 --- */}
                  <div>
                    <h2 className="text-xl font-semibold mb-2">직원 (Employees)</h2>
                    {employeesQuery.isLoading && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                    {employeesQuery.error && <div className="text-red-500 text-center p-4">{(employeesQuery.error as Error).message}</div>}
                    {!employeesQuery.isLoading && !employeesQuery.error && (
                      <EmployeesTable
                        data={employeesQuery.data?.content ?? []}
                        onDelete={(id) => handleDelete(id, "EMPLOYEES")} // ⭐️ 타입 명시
                        isDeleting={isDeletingUser}
                      />
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* ⭐️ '사장님' 탭 컨텐츠 */}
              <TabsContent value="OWNERS">
                {ownersQuery.isLoading && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                {ownersQuery.error && <div className="text-red-500 text-center p-4">{(ownersQuery.error as Error).message}</div>}
                {!ownersQuery.isLoading && !ownersQuery.error && (
                  <OwnersTable
                    data={ownersQuery.data?.content ?? []}
                    onDelete={(id) => handleDelete(id, "OWNERS")} // ⭐️ 타입 명시
                    isDeleting={isDeletingUser}
                  />
                )}
              </TabsContent>

              {/* ⭐️ '직원' 탭 컨텐츠 */}
              <TabsContent value="EMPLOYEES">
                {employeesQuery.isLoading && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                {employeesQuery.error && <div className="text-red-500 text-center p-4">{(employeesQuery.error as Error).message}</div>}
                {!employeesQuery.isLoading && !employeesQuery.error && (
                  <EmployeesTable
                    data={employeesQuery.data?.content ?? []}
                    onDelete={(id) => handleDelete(id, "EMPLOYEES")} // ⭐️ 타입 명시
                    isDeleting={isDeletingUser}
                  />
                )}
              </TabsContent>
                  
              {/* ⭐️ 공용 페이지네이션 */}
              {/* '전체' 탭일 때도 페이지네이션이 보이도록 함 */}
              <CustomPagination
                page={page}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
                isLoading={isLoading}
              />
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// --- 공용 페이지네이션 컴포넌트 ---
function CustomPagination({ page, totalPages, handlePageChange, isLoading }: {
  page: number;
  totalPages: number;
  handlePageChange: (p: number) => void;
  isLoading: boolean;
}) {
  // ⭐️ 페이지가 1페이지 미만일 때는 페이지네이션 숨김
  if (totalPages <= 1) {
    return null;
  }
  
  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }}
            className={!isLoading && page > 0 ? "" : "pointer-events-none opacity-50"}
          />
        </PaginationItem>
        <PaginationItem>
          <span className="px-4 py-2 text-sm">
            Page {totalPages > 0 ? page + 1 : 0} of {totalPages}
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }}
            className={!isLoading && page < totalPages - 1 ? "" : "pointer-events-none opacity-50"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}


// --- 사장님 테이블 ---
function OwnersTable({ data, onDelete, isDeleting }: { data: AdminOwner[], onDelete: (id: number) => void, isDeleting: boolean }) {
  return (
    <Table><TableHeader><TableRow>
        <TableHead>Owner ID</TableHead>
        <TableHead>이름 (username)</TableHead>
        <TableHead>이메일</TableHead>
        <TableHead>가입일</TableHead>
        <TableHead className="text-right">작업</TableHead>
    </TableRow></TableHeader><TableBody>
      {data.length === 0 && (
        <TableRow key="empty-row-owner">
          <TableCell colSpan={5} className="text-center text-muted-foreground">데이터가 없습니다.</TableCell>
        </TableRow>
      )}
      {data.map((owner) => (
        <TableRow key={owner.ownerId}>
          <TableCell>{owner.ownerId}</TableCell>
          <TableCell className="font-medium">{owner.username}</TableCell>
          <TableCell>{owner.email}</TableCell>
          <TableCell>{new Date(owner.createdAt).toLocaleDateString()}</TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isDeleting}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(owner.ownerId)} // ⭐️ 훅의 handleDelete 호출
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody></Table>
  );
}

// --- 직원 테이블 ---
function EmployeesTable({ data, onDelete, isDeleting }: { data: AdminEmployee[], onDelete: (id: number) => void, isDeleting: boolean }) {
  return (
    <Table><TableHeader><TableRow>
        <TableHead>Employee ID</TableHead>
        <TableHead>이름</TableHead>
        <TableHead>이메일</TableHead>
        <TableHead>연락처</TableHead>
        <TableHead>가입일</TableHead>
        <TableHead className="text-right">작업</TableHead>
    </TableRow></TableHeader><TableBody>
      {data.length === 0 && (
        <TableRow key="empty-row-employee">
          <TableCell colSpan={6} className="text-center text-muted-foreground">데이터가 없습니다.</TableCell>
        </TableRow>
      )}
      {data.map((emp) => (
        <TableRow key={emp.employeeId}>
          <TableCell>{emp.employeeId}</TableCell>
          <TableCell className="font-medium">{emp.name}</TableCell>
          <TableCell>{emp.email}</TableCell>
          <TableCell>{emp.phone}</TableCell>
          <TableCell>{new Date(emp.createdAt).toLocaleDateString()}</TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isDeleting}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(emp.employeeId)} // ⭐️ 훅의 handleDelete 호출
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody></Table>
  );
}
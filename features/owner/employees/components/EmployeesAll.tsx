// features/owner/employees/components/EmployeesAll.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import useEmployeesAll from "@/features/owner/employees/hooks/useEmployeesAll"

export default function EmployeesAll() {
  const {
    // state
    searchQuery,
    employees,
    loading,
    banner,
    openDelete,
    targetToDelete,
    // setters
    setSearchQuery,
    setOpenDelete,
    setTargetToDelete,
    // derived
    filtered,
    formatDate,
    // actions
    confirmDelete,
  } = useEmployeesAll()

  return (
    <div className="space-y-6">
      {banner && (
        <div
          className={`rounded-md border p-3 text-sm ${
            banner.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {banner.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>직원 목록</CardTitle>
              <CardDescription>전체 {employees.length}명의 직원이 등록되어 있습니다</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="직원 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">불러오는 중…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>전화번호</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e, idx) => (
                  <TableRow key={e.employeeId ?? `emp-${idx}`}>
                    <TableCell className="font-medium">{e.name || "-"}</TableCell>
                    <TableCell>{e.email || "-"}</TableCell>
                    <TableCell>{e.phone || "-"}</TableCell>
                    <TableCell>
                      {e.provider ? (
                        <Badge variant="secondary">{e.provider}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(e.createdAt)}</TableCell>
                    {/* 🔹 삭제 전용 작업 메뉴 */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="작업 메뉴 열기">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-28">
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => {
                              setTargetToDelete(e)
                              setOpenDelete(true)
                            }}
                          >
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      검색 결과가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>직원 삭제</DialogTitle>
            <DialogDescription>
              {targetToDelete ? (
                <>
                  <span className="font-medium">{targetToDelete.name}</span> ({targetToDelete.email}) 직원을 정말
                  삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </>
              ) : (
                "선택한 직원을 삭제하시겠습니까?"
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              취소
            </Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={confirmDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
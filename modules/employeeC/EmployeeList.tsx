// modules/employeeC/EmployeeList.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Search, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import useEmployeeList from "./useEmployeeList";

export default function EmployeeList() {
  const {
    searchQuery, setSearchQuery, employees, filtered, loading, banner,
    openDelete, setOpenDelete, targetToDelete, setTargetToDelete, confirmDelete, formatDate
  } = useEmployeeList();

  return (
    <div className="space-y-6">
      {banner && <div className={`p-3 text-sm rounded border ${banner.type==="success"?"bg-green-50 text-green-700":"bg-red-50 text-red-700"}`}>{banner.message}</div>}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center gap-3">
            <div><CardTitle>직원 목록</CardTitle><CardDescription>{employees.length}명의 직원이 있습니다.</CardDescription></div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-sm">로딩 중...</div> : (
            <Table>
              <TableHeader><TableRow><TableHead>이름</TableHead><TableHead>이메일</TableHead><TableHead>전화번호</TableHead><TableHead>Provider</TableHead><TableHead>가입일</TableHead><TableHead className="text-right">관리</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((e, idx) => (
                  <TableRow key={e.employeeId || idx}>
                    <TableCell className="font-medium">{e.name || "-"}</TableCell>
                    <TableCell>{e.email || "-"}</TableCell>
                    <TableCell>{e.phone || "-"}</TableCell>
                    <TableCell>{e.provider ? <Badge variant="secondary">{e.provider}</Badge> : "-"}</TableCell>
                    <TableCell>{formatDate(e.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-red-600" onClick={() => { setTargetToDelete(e); setOpenDelete(true); }}>삭제</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8">데이터가 없습니다.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader><DialogTitle>직원 삭제</DialogTitle><DialogDescription>{targetToDelete?.name} 직원을 삭제(배정 해제)하시겠습니까?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>취소</Button>
            <Button variant="destructive" onClick={confirmDelete}>삭제</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
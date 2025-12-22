// src/modules/admin/AdminLogList.tsx
"use client";

import { useAdminLogs } from "./useAdminLogs";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Search } from "lucide-react";

export default function AdminLogList() {
  const {
    logs, totalPages, page, setPage,
    levelFilter, setLevelFilter,
    searchQuery, setSearchQuery, isLoading
  } = useAdminLogs();

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "ERROR": return "destructive";
      case "WARN": return "secondary"; // orange 느낌이 없어서 secondary 사용
      default: return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <CardTitle>시스템 로그</CardTitle>
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={levelFilter} onValueChange={(v: any) => { setLevelFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="레벨" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="INFO">INFO</SelectItem>
                <SelectItem value="WARN">WARN</SelectItem>
                <SelectItem value="ERROR">ERROR</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="메시지 검색" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? <p className="text-center py-8">로딩 중...</p> : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">레벨</TableHead>
                  <TableHead className="w-[180px]">시간</TableHead>
                  <TableHead>메시지</TableHead>
                  <TableHead className="w-[120px]">요청자</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center h-24">로그가 없습니다.</TableCell></TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.logId}>
                      <TableCell>
                        <Badge variant={getLevelBadgeVariant(log.level)}>{log.level}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {log.timestamp}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{log.message}</div>
                        {log.details && <div className="text-xs text-muted-foreground mt-1 truncate max-w-md">{log.details}</div>}
                      </TableCell>
                      <TableCell className="text-xs">
                        {log.requesterId || log.requesterIp || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* 페이지네이션 */}
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>이전</Button>
          <span className="text-sm flex items-center">{page + 1} / {Math.max(1, totalPages)}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>다음</Button>
        </div>
      </CardContent>
    </Card>
  );
}
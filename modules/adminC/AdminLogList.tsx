"use client";

import { useAdminLogs } from "./useAdminLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Search } from "lucide-react";
import { Badge } from "@/shared/ui/badge";

export default function AdminLogList() {
  const {
    logs, totalPages, page, handlePageChange,
    levelFilter, setLevelFilter,
    searchQuery, setSearchQuery, handleKeyDown,
    isLoading
  } = useAdminLogs();

  return (
    <Card>
      <CardHeader>
        <CardTitle>시스템 로그</CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Select value={levelFilter} onValueChange={(v: any) => setLevelFilter(v)}>
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

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="로그 메시지 검색..."
              className="pl-8"
              value={searchQuery}
              onChange={setSearchQuery} // ✅
              onKeyDown={handleKeyDown} // ✅
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
            {isLoading && <div>로딩 중...</div>}
            {!isLoading && logs.length === 0 && <div className="text-center py-4">로그가 없습니다.</div>}
            {logs.map((log) => (
              <div key={log.logId} className="flex justify-between items-center p-3 border rounded text-sm">
                <div className="flex items-center gap-3">
                  <Badge variant={log.level === 'ERROR' ? 'destructive' : log.level === 'WARN' ? 'secondary' : 'outline'}>
                    {log.level}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">{log.createdAt.slice(0, 19)}</span>
                  <span>{log.message}</span>
                </div>
                <div className="text-xs text-muted-foreground">{log.module}</div>
              </div>
            ))}
        </div>

        <div className="flex justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => handlePageChange(page - 1)}>Prev</Button>
          <span className="flex items-center text-sm">{page + 1} / {Math.max(1, totalPages)}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => handlePageChange(page + 1)}>Next</Button>
        </div>
      </CardContent>
    </Card>
  );
}
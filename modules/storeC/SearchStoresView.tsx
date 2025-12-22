"use client";

import { useSearchStores } from "./useSearchStores";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Search, MapPin, Store } from "lucide-react";
import { Badge } from "@/shared/ui/badge";

export default function SearchStoresView() {
  const {
    workplaceCode, setWorkplaceCode, handleSearch, handleKeyDown, // 훅에서 반환된 변수명 사용
    searchResult, appliedStores, submitting, searching, assignmentStatus, handleApply
  } = useSearchStores();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">사업장 찾기</h2>
        <p className="text-muted-foreground">사장님이 공유해주신 사업장 코드를 입력하세요.</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="사업장 코드 (숫자)" 
            className="pl-10 h-10 text-lg"
            value={workplaceCode}
            onChange={setWorkplaceCode} // ✅ useSearch 훅의 handleChange 연결
            onKeyDown={handleKeyDown}   // ✅ 엔터키 연결
          />
        </div>
        <Button size="lg" onClick={handleSearch} disabled={searching}>
          {searching ? "검색 중..." : "검색"}
        </Button>
      </div>

      {searchResult && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  {searchResult.storeName}
                </CardTitle>
                <CardDescription>{searchResult.industry}</CardDescription>
              </div>
              {assignmentStatus && assignmentStatus !== "NONE" && (
                <Badge variant={assignmentStatus === "ACCEPTED" ? "default" : "secondary"}>
                  {assignmentStatus === "ACCEPTED" ? "근무 중" : "승인 대기"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {searchResult.address || "주소 정보 없음"}
            </div>
            
            <div className="pt-2">
              <Button 
                className="w-full" 
                size="lg" 
                onClick={() => handleApply(searchResult.storeId)}
                disabled={submitting || appliedStores.includes(searchResult.storeId) || assignmentStatus !== null}
              >
                {assignmentStatus === "PENDING" ? "승인 대기 중" : 
                 assignmentStatus === "ACCEPTED" ? "이미 소속됨" : 
                 "직원 등록 신청"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
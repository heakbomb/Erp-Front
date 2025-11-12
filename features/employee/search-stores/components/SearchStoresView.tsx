// features/employee/search-stores/components/SearchStoresView.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Store, Send, CheckCircle, Key } from "lucide-react";
import { PreviewStore } from "@/features/employee/search-stores/services/searchStoresService";

export default function SearchStoresView({
  workplaceCode,
  searchResult,
  appliedStores,
  submitting,
  searching,
  // ✅ 함수 이름을 *Action 으로만 바꿈 (동작/UX 동일)
  setWorkplaceCodeAction,
  handleSearchAction,
  handleApplyAction,
}: {
  workplaceCode: string;
  searchResult: PreviewStore | null;
  appliedStores: number[];
  submitting: boolean;
  searching: boolean;
  setWorkplaceCodeAction: (v: string) => void;
  handleSearchAction: () => Promise<void>;
  handleApplyAction: (storeId: number) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">사업장 검색</h1>
        <p className="text-muted-foreground">사업장 코드를 입력하여 근무 신청하세요</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>사업장 코드 입력</CardTitle>
          <CardDescription>사장님께 받은 사업장 코드를 입력하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workplace-code">사업장 코드</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Key className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="workplace-code"
                  placeholder="예: 11"
                  value={workplaceCode}
                  onChange={(e) => setWorkplaceCodeAction(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button size="lg" onClick={handleSearchAction} disabled={searching}>
                {searching ? "검색 중..." : "검색"}
              </Button>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">
              💡 현재는 숫자 형태의 사업장 코드(예: <span className="font-mono">11</span>)를 사용합니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {searchResult && !appliedStores.includes(searchResult.id) && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>검색 결과</CardTitle>
            <CardDescription>아래 사업장이 맞다면 신청하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-start gap-3 flex-1">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{searchResult.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{searchResult.address}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{searchResult.industry}</Badge>
                    {typeof searchResult.employees === "number" && (
                      <span className="text-xs text-muted-foreground">직원 {searchResult.employees}명</span>
                    )}
                  </div>
                  <div className="mt-2 p-2 rounded bg-muted">
                    <p className="text-xs text-muted-foreground">
                      사업장 코드: <span className="font-mono font-medium">{searchResult.code}</span>
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleApplyAction(searchResult.id)} disabled={submitting}>
                <Send className="mr-2 h-4 w-4" />
                {submitting ? "신청 중..." : "신청하기"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {appliedStores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>신청한 사업장</CardTitle>
            <CardDescription>승인 대기 중인 사업장입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appliedStores.map((id) => (
                <div key={id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">사업장 #{id}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">주소 정보 없음</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">업종 정보 없음</Badge>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    승인 대기
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import { useAdminSubscriptions } from "./useAdminSubscriptions";
import { Card, CardHeader, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/shared/ui/table";
import { Search, Plus, Trash2, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

export default function AdminSubscriptionList() {
  const {
    tab, handleTabChange,
    searchQuery, setSearchQuery,
    productsQuery, statusQuery,
    createPlan, // 생성 훅
    updatePlan, // 수정 훅
    deletePlan
  } = useAdminSubscriptions();

  // --- 다이얼로그 상태 및 폼 데이터 관리 ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    subName: "",
    monthlyPrice: 0,
    isActive: true,
  });

  // [기능 1] 구독 추가 다이얼로그 열기
  const openCreateDialog = () => {
    setIsEditMode(false);
    setTargetId(null);
    setFormData({ subName: "", monthlyPrice: 0, isActive: true });
    setIsDialogOpen(true);
  };

  // [기능 2] 구독 수정 다이얼로그 열기
  const openEditDialog = (plan: any) => {
    console.log("수정할 플랜 데이터:", plan); // 디버깅용 로그

    setIsEditMode(true);
    setTargetId(plan.subId);
    
    // ✅ [핵심] isActive가 없거나 null일 경우에 대한 안전한 처리
    // plan.isActive가 있으면 그걸 쓰고, 없으면 plan.active를 확인하고, 둘 다 없으면 false
    const activeStatus = plan.isActive ?? plan.active ?? false;

    setFormData({
      subName: plan.subName,
      monthlyPrice: plan.monthlyPrice,
      isActive: activeStatus,
    });
    
    setIsDialogOpen(true);
  };

  // ✅ [수정] handleSave 함수 정의 (에러가 났던 부분)
  const handleSave = () => {
    if (!formData.subName) {
      alert("상품명을 입력해주세요.");
      return;
    }

    const payload = {
      subName: formData.subName,
      monthlyPrice: Number(formData.monthlyPrice), // 숫자로 변환
      isActive: formData.isActive,
    };

    if (isEditMode && targetId) {
      // 수정 요청
      updatePlan({ id: targetId, data: payload });
    } else {
      // 생성 요청
      createPlan(payload);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">구독 관리</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="검색..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="pl-8" 
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="PRODUCTS">상품 관리</TabsTrigger>
              <TabsTrigger value="STATUS">구독 현황</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {tab === "PRODUCTS" && (
            <div>
              <div className="flex justify-end mb-4">
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4"/> 상품 추가
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>상품명</TableHead>
                    <TableHead>가격</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsQuery.isLoading ? <TableRow><TableCell colSpan={5}>로딩 중...</TableCell></TableRow> :
                   productsQuery.data?.content.map((sub) => (
                    <TableRow key={sub.subId}>
                      <TableCell>{sub.subId}</TableCell>
                      <TableCell>{sub.subName}</TableCell>
                      <TableCell>{sub.monthlyPrice.toLocaleString()}원</TableCell>
                      <TableCell>
                        <Badge variant={sub.isActive ? "default" : "secondary"}>
                          {sub.isActive ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => openEditDialog(sub)}>
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deletePlan(sub.subId)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {tab === "STATUS" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사장님</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>플랜</TableHead>
                  <TableHead>만료일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statusQuery.isLoading ? <TableRow><TableCell colSpan={4}>로딩 중...</TableCell></TableRow> :
                 statusQuery.data?.content.map((st) => (
                  <TableRow key={st.ownerSubId}>
                    <TableCell>{st.ownerName}</TableCell>
                    <TableCell>{st.ownerEmail}</TableCell>
                    <TableCell>{st.subName}</TableCell>
                    <TableCell>{st.expiryDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 상품 추가/수정 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "상품 수정" : "새 상품 추가"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                상품명
              </Label>
              <Input
                id="name"
                value={formData.subName}
                onChange={(e) => setFormData({ ...formData, subName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                가격(월)
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.monthlyPrice}
                onChange={(e) => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                상태
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formData.isActive ? "ACTIVE" : "INACTIVE"} 
                  onValueChange={(val) => setFormData({ ...formData, isActive: val === "ACTIVE" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE (판매 중)</SelectItem>
                    <SelectItem value="INACTIVE">INACTIVE (판매 중지)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
            {/* handleSave가 여기서 호출됩니다 */}
            <Button onClick={handleSave}>{isEditMode ? "수정 저장" : "추가하기"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
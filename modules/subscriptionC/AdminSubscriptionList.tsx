// src/modules/subscription/AdminSubscriptionList.tsx
"use client";

import { useState } from "react";
import { useAdminSubscriptions } from "./useAdminSubscriptions";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/shared/ui/table";
import { Search, Loader2, MoreVertical, Plus, Trash2, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/shared/ui/dropdown-menu";

export default function AdminSubscriptionList() {
  const {
    tab, handleTabChange,
    searchQuery, setSearchQuery,
    page, setPage,
    productsQuery, statusQuery,
    deletePlan
  } = useAdminSubscriptions();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">구독 관리</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" />
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
                <Button><Plus className="mr-2 h-4 w-4"/> 상품 추가</Button>
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
                      <TableCell><Badge variant={sub.isActive ? "default" : "secondary"}>{sub.isActive ? "ACTIVE" : "INACTIVE"}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => deletePlan(sub.subId)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
    </div>
  );
}
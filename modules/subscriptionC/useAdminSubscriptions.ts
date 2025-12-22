// src/modules/subscription/useAdminSubscriptions.ts
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionApi } from "./subscriptionApi";
import type { SubscriptionRequest } from "./subscriptionTypes";
import { useToast } from "@/shared/ui/use-toast";

export function useAdminSubscriptions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [tab, setTab] = useState("PRODUCTS");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // 상품 쿼리
  const productsQuery = useQuery({
    queryKey: ["adminPlans", page, searchQuery],
    queryFn: () => subscriptionApi.getAdminPlans({
      page, size: pageSize, status: "ALL", q: searchQuery
    }),
    enabled: tab === "PRODUCTS",
  });

  // 현황 쿼리
  const statusQuery = useQuery({
    queryKey: ["adminSubStatus", page, searchQuery],
    queryFn: () => subscriptionApi.getSubscriptionStatuses({
      page, size: pageSize, q: searchQuery
    }),
    enabled: tab === "STATUS",
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: subscriptionApi.createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPlans"] });
      toast({ title: "상품 생성 완료" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: SubscriptionRequest }) => 
      subscriptionApi.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPlans"] });
      toast({ title: "상품 수정 완료" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: subscriptionApi.deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPlans"] });
      toast({ title: "상품 삭제 완료" });
    }
  });

  const handleTabChange = (val: string) => {
    setTab(val);
    setPage(0);
    setSearchQuery("");
  };

  return {
    tab, handleTabChange,
    searchQuery, setSearchQuery,
    page, setPage,
    productsQuery,
    statusQuery,
    createPlan: createMutation.mutate,
    updatePlan: updateMutation.mutate,
    deletePlan: deleteMutation.mutate,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
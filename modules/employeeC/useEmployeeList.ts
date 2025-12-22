// modules/employeeC/useEmployeeList.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/contexts/StoreContext";
import { employeeApi } from "./employeeApi";
import { useSearch } from "@/shared/hooks/useSearch"; // ✅ useSearch import
import type { StoreEmployee, Banner } from "./employeeTypes";

export default function useEmployeeList() {
  const { currentStoreId } = useStore();

  // ✅ [수정] 공통 검색 훅 사용
  // keyword: 입력창의 값 (실시간)
  // activeKeyword: 엔터/검색버튼으로 확정된 값 (필터링용)
  const { 
    keyword: searchQuery, 
    setKeyword: setSearchQuery, 
    activeKeyword, 
    handleKeyDown 
  } = useSearch();

  const [employees, setEmployees] = useState<StoreEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  // 수정 관련 State
  const [openEdit, setOpenEdit] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", provider: "" });
  const [saving, setSaving] = useState(false);

  // 삭제 관련 State
  const [openDelete, setOpenDelete] = useState(false);
  const [targetToDelete, setTargetToDelete] = useState<StoreEmployee | null>(null);

  const bannerShow = (b: Banner) => {
    setBanner(b);
    setTimeout(() => setBanner(null), 2400);
  };

  const loadEmployees = async (storeId: number) => {
    try {
      setLoading(true);
      const data = await employeeApi.fetchEmployees(storeId);
      setEmployees(data);
    } catch (e) {
      console.error("직원 목록 로드 실패:", e);
      bannerShow({ type: "error", message: "직원 목록을 불러오지 못했습니다." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentStoreId) {
      setEmployees([]);
      return;
    }
    loadEmployees(currentStoreId);
  }, [currentStoreId]);

  // ✅ [수정] activeKeyword를 기준으로 필터링 수행
  const filtered = useMemo(() => {
    const q = activeKeyword.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        (e.name ?? "").toLowerCase().includes(q) ||
        (e.email ?? "").toLowerCase().includes(q) ||
        (e.phone ?? "").toLowerCase().includes(q)
    );
  }, [employees, activeKeyword]);

  // 수정 다이얼로그 열기
  const openEditDialog = (emp: StoreEmployee) => {
    setEditingId(emp.employeeId);
    setEditForm({
      name: emp.name ?? "",
      email: emp.email ?? "",
      phone: emp.phone ?? "",
      provider: emp.provider ?? "",
    });
    setOpenEdit(true);
  };

  // 수정 처리
  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      setSaving(true);
      await employeeApi.updateEmployee({
        employeeId: editingId,
        ...editForm,
      });
      setOpenEdit(false);
      setEditingId(null);
      if (currentStoreId) await loadEmployees(currentStoreId);
      bannerShow({ type: "success", message: "직원 정보가 수정되었습니다." });
    } catch (e: any) {
      bannerShow({ type: "error", message: "수정 실패: " + (e.response?.data?.message || e.message) });
    } finally {
      setSaving(false);
    }
  };

  // 삭제 처리
  const confirmDelete = async () => {
    if (!targetToDelete) return;

    if (!targetToDelete.assignmentId) {
      bannerShow({ type: "error", message: "배정 정보를 찾을 수 없어 삭제할 수 없습니다." });
      return;
    }

    try {
      await employeeApi.deleteEmployee(targetToDelete.assignmentId);
      setOpenDelete(false);
      if (currentStoreId) await loadEmployees(currentStoreId);
      bannerShow({ type: "success", message: "직원이 사업장에서 제거되었습니다." });
    } catch (e: any) {
      bannerShow({ type: "error", message: "삭제 실패" });
    }
  };

  const formatDate = (iso?: string | null) => (iso ? iso.slice(0, 10) : "-");

  return {
    searchQuery, setSearchQuery, handleKeyDown, // ✅ handleKeyDown 추가 반환
    employees, filtered, loading, banner,
    openDelete, setOpenDelete, targetToDelete, setTargetToDelete,
    openEdit, setOpenEdit, editForm, setEditForm,
    openEditDialog, handleUpdate, confirmDelete,
    formatDate, saving
  };
}
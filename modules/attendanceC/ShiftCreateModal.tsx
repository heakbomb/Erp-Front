"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import type { EmployeeShift } from "./attendanceTypes";
import type { Employee } from "@/modules/employeeC/employeeTypes";

export type ShiftFormValues = {
  employeeId: number | "";
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes?: number | null;
};

interface Props {
  open: boolean;
  onClose: () => void;
  date: string; // "YYYY-MM-DD"
  employees: Employee[];
  initialShift?: EmployeeShift | null;
  onSubmit: (payload: ShiftFormValues, shiftId?: number) => Promise<void>;
  onDelete?: (shiftId: number) => Promise<void>;
  onDeleteMonthAll?: (employeeId: number) => Promise<void> | void;
}

export default function ShiftCreateModal({
  open,
  onClose,
  date,
  employees,
  initialShift,
  onSubmit,
  onDelete,
  onDeleteMonthAll,
}: Props) {
  const isEditMode = !!initialShift;

  const [form, setForm] = useState<ShiftFormValues>({
    employeeId: "",
    date,
    startTime: "09:00",
    endTime: "18:00",
    breakMinutes: 0,
  });

  useEffect(() => {
    if (initialShift) {
      setForm({
        employeeId: initialShift.employeeId,
        date: initialShift.shiftDate,
        startTime: initialShift.startTime,
        endTime: initialShift.endTime,
        breakMinutes: initialShift.breakMinutes ?? 0,
      });
    } else {
      setForm({
        employeeId: "",
        date,
        startTime: "09:00",
        endTime: "18:00",
        breakMinutes: 0,
      });
    }
    setIsBreakTimeLimitReached(false);
  }, [initialShift, date, open]);

  const handleChange = (field: keyof ShiftFormValues, value: string) => {
    if (field === "employeeId") {
      setForm((prev) => ({
        ...prev,
        employeeId: value === "" ? "" : Number(value),
      }));
      return;
    }

    if (field === "breakMinutes") {
      // ✅ 0~120으로 강제
      let num = value === "" ? 0 : Number(value);
      if (!Number.isFinite(num)) num = 0;
      if (num < 0) num = 0;
      if (num > 120) num = 120;

      setForm((prev) => ({ ...prev, breakMinutes: num }));
      return;
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const extractErrorMessage = (err: any) => {
    // ✅ Error("중복근무 신청입니다") 형태 지원
    if (err?.message) return err.message;

    const status = err?.response?.status;
    const data = err?.response?.data;

    if (status === 409) return "중복근무 신청입니다.";
    if (typeof data === "string" && data.trim()) return data;
    if (data?.message) return data.message;

    return "요청 처리 중 오류가 발생했습니다.";
  };

  const handleSubmit = async () => {
    if (!form.employeeId) {
      alert("직원을 선택해주세요.");
      return;
    }
    if (!form.startTime || !form.endTime) {
      alert("시작/종료 시간을 입력해주세요.");
      return;
    }

    try {
      await onSubmit(form, initialShift?.shiftId);
      onClose();
    } catch (err: any) {
      alert(extractErrorMessage(err));
    }
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // ✅ 이벤트 전파 방지
    e.preventDefault();
    e.stopPropagation();
    
    if (!initialShift || !onDelete) return;
    if (confirm("정말 삭제하시겠습니까?")) {
      await onDelete(initialShift.shiftId);
      onClose();
    }
  };

  const handleDeleteMonth = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // ✅ 이벤트 전파 방지
    e.preventDefault();
    e.stopPropagation();

    if (!form.employeeId || !onDeleteMonthAll) return;
    if (confirm("이 직원의 이번 달 근무를 모두 삭제하시겠습니까?")) {
      await onDeleteMonthAll(Number(form.employeeId));
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "근무 수정" : "근무 추가"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>직원</Label>
            <select
              className="w-full border rounded-md px-2 py-1 text-sm"
              value={form.employeeId}
              onChange={(e) => handleChange("employeeId", e.target.value)}
            >
              <option value="">선택하세요</option>
              {employees.map((emp) => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>날짜</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>시작</Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>종료</Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>휴게시간 (분)</Label>
            {/* ✅ 안내 문구만 추가 (다른 UI 영향 최소) */}
            <p className="text-xs text-muted-foreground">최대 120분까지 입력할 수 있습니다.</p>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={120}
              step={1}
              value={form.breakMinutes ?? 0}
              onChange={(e) => handleChange("breakMinutes", e.target.value)}
            />
            {/* ✅ 경고 문구 추가 */}
            {isBreakTimeLimitReached && (
              <p className="text-xs text-red-500 mt-1">
                휴게시간은 최대 3자리(999분)까지 입력 가능합니다.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between w-full">
          <div className="flex gap-2">
            {isEditMode && onDelete && (
              <Button variant="destructive" onClick={handleDelete} type="button">
                삭제
              </Button>
            )}
            {isEditMode && onDeleteMonthAll && form.employeeId && (
              <Button variant="outline" onClick={handleDeleteMonth} type="button">
                월 전체 삭제
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              취소
            </Button>
            <Button onClick={handleSubmit} type="button">
              저장
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
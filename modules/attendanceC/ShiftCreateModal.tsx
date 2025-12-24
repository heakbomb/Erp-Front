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

  // ✅ 고정 스케줄
  isFixed?: boolean;
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
    isFixed: false,
  });

  useEffect(() => {
    if (initialShift) {
      setForm({
        employeeId: initialShift.employeeId,
        date: initialShift.shiftDate,
        startTime: initialShift.startTime,
        endTime: initialShift.endTime,
        breakMinutes: initialShift.breakMinutes ?? 0,
        isFixed: !!initialShift.isFixed,
      });
    } else {
      setForm({
        employeeId: "",
        date,
        startTime: "09:00",
        endTime: "18:00",
        breakMinutes: 0,
        isFixed: false,
      });
    }
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
      let num = value === "" ? 0 : Number(value);
      if (num < 0) num = 0;
      setForm((prev) => ({ ...prev, breakMinutes: num }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
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
    await onSubmit(form, initialShift?.shiftId);
  };

  const handleDelete = async () => {
    if (!initialShift || !onDelete) return;
    if (confirm("정말 삭제하시겠습니까?")) {
      await onDelete(initialShift.shiftId);
      onClose();
    }
  };

  // ✅ 월 전체 삭제: form.employeeId가 비어도(initialShift 수정모드 등) 동작하도록 보강
  const handleDeleteMonth = async () => {
    if (!onDeleteMonthAll) return;

    const empId = Number(form.employeeId || initialShift?.employeeId);
    if (!empId) return;

    if (confirm("이 직원의 이번 달 근무를 모두 삭제하시겠습니까?")) {
      await onDeleteMonthAll(empId);
      onClose();
    }
  };

  // ✅ 버튼 노출 여부: 추가모드라도 직원 선택하면 보이게 / 수정모드면 무조건 보이게
  const canShowDeleteMonth =
    !!onDeleteMonthAll && (!!form.employeeId || !!initialShift?.employeeId);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "근무 수정" : "근무 추가"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 직원 선택 */}
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

          {/* ✅ 고정 스케줄 체크 + 안내(추가/수정 모두 표시) */}
          <div className="flex items-center gap-2">
            <input
              id="isFixed"
              type="checkbox"
              checked={!!form.isFixed}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isFixed: e.target.checked }))
              }
            />
            <Label htmlFor="isFixed">고정 스케줄</Label>

            {form.isFixed && (
              <span className="text-xs text-muted-foreground">
                {isEditMode ? "📌 고정 스케줄입니다" : "📌 고정으로 등록됩니다"}
              </span>
            )}
          </div>

          {/* 날짜 */}
          <div className="space-y-2">
            <Label>날짜</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
          </div>

          {/* 시간 */}
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

          {/* 휴게시간 */}
          <div className="space-y-2">
            <Label>휴게시간 (분)</Label>
            <Input
              type="number"
              value={form.breakMinutes ?? 0}
              onChange={(e) => handleChange("breakMinutes", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between w-full">
          {/* ✅ 좌측 버튼들 */}
          <div className="flex gap-2">
            {isEditMode && onDelete && (
              <Button variant="destructive" onClick={handleDelete} type="button">
                삭제
              </Button>
            )}

            {canShowDeleteMonth && (
              <Button variant="outline" onClick={handleDeleteMonth} type="button">
                월 전체 삭제
              </Button>
            )}
          </div>

          {/* 우측 버튼들 */}
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

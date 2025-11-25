"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import type { Employee, EmployeeShift } from "@/lib/types/database";

type FormValues = {
  employeeId: number | "";
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes?: number | null;
};

type ShiftCreateModalProps = {
  open: boolean;
  onClose: () => void;
  date: string;
  employees: Employee[];
  initialShift?: EmployeeShift | null;
  onSubmit: (payload: FormValues, shiftId?: number) => Promise<void>;
  onDelete?: (shiftId: number) => Promise<void>;
  onDeleteMonthAll?: (employeeId: number) => Promise<void> | void; // ✅ 일괄삭제 콜백
};

export default function ShiftCreateModal({
  open,
  onClose,
  date,
  employees,
  initialShift,
  onSubmit,
  onDelete,
  onDeleteMonthAll, // ✅ props에 추가
}: ShiftCreateModalProps) {
  const isEditMode = !!initialShift;

  const [form, setForm] = useState<FormValues>({
    employeeId: "",
    date,
    startTime: "09:00",
    endTime: "18:00",
    breakMinutes: 0,
  });

  // 초기값 설정
  useEffect(() => {
    if (initialShift) {
      setForm({
        employeeId: initialShift.employeeId,
        date: initialShift.shiftDate,
        startTime: initialShift.startTime,
        endTime: initialShift.endTime,
        breakMinutes:
          typeof initialShift.breakMinutes === "number"
            ? initialShift.breakMinutes
            : 0,
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
  }, [initialShift, date]);

  // 폼 변경 처리
  const handleChange = (field: keyof FormValues, value: string) => {
    if (field === "employeeId") {
      setForm((prev) => ({
        ...prev,
        employeeId: value === "" ? "" : Number(value),
      }));
    } else if (field === "breakMinutes") {
      setForm((prev) => ({
        ...prev,
        breakMinutes: value === "" ? null : Number(value),
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  // 단건 삭제
  const handleDelete = async () => {
    if (!initialShift || !onDelete) return;
    const ok = confirm("정말 이 근무 스케줄을 삭제하시겠습니까?");
    if (!ok) return;
    await onDelete(initialShift.shiftId);
  };

  // ✅ 월 전체 삭제
  const handleDeleteMonthAll = async () => {
    if (!onDeleteMonthAll || !form.employeeId) return;

    const ok = confirm(
      "이 직원의 이번 달 근무 스케줄을 모두 삭제하시겠습니까?"
    );
    if (!ok) return;

    await onDeleteMonthAll(Number(form.employeeId));
  };

  // 등록/수정 처리
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

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "근무 스케줄 수정" : "근무 스케줄 추가"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 직원 */}
          <div className="space-y-2">
            <Label htmlFor="employee">직원</Label>
            <select
              id="employee"
              className="w-full border rounded-md px-2 py-1 text-sm"
              value={form.employeeId === "" ? "" : form.employeeId}
              onChange={(e) => handleChange("employeeId", e.target.value)}
            >
              <option value="">직원을 선택하세요</option>
              {employees.map((emp) => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
          </div>

          {/* 날짜 */}
          <div className="space-y-2">
            <Label htmlFor="date">근무 날짜</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
          </div>

          {/* 시간 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startTime">시작 시간</Label>
              <Input
                id="startTime"
                type="time"
                value={form.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">종료 시간</Label>
              <Input
                id="endTime"
                type="time"
                value={form.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
              />
            </div>
          </div>

          {/* 휴게시간 */}
          <div className="space-y-2">
            <Label htmlFor="breakMinutes">휴게 시간 (분)</Label>
            <Input
              id="breakMinutes"
              type="number"
              min={0}
              value={form.breakMinutes ?? ""}
              onChange={(e) => handleChange("breakMinutes", e.target.value)}
              placeholder="예) 60"
            />
          </div>

          {/* 고정 스케줄 표시 */}
          {initialShift?.isFixed && (
            <p className="text-xs text-muted-foreground">
              이 근무는{" "}
              <span className="font-semibold text-primary">고정 스케줄</span>
              입니다.
            </p>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex justify-between gap-2">
          <div className="flex gap-2">
            {isEditMode && onDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                단건 삭제
              </Button>
            )}

            {/* ✅ 이번 달 전체 삭제 버튼 */}
            {onDeleteMonthAll && form.employeeId && (
              <Button variant="outline" onClick={handleDeleteMonthAll}>
                이번 달 전체 삭제
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSubmit}>
              {isEditMode ? "수정" : "추가"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
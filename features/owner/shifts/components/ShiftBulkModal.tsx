// features/owner/shifts/components/ShiftBulkModal.tsx
"use client";

import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ko } from "date-fns/locale";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { Employee } from "@/lib/types/database";

type ShiftBulkModalProps = {
  open: boolean;
  onClose: () => void;
  employees: Employee[];
  defaultMonth: Date; // 현재 anchorDate 기준 월
  onSubmit: (values: {
    employeeId: number;
    startDate: string;   // yyyy-MM-dd
    endDate: string;     // yyyy-MM-dd
    weekdays: number[];  // 1~7 (월=1, ..., 일=7)
    startTime: string;
    endTime: string;
    breakMinutes?: number | null;
    isFixed?: boolean;
  }) => Promise<void>;
};

const weekdayOptions = [
  { label: "월", value: 1 },
  { label: "화", value: 2 },
  { label: "수", value: 3 },
  { label: "목", value: 4 },
  { label: "금", value: 5 },
  { label: "토", value: 6 },
  { label: "일", value: 7 },
];

export default function ShiftBulkModal({
  open,
  onClose,
  employees,
  defaultMonth,
  onSubmit,
}: ShiftBulkModalProps) {
  const monthStart = useMemo(() => startOfMonth(defaultMonth), [defaultMonth]);
  const monthEnd = useMemo(() => endOfMonth(defaultMonth), [defaultMonth]);

  const [employeeId, setEmployeeId] = useState<number | "">("");
  const [startDate, setStartDate] = useState<string>(format(monthStart, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState<string>(format(monthEnd, "yyyy-MM-dd"));
  const [weekdayValues, setWeekdayValues] = useState<number[]>([1, 2, 3, 4, 5]); // 기본: 월~금
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [breakMinutes, setBreakMinutes] = useState<string>("60");
  const [isFixed, setIsFixed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleWeekday = (value: number, checked: boolean) => {
    setWeekdayValues((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value),
    );
  };

  // 🔹 "HH:mm" → 분 단위 숫자로 변환
  const parseTimeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  };

  // 🔹 휴게 시간 0~120분으로 제한
  const handleBreakMinutesChange = (value: string) => {
    if (value === "") {
      setBreakMinutes("");
      return;
    }

    let num = Number(value);
    if (Number.isNaN(num)) return;

    if (num < 0) num = 0;
    if (num > 120) num = 120;

    setBreakMinutes(String(num));
  };

   const handleSubmit = async () => {
    if (!employeeId) {
      alert("직원을 선택해주세요.");
      return;
    }
    if (!startDate || !endDate) {
      alert("기간을 선택해주세요.");
      return;
    }
    if (weekdayValues.length === 0) {
      alert("요일을 한 개 이상 선택해주세요.");
      return;
    }
    if (!startTime || !endTime) {
      alert("근무 시작/종료 시간을 입력해주세요.");
      return;
    }

    // 🔹 시작/종료 시간 역순 방지 (하루를 넘기지 못하게)
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);
    if (startMinutes == null || endMinutes == null) {
      alert("근무 시작/종료 시간을 다시 확인해주세요.");
      return;
    }
    if (endMinutes <= startMinutes) {
      alert("종료 시간은 시작 시간보다 늦어야 합니다. 하루를 넘길 수 없습니다.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        employeeId: Number(employeeId),
        startDate,
        endDate,
        weekdays: weekdayValues,
        startTime,
        endTime,
        breakMinutes: breakMinutes ? Number(breakMinutes) : undefined,
        isFixed,
      });

      // ✅ 성공 시 모달 닫기
      onClose();
    } catch (e: any) {
      // 🔥 여기서 409(중복 근무 스케줄) 처리
      const status = e?.response?.status;
      const msg = e?.response?.data ?? e?.message;

      if (status === 409) {
        // 백엔드에서 내려준 "이미 등록된 근무 스케줄이 포함되어 있습니다." 그대로 사용
        alert(String(msg || "이미 등록된 근무 스케줄이 포함되어 있습니다."));
      } else {
        alert("월간 근무 일괄 등록 중 오류가 발생했습니다.");
        console.error("Shift bulk create failed:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>월간 근무 일괄 등록</DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            선택한 기간과 요일 기준으로, 해당 직원의 근무를 한 번에 등록합니다.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 직원 선택 */}
          <div className="space-y-1">
            <Label>직원</Label>
            <Select
              value={employeeId ? String(employeeId) : ""}
              onValueChange={(v) => setEmployeeId(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="직원을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.employeeId} value={String(e.employeeId)}>
                    {e.name} ({e.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 기간 선택 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>시작일</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>종료일</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* 요일 선택 */}
          <div className="space-y-1">
            <Label>적용 요일</Label>
            <div className="flex flex-wrap gap-2">
              {weekdayOptions.map((w) => (
                <label
                  key={w.value}
                  className="flex items-center gap-1 rounded border px-2 py-1 text-xs cursor-pointer"
                >
                  <Checkbox
                    checked={weekdayValues.includes(w.value)}
                    onCheckedChange={(checked) =>
                      handleToggleWeekday(w.value, Boolean(checked))
                    }
                  />
                  <span>{w.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 시간 및 휴게 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>시작 시간</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>종료 시간</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>휴게 시간(분)</Label>
              <Input
                type="number"
                min={0}
                max={120}
                value={breakMinutes}
                onChange={(e) => handleBreakMinutesChange(e.target.value)}
                placeholder="예:  (최대 120분)"
              />
            </div>
            <div className="space-y-1 flex items-center gap-2 mt-5">
              <Checkbox
                id="isFixed"
                checked={isFixed}
                onCheckedChange={(checked) => setIsFixed(Boolean(checked))}
              />
              <Label htmlFor="isFixed">고정 스케줄로 표시</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "등록 중..." : "일괄 등록"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
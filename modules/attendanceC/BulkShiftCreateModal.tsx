"use client";

import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { CalendarDays, Clock, User, Check, AlertCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import type { Employee } from "@/modules/employeeC/employeeTypes";
import { cn } from "@/shared/utils/commonUtils";

export type BulkShiftFormValues = {
  employeeId: number | "";
  dates: string[];
  startTime: string;
  endTime: string;
  breakMinutes?: number;
  isFixed?: boolean;
};

interface Props {
  open: boolean;
  onClose: () => void;
  targetMonth: Date;
  employees: Employee[];
  onSubmit: (payload: BulkShiftFormValues) => Promise<void>;
}

export default function BulkShiftCreateModal({
  open,
  onClose,
  targetMonth,
  employees,
  onSubmit,
}: Props) {
  const [loading, setLoading] = useState(false);

  // 폼 상태
  const [employeeId, setEmployeeId] = useState<string>("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [breakMinutes, setBreakMinutes] = useState(60);

  // ✅ 고정 스케줄 및 휴게시간 경고
  const [isFixed, setIsFixed] = useState(false);
  const [isBreakTimeLimitReached, setIsBreakTimeLimitReached] = useState(false);

  // 날짜 선택 상태
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);

  useEffect(() => {
    if (open) {
      setEmployeeId("");
      setStartTime("09:00");
      setEndTime("18:00");
      setBreakMinutes(60);
      setSelectedWeekdays([]);
      setIsFixed(false);
      setIsBreakTimeLimitReached(false);

      const start = startOfMonth(targetMonth);
      const end = endOfMonth(targetMonth);
      setRangeStart(format(start, "yyyy-MM-dd"));
      setRangeEnd(format(end, "yyyy-MM-dd"));
    }
  }, [open, targetMonth]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setRangeStart(newStart);
    if (rangeEnd && newStart > rangeEnd) setRangeEnd(newStart);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    setRangeEnd(newEnd);
    if (rangeStart && newEnd < rangeStart) setRangeStart(newEnd);
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStartTime(newStart);
    if (endTime && newStart > endTime) setEndTime(newStart);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    setEndTime(newEnd);
    if (startTime && newEnd < startTime) setStartTime(newEnd);
  };

  // ✅ 휴게시간 3자리 제한 핸들러
  const handleBreakTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // 3자리 초과 입력 차단 및 경고 표시
    if (val.length > 3) {
      setIsBreakTimeLimitReached(true);
      return; 
    } else {
      setIsBreakTimeLimitReached(false);
    }
    setBreakMinutes(Number(val));
  };

  const toggleWeekday = (dayIdx: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(dayIdx) ? prev.filter((d) => d !== dayIdx) : [...prev, dayIdx].sort()
    );
  };

  const handleSubmit = async () => {
    if (!employeeId) return alert("직원을 선택해주세요.");
    if (!rangeStart || !rangeEnd) return alert("기간을 설정해주세요.");
    if (rangeStart > rangeEnd) return alert("종료일이 시작일보다 빠를 수 없습니다.");
    if (startTime > endTime) return alert("종료 시간이 시작 시간보다 빠를 수 없습니다.");

    const start = new Date(rangeStart);
    const end = new Date(rangeEnd);
    const allDays = eachDayOfInterval({ start, end });

    let targetDates = allDays;
    if (selectedWeekdays.length > 0) {
      targetDates = allDays.filter((d) => selectedWeekdays.includes(d.getDay()));
    }
    if (targetDates.length === 0) return alert("조건에 맞는 날짜가 없습니다.");

    setLoading(true);
    try {
      const dateStrings = targetDates.map((d) => format(d, "yyyy-MM-dd"));

      await onSubmit({
        employeeId: Number(employeeId),
        dates: dateStrings,
        startTime,
        endTime,
        breakMinutes,
        isFixed,
      });
    } finally {
      setLoading(false);
    }
  };

  const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[480px] gap-0 p-0 overflow-hidden border bg-background shadow-lg sm:rounded-lg">
        <DialogHeader className="px-6 py-4 border-b bg-muted/5">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            월간 근무 일괄 등록
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            특정 기간 동안의 근무 일정을 한 번에 생성합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <User className="w-4 h-4 text-primary" /> 직원 선택
              </Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="근무자를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.employeeId} value={String(emp.employeeId)}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="bulkIsFixed"
                type="checkbox"
                checked={isFixed}
                onChange={(e) => setIsFixed(e.target.checked)}
              />
              <Label htmlFor="bulkIsFixed">고정 스케줄</Label>
              {isFixed && (
                <span className="text-xs text-muted-foreground">📌 고정으로 등록됩니다</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" /> 시작 시간
                </Label>
                <Input
                  type="time"
                  className="h-10"
                  value={startTime}
                  onChange={handleStartTimeChange}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" /> 종료 시간
                </Label>
                <Input
                  type="time"
                  className="h-10"
                  value={endTime}
                  onChange={handleEndTimeChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">휴게 시간 (분)</Label>
              <Input
                type="number"
                className="h-10"
                value={breakMinutes}
                onChange={handleBreakTimeChange} // ✅ 변경된 핸들러 연결
              />
              {/* ✅ 경고 문구 추가 */}
              {isBreakTimeLimitReached && (
                <p className="text-xs text-red-500 mt-1">
                  휴게시간은 최대 3자리(999분)까지 입력 가능합니다.
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-primary" /> 기간 설정
              </Label>
              <div className="flex items-center gap-2">
                <Input type="date" className="h-10" value={rangeStart} onChange={handleStartDateChange} />
                <span className="text-muted-foreground">~</span>
                <Input type="date" className="h-10" value={rangeEnd} onChange={handleEndDateChange} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">요일 반복</Label>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> 선택 시 해당 요일만 등록
                </span>
              </div>

              <div className="flex justify-between gap-1">
                {WEEKDAYS.map((day, idx) => {
                  const selected = selectedWeekdays.includes(idx);
                  return (
                    <Button
                      key={day}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      className={cn(
                        "h-10 w-10 p-0 rounded-md font-medium transition-all text-sm shadow-sm",
                        selected ? "ring-2 ring-primary ring-offset-1" : "hover:bg-muted",
                        !selected && idx === 0 && "text-red-500",
                        !selected && idx === 6 && "text-blue-500"
                      )}
                      onClick={() => toggleWeekday(idx)}
                    >
                      {day}
                      {selected && <span className="sr-only">(선택됨)</span>}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/5 gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto gap-2"
          >
            {loading ? (
              "등록 중..."
            ) : (
              <>
                <Check className="w-4 h-4" />
                일괄 등록하기
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
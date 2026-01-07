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

  const [employeeId, setEmployeeId] = useState<string>("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [breakMinutes, setBreakMinutes] = useState(60);

  const [isFixed, setIsFixed] = useState(false);
  const [isBreakTimeLimitReached, setIsBreakTimeLimitReached] = useState(false);

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

  /**
   * ✅ [수정] 야간근무 테스트를 막는 "자동 보정" 제거
   * - start > end 이어도 그대로 둔다 (야간근무 케이스)
   */
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(e.target.value);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(e.target.value);
  };

  // ✅ [추가] 휴게시간 0~120으로 강제
  const handleBreakMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    let num = raw === "" ? 0 : Number(raw);
    if (!Number.isFinite(num)) num = 0;
    if (num < 0) num = 0;
    if (num > 120) num = 120;
    setBreakMinutes(num);
  };

  const toggleWeekday = (dayIdx: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(dayIdx) ? prev.filter((d) => d !== dayIdx) : [...prev, dayIdx].sort()
    );
  };

  // ✅ 에러 메시지 추출 (axios error + 일반 Error 모두)
  const extractErrorMessage = (err: any) => {
    if (err instanceof Error && err.message) return err.message;

    const status = err?.response?.status;
    const data = err?.response?.data;

    if (status === 409) return "중복근무 신청입니다.";
    if (data?.message) return data.message;
    if (typeof data === "string" && data.trim()) return data;

    return err?.message || "요청 처리 중 오류가 발생했습니다.";
  };

  const handleSubmit = async () => {
    if (!employeeId) return alert("직원을 선택해주세요.");
    if (!rangeStart || !rangeEnd) return alert("기간을 설정해주세요.");
    if (rangeStart > rangeEnd) return alert("종료일이 시작일보다 빠를 수 없습니다.");

    /**
     * ✅ [수정] "startTime > endTime" 야간근무는 허용
     * ✅ "startTime === endTime" (06:00~06:00)만 차단
     */
    if (startTime === endTime) {
      return alert("시작/종료 시간이 같을 수 없습니다.");
    }

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
        breakMinutes, // ✅ 0~120 강제된 값
        isFixed,
      });

      onClose();
    } catch (err: any) {
      alert(extractErrorMessage(err));
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

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">휴게 시간 (분)</Label>
              <p className="text-xs text-muted-foreground">최대 120분까지 입력할 수 있습니다.</p>
              <Input
                type="number"
                className="h-10"
                inputMode="numeric"
                min={0}
                max={120}
                step={1}
                value={breakMinutes}
                onChange={handleBreakMinutesChange}
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
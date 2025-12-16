"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

interface YearMonthSelectProps {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}

export function YearMonthSelect({ year, month, onChange }: YearMonthSelectProps) {
  const currentYear = new Date().getFullYear()

  // 예: 현재 기준 -2년 ~ +1년
  const years = Array.from({ length: 4 }, (_, i) => currentYear - 2 + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const handleYearChange = (value: string) => {
    const nextYear = Number(value)
    onChange(nextYear, month)
  }

  const handleMonthChange = (value: string) => {
    const nextMonth = Number(value)
    onChange(year, nextMonth)
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={String(year)} onValueChange={handleYearChange}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="연도" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}년
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={String(month)} onValueChange={handleMonthChange}>
        <SelectTrigger className="w-[90px]">
          <SelectValue placeholder="월" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m} value={String(m)}>
              {m}월
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

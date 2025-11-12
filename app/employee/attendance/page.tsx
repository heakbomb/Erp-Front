// app/employee/attendance/page.tsx
"use client";

import { useEmployeeAttendance } from "@/features/employee/attendance/hooks/useEmployeeAttendance";
import { AttendanceDesktopView } from "@/features/employee/attendance/components/AttendanceDesktop";

export default function AttendancePage() {
  const attendance = useEmployeeAttendance("3", "11");

  return (
    <AttendanceDesktopView
      employeeId={attendance.employeeId}
      storeId={attendance.storeId}
      date={attendance.date}
      visibleMonth={attendance.visibleMonth}
      ymOpen={attendance.ymOpen}
      recent={attendance.recent}
      daily={attendance.daily}
      loadingRecent={attendance.loadingRecent}
      loadingDay={attendance.loadingDay}
      punching={attendance.punching}
      page={attendance.page}
      totalPages={attendance.totalPages}
      pagedRecent={attendance.pagedRecent}
      modifiers={attendance.modifiers}
      dayHasIn={attendance.dayHasIn}
      dayHasOut={attendance.dayHasOut}
      /* ✅ 이름이 바뀐 부분만 Action 접미사로 맞춰줌 */
      setEmployeeIdAction={attendance.setEmployeeId}
      setStoreIdAction={attendance.setStoreId}
      setDateAction={attendance.setDate}
      setVisibleMonthAction={attendance.setVisibleMonth}
      setYmOpenAction={attendance.setYmOpen}
      setPageAction={attendance.setPage}
      loadRecentAction={attendance.loadRecent}
      punchAction={attendance.punch}
      loadDayAction={attendance.loadDay}
    />
  );
}
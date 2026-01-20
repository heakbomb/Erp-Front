"use client";

import React, { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import ChatWidget from "@/shared/components/chatbot/ChatWidget";
import type { ChatRole } from "@/shared/api/chatbot";

function inferRole(pathname: string | null): ChatRole {
  const p = pathname ?? "";
  if (p.startsWith("/owner")) return "OWNER";
  if (p.startsWith("/employee")) return "EMPLOYEE";
  return "PUBLIC";
}

export default function ChatLauncher() {
  const pathname = usePathname();
  const role = useMemo(() => inferRole(pathname), [pathname]);

  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[60] rounded-full border bg-white shadow-lg px-4 py-3 text-sm font-medium"
      >
        챗봇
      </button>

      {/* 오버레이 + 패널 */}
      {open && (
        <div className="fixed inset-0 z-[70]">
          {/* 배경 오버레이 */}
          <button
            aria-label="close overlay"
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />

          {/* 우하단 패널 */}
          <div className="absolute bottom-5 right-5 w-[420px] max-w-[calc(100vw-40px)]">
            <ChatWidget role={role} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
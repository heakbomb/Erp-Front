"use client";

import React, { useMemo, useRef, useState } from "react";
import { sendChatStream, type ChatRole } from "@/shared/api/chatbot";
import { usePathname } from "next/navigation";

type Msg = { id: string; role: "user" | "assistant"; content: string };

function uid() {
    return Math.random().toString(36).slice(2);
}

export default function ChatWidget({
    role,
    onClose,
}: {
    role: ChatRole; // ✅ 필수로 고정 (Launcher가 항상 줌)
    onClose?: () => void;
}) {
    const pathname = usePathname();
    const currentRoute = useMemo(() => pathname || "", [pathname]);

    const [messages, setMessages] = useState<Msg[]>([
        {
            id: uid(),
            role: "assistant",
            content: "ERP 사용법을 도와드릴게요. 예) 급여 계산 방법, 직원 초대 방법",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const abortRef = useRef<AbortController | null>(null);

    const send = async () => {
        const q = input.trim();
        if (!q || isLoading) return;

        setInput("");
        setIsLoading(true);

        const userMsg: Msg = { id: uid(), role: "user", content: q };
        const assistantId = uid();
        const assistantMsg: Msg = { id: assistantId, role: "assistant", content: "" };

        setMessages((prev) => [...prev, userMsg, assistantMsg]);

        abortRef.current?.abort();
        abortRef.current = new AbortController();

        try {
            await sendChatStream(
                { query: q, role, currentRoute },
                (delta: string) => {
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === assistantId ? { ...m, content: m.content + delta } : m
                        )
                    );
                },
                abortRef.current.signal
            );
        } catch (e: any) {
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === assistantId
                        ? { ...m, content: `오류: ${e?.message ?? String(e)}` }
                        : m
                )
            );
        } finally {
            setIsLoading(false);
            abortRef.current = null;
        }
    };

    return (
        <div className="w-full rounded-2xl border bg-white shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="text-lg font-semibold">ERP 가이드 챗봇</div>
                <button className="text-sm" onClick={onClose}>
                    닫기
                </button>
            </div>

            <div className="h-[420px] overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={
                            m.role === "user"
                                ? "ml-auto max-w-[85%] rounded-2xl bg-black text-white px-4 py-3"
                                : "mr-auto max-w-[85%] rounded-2xl bg-gray-100 text-gray-900 px-4 py-3 whitespace-pre-wrap"
                        }
                    >
                        {m.content ||
                            (m.role === "assistant" && isLoading
                                ? "답변을 생성 중입니다…"
                                : "")}
                    </div>
                ))}
            </div>

            <div className="flex gap-2 p-4 border-t">
                <input
                    className="flex-1 rounded-xl border px-3 py-2 outline-none"
                    value={input}
                    placeholder="질문을 입력하세요"
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") send();
                    }}
                    disabled={isLoading}
                />
                <button
                    className="rounded-xl border px-4 py-2"
                    onClick={send}
                    disabled={isLoading}
                >
                    전송
                </button>
            </div>
        </div>
    );
}
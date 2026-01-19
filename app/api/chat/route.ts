// app/api/chat/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body?.query || typeof body.query !== "string") {
    return NextResponse.json(
      { status: "error", answer: "query가 필요합니다." },
      { status: 400 }
    );
  }

  // FastAPI 챗봇 서버
  const chatbotUrl =
    process.env.CHATBOT_API_URL ?? "http://127.0.0.1:8000/chat";

  try {
    const upstream = await fetch(chatbotUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      // RAG + LLM 시간 고려
      signal: AbortSignal.timeout(90_000),
    });

    const data = await upstream.json().catch(() => null);

    if (!upstream.ok) {
      return NextResponse.json(
        {
          status: "error",
          answer:
            data?.detail ??
            data?.message ??
            "챗봇 서버 오류가 발생했습니다.",
        },
        { status: upstream.status }
      );
    }

    /**
     * FastAPI 응답 형태 정규화
     * - { status, response }
     * - { status, answer }
     */
    const answer =
      typeof data?.answer === "string"
        ? data.answer
        : typeof data?.response === "string"
          ? data.response
          : "";

    return NextResponse.json({
      status: "success",
      answer,
      citations: data?.citations ?? undefined,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        status: "error",
        answer: `챗봇 서버 연결 실패: ${e?.message ?? "unknown error"}`,
      },
      { status: 502 }
    );
  }
}
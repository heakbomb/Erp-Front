import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body?.query || typeof body.query !== "string") {
    return NextResponse.json(
      { status: "error", answer: "query가 필요합니다." },
      { status: 400 }
    );
  }

  const upstreamUrl = process.env.CHATBOT_API_URL ?? "http://127.0.0.1:8000/chat";

  // SSE 스트림 생성
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (obj: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      const sendDone = () => {
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      };

      try {
        const upstream = await fetch(upstreamUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(90_000),
        });

        const data = await upstream.json().catch(() => null);

        if (!upstream.ok) {
          send({ error: data?.detail ?? data?.message ?? "챗봇 서버 오류" });
          sendDone();
          controller.close();
          return;
        }

        const answer =
          typeof data?.answer === "string"
            ? data.answer
            : typeof data?.response === "string"
              ? data.response
              : "";

        // ✅ 여기서 "한 글자씩" 또는 "토큰 단위"로 쪼개서 흘려줌 (옵션 A)
        // 너무 빠르면 UX가 별로라 약간 텀을 줌
        for (const ch of answer) {
          send({ delta: ch });
          // 5~15ms 정도(너무 느리면 답답)
          await new Promise((r) => setTimeout(r, 10));
        }

        // citations은 마지막에 한 번 더 내려도 되지만,
        // 지금 UI가 citations를 표시하지 않으면 생략
        sendDone();
        controller.close();
      } catch (e: any) {
        send({ error: `챗봇 서버 연결 실패: ${e?.message ?? "unknown"}` });
        sendDone();
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
export type ChatRole = "OWNER" | "EMPLOYEE" | "PUBLIC";

export type ChatRequest = {
  query: string;
  role?: ChatRole;
  currentRoute?: string;
};

type StreamDeltaCallback = (delta: string) => void;

function inferRoleFromPath(pathname: string): ChatRole {
  if (pathname.startsWith("/owner")) return "OWNER";
  if (pathname.startsWith("/employee")) return "EMPLOYEE";
  return "PUBLIC";
}

/**
 * Next.js API(/api/chat/stream)로 요청하고, SSE로 delta를 받음
 */
export async function sendChatStream(
  req: ChatRequest,
  onDelta: StreamDeltaCallback,
  signal?: AbortSignal
): Promise<void> {
  // role이 없으면 기본 추론(최소 안전망)
  const role =
    req.role ??
    (req.currentRoute ? inferRoleFromPath(req.currentRoute) : "PUBLIC");

  const res = await fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...req, role }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Chat API failed: ${res.status} ${text}`.trim());
  }

  if (!res.body) throw new Error("No response body (stream)");

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE 이벤트는 \n\n 단위로 끊김
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const line = part
        .split("\n")
        .find((l) => l.startsWith("data:"));
      if (!line) continue;

      const payload = line.replace(/^data:\s?/, "");
      if (payload === "[DONE]") return;

      try {
        const json = JSON.parse(payload) as { delta?: string; error?: string };
        if (json.error) throw new Error(json.error);
        if (typeof json.delta === "string" && json.delta.length > 0) {
          onDelta(json.delta);
        }
      } catch {
        // JSON 아닌 경우는 무시
      }
    }
  }
}
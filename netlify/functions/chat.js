// ─── 限流配置 ───────────────────────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 分钟窗口
const RATE_LIMIT_MAX       = 10;        // 每 IP 每分钟最多 10 次
const rateLimitStore       = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count++;
  return false;
}

// ─── 降级回复 ────────────────────────────────────────────────────────────────
function getFallbackReply(messages) {
  const last = (messages && messages.slice().reverse().find(m => m.role === "user")?.content) || "";
  const lower = last.toLowerCase();
  if (lower.includes("agent") || lower.includes("controller") || lower.includes("planner")) {
    return "AI 助手暂时不可用。关于 Agent/Controller/Planner 的内容，请参考课程第3–4讲讲义。";
  }
  if (lower.includes("memory") || lower.includes("记忆")) {
    return "AI 助手暂时不可用。Memory 相关内容见课程第5讲。";
  }
  if (lower.includes("tool") || lower.includes("工具")) {
    return "AI 助手暂时不可用。Tool 相关内容见课程第4讲。";
  }
  return "AI 助手暂时不可用，请稍后再试，或直接查阅对应讲次的课程讲义。";
}

// ─── 主处理函数 ──────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // 限流检查
  const clientIp =
    event.headers?.["x-forwarded-for"] ||
    event.headers?.["client-ip"] ||
    "unknown";

  if (isRateLimited(clientIp)) {
    return {
      statusCode: 429,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: "请求过于频繁，请 1 分钟后再试。" }),
    };
  }

  const { messages } = JSON.parse(event.body || "{}");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 秒超时

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `你是一位专为"OpenClaw Agent框架"课程服务的智能助手，课程由天津财经大学统计学院龚凤乾教授主讲。课程共8讲，涵盖从ChatGPT到Agent、Controller、Planner、Tool、Memory、语义空间、可观察认知系统和信息空间统一视角等核心内容。请用清晰、学术而友好的语气回答学生关于该课程的任何问题。`,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    clearTimeout(timeout);

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "抱歉，我暂时无法回答。";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("DeepSeek API error:", err.message);
    // 降级：保持 200，返回静态兜底回复
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: getFallbackReply(messages) }),
    };
  }
};

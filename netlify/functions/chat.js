exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { messages } = JSON.parse(event.body || "{}");

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
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

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "抱歉，我暂时无法回答。";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

import type { ChatMessage } from "./typegpt";

function geminiParts(messages: ChatMessage[]) {
  return messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }]
    }));
}

export async function callGeminiText(input: {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  timeoutMs?: number;
}) {
  const systemInstruction = input.messages.find((message) => message.role === "system")?.content;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs ?? 30000);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:generateContent?key=${encodeURIComponent(input.apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
          contents: geminiParts(input.messages),
          generationConfig: {
            temperature: input.temperature ?? 0.3
          }
        }),
        signal: controller.signal
      }
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Gemini request failed with ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
    if (!text) throw new Error("Gemini response did not include text");
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function validateGeminiKey(apiKey: string) {
  await callGeminiText({
    apiKey,
    model: process.env.PLATFORM_GEMINI_BRAIN_MODEL ?? "gemini-2.5-flash",
    messages: [{ role: "user", content: "Reply with ok." }],
    temperature: 0,
    timeoutMs: 12000
  });
}

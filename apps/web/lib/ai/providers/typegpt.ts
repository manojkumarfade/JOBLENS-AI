import { TYPEGPT_BASE_URL } from "@joblens/shared";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function callTypeGpt(input: {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  timeoutMs?: number;
}) {
  const baseUrl = (process.env.PLATFORM_TYPEGPT_BASE_URL ?? TYPEGPT_BASE_URL).replace(/\/$/, "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs ?? 30000);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.apiKey}`
      },
      body: JSON.stringify({
        model: input.model,
        messages: input.messages,
        temperature: input.temperature ?? 0.3
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`TypeGPT request failed with ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("TypeGPT response did not include content");
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

export async function validateTypeGptKey(apiKey: string) {
  await callTypeGpt({
    apiKey,
    model: process.env.PLATFORM_TYPEGPT_DEFAULT_MODEL ?? "openai/gpt-oss-20b",
    messages: [{ role: "user", content: "Reply with ok." }],
    temperature: 0,
    timeoutMs: 12000
  });
}

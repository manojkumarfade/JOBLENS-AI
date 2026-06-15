import { z } from "zod";

export function extractJson(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model output did not contain a JSON object");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as unknown;
}

export async function parseModelJson<T>(
  text: string,
  schema: z.ZodType<T>,
  retry?: () => Promise<string>
) {
  try {
    return schema.parse(extractJson(text));
  } catch (firstError) {
    if (!retry) throw firstError;
    const retried = await retry();
    return schema.parse(extractJson(retried));
  }
}

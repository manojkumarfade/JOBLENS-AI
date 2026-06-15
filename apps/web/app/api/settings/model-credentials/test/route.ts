import { z } from "zod";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { validateGeminiKey } from "@/lib/ai/providers/gemini";
import { validateTypeGptKey } from "@/lib/ai/providers/typegpt";

const schema = z.object({
  provider: z.enum(["typegpt", "gemini"]),
  apiKey: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to test API keys.", 401);
    const body = schema.parse(await readJson(request));
    if (body.provider === "typegpt") await validateTypeGptKey(body.apiKey);
    else await validateGeminiKey(body.apiKey);
    return json({ ok: true });
  } catch (error) {
    if (error instanceof Error && /request failed|response did not|abort|API key/i.test(error.message)) {
      return errorResponse("INVALID_API_KEY", "The API key could not be validated.", 400);
    }
    return handleRouteError(error);
  }
}

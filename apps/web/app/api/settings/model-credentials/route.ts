import { modelCredentialsPatchSchema } from "@joblens/shared";
import { errorResponse, handleRouteError, json, readJson } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";
import {
  credentialStatus,
  ensureCredentialRow,
  ModelCredentialsError,
  updateCredentialRow
} from "@/lib/ai/modelRouter";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to manage model credentials.", 401);
    const row = await ensureCredentialRow(user.id);
    return json(credentialStatus(row));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return errorResponse("AUTH_REQUIRED", "Sign in to manage model credentials.", 401);
    const body = modelCredentialsPatchSchema.parse(await readJson(request));
    const row = await updateCredentialRow(user.id, body);
    return json({ ok: true, credentials: credentialStatus(row) });
  } catch (error) {
    if (error instanceof ModelCredentialsError) {
      return errorResponse("MODEL_CREDENTIALS_MISSING", error.message, 400);
    }
    if (error instanceof Error && /request failed|response did not|abort|API key/i.test(error.message)) {
      return errorResponse("INVALID_API_KEY", "The API key could not be validated.", 400);
    }
    return handleRouteError(error);
  }
}

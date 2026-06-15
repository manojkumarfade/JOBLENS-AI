import { NextResponse } from "next/server";
import { isMissingSupabaseSchemaError, supabaseSetupMessage } from "./supabase/schema";

export type ApiErrorCode =
  | "AUTH_REQUIRED"
  | "BAD_REQUEST"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "MODEL_CREDENTIALS_MISSING"
  | "INVALID_API_KEY"
  | "QUOTA_EXCEEDED"
  | "VOICE_MODE_UNAVAILABLE"
  | "UPSTREAM_ERROR"
  | "SETUP_REQUIRED"
  | "INTERNAL_ERROR";

export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function errorResponse(
  code: ApiErrorCode,
  message: string,
  status = 400,
  fallbackMode?: "web_speech" | "text_only"
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(fallbackMode ? { fallbackMode } : {})
      }
    },
    { status }
  );
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("Invalid JSON body");
  }
}

export function handleRouteError(error: unknown) {
  if (error instanceof Error && error.message === "Invalid JSON body") {
    return errorResponse("BAD_REQUEST", "Request body must be valid JSON.", 400);
  }

  if (isMissingSupabaseSchemaError(error)) {
    return errorResponse("SETUP_REQUIRED", supabaseSetupMessage(), 503);
  }

  console.error(error instanceof Error ? error.message : error);
  return errorResponse("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
}

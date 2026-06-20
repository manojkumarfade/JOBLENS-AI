import type { ExtractedPageContext } from "@joblens/shared";

export type ExtensionMessage =
  | { type: "GET_AUTH_STATE" }
  | { type: "AUTH_STATE_CHANGED"; payload: { signedIn: boolean } }
  | { type: "PAGE_CONTEXT_READY"; payload: ExtractedPageContext }
  | { type: "START_WEB_SPEECH"; payload: { page: ExtractedPageContext; voiceSessionId?: string } }
  | { type: "STORE_EXTENSION_TOKEN"; payload: { token: string; expiresAt?: string; userEmail?: string | null } }
  | { type: "CLEAR_EXTENSION_TOKEN" }
  | { type: "RESET_EXTENSION_ACCOUNT" }
  | { type: "SYNC_STARTUP_STATE" }
  | { type: "ERROR"; payload: { code: string; message: string; fallbackMode?: string } };

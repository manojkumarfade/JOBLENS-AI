const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const SCRIPT_STYLE = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi;
const TAGS = /<[^>]+>/g;
const INJECTION_PHRASES =
  /(ignore all previous instructions|developer mode|reveal.*api key|reveal.*resume|system:|assistant:)/gi;

export function sanitizeJobText(text: string, maxLength = 12000) {
  return text
    .replace(SCRIPT_STYLE, " ")
    .replace(TAGS, " ")
    .replace(CONTROL_CHARS, " ")
    .replace(INJECTION_PHRASES, "[untrusted page instruction removed]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeHeadings(headings: unknown) {
  if (!Array.isArray(headings)) return [];
  return headings
    .map((heading) => String(heading).replace(CONTROL_CHARS, " ").trim())
    .filter(Boolean)
    .slice(0, 40);
}

export function safeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

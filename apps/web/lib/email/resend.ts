import { env } from "../env";

export async function sendEmail(input: {
  to: string;
  template: "welcome" | "resume_parsed" | "subscription_activated" | "subscription_cancelled" | "byok_key_invalid";
  data?: Record<string, unknown>;
}) {
  const apiKey = env("RESEND_API_KEY");
  if (!apiKey) return { skipped: true };

  const subjectByTemplate: Record<typeof input.template, string> = {
    welcome: "Welcome to JobLens Recruiter AI",
    resume_parsed: "Your candidate resume is ready in JobLens Recruiter AI",
    subscription_activated: "Your JobLens Recruiter AI subscription is active",
    subscription_cancelled: "Your JobLens Recruiter AI subscription was cancelled",
    byok_key_invalid: "JobLens Recruiter AI could not use one of your API keys"
  };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "JobLens Recruiter AI <notifications@joblens.ai>",
      to: input.to,
      subject: subjectByTemplate[input.template],
      text: `${subjectByTemplate[input.template]}\n\n${JSON.stringify(input.data ?? {}, null, 2)}`
    })
  });

  if (!res.ok) {
    throw new Error(`Resend failed with ${res.status}`);
  }

  return { ok: true };
}

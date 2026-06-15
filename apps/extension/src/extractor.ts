import type { ExtractedPageContext } from "@joblens/shared";

const noisySelectors = [
  "nav",
  "footer",
  "aside",
  "[role='navigation']",
  "[aria-label*='cookie' i]",
  "[class*='cookie' i]",
  "[class*='banner' i]",
  "[class*='advert' i]",
  "script",
  "style"
];

export function extractPageContext(): ExtractedPageContext {
  const clone = document.body.cloneNode(true) as HTMLElement;
  for (const selector of noisySelectors) {
    clone.querySelectorAll(selector).forEach((node) => node.remove());
  }

  const text = (clone.innerText || "")
    .replace(/\s+/g, " ")
    .replace(/(Apply now\s*){2,}/gi, "Apply now ")
    .trim()
    .slice(0, 12000);

  const headings = Array.from(document.querySelectorAll("h1,h2,h3"))
    .map((heading) => heading.textContent?.replace(/\s+/g, " ").trim() ?? "")
    .filter(Boolean)
    .slice(0, 30);

  const confidence = computeConfidence(text, headings);

  return {
    url: window.location.href,
    title: document.title,
    sourceType: confidence > 0.35 ? "job_page" : "unknown",
    extractedAt: new Date().toISOString(),
    text,
    headings,
    confidence
  };
}

function computeConfidence(text: string, headings: string[]) {
  const haystack = `${headings.join(" ")} ${text}`.toLowerCase();
  const keywords = ["responsibilities", "requirements", "qualifications", "experience", "salary", "benefits", "skills", "job"];
  const score = keywords.reduce((total, keyword) => total + (haystack.includes(keyword) ? 0.12 : 0), 0);
  return Math.max(0.1, Math.min(0.95, score + Math.min(text.length / 12000, 1) * 0.25));
}

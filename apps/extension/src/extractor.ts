import type { ExtractedPageContext } from "@joblens/shared";

const JD_SELECTORS = [
  "[class*='job-desc']",
  "#job_description",
  "[class*='jd-description']",
  "[class*='description__text']",
  ".jobs-description-content__text",
  "#jobDescriptionText",
  "[class*='jobsearch-jobDescriptionText']",
  "[class*='jobDescriptionContent']",
  "[data-test='description']",
  "[role='main'] article",
  "main article",
  "section[aria-label*='job' i]",
  "[id*='job' i][class*='desc' i]"
];

const NOISE_SELECTORS = [
  "nav",
  "footer",
  "aside",
  "header",
  "[role='navigation']",
  "[role='banner']",
  "[role='complementary']",
  "[aria-label*='cookie' i]",
  "[class*='cookie' i]",
  "[class*='banner' i]",
  "[class*='advert' i]",
  "script",
  "style",
  "noscript"
];

function stripNoise(root: HTMLElement): HTMLElement {
  const clone = root.cloneNode(true) as HTMLElement;
  for (const selector of NOISE_SELECTORS) {
    clone.querySelectorAll(selector).forEach((node) => node.remove());
  }
  return clone;
}

function getText(element: Element | null): string {
  if (!element) return "";
  return (element as HTMLElement).innerText
    .replace(/\s+/g, " ")
    .replace(/(Apply now\s*){2,}/gi, "Apply now ")
    .trim()
    .slice(0, 12000);
}

function findJobDescriptionEl(): { element: Element | null; isTargeted: boolean } {
  for (const selector of JD_SELECTORS) {
    const element = document.querySelector(selector);
    if (element && (element as HTMLElement).innerText.trim().length > 100) {
      return { element, isTargeted: true };
    }
  }
  return { element: null, isTargeted: false };
}

function computeConfidence(text: string, headings: string[], isTargeted: boolean): number {
  const haystack = `${headings.join(" ")} ${text}`.toLowerCase();
  const keywords = ["responsibilities", "requirements", "qualifications", "experience", "salary", "benefits", "skills", "job"];
  const keywordScore = keywords.reduce((acc, keyword) => acc + (haystack.includes(keyword) ? 0.12 : 0), 0);
  const lengthScore = Math.min(text.length / 12000, 1) * 0.25;
  const targetBonus = isTargeted ? 0.25 : 0;
  return Math.max(0.1, Math.min(0.97, keywordScore + lengthScore + targetBonus));
}

function inferJobIdentity(headings: string[], text: string) {
  const likelyJobTitle = headings[0] || document.title.split("|")[0]?.split("-")[0]?.trim() || undefined;
  const companyPatterns = [
    /\b(?:at|company)\s+([A-Z][A-Za-z0-9&.,' -]{2,60})/,
    /\b([A-Z][A-Za-z0-9&.,' -]{2,60})\s+is hiring\b/
  ];
  const likelyCompany = companyPatterns
    .map((pattern) => text.match(pattern)?.[1]?.replace(/\s+/g, " ").trim())
    .find(Boolean);
  return { likelyJobTitle, likelyCompany };
}

export function extractPageContext(): ExtractedPageContext {
  const headings = Array.from(document.querySelectorAll("h1,h2,h3"))
    .map((heading) => heading.textContent?.replace(/\s+/g, " ").trim() ?? "")
    .filter(Boolean)
    .slice(0, 30);

  const { element, isTargeted } = findJobDescriptionEl();
  const text = isTargeted && element ? getText(element) : getText(stripNoise(document.body));
  const confidence = computeConfidence(text, headings, isTargeted);
  const { likelyJobTitle, likelyCompany } = inferJobIdentity(headings, text);

  return {
    url: window.location.href,
    title: document.title,
    sourceType: confidence > 0.35 ? "job_page" : "unknown",
    extractedAt: new Date().toISOString(),
    text,
    headings,
    likelyJobTitle,
    likelyCompany,
    confidence
  };
}

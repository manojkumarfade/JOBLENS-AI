export interface ExtractedPageContext {
  url: string;
  title: string;
  sourceType: "job_page" | "unknown";
  extractedAt?: string;
  text: string;
  headings: string[];
  likelyJobTitle?: string;
  likelyCompany?: string;
  confidence?: number;
}

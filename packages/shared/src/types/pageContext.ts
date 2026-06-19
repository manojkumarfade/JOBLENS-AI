export interface ExtractedPageContext {
  url: string;
  title: string;
  sourceType: "general_page" | "job_page" | "recruiter_page" | "unknown";
  extractedAt?: string;
  text: string;
  headings: string[];
  likelyJobTitle?: string;
  likelyCompany?: string;
  confidence?: number;
}

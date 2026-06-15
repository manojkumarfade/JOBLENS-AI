import mammoth from "mammoth";
import pdfParse from "pdf-parse";

const commonSkills = [
  "javascript",
  "typescript",
  "react",
  "next.js",
  "node.js",
  "python",
  "sql",
  "postgres",
  "supabase",
  "aws",
  "docker",
  "kubernetes",
  "graphql",
  "tailwind",
  "figma",
  "machine learning",
  "data analysis",
  "communication",
  "leadership"
];

export async function parseResumeFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const lower = file.name.toLowerCase();
  let parsedText = "";

  if (file.type === "application/pdf" || lower.endsWith(".pdf")) {
    const parsed = await pdfParse(buffer);
    parsedText = parsed.text;
  } else if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx")
  ) {
    const parsed = await mammoth.extractRawText({ buffer });
    parsedText = parsed.value;
  } else {
    parsedText = buffer.toString("utf8");
  }

  const normalized = parsedText.replace(/\s+/g, " ").trim();
  return {
    parsedText: normalized,
    skills: extractSkills(normalized),
    projects: extractProjects(normalized),
    experienceLevel: inferExperienceLevel(normalized)
  };
}

function extractSkills(text: string) {
  const lower = text.toLowerCase();
  return commonSkills.filter((skill) => lower.includes(skill)).slice(0, 30);
}

function extractProjects(text: string) {
  const projectSection = text.match(/projects?\s*[:\n-]\s*([\s\S]{0,800})/i)?.[1] ?? "";
  return projectSection
    .split(/[.;\n]/)
    .map((line) => line.trim())
    .filter((line) => line.length > 20)
    .slice(0, 8);
}

function inferExperienceLevel(text: string) {
  const yearMatches = text.match(/(\d+)\+?\s+years?/gi) ?? [];
  const years = yearMatches
    .map((match) => Number(match.match(/\d+/)?.[0] ?? 0))
    .sort((a, b) => b - a)[0];
  if (!years) return "entry";
  if (years >= 7) return "senior";
  if (years >= 3) return "mid";
  return "junior";
}

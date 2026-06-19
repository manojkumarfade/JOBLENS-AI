import type { CandidateProfile, RecruiterJobInput } from "./types";

export const demoJob: RecruiterJobInput = {
  title: "Senior Full Stack Developer / AI Product Engineer",
  company: "JobLens Recruiter AI",
  location: "Remote / Bengaluru",
  experienceMin: 5,
  experienceMax: 9,
  workMode: "hybrid",
  salaryRange: "Market aligned",
  mustHaveSkills: ["TypeScript", "React", "Next.js", "Node.js", "Postgres", "AI product development"],
  niceToHaveSkills: ["Supabase", "RAG", "Tailwind", "Vercel", "Recruiting domain"],
  description:
    "We are hiring a Senior Full Stack Developer / AI Product Engineer to build AI-powered recruiter workflows. The role owns Next.js and React interfaces, TypeScript backend APIs, Postgres/Supabase data models, and ranking features that combine semantic AI understanding with deterministic business signals. Must have production experience shipping full-stack web apps, strong Node.js API design, database modeling, and practical AI product judgment. Nice to have: RAG, LLM evaluation, recruiter-tech or ATS experience, Vercel, Tailwind, and analytics instrumentation. The engineer will collaborate with recruiters, design explainable ranking UX, build secure APIs, and maintain fairness guardrails for human-in-the-loop hiring decisions."
};

export const demoCandidates: CandidateProfile[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Aarav Menon",
    email: "aarav.menon@example.com",
    phone: "+91 98765 10001",
    currentRole: "Senior Full Stack AI Product Engineer",
    experienceYears: 7,
    location: "Bengaluru",
    education: "B.Tech Computer Science",
    skills: ["typescript", "react", "next.js", "node.js", "postgres", "supabase", "tailwind", "rag", "llm", "vercel"],
    projects: [
      "Built an AI recruiter ranking dashboard with explainable scorecards, Supabase RLS, and candidate evidence tracing.",
      "Shipped a Next.js analytics product used by hiring teams to compare funnel quality and recruiter response time."
    ],
    careerMetadata: {
      source: "demo",
      domains: ["recruiting", "saas", "analytics"],
      companies: ["TalentGrid", "SaaSFlow"],
      certifications: ["AWS Certified Developer"],
      noticePeriod: "30 days",
      salaryExpectation: "Open"
    },
    activitySignals: {
      profileCompleteness: 96,
      recentActivityScore: 92,
      assessmentScore: 94,
      responseSpeedScore: 90,
      portfolioAvailable: true,
      githubAvailable: true,
      applicationFreshness: 98,
      communicationScore: 92
    },
    resumeText:
      "Senior Full Stack AI Product Engineer with 7 years of experience in TypeScript, React, Next.js, Node.js, Postgres, Supabase, Tailwind, RAG and LLM workflows. Built recruiter ranking dashboards, explainable scorecards, secure APIs, Supabase RLS, and human review workflows for HR teams.",
    isDemo: true
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Meera Shah",
    email: "meera.shah@example.com",
    currentRole: "Senior Backend Engineer",
    experienceYears: 8,
    location: "Pune",
    education: "M.Tech Software Systems",
    skills: ["node.js", "typescript", "postgres", "redis", "docker", "kubernetes", "aws", "rest api"],
    projects: [
      "Designed high-throughput Node.js APIs and Postgres schemas for a workflow automation platform.",
      "Led migration from monolith services to containerized deployment with observability and CI/CD."
    ],
    careerMetadata: {
      source: "demo",
      domains: ["enterprise", "automation"],
      companies: ["CloudDesk", "InfraWare"],
      noticePeriod: "45 days"
    },
    activitySignals: {
      profileCompleteness: 88,
      recentActivityScore: 82,
      assessmentScore: 86,
      responseSpeedScore: 76,
      portfolioAvailable: false,
      githubAvailable: true,
      applicationFreshness: 90,
      communicationScore: 78
    },
    resumeText:
      "Senior Backend Engineer with 8 years in Node.js, TypeScript, Postgres, Redis, AWS, Docker and Kubernetes. Strong API design and database modeling. Limited frontend React exposure and no direct AI product ownership.",
    isDemo: true
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Riya Kapoor",
    email: "riya.kapoor@example.com",
    currentRole: "Frontend Lead",
    experienceYears: 6,
    location: "Remote",
    education: "B.E. Information Technology",
    skills: ["react", "next.js", "typescript", "tailwind", "figma", "redux", "css", "html"],
    projects: [
      "Owned a complex Next.js dashboard with filters, tables, detail panels, and accessible UI components.",
      "Built design system foundations and performance improvements for a SaaS analytics app."
    ],
    careerMetadata: {
      source: "demo",
      domains: ["saas", "analytics"],
      companies: ["PixelOps"],
      portfolioUrl: "https://example.com/riya"
    },
    activitySignals: {
      profileCompleteness: 93,
      recentActivityScore: 88,
      assessmentScore: 82,
      responseSpeedScore: 84,
      portfolioAvailable: true,
      githubAvailable: true,
      applicationFreshness: 91,
      communicationScore: 89
    },
    resumeText:
      "Frontend Lead with 6 years building React, Next.js, TypeScript and Tailwind dashboards. Strong UX and product collaboration. Some API integration experience, but limited Node.js backend ownership and no AI ranking experience.",
    isDemo: true
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Kabir Rao",
    email: "kabir.rao@example.com",
    currentRole: "AI Application Engineer",
    experienceYears: 3,
    location: "Hyderabad",
    education: "B.Tech Artificial Intelligence",
    skills: ["python", "llm", "rag", "machine learning", "fastapi", "react", "postgres", "typescript"],
    projects: [
      "Built a resume search prototype using embeddings, RAG, FastAPI, and a React review interface.",
      "Created model evaluation notebooks and prompt regression checks for a support automation product."
    ],
    careerMetadata: {
      source: "demo",
      domains: ["automation", "analytics"],
      companies: ["ModelWorks"],
      certifications: ["DeepLearning.AI short courses"]
    },
    activitySignals: {
      profileCompleteness: 84,
      recentActivityScore: 91,
      assessmentScore: 89,
      responseSpeedScore: 86,
      portfolioAvailable: true,
      githubAvailable: true,
      applicationFreshness: 93,
      communicationScore: 82
    },
    resumeText:
      "AI Application Engineer with 3 years of experience in RAG, LLMs, Python, FastAPI, React, TypeScript and Postgres. Strong AI prototypes and evaluation work, less senior full-stack production ownership.",
    isDemo: true
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    name: "Nisha Iyer",
    email: "nisha.iyer@example.com",
    currentRole: "Full Stack Developer",
    experienceYears: 5,
    location: "Chennai",
    education: "B.Tech Computer Science",
    skills: ["javascript", "typescript", "react", "node.js", "mongodb", "express", "docker"],
    projects: [
      "Built customer portals with React, Express, MongoDB and Docker.",
      "Maintained REST APIs and integrated third-party payment and messaging services."
    ],
    careerMetadata: {
      source: "demo",
      domains: ["ecommerce", "saas"],
      companies: ["ShopStack"],
      noticePeriod: "Immediate"
    },
    activitySignals: {
      profileCompleteness: 76,
      recentActivityScore: 64,
      assessmentScore: 72,
      responseSpeedScore: 68,
      portfolioAvailable: false,
      githubAvailable: false,
      applicationFreshness: 75,
      communicationScore: 74
    },
    resumeText:
      "Full Stack Developer with 5 years in React, TypeScript, Node.js, Express, MongoDB and Docker. Production web app experience, but limited Postgres, Supabase, Next.js and AI product evidence.",
    isDemo: true
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    name: "Dev Malhotra",
    email: "dev.malhotra@example.com",
    currentRole: "Graduate Developer",
    experienceYears: 1,
    location: "Delhi",
    education: "B.Tech Computer Science",
    skills: ["react", "next.js", "typescript", "tailwind", "supabase", "postgres"],
    projects: [
      "Created a campus hiring portal with Next.js, Supabase auth, Postgres tables and Tailwind UI.",
      "Built a small LLM-powered resume analyzer as a final-year project."
    ],
    careerMetadata: {
      source: "demo",
      domains: ["recruiting"],
      portfolioUrl: "https://example.com/dev"
    },
    activitySignals: {
      profileCompleteness: 86,
      recentActivityScore: 95,
      assessmentScore: 78,
      responseSpeedScore: 92,
      portfolioAvailable: true,
      githubAvailable: true,
      applicationFreshness: 97,
      communicationScore: 80
    },
    resumeText:
      "Graduate Developer with 1 year internship experience. Projects include a Next.js and Supabase campus hiring portal and an LLM resume analyzer. Strong project activity but below required senior experience.",
    isDemo: true
  },
  {
    id: "77777777-7777-4777-8777-777777777777",
    name: "Omar Siddiqui",
    email: "omar.siddiqui@example.com",
    currentRole: "Machine Learning Engineer",
    experienceYears: 6,
    location: "Mumbai",
    education: "M.S. Data Science",
    skills: ["python", "machine learning", "llm", "rag", "aws", "sql", "docker"],
    projects: [
      "Built RAG pipelines for support search with vector retrieval and quality evaluation.",
      "Owned model monitoring workflows and prompt quality dashboards."
    ],
    careerMetadata: {
      source: "demo",
      domains: ["analytics", "automation"],
      companies: ["AIWorks"],
      certifications: ["AWS Machine Learning Specialty"]
    },
    activitySignals: {
      profileCompleteness: 81,
      recentActivityScore: 72,
      assessmentScore: 91,
      responseSpeedScore: 70,
      portfolioAvailable: true,
      githubAvailable: true,
      applicationFreshness: 84,
      communicationScore: 76
    },
    resumeText:
      "Machine Learning Engineer with 6 years in Python, RAG, LLM evaluation, AWS, Docker and SQL. Strong AI depth but limited React, Next.js and product UI ownership.",
    isDemo: true
  },
  {
    id: "88888888-8888-4888-8888-888888888888",
    name: "Priya Nair",
    email: "priya.nair@example.com",
    currentRole: "Recruiter Operations Analyst",
    experienceYears: 7,
    location: "Bengaluru",
    education: "MBA HR",
    skills: ["analytics", "sql", "communication", "stakeholder", "ats"],
    projects: [
      "Improved recruiter funnel reporting and created dashboards for candidate response time.",
      "Partnered with engineering teams to define ATS workflow requirements."
    ],
    careerMetadata: {
      source: "demo",
      domains: ["recruiting", "hr", "ats"],
      companies: ["HireOps"],
      noticePeriod: "30 days"
    },
    activitySignals: {
      profileCompleteness: 90,
      recentActivityScore: 89,
      assessmentScore: 77,
      responseSpeedScore: 96,
      portfolioAvailable: false,
      githubAvailable: false,
      applicationFreshness: 95,
      communicationScore: 95
    },
    resumeText:
      "Recruiter Operations Analyst with HR domain knowledge, ATS workflows, SQL dashboards and excellent communication. Not a full-stack engineer; no React, Next.js, Node.js or AI engineering implementation evidence.",
    isDemo: true
  },
  {
    id: "99999999-9999-4999-8999-999999999999",
    name: "Sameer Kulkarni",
    email: "sameer.kulkarni@example.com",
    currentRole: "Senior Full Stack Developer",
    experienceYears: 9,
    location: "Remote",
    education: "B.E. Computer Engineering",
    skills: ["typescript", "react", "next.js", "node.js", "postgres", "graphql", "aws", "docker"],
    projects: [
      "Led a Next.js B2B workflow product with Postgres, GraphQL, access controls and analytics.",
      "Built internal matching logic for sales lead prioritization using deterministic scores."
    ],
    careerMetadata: {
      source: "demo",
      domains: ["saas", "enterprise"],
      companies: ["WorkflowPro", "CloudMint"],
      salaryExpectation: "High"
    },
    activitySignals: {
      profileCompleteness: 72,
      recentActivityScore: 44,
      assessmentScore: 84,
      responseSpeedScore: 42,
      portfolioAvailable: false,
      githubAvailable: false,
      applicationFreshness: 50,
      communicationScore: 62
    },
    resumeText:
      "Senior Full Stack Developer with 9 years in TypeScript, React, Next.js, Node.js, Postgres, GraphQL, AWS and Docker. Strong production ownership and scoring systems. Limited direct LLM work and weak recent activity signals.",
    isDemo: true
  },
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    name: "Ananya Ghosh",
    email: "ananya.ghosh@example.com",
    currentRole: "Data Analyst",
    experienceYears: 4,
    location: "Kolkata",
    education: "B.Sc Statistics",
    skills: ["sql", "python", "data analysis", "tableau", "communication"],
    projects: [
      "Created weekly business intelligence dashboards and cohort analyses for operations teams.",
      "Automated spreadsheet reporting with Python scripts."
    ],
    careerMetadata: {
      source: "demo",
      domains: ["analytics"],
      companies: ["InsightWorks"]
    },
    activitySignals: {
      profileCompleteness: 66,
      recentActivityScore: 58,
      assessmentScore: 64,
      responseSpeedScore: 60,
      portfolioAvailable: false,
      githubAvailable: false,
      applicationFreshness: 62,
      communicationScore: 72
    },
    resumeText:
      "Data Analyst with 4 years in SQL, Python, Tableau and reporting automation. No clear evidence for full-stack product engineering, React, Next.js, Node.js, Supabase or AI product implementation.",
    isDemo: true
  }
];

/**
 * Site content lives here rather than in JSX so the copy can be edited without
 * touching layout. Everything on the homepage is rendered from these exports.
 */

export const profile = {
  name: "Spencer Will",
  role: "Full-Stack Software Engineer",
  employer: "Seven Hills Technology",
  location: "Cincinnati, OH",
  email: "spencer.a.will@gmail.com",
  pitch:
    "I build and own production systems end to end — C#/.NET and TypeScript on Azure.",
  pitchEmphasis: "sole architect and developer",
  pitchTail:
    "of a multi-tenant payroll integration platform, live for a national HR/payroll provider in about three months.",
  url: "https://spencerwill.com",
  employerUrl: "https://sevenhillstechnology.com",
  university: "University of Cincinnati",
  avatar: "/avatar-160.webp",
  avatarAlt: "Spencer Will, standing above a snow-covered Bryce Canyon",
  links: {
    github: "https://github.com/SpencerAWill",
    linkedin: "https://www.linkedin.com/in/spencer-a-will",
    resume: "/resume.pdf",
  },
} as const;

export type Metric = {
  value: string;
  label: string;
};

export type Project = {
  title: string;
  meta: string;
  metrics?: Metric[];
  body: string;
  tags: string[];
  href?: string;
};

export const projects: Project[] = [
  {
    title: "Multi-Tenant Payroll Integration Platform",
    meta: "National HR/payroll SaaS provider · 2026 – present",
    metrics: [
      { value: "186,000+", label: "records / month" },
      { value: "~3 mo", label: "concept to production" },
      { value: "1", label: "engineer — me" },
    ],
    body: "A configurable ETL job runner, plus a React admin dashboard giving live health monitoring of every tenant, integration, and job run. Hardened with retries, idempotency, Slack alerting, and CI merge gates. I was the sole technical contact across four parties: our team, the client, external vendors, and the payroll provider.",
    tags: [
      "ASP.NET Core",
      "Azure Functions",
      "React",
      "Entra ID / OIDC",
      "Static Web Apps",
    ],
  },
  {
    title: "E-Commerce Ordering Platform",
    meta: "Regional restaurant group, 33 locations · 2024 – 2026",
    metrics: [
      { value: "$1.5M+", label: "monthly gross sales" },
      { value: "30,000+", label: "orders / month" },
      { value: "33", label: "locations" },
    ],
    body: "Replaced a rigid templated ordering system with a fully custom frontend, backend, data warehouse, and admin platform on Azure. I wrote the majority of the ASP.NET Core backend and React frontends as one of three engineers over ~14 months, then supported it in production for five more.",
    tags: ["ASP.NET Core", "React", "Azure", "Data warehouse"],
  },
  {
    title: "reMind — AI Voice Assistant for Memory Care",
    meta: "Senior capstone · 2025 – 2026",
    body: "A realtime voice-to-voice agent running on Apple Watch for memory-care patients, with a caregiver interface. Local tool calling, live fall and distress detection with alerting, a semantic conversational memory store with summarization, and vector search over pgvector. I authored a custom Swift WebSocket library to stream audio to Azure AI Foundry's realtime model.",
    tags: ["Swift", "WebSockets", "pgvector", "Azure AI Foundry"],
  },
  {
    title: "UC Mountaineering Club Gear Platform",
    meta: "ucmc.spencerwill.com · 2026 – present",
    metrics: [
      { value: "~1,900", label: "pieces of gear" },
      { value: "100", label: "club members" },
    ],
    body: "Replacing an Excel sheet with barcode checkout and return, passkey (WebAuthn) authentication, and role-based access control. Sole owner of architecture, deployment, and DNS — same stack this site runs on.",
    tags: ["TanStack Start", "Cloudflare Workers", "WebAuthn", "D1"],
    href: "https://ucmc.spencerwill.com",
  },
];

export type Category = "school" | "work" | "client" | "project" | "climb";

export const categories: { id: Category; label: string }[] = [
  { id: "school", label: "School" },
  { id: "work", label: "Employment" },
  { id: "client", label: "Client work" },
  { id: "project", label: "My projects" },
  { id: "climb", label: "Climbing club" },
];

export type YearItem = {
  category: Category;
  title: string;
  note?: string;
};

export type Year = {
  year: string;
  current?: boolean;
  items: YearItem[];
};

/**
 * Ordered newest first. Items within a year follow the `categories` order above
 * so scanning down the column compares like against like.
 */
export const years: Year[] = [
  {
    year: "2026",
    current: true,
    items: [
      {
        category: "school",
        title: "Graduated — BS Computer Science, Math minor",
        note: "Summa Cum Laude, 3.99 · 3× Mantei/Mae",
      },
      {
        category: "work",
        title: "Seven Hills Technology",
        note: "— Software Developer, full-time from June",
      },
      {
        category: "client",
        title: "Payroll integration platform",
        note: "national HR/payroll provider · from June",
      },
      {
        category: "client",
        title: "Mobile & web platform support",
        note: "horse racing media · May – June",
      },
      { category: "project", title: "UCMC gear platform", note: "from May" },
    ],
  },
  {
    year: "2025",
    items: [
      { category: "school", title: "University of Cincinnati" },
      { category: "work", title: "Seven Hills Technology", note: "— co-op" },
      {
        category: "client",
        title: "E-commerce ordering platform",
        note: "regional restaurant group, 33 locations",
      },
      {
        category: "project",
        title: "reMind — AI voice assistant",
        note: "senior capstone · from August",
      },
      {
        category: "climb",
        title: "UC Competitive Climbing Club",
        note: "— President · fall 2024 through summer 2025",
      },
    ],
  },
  {
    year: "2024",
    items: [
      { category: "school", title: "University of Cincinnati" },
      {
        category: "work",
        title: "Seven Hills Technology",
        note: "— co-op, from May",
      },
      {
        category: "client",
        title: "E-commerce ordering platform",
        note: "from June",
      },
      {
        category: "climb",
        title: "UC Competitive Climbing Club",
        note: "— Team Captain · fall 2023 through summer 2024",
      },
    ],
  },
  {
    year: "2023",
    items: [
      { category: "school", title: "University of Cincinnati" },
      {
        category: "work",
        title: "London Computer Systems",
        note: "— Software Developer, co-op · spring and fall",
      },
    ],
  },
  {
    year: "2022",
    items: [
      { category: "school", title: "University of Cincinnati" },
      {
        category: "work",
        title: "Hyland Software",
        note: "— R&D Intern, summer",
      },
    ],
  },
  {
    year: "2021",
    items: [
      {
        category: "school",
        title: "University of Cincinnati",
        note: "enrolled August",
      },
      {
        category: "work",
        title: "Hyland Software",
        note: "— R&D Intern, summer",
      },
    ],
  },
  {
    year: "2020",
    items: [
      {
        category: "work",
        title: "Hyland Software",
        note: "— R&D Intern, summer",
      },
    ],
  },
];

export type SkillSegment = {
  text: string;
  strong?: boolean;
};

export type SkillRow = {
  label: string;
  segments: SkillSegment[];
};

export const skills: SkillRow[] = [
  {
    label: "backend",
    segments: [
      { text: "C#", strong: true },
      {
        text: "ASP.NET Core, .NET 8/9/10, EF Core, Azure Functions & Durable Functions, Service Bus, REST, OAuth 2.0 / OIDC",
      },
    ],
  },
  {
    label: "frontend",
    segments: [
      { text: "TypeScript", strong: true },
      { text: "React, TanStack (Query, Router, Start), Vite" },
    ],
  },
  {
    label: "cloud",
    segments: [
      { text: "Azure", strong: true },
      {
        text: "Functions, SQL, Entra ID, Key Vault, App Service, Static Web Apps, Container Apps",
      },
      { text: "Cloudflare", strong: true },
      { text: "Workers, D1, R2 · AWS, Firebase" },
    ],
  },
  {
    label: "practice",
    segments: [
      {
        text: "Multi-tenant architecture, ETL pipelines, RBAC, distributed systems, Terraform, Docker, GitHub Actions, unit / integration / E2E testing",
      },
    ],
  },
  {
    label: "also",
    segments: [{ text: "SQL, Python, Swift, C++, Rust (learning)" }],
  },
];

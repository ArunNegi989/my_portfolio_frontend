import type { Skill, SkillCategory, SkillCategoryKey } from "@/types/content";

// Skills as listed on the resume. No proficiency ratings are shown on purpose.
export const skillCategories: SkillCategory[] = [
  {
    key: "frontend",
    title: "Frontend",
    description: "Responsive, accessible, SEO-friendly interfaces built with modern React tooling.",
  },
  {
    key: "backend",
    title: "Backend",
    description: "REST APIs, authentication and server logic on Node.js.",
  },
  {
    key: "databases",
    title: "Databases",
    description: "Document and relational data modelling for production apps.",
  },
  {
    key: "cms",
    title: "CMS & Platforms",
    description: "Content-managed websites, e-commerce and enterprise portals.",
  },
  {
    key: "tools",
    title: "Tools",
    description: "Version control, editing and design hand-off.",
  },
];

const byCategory: Record<SkillCategoryKey, string[]> = {
  frontend: [
    "Next.js",
    "React.js",
    "TypeScript",
    "JavaScript",
    "HTML5",
    "CSS3",
    "CSS Modules",
    "Tailwind CSS",
    "SASS",
    "Bootstrap",
  ],
  backend: ["Node.js", "Express.js", "REST APIs", "JWT Authentication"],
  databases: ["MongoDB", "MySQL", "SQL"],
  cms: [
    "WordPress",
    "Elementor",
    "WooCommerce",
    "ACF",
    "Yoast SEO",
    "Rank Math",
    "WP Rocket",
    "WPForms",
    "Liferay 7.4 DXP",
  ],
  tools: ["Git", "GitHub", "VS Code", "Figma"],
};

const toId = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const skills: Skill[] = (Object.keys(byCategory) as SkillCategoryKey[]).flatMap((category) =>
  byCategory[category].map((name, index) => ({ id: `${category}-${toId(name)}`, name, category, order: index + 1 })),
);

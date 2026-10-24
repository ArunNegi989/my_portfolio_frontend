// Shared content types. Every public page and admin screen reads these shapes,
// so a future backend only needs to return the same structures.

export type PublishStatus = "published" | "draft";

export interface ImageAsset {
  src: string;
  alt: string;
  /** Credit line for stock / representative imagery. */
  credit?: string;
}

export interface Stat {
  id: string;
  value: number;
  suffix: string;
  label: string;
}

export interface Profile {
  name: string;
  shortName: string;
  role: string;
  headline: string;
  intro: string;
  summary: string;
  aboutParagraphs: string[];
  focusAreas: string[];
  email: string;
  /** Display format, e.g. "+91 84768 98395". The tel: link is derived from it. */
  phone: string;
  location: string;
  availability: string;
  availableForWork: boolean;
  resumePath: string;
  stats: Stat[];
  portraitImage: ImageAsset;
  aboutImage: ImageAsset;
}

export interface NavItem {
  label: string;
  href: string;
}

export type HomeSectionKey =
  | "about"
  | "projects"
  | "skills"
  | "experience"
  | "services"
  | "blog"
  | "contact";

export interface HomeSection {
  key: HomeSectionKey;
  label: string;
  visible: boolean;
  eyebrow: string;
  title: string;
}

export interface HomeContent {
  heroName: string;
  /** Cyan label above the name. */
  heroRole: string;
  /** The hero headline cycles through these roles. */
  heroRoles: string[];
  /** Seconds each role stays on screen. */
  heroRoleInterval: number;
  heroSupportingText: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  techLabels: string[];
  featuredProjectSlugs: string[];
  sections: HomeSection[];
  contactHeadline: string;
  contactText: string;
}

export interface ProjectProcessStep {
  title: string;
  description: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  /** Company or engagement the project was delivered under. */
  context: string;
  experienceId?: string;
  period?: string;
  summary: string;
  overview: string;
  problem: string;
  goals: string[];
  solution: string;
  features: string[];
  technologies: string[];
  process: ProjectProcessStep[];
  /** Only resume-verified outcomes belong here. */
  results: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  status: PublishStatus;
  order: number;
  cover: ImageAsset;
  gallery: ImageAsset[];
  /** True when the images are representative stock imagery, not project screenshots. */
  representativeImagery: boolean;
  /** True when the case study still needs project-specific detail from Arun. */
  detailsPending: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  cover: ImageAsset;
  /** Article body in a small Markdown subset (see lib/markdown). */
  content: string;
  author: string;
  publishedAt: string;
  status: PublishStatus;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  summary: string;
  responsibilities: string[];
  relatedProjectSlugs: string[];
  technologies: string[];
  order: number;
}

export type SkillCategoryKey = "frontend" | "backend" | "databases" | "cms" | "tools";

export interface SkillCategory {
  key: SkillCategoryKey;
  title: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategoryKey;
  order: number;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  deliverables: string[];
  technologies: string[];
  image: ImageAsset;
  visible: boolean;
  order: number;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  /** Demo entries are never rendered on the public site. */
  isDemo: boolean;
  visible: boolean;
}

export type SocialPlatform = "github" | "linkedin" | "email" | "whatsapp" | "website" | "other";

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
  visible: boolean;
}

export interface PageSeo {
  id: string;
  path: string;
  label: string;
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
}

export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  tagline: string;
  defaultOgImage: string;
  introEnabled: boolean;
  introAudioEnabled: boolean;
  smoothScroll: boolean;
  whatsappNumber: string;
  footerNote: string;
  footerHeadline: string;
  footerInvitation: string;
  footerCtaLabel: string;
  /** Compact list of roles / technologies shown in the footer. */
  footerHighlights: string[];
  /** Decorative imagery for inner pages that have no content item of their own. */
  pageImages: Record<"skillsHero" | "educationSide" | "projectsHero" | "blogHero", ImageAsset>;
}

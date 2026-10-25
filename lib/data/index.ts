// Data access layer. Pages call these functions instead of importing /data directly.
//
// Content comes from my-portfolio-backend. Every read is cached ("use cache") and tagged per
// dataset; the backend calls app/api/revalidate after each admin change so the next visit shows it.
// The static modules in /data are the fallback: they are used when no API is configured and when
// the API can't be reached, so the public site keeps rendering instead of returning errors.

import { cacheLife, cacheTag } from "next/cache";
import { posts as staticPosts } from "@/data/blog";
import { certifications as staticCertifications, education as staticEducation } from "@/data/education";
import { experience as staticExperience } from "@/data/experience";
import { home as staticHome } from "@/data/home";
import { profile as staticProfile } from "@/data/profile";
import { projects as staticProjects } from "@/data/projects";
import { pageSeo as staticPageSeo } from "@/data/seo";
import { services as staticServices } from "@/data/services";
import { navigation, settings as staticSettings, socialLinks as staticSocialLinks } from "@/data/settings";
import { skillCategories as staticSkillCategories, skills as staticSkills } from "@/data/skills";
import { testimonials as staticTestimonials } from "@/data/testimonials";
import { SERVER_API_URL } from "@/lib/api/config";
import type {
  BlogPost,
  Certification,
  Education,
  Experience,
  HomeContent,
  PageSeo,
  Profile,
  Project,
  Service,
  SiteSettings,
  Skill,
  SkillCategory,
  SocialLink,
  Testimonial,
} from "@/types/content";

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;
const byDateDesc = (a: BlogPost, b: BlogPost) => b.publishedAt.localeCompare(a.publishedAt);

const NOT_FOUND = Symbol("not-found");

async function fetchApi<T>(path: string): Promise<{ data: T; meta?: { totalPages?: number } } | typeof NOT_FOUND> {
  const res = await fetch(`${SERVER_API_URL}${path}`, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10_000) });
  if (res.status === 404) return NOT_FOUND;
  if (!res.ok) throw new Error(`responded ${res.status}`);
  return res.json();
}

/**
 * Reads one API resource. `fallback` supplies the static /data value when the API is not configured
 * or unavailable; `onNotFound` decides what a 404 means (missing record vs. unseeded database).
 */
async function read<T>(path: string, fallback: () => T, onNotFound: () => T = fallback): Promise<T> {
  if (!SERVER_API_URL) return fallback();
  try {
    const result = await fetchApi<T>(path);
    if (result === NOT_FOUND) return onNotFound();
    return result.data;
  } catch (err) {
    console.error(`[data] GET ${path} failed (${err instanceof Error ? err.message : String(err)}); using the static /data content instead.`);
    return fallback();
  }
}

/** Reads every page of a paginated list endpoint. */
async function readAll<T>(path: string, fallback: () => T[]): Promise<T[]> {
  if (!SERVER_API_URL) return fallback();
  const separator = path.includes("?") ? "&" : "?";
  try {
    const items: T[] = [];
    for (let page = 1; ; page++) {
      const result = await fetchApi<T[]>(`${path}${separator}limit=100&page=${page}`);
      if (result === NOT_FOUND) return fallback();
      items.push(...result.data);
      if (page >= (result.meta?.totalPages ?? 1)) return items;
    }
  } catch (err) {
    console.error(`[data] GET ${path} failed (${err instanceof Error ? err.message : String(err)}); using the static /data content instead.`);
    return fallback();
  }
}

const unseeded = <T>(name: string, value: T) => () => {
  console.warn(`[data] The API has no ${name} yet (run \`npm run seed\` in my-portfolio-backend); using the static /data content.`);
  return value;
};

export async function getProfile(): Promise<Profile> {
  "use cache";
  cacheLife("minutes");
  cacheTag("profile");
  return read("/profile", () => staticProfile, unseeded("profile", staticProfile));
}

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("minutes");
  cacheTag("settings");
  const stored = await read<Omit<SiteSettings, "siteUrl">>("/settings", () => staticSettings, unseeded("settings", staticSettings));
  // The site URL is deployment configuration (NEXT_PUBLIC_SITE_URL), not database content.
  return { ...stored, siteUrl: staticSettings.siteUrl };
}

/** Primary navigation mirrors the app's routes, so it stays in code. */
export async function getNavigation() {
  return navigation;
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("social-links");
  return read("/social-links", () => staticSocialLinks.filter((link) => link.visible));
}

export async function getHomeContent(): Promise<HomeContent> {
  "use cache";
  cacheLife("minutes");
  cacheTag("home");
  return read("/home", () => staticHome, unseeded("homepage content", staticHome));
}

export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("projects");
  return readAll<Project>("/projects", () => staticProjects.filter((p) => p.status === "published").sort(byOrder));
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("projects");
  return read<Project | null>(
    `/projects/${encodeURIComponent(slug)}`,
    () => staticProjects.find((p) => p.slug === slug && p.status === "published") ?? null,
    () => null,
  );
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const [all, home] = await Promise.all([getProjects(), getHomeContent()]);
  const picked = home.featuredProjectSlugs.map((slug) => all.find((p) => p.slug === slug)).filter((p): p is Project => Boolean(p));
  return picked.length ? picked : all.filter((p) => p.featured).slice(0, 5);
}

export async function getProjectsBySlugs(slugs: string[]): Promise<Project[]> {
  const all = await getProjects();
  return slugs.map((slug) => all.find((p) => p.slug === slug)).filter((p): p is Project => Boolean(p));
}

export async function getPosts(): Promise<BlogPost[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts");
  return readAll<BlogPost>("/posts", () => staticPosts.filter((p) => p.status === "published").sort(byDateDesc));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts");
  return read<BlogPost | null>(
    `/posts/${encodeURIComponent(slug)}`,
    () => staticPosts.find((p) => p.slug === slug && p.status === "published") ?? null,
    () => null,
  );
}

export async function getExperience(): Promise<Experience[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("experience");
  return read("/experience", () => [...staticExperience].sort(byOrder));
}

export async function getSkills(): Promise<{ categories: SkillCategory[]; skills: Skill[] }> {
  "use cache";
  cacheLife("minutes");
  cacheTag("skills");
  return read("/skills", () => ({ categories: staticSkillCategories, skills: [...staticSkills].sort(byOrder) }));
}

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("services");
  return read("/services", () => staticServices.filter((s) => s.visible).sort(byOrder));
}

export async function getEducation(): Promise<{ education: Education[]; certifications: Certification[] }> {
  "use cache";
  cacheLife("minutes");
  cacheTag("education");
  return read("/education", () => ({ education: staticEducation, certifications: staticCertifications }));
}

/** Only real (non-demo), visible testimonials ever reach the public site (filtered by the API too). */
export async function getPublicTestimonials(): Promise<Testimonial[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("testimonials");
  return read("/testimonials", () => staticTestimonials.filter((t) => !t.isDemo && t.visible));
}

export async function getAllPageSeo(): Promise<PageSeo[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("seo");
  return read("/seo", () => staticPageSeo);
}

export async function getPageSeo(path: string) {
  return (await getAllPageSeo()).find((p) => p.path === path);
}

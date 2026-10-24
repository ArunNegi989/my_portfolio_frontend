// Data access layer. Pages call these functions instead of importing /data directly,
// so a future backend (REST API or database) can replace the static source here
// without changing any page component.

import { posts } from "@/data/blog";
import { certifications, education } from "@/data/education";
import { experience } from "@/data/experience";
import { home } from "@/data/home";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { pageSeo } from "@/data/seo";
import { services } from "@/data/services";
import { navigation, settings, socialLinks } from "@/data/settings";
import { skillCategories, skills } from "@/data/skills";
import { testimonials } from "@/data/testimonials";
import type { BlogPost, Project } from "@/types/content";

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;
const byDateDesc = (a: BlogPost, b: BlogPost) => b.publishedAt.localeCompare(a.publishedAt);

export async function getProfile() {
  return profile;
}

export async function getSettings() {
  return settings;
}

export async function getNavigation() {
  return navigation;
}

export async function getSocialLinks() {
  return socialLinks.filter((link) => link.visible);
}

export async function getHomeContent() {
  return home;
}

export async function getProjects(): Promise<Project[]> {
  return projects.filter((p) => p.status === "published").sort(byOrder);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return projects.find((p) => p.slug === slug && p.status === "published") ?? null;
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const all = await getProjects();
  const picked = home.featuredProjectSlugs
    .map((slug) => all.find((p) => p.slug === slug))
    .filter((p): p is Project => Boolean(p));
  return picked.length ? picked : all.filter((p) => p.featured).slice(0, 5);
}

export async function getProjectsBySlugs(slugs: string[]): Promise<Project[]> {
  const all = await getProjects();
  return slugs.map((slug) => all.find((p) => p.slug === slug)).filter((p): p is Project => Boolean(p));
}

export async function getPosts(): Promise<BlogPost[]> {
  return posts.filter((p) => p.status === "published").sort(byDateDesc);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return posts.find((p) => p.slug === slug && p.status === "published") ?? null;
}

export async function getExperience() {
  return [...experience].sort(byOrder);
}

export async function getSkills() {
  return { categories: skillCategories, skills: [...skills].sort(byOrder) };
}

export async function getServices() {
  return services.filter((s) => s.visible).sort(byOrder);
}

export async function getEducation() {
  return { education, certifications };
}

/** Only real (non-demo), visible testimonials ever reach the public site. */
export async function getPublicTestimonials() {
  return testimonials.filter((t) => !t.isDemo && t.visible);
}

export async function getPageSeo(path: string) {
  return pageSeo.find((p) => p.path === path);
}

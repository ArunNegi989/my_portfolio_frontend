"use client";

// Client-side mock content store for the admin prototype.
// Seeded from the same /data modules the public site uses; edits go through demoStorage.

import { useSyncExternalStore } from "react";
import { posts } from "@/data/blog";
import { certifications, education } from "@/data/education";
import { experience } from "@/data/experience";
import { home } from "@/data/home";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { pageSeo } from "@/data/seo";
import { services } from "@/data/services";
import { settings, socialLinks } from "@/data/settings";
import { skillCategories, skills } from "@/data/skills";
import { testimonials } from "@/data/testimonials";
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
import { demoStorage } from "./storage";

export interface ActivityEntry {
  id: string;
  message: string;
  at: string;
}

export interface AdminState {
  version: 1;
  profile: Profile;
  home: HomeContent;
  settings: SiteSettings;
  projects: Project[];
  posts: BlogPost[];
  experience: Experience[];
  skills: Skill[];
  skillCategories: SkillCategory[];
  services: Service[];
  education: Education[];
  certifications: Certification[];
  testimonials: Testimonial[];
  socialLinks: SocialLink[];
  seo: PageSeo[];
  activity: ActivityEntry[];
}

type CollectionKey = {
  [K in keyof AdminState]: AdminState[K] extends Array<{ id: string }> ? K : never;
}[keyof AdminState];
/** Values replaced as a whole (skill categories are keyed by `key`, not `id`). */
type SingletonKey = "profile" | "home" | "settings" | "skillCategories";

function createSeed(): AdminState {
  return structuredClone({
    version: 1 as const,
    profile,
    home,
    settings,
    projects,
    posts,
    experience,
    skills,
    skillCategories,
    services,
    education,
    certifications,
    testimonials,
    socialLinks,
    seo: pageSeo,
    activity: [{ id: "seed", message: "Demo content loaded from the /data files", at: "2026-10-24T00:00:00.000Z" }],
  });
}

const SEED = createSeed();
let state: AdminState = SEED;
let loaded = false;
const listeners = new Set<() => void>();

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const saved = demoStorage.load<AdminState>();
  if (saved && saved.version === 1) {
    const seed = createSeed();
    // Singletons are merged field by field so fields added after the data was saved keep their seed values.
    state = {
      ...seed,
      ...saved,
      profile: { ...seed.profile, ...saved.profile },
      home: { ...seed.home, ...saved.home },
      settings: { ...seed.settings, ...saved.settings },
    };
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function commit(next: AdminState, message?: string) {
  state = message
    ? { ...next, activity: [{ id: newId("a"), message, at: new Date().toISOString() }, ...next.activity].slice(0, 40) }
    : next;
  demoStorage.save(state);
  emit();
}

export const adminStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    ensureLoaded();
    return state;
  },
  getServerSnapshot() {
    return SEED;
  },
};

export function useAdminState(): AdminState {
  return useSyncExternalStore(adminStore.subscribe, adminStore.getSnapshot, adminStore.getServerSnapshot);
}

const noop = () => () => {};
/** False during SSR / hydration, true once running in the browser with stored demo data loaded. */
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

type Item<K extends CollectionKey> = AdminState[K][number];

export const adminActions = {
  upsert<K extends CollectionKey>(key: K, item: Item<K>, message: string) {
    const current = state[key] as Array<{ id: string }>;
    const exists = current.some((x) => x.id === item.id);
    const next = exists ? current.map((x) => (x.id === item.id ? item : x)) : [...current, item];
    commit({ ...state, [key]: next }, message);
  },
  remove<K extends CollectionKey>(key: K, id: string, message: string) {
    const current = state[key] as Array<{ id: string }>;
    commit({ ...state, [key]: current.filter((x) => x.id !== id) }, message);
  },
  replace<K extends CollectionKey>(key: K, items: AdminState[K], message: string) {
    commit({ ...state, [key]: items }, message);
  },
  update<K extends SingletonKey>(key: K, value: AdminState[K], message: string) {
    commit({ ...state, [key]: value }, message);
  },
  reset() {
    demoStorage.clear();
    state = createSeed();
    emit();
  },
  exportJson() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { activity, version, ...content } = state;
    return JSON.stringify(content, null, 2);
  },
};

/** Moves an item within an array (for up/down reordering). */
export function move<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

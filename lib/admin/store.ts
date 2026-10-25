"use client";

// Client-side content store for the admin dashboard, backed by my-portfolio-backend.
// Everything is loaded once from GET /admin/content; every action saves through the API first and
// only updates local state with what the server returned, so the screens always show saved data.

import { useSyncExternalStore } from "react";
import { api } from "@/lib/api/client";
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

export interface ActivityEntry {
  id: string;
  message: string;
  at: string;
}

export interface AdminState {
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
type SingletonKey = "profile" | "home" | "settings" | "skillCategories";

/** "empty" = the API answered but the database has not been seeded yet. */
export type AdminStatus = "idle" | "loading" | "ready" | "empty" | "error";

const COLLECTION_PATHS: Record<Exclude<CollectionKey, "activity">, string> = {
  projects: "/admin/projects",
  posts: "/admin/posts",
  experience: "/admin/experience",
  skills: "/admin/skills",
  services: "/admin/services",
  education: "/admin/education",
  certifications: "/admin/certifications",
  testimonials: "/admin/testimonials",
  socialLinks: "/admin/social-links",
  seo: "/admin/seo",
};

const SINGLETON_PATHS: Record<SingletonKey, string> = {
  profile: "/admin/profile",
  home: "/admin/home",
  settings: "/admin/settings",
  skillCategories: "/admin/skill-categories",
};

// The site URL is deployment configuration (NEXT_PUBLIC_SITE_URL), shown read-only in Settings.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

interface Snapshot {
  status: AdminStatus;
  state: AdminState | null;
  error: string | null;
}

const SERVER_SNAPSHOT: Snapshot = { status: "idle", state: null, error: null };
let snapshot: Snapshot = SERVER_SNAPSHOT;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function set(next: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((l) => l());
}

type ContentResponse = Omit<AdminState, "profile" | "home" | "settings"> & {
  profile: Profile | null;
  home: HomeContent | null;
  settings: Omit<SiteSettings, "siteUrl"> | null;
};

/** Loads (or reloads) everything the dashboard edits. Concurrent calls share one request. */
export function loadAdminContent(): Promise<void> {
  if (loading) return loading;
  if (snapshot.status !== "ready") set({ status: "loading", error: null });
  loading = api
    .get<ContentResponse>("/admin/content")
    .then((data) => {
      if (!data.profile || !data.home || !data.settings) {
        set({ status: "empty", state: null });
        return;
      }
      set({ status: "ready", error: null, state: { ...data, profile: data.profile, home: data.home, settings: { ...data.settings, siteUrl: SITE_URL } } });
    })
    .catch((err) => {
      set({ status: "error", error: err instanceof Error ? err.message : "Couldn't load the dashboard content." });
    })
    .finally(() => {
      loading = null;
    });
  return loading;
}

/** Forgets all loaded content (used on sign-out so nothing stays in memory). */
export function clearAdminState() {
  set({ status: "idle", state: null, error: null });
}

export const adminStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
  getServerSnapshot: () => SERVER_SNAPSHOT,
};

function useSnapshot() {
  return useSyncExternalStore(adminStore.subscribe, adminStore.getSnapshot, adminStore.getServerSnapshot);
}

export function useAdminStatus() {
  const { status, error } = useSnapshot();
  return { status, error };
}

/**
 * The loaded content. Screens render only inside AdminShell, which waits for status "ready",
 * so the state is always present here.
 */
export function useAdminState(): AdminState {
  const { state } = useSnapshot();
  if (!state) throw new Error("useAdminState() was used before the dashboard content loaded.");
  return state;
}

/** True once the dashboard content has loaded. */
export function useHydrated() {
  return useSnapshot().status === "ready";
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function current(): AdminState {
  if (!snapshot.state) throw new Error("Dashboard content is not loaded.");
  return snapshot.state;
}

/** Applies a saved change locally and adds it to the activity feed (the server records it too). */
function commit(next: AdminState, message?: string) {
  const activity = message ? [{ id: newId("a"), message, at: new Date().toISOString() }, ...next.activity].slice(0, 40) : next.activity;
  set({ state: { ...next, activity } });
}

type Item<K extends CollectionKey> = AdminState[K][number];

export const adminActions = {
  /** Creates the item if its id is new, otherwise replaces it. Resolves with the saved item. */
  async upsert<K extends Exclude<CollectionKey, "activity">>(key: K, item: Item<K>, message: string): Promise<Item<K>> {
    const list = current()[key] as Array<{ id: string }>;
    const exists = list.some((x) => x.id === item.id);
    const path = COLLECTION_PATHS[key];
    const saved = exists ? await api.put<Item<K>>(`${path}/${encodeURIComponent(item.id)}`, item) : await api.post<Item<K>>(path, item);
    const latest = current()[key] as Array<{ id: string }>;
    const next = exists ? latest.map((x) => (x.id === item.id ? saved : x)) : [...latest, saved];
    commit({ ...current(), [key]: next }, message);
    return saved;
  },

  async remove<K extends Exclude<CollectionKey, "activity">>(key: K, id: string, message: string) {
    await api.delete(`${COLLECTION_PATHS[key]}/${encodeURIComponent(id)}`);
    const latest = current()[key] as Array<{ id: string }>;
    commit({ ...current(), [key]: latest.filter((x) => x.id !== id) }, message);
  },

  /** Saves a whole list (reordering, or screens that save every row together). */
  async replace<K extends Exclude<CollectionKey, "activity">>(key: K, items: AdminState[K], message: string) {
    const saved = await api.put<AdminState[K]>(COLLECTION_PATHS[key], { items });
    commit({ ...current(), [key]: saved }, message);
  },

  async update<K extends SingletonKey>(key: K, value: AdminState[K], message: string) {
    const body = key === "skillCategories" ? { items: value } : value;
    const saved = await api.put<AdminState[K]>(SINGLETON_PATHS[key], body);
    const merged = key === "settings" ? { ...(saved as SiteSettings), siteUrl: SITE_URL } : saved;
    commit({ ...current(), [key]: merged }, message);
  },

  /** Discards local state and reloads everything from the server. */
  async reload() {
    await loadAdminContent();
  },

  exportJson() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { activity, ...content } = current();
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

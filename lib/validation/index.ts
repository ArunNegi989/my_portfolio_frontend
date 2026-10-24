// Shared validation rules for public and admin forms.

import { isWebsiteUrl } from "@/lib/utils";

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateUrl(value: string | undefined, { optional = true } = {}): true | string {
  if (!value) return optional ? true : "URL is required.";
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" || url.protocol === "mailto:" || "Use an http(s) or mailto: URL.";
  } catch {
    return "Enter a valid URL (https://…) or a site path (/…).";
  }
}

/**
 * A project's live website: optional, but when set it must be an absolute http(s) URL and must not
 * point back at this portfolio's own project pages.
 */
export function validateWebsiteUrl(value: string | undefined, ownSites: string[] = []): true | string {
  const trimmed = value?.trim();
  if (!trimmed) return true;
  if (!isWebsiteUrl(trimmed)) return "Enter the full website address, starting with http:// or https:// (e.g. https://example.com).";
  const url = new URL(trimmed);
  const ownOrigins = ownSites.filter(isWebsiteUrl).map((site) => new URL(site).origin);
  if (ownOrigins.includes(url.origin) && url.pathname.startsWith("/projects")) {
    return "This links to the portfolio's own project page. Enter the project's real live website instead.";
  }
  return true;
}

export function validateSlug(value: string, taken: string[]): true | string {
  if (!value) return "Slug is required.";
  if (!slugPattern.test(value)) return "Use lowercase letters, numbers and single hyphens.";
  if (taken.includes(value)) return "This slug is already used. Slugs must be unique.";
  return true;
}

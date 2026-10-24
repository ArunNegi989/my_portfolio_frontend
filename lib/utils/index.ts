export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Formats `YYYY-MM-DD` or `YYYY-MM` deterministically (no locale/timezone drift between server and client). */
export function formatDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month) return value;
  const m = MONTHS[month - 1] ?? "";
  return day ? `${m} ${day}, ${year}` : `${m} ${year}`;
}

export function formatRange(start: string, end: string | null): string {
  return `${formatDate(start)} – ${end ? formatDate(end) : "Present"}`;
}

export function readingTime(text: string): number {
  const words = text.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function isValidUrl(value: string): boolean {
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:";
  } catch {
    return false;
  }
}

export function absoluteUrl(siteUrl: string, path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/** `tel:` link for a display-formatted phone number ("+91 84768 98395" → "tel:+918476898395"). */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** Hostname without "www." for compact external-link labels. */
/** True only for absolute http(s) addresses, the only kind a "live website" link may point to. */
export function isWebsiteUrl(value: string | undefined): value is string {
  if (!value || /\s/.test(value)) return false;
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

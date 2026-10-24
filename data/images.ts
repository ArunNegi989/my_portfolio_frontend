// Builds explicit, stable Unsplash CDN URLs (fixed photo IDs, no random endpoints).
// Every ID used in /data was checked to resolve and to match its subject.
// Replace any URL in the data files with your own screenshots when available.

export function unsplash(id: string, width = 1600, height?: number): string {
  const size = height ? `&h=${height}` : "";
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}${size}&q=75`;
}

export const UNSPLASH_CREDIT = "Representative image via Unsplash";

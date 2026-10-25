import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

// Called by my-portfolio-backend after an admin change. Expires the cached datasets named in the
// request so the next visit renders fresh content. Server-to-server only: protected by a shared
// secret (REVALIDATE_SECRET, never exposed to the browser).

const TAGS = new Set(["profile", "settings", "home", "social-links", "projects", "posts", "experience", "skills", "services", "education", "testimonials", "seo"]);

function secretMatches(provided: string | null, expected: string) {
  const a = Buffer.from(provided ?? "");
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return Response.json({ error: "Revalidation is not configured." }, { status: 503 });
  if (!secretMatches(request.headers.get("x-revalidate-secret"), secret)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const tags = Array.isArray(body?.tags) ? body.tags.filter((t: unknown): t is string => typeof t === "string" && TAGS.has(t)) : [];
  if (!tags.length) return Response.json({ error: "No known tags to revalidate." }, { status: 400 });

  // expire: 0 → the next request renders fresh data (an admin should see their edit straight away).
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: tags });
}

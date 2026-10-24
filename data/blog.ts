import type { BlogPost } from "@/types/content";
import { unsplash, UNSPLASH_CREDIT } from "./images";

// Original sample articles written for this portfolio. Content uses the Markdown subset
// supported by lib/markdown: ## / ### headings, paragraphs, - and 1. lists, > quotes,
// fenced code blocks, ![images](url), `inline code`, **bold**, *italic* and [links](url).

const AUTHOR = "Arun Negi";

export const posts: BlogPost[] = [
  {
    id: "b-nextjs-structure",
    slug: "structuring-a-nextjs-app-router-project",
    title: "Structuring a Next.js App Router Project That Stays Maintainable",
    excerpt:
      "Route groups, colocated components and a thin data layer: the folder structure I reach for when a Next.js project needs to grow without turning into a maze.",
    category: "Next.js & React",
    tags: ["Next.js", "React", "Architecture"],
    cover: {
      src: unsplash("1633356122544-f134324a6cee", 1600),
      alt: "Code editor with the React logo on a dark screen",
      credit: UNSPLASH_CREDIT,
    },
    author: AUTHOR,
    publishedAt: "2026-10-12",
    status: "published",
    featured: true,
    content: `Most Next.js projects start tidy. The trouble begins around the tenth page, when a second layout appears, an admin area gets bolted on and data fetching ends up scattered across components. A little structure early on saves a lot of refactoring later.

## Start with route groups

Route groups — folders wrapped in parentheses — organise routes without changing the URL. They are the cleanest way to give different areas of a site different layouts.

\`\`\`text
app/
  (public)/
    layout.tsx      // navbar + footer
    page.tsx        // "/"
    projects/
      page.tsx      // "/projects"
      [slug]/page.tsx
  admin/
    layout.tsx      // sidebar shell
    page.tsx        // "/admin"
\`\`\`

The public pages share a marketing layout, the admin area gets its own shell, and neither leaks into the other.

## Keep data access in one place

Components should not know where data comes from. I put every read behind small async functions in a \`lib/data\` folder:

\`\`\`ts
// lib/data/projects.ts
import { projects } from "@/data/projects";

export async function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug && p.status === "published") ?? null;
}
\`\`\`

Today those functions read local TypeScript files. Tomorrow they can call a database or a REST API, and not a single page component has to change.

## Server components by default

Pages and layouts are server components unless they need interactivity. I only add \`"use client"\` to the leaves that need state or browser APIs: a filter bar, a form, a menu toggle. That keeps JavaScript bundles small and lets data load on the server.

- **Server:** pages, layouts, lists, article bodies
- **Client:** forms, search inputs, carousels, anything with \`useState\`

## Share types between UI and data

A single \`types/content.ts\` file describing a \`Project\` or a \`BlogPost\` means the admin form, the listing card and the detail page all agree on the shape of the data. When a field changes, TypeScript points at every place that needs updating.

## Metadata belongs next to the page

Each route exports its own \`generateMetadata\`, built from the same data the page renders. Titles and descriptions never drift away from the content.

> A good structure is one where a new teammate can guess where a file lives before searching for it.

None of this is exotic. It is simply a set of boundaries — routes, data, types and client islands — that keep a growing Next.js codebase predictable.`,
  },
  {
    id: "b-express-jwt",
    slug: "designing-rest-apis-with-express-and-jwt",
    title: "Designing REST APIs with Express.js and JWT Authentication",
    excerpt:
      "Resource-oriented routes, consistent errors and a small JWT middleware: a practical blueprint for Node.js APIs that frontends enjoy consuming.",
    category: "Node.js & APIs",
    tags: ["Node.js", "Express.js", "JWT", "REST"],
    cover: {
      src: unsplash("1558494949-ef010cbdcc31", 1600),
      alt: "Server rack with organised network cables",
      credit: UNSPLASH_CREDIT,
    },
    author: AUTHOR,
    publishedAt: "2026-09-21",
    status: "published",
    featured: false,
    content: `A REST API is a contract with every client that calls it. When the contract is consistent, frontend work speeds up; when it is not, every screen needs special cases. Here is the blueprint I follow with Express.js.

## Name resources, not actions

Routes describe *things*, and HTTP methods describe what happens to them.

\`\`\`text
GET    /api/bookings          list bookings
POST   /api/bookings          create a booking
GET    /api/bookings/:id      read one booking
PATCH  /api/bookings/:id      update part of a booking
DELETE /api/bookings/:id      cancel a booking
\`\`\`

Verbs such as \`/createBooking\` or \`/getAllBookings\` creep in easily. Resisting them keeps the API guessable.

## One error shape everywhere

Clients should never parse three different error formats. A single error handler at the end of the middleware chain makes that easy:

\`\`\`js
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: { message: err.expose ? err.message : "Something went wrong", code: err.code || "INTERNAL" },
  });
});
\`\`\`

## Authenticate with a small JWT middleware

After login, the server signs a short-lived token. Protected routes verify it before doing anything else.

\`\`\`js
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: { message: "Missing token", code: "UNAUTHENTICATED" } });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: { message: "Invalid or expired token", code: "UNAUTHENTICATED" } });
  }
}
\`\`\`

## Authorise by role, separately

Authentication answers *who are you*; authorisation answers *what may you do*. Keeping them in separate middleware keeps both readable — and is the foundation of role-based access control in systems like an HRMS.

\`\`\`js
export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : res.status(403).json({ error: { message: "Forbidden", code: "FORBIDDEN" } });

router.patch("/payroll/:id", requireAuth, requireRole("admin", "hr"), updatePayroll);
\`\`\`

## Validate at the edge

Reject bad input before it reaches the database. Validate the body, params and query of every write request, and return a 400 with field-level messages the frontend can display next to the right input.

## A checklist before shipping

1. Every list endpoint is paginated.
2. Secrets live in environment variables, never in the repository.
3. Tokens expire, and passwords are hashed.
4. Errors share one shape and never leak stack traces.
5. CORS allows only the origins that need access.

Small, boring conventions like these are what make an API pleasant to build against for years.`,
  },
  {
    id: "b-performance-seo",
    slug: "practical-website-performance-wins-for-seo",
    title: "Practical Website Performance Wins That Also Help SEO",
    excerpt:
      "Images, fonts, caching and semantic HTML: the unglamorous fixes that make pages feel faster and easier for search engines to understand.",
    category: "Performance & SEO",
    tags: ["Performance", "SEO", "Core Web Vitals"],
    cover: {
      src: unsplash("1504868584819-f8e8b4b6d7e3", 1600),
      alt: "Laptop showing analytics charts",
      credit: UNSPLASH_CREDIT,
    },
    author: AUTHOR,
    publishedAt: "2026-08-30",
    status: "published",
    featured: false,
    content: `Speed and search visibility are closely linked. Faster pages keep visitors around, and clean, well-structured markup helps search engines understand what a page is about. These are the fixes I check first on any site, whether it runs on Next.js or WordPress.

## 1. Treat images as the biggest budget item

Images are usually the heaviest part of a page.

- Serve modern formats (WebP or AVIF) at the size they are actually displayed.
- Always set width and height (or an aspect ratio) so the layout does not jump.
- Lazy-load anything below the fold, and prioritise only the main hero image.

In Next.js, the \`Image\` component handles resizing and lazy loading. On WordPress, a caching and optimisation plugin such as WP Rocket covers much of the same ground.

## 2. Load fonts without layout shift

Self-host fonts or use a framework helper so they are served from your own domain, and limit yourself to the weights you really use. \`next/font\` does this automatically and avoids the flash of re-flowing text.

## 3. Cache aggressively, invalidate deliberately

Static assets should be cached for a long time with hashed filenames. HTML can be cached too when content changes predictably. Page caching alone often turns a sluggish CMS site into a fast one.

## 4. Write semantic HTML

Search engines and screen readers both rely on structure.

\`\`\`html
<main>
  <article>
    <h1>One clear page title</h1>
    <h2>Section heading</h2>
    <p>Content…</p>
  </article>
</main>
\`\`\`

One \`h1\` per page, headings in order, real \`button\` and \`a\` elements, and descriptive alt text all count.

## 5. Get metadata right on every page

Every page deserves a unique title and description, a canonical URL and Open Graph tags for link previews. SEO plugins such as Yoast SEO and Rank Math make this manageable for editors; in Next.js, the Metadata API keeps it next to the page code.

## 6. Ship less JavaScript

Every kilobyte of JavaScript has to be downloaded, parsed and executed. Render on the server where possible, split heavy widgets into lazily loaded chunks, and question every third-party script.

> Performance work is rarely one big win. It is a dozen small ones that add up.

Measure before and after each change — Lighthouse and real-user Core Web Vitals data will tell you which of these fixes matter most for your site.`,
  },
  {
    id: "b-wordpress-acf",
    slug: "content-managed-sites-with-wordpress-acf-elementor",
    title: "Building Content-Managed Sites with WordPress, ACF and Elementor",
    excerpt:
      "How I model content with Advanced Custom Fields and design reusable Elementor templates so editors can publish confidently without breaking layouts.",
    category: "WordPress",
    tags: ["WordPress", "ACF", "Elementor", "CMS"],
    cover: {
      src: unsplash("1585829365295-ab7cd400c167", 1600),
      alt: "Typewriter with a page reading News",
      credit: UNSPLASH_CREDIT,
    },
    author: AUTHOR,
    publishedAt: "2026-07-18",
    status: "published",
    featured: false,
    content: `WordPress is at its best when editors can publish quickly and the design stays intact. The combination of Advanced Custom Fields (ACF) for structure and Elementor for layout makes that possible — if it is set up deliberately.

## Model content before designing pages

Before opening Elementor, list the content types the site needs and the fields each one has. For a news portal that might be:

- **Article:** headline, standfirst, featured image, category, author, body
- **Author:** name, photo, short bio, social links
- **Category landing:** intro text, featured articles

ACF turns that list into real fields, so editors fill in a form instead of fighting a page builder.

## Build templates, not one-off pages

Elementor's theme builder lets you design a single template for every article or category page. The template pulls its content from the fields, so a hundred articles share one consistent layout.

\`\`\`php
<?php
// Reading an ACF field inside a theme template
$standfirst = get_field('standfirst');
if ($standfirst) {
  echo '<p class="standfirst">' . esc_html($standfirst) . '</p>';
}
\`\`\`

## Keep SEO in the editor's hands

Plugins such as Yoast SEO or Rank Math give editors a title, description and preview for every post. Pair that with clean headings in the template and sensible permalink settings, and most on-page SEO is covered.

## Make it fast from day one

News sites get traffic spikes. Page caching, minified assets and optimised images — handled by a plugin such as WP Rocket — keep pages responsive when it matters.

## Hand over a CMS, not a puzzle

1. Remove widgets and options editors do not need.
2. Name fields clearly and add instructions to them.
3. Document how to publish, schedule and update content.

> The best compliment a WordPress build can get is that editors never need to call the developer.`,
  },
  {
    id: "b-lessons",
    slug: "lessons-from-shipping-production-web-apps",
    title: "Lessons from Shipping 15+ Production Web Applications",
    excerpt:
      "Scope clearly, design the data first, build admin tools early and treat deadlines as a feature. What repeated delivery across many domains has taught me.",
    category: "Full Stack Lessons",
    tags: ["Career", "Full Stack", "Delivery"],
    cover: {
      src: unsplash("1550439062-609e1531270e", 1600),
      alt: "Developer working at a desk with three monitors",
      credit: UNSPLASH_CREDIT,
    },
    author: AUTHOR,
    publishedAt: "2026-06-25",
    status: "published",
    featured: false,
    content: `Working on yoga platforms, e-commerce stores, news portals, a government portal, healthcare and audit software has taught me that the domain changes far more than the fundamentals do. These are the lessons that keep repeating.

## Clarify scope before writing code

Most delays I have seen come from unclear requirements, not hard problems. A short list of user flows — "a student finds a program, enrols and receives confirmation" — removes more uncertainty than a long feature list.

## Design the data model first

Pages change often; data models are expensive to change. Sketching the collections and relationships up front, whether in MongoDB or MySQL, makes the API and the UI much easier to build.

## Admin tools are part of the product

Clients spend their days in the admin side of an application. Program listings, enrolment records, inquiries and blog posts all need simple management screens. A good admin area is often where the biggest time savings for a client come from.

## Mobile-first is not optional

For e-commerce and content sites alike, a large share of visitors arrive on a phone. Designing the small screen first forces focus on what matters.

## Ship in small increments

Agile sprints work best when each one ends with something the client can click. Early feedback catches misunderstandings while they are still cheap to fix.

- Demo working features, not slides.
- Keep a visible list of what is next.
- Make deadlines part of the plan, not a surprise at the end.

## Write code your future self can read

Consistent naming, small components and a predictable folder structure matter more than clever tricks. Six months later, someone — often you — will need to change it quickly.

> Shipping reliably is a skill in its own right, and it compounds with every project.`,
  },
];

export const blogCategories = Array.from(new Set(posts.map((p) => p.category)));

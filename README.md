# Arun Negi — 3D Developer Portfolio + Admin Dashboard (Phase 1)

A cinematic, 3D developer portfolio for **Arun Negi, Full Stack Developer**, with a separate admin dashboard UI for managing content. Phase 1 is a **complete static frontend**: no backend, no database, no authentication.

Built with **Next.js 16 (App Router, Cache Components) · TypeScript · CSS Modules · React Three Fiber + Drei · Motion · Lenis · React Hook Form · Lucide**.

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # ESLint
npx tsc --noEmit   # type-check
npm run build      # production build (prerenders ~80 pages)
npm start          # serve the production build
```

Optional: copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` once the production domain is decided. It drives canonical URLs, Open Graph URLs, `sitemap.xml` and `robots.txt`. It defaults to `http://localhost:3000`.

---

## What's in Phase 1

### Public site

| Route | Content |
| --- | --- |
| `/` | Cinematic intro, 3D hero, about preview with stats, featured projects, skills, experience timeline, services, latest posts, contact |
| `/about` | Summary, story, stats, focus areas, education & certifications |
| `/projects` | Search (name/technology), category filters, sorting, clear filters, empty state |
| `/projects/[slug]` | Case-study template: problem, goals, solution, features, stack, process, verified results, gallery + lightbox, prev/next, related |
| `/experience` | Full animated timeline from the resume |
| `/skills` | Skill categories (no invented proficiency ratings) |
| `/services` | Seven proposed, editable service categories |
| `/blog` | Featured article, search, category filters, "load more" |
| `/blog/[slug]` | TOC with active heading, reading progress, copy-code buttons, share links, related, prev/next, JSON-LD |
| `/contact` | Validated contact form (demo) + email/LinkedIn/GitHub |
| 404 | Custom not-found page |

### Cinematic intro

The exact sequence: `ARUN NEGI` / `PORTFOLIO.EXE` → zoom toward the viewer → text breaks into shards that burst out and fall → near-empty screen → an original SVG robot drops in from the top → grabs and pulls a rope → curtains open → the 3D hero rises in.

- Plays on the **first homepage visit** (flag in `localStorage`). A tiny inline script runs before first paint, so returning visitors never see the overlay flash and first-time visitors never see the homepage flash.
- **Skip Intro** button (and `Esc`); **Replay Intro** button in the hero.
- Never blocks direct links to other routes (it only lives on `/`).
- `prefers-reduced-motion`: a short fade-only version.
- No audio is bundled; the setting is off by default.
- Without JavaScript, the overlay is hidden by CSS.
- Enable or disable it in `data/settings.ts` (`introEnabled`).

### 3D hero

`components/three/HeroScene.tsx`: distorted core, wireframe shell, rings, floating cubes, particles, mouse parallax, and orbiting technology labels (plain DOM projected from 3D each frame).

- The Three.js bundle is **lazy-loaded** only when WebGL is available. It's preloaded during the intro but mounted after it, and rendering pauses when the hero is off-screen.
- **Fallback:** small screens, reduced-motion users and browsers without WebGL get a lightweight CSS orb/orbit (`HeroVisual.tsx`).

### Admin dashboard (`/admin`)

Overview (stats computed from the data, recent activity, recent projects, category chart, quick actions) plus every management screen: profile, pages & sections, projects (list/new/edit), blog (list/new/edit with Markdown preview), experience, skills, services, education, testimonials, social links, SEO and settings.

It includes typed React Hook Form forms with shared validation, unique-slug checks, URL validation, image-URL previews with failure handling, a gallery editor (add/edit/reorder/remove), confirmation dialogs, toasts, search, filters, empty and loading states, a collapsible sidebar, breadcrumbs, global search and a profile-menu mockup.

---

## Content architecture

All content is typed (`types/content.ts`) and lives in `/data`:

```text
data/profile.ts       name, role, summary, stats, contact, resume path
data/home.ts          hero copy, section visibility & headings, featured projects
data/projects.ts      20 resume-based case studies
data/blog.ts          5 original sample articles (Markdown subset)
data/experience.ts    3 roles from the resume
data/skills.ts        skills + categories from the resume
data/services.ts      7 proposed services
data/education.ts     degrees + certifications
data/testimonials.ts  DEMO entries only (never shown publicly)
data/settings.ts      site settings, navigation, social links, page imagery
data/seo.ts           per-page metadata
```

Pages never import `/data` directly. They call the async functions in **`lib/data/index.ts`**, which is the single place to swap in a real API or database later.

Blog articles use a small Markdown subset rendered by `lib/markdown` + `components/shared/Markdown.tsx`: `##`/`###` headings, lists, quotes, fenced code, images, inline code, bold, italic and links. The same renderer powers the admin preview.

---

## Online images

- Every image is a **fixed, explicit Unsplash URL** built by `data/images.ts`. Each one was checked to load and to match its subject. URLs live next to their content (project, post, service, profile, settings).
- Unsplash images go through a custom `next/image` loader (`components/shared/SmartImage.tsx`). Unsplash's CDN resizes them and serves WebP/AVIF, so you still get a responsive `srcset` without re-optimising on your server.
- `SmartImage` shows a branded fallback if an image fails to load. Hosts not listed in `next.config.ts` are rendered unoptimized. To use `next/image` optimisation for another host, add it to `images.remotePatterns`.
- **Project images are representative stock photos, not screenshots.** Cards and case studies label them as such (`representativeImagery: true`). Replace them with real screenshots when available, then set the flag to `false`.

---

## Honesty rules baked into the data

- Experience, dates, companies, skills and results come **only from the resume**. The only quantified results shown are the resume's own: ~60% less manual admin effort (yoga platforms) and ~50% faster invoicing (billing software).
- Case studies only restate resume facts and carry `detailsPending: true`, which shows a note that deeper notes and screenshots will follow.
- The only live project URL is Visezy (`visezy.com`, listed on the resume). No GitHub repo URLs were invented.
- Testimonials are demo-only and filtered out of the public site. Marking one as real requires an explicit confirmation in the admin.
- Some project tech stacks are inferred from the role: Dream Byte projects use the stack named in that role's bullet, and GIKS MERN projects use MERN. Please double-check them.

---

## Mock-data limitations (important)

- **The public site always reads `/data`.** Admin edits do **not** change the public site.
- Admin edits are stored in **this browser's `localStorage`** through the adapter in `lib/admin/storage.ts`. This is demo persistence, **not a database**. It's per-device, can be cleared by the browser, and is invisible to visitors.
- To make an edit real today: **Admin → Settings → Export content as JSON**, then copy the relevant parts into `/data/*.ts`. **Reset demo data** reloads everything from `/data`.
- Admin routes are **unprotected** (no authentication). Don't deploy `/admin` publicly before Phase 2, or block it at your host. It is already `noindex` and disallowed in `robots.txt`.
- The contact form validates input but **sends nothing**. After submitting, it offers a pre-filled `mailto:` link instead.
- Image fields take **URLs only**; nothing is uploaded.

---

## Phase 2: backend integration plan

1. **Auth:** protect `/admin` (for example with `proxy.ts` plus server-side session checks in `app/admin/layout.tsx`), add a login page and role checks.
2. **API/database:** replace the bodies of the functions in `lib/data/index.ts` with database or API calls (keep the `types/content.ts` shapes). Use `"use cache"` + `cacheTag` for public reads.
3. **Admin writes:** replace `lib/admin/storage.ts` / `adminActions` with Server Actions or REST calls, and revalidate with `updateTag`/`revalidateTag` after saves.
4. **Media:** add an upload endpoint and storage (S3, Cloudinary, …). Add its host to `images.remotePatterns`.
5. **Contact:** send form submissions through an email provider (Resend, SES, …) with spam protection.
6. **Publishing workflow:** drafts and scheduled publishing on the server.

---

## Project structure

```text
app/
  layout.tsx              root layout, fonts, intro boot script
  (public)/               public site with navbar/footer layout
  admin/                  admin layout + all management routes
  sitemap.ts, robots.ts, not-found.tsx
components/
  animations/             intro, intro store, Lenis, reveal, count-up
  three/                  3D hero scene + fallback wrapper
  public/                 navbar, footer, cards, explorers, article parts, sections
  admin/                  shell, UI kit, fields, feedback, screens
  shared/                 SmartImage, Markdown, buttons, tags, brand icons
data/                     typed content (source of truth)
lib/                      data access, markdown, SEO, validation, admin store, utils
types/content.ts          shared content types
public/resume/            Arun_Negi_Resume.pdf (Download Resume)
```

> Note: `public/resume/Arun_Negi_Resume.pdf` contains your phone number and email. Remove or replace it before publishing if you prefer.

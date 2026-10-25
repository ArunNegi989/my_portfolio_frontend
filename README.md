# Arun Negi — 3D Developer Portfolio + Admin Dashboard

A cinematic, 3D developer portfolio for **Arun Negi, Full Stack Developer**, with an admin dashboard for managing all of its content. Content, accounts, uploads and contact messages are stored by the separate API in [`../my-portfolio-backend`](../my-portfolio-backend) (Node.js, Express, MongoDB).

Built with **Next.js 16 (App Router, Cache Components) · TypeScript · CSS Modules · React Three Fiber + Drei · Motion · Lenis · React Hook Form · Lucide**.

---

## Getting started

Set up and start the backend first (see [`my-portfolio-backend/README.md`](../my-portfolio-backend/README.md)), then:

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL, REVALIDATE_SECRET
npm install
npm run dev        # http://localhost:3000 — dashboard at /login
npm run lint       # ESLint
npx tsc --noEmit   # type-check
npm run build      # production build
npm start          # serve the production build
```

| Variable (`.env.local`) | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | API base URL including `/api/v1`, e.g. `http://localhost:5000/api/v1`. Leave empty to render the static `/data` content without a backend (the dashboard needs the API) |
| `NEXT_PUBLIC_SITE_URL` | Public URL of this site: canonical URLs, Open Graph, `sitemap.xml`, `robots.txt` |
| `REVALIDATE_SECRET` | Same value as in the backend; lets the API refresh cached pages after admin changes |
| `API_URL`, `API_PROXY_TARGET` | Optional; for internal URLs and for deploying the API on another domain (backend README → Deployment) |

`NEXT_PUBLIC_*` values are inlined at build time: rebuild after changing them.

---

## What's included

### Public site

| Route | Content |
| --- | --- |
| `/` | Cinematic intro, 3D hero, about preview with stats, featured projects, skills, experience timeline, services, latest posts, contact |
| `/about` | Summary, story, stats, focus areas, education & certifications |
| `/projects` | Search (name/technology), category filters, sorting, clear filters, empty state |
| `/projects/[slug]` | Case-study template: problem, goals, solution, features, stack, process, verified results, gallery + lightbox, prev/next, related |
| `/experience` | Full animated timeline from the resume |
| `/skills` | Skill categories (no invented proficiency ratings) |
| `/services` | Service categories (editable in the dashboard) |
| `/blog` | Featured article, search, category filters, "load more" |
| `/blog/[slug]` | TOC with active heading, reading progress, copy-code buttons, share links, related, prev/next, JSON-LD |
| `/contact` | Validated contact form (stored by the API, emailed to the owner) + email/LinkedIn/GitHub |
| 404 | Custom not-found page |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | Dashboard sign-in, account request, password reset by email |

### Cinematic intro

The exact sequence: `ARUN NEGI` / `PORTFOLIO.EXE` → zoom toward the viewer → text breaks into shards that burst out and fall → near-empty screen → an original SVG robot drops in from the top → grabs and pulls a rope → curtains open → the 3D hero rises in.

- Plays on the **first homepage visit** (flag in `localStorage`). A tiny inline script runs before first paint, so returning visitors never see the overlay flash and first-time visitors never see the homepage flash.
- **Skip Intro** button (and `Esc`); **Replay Intro** button in the hero.
- Never blocks direct links to other routes (it only lives on `/`).
- `prefers-reduced-motion`: a short fade-only version.
- No audio is bundled; the setting is off by default.
- Without JavaScript, the overlay is hidden by CSS.
- Enable or disable it in **Admin → Settings → Cinematic intro**.

### 3D hero

`components/three/HeroScene.tsx`: distorted core, wireframe shell, rings, floating cubes, particles, mouse parallax, and orbiting technology labels (plain DOM projected from 3D each frame).

- The Three.js bundle is **lazy-loaded** only when WebGL is available. It's preloaded during the intro but mounted after it, and rendering pauses when the hero is off-screen.
- **Fallback:** small screens, reduced-motion users and browsers without WebGL get a lightweight CSS orb/orbit (`HeroVisual.tsx`).

### Admin dashboard (`/admin`)

Overview (stats, recent activity, recent projects, category chart, quick actions) plus every management screen: profile, pages & sections, projects (list/new/edit), blog (list/new/edit with Markdown preview), experience, skills, services, education, testimonials, **contact messages**, social links, SEO and settings.

- **Sign-in required.** `/admin` renders nothing until the API confirms an admin session; signed-out visitors are sent to `/login`. Sign out from the profile menu.
- **Saved to the database.** Every form saves through the API (field errors from the server appear on the matching inputs) and the public site updates on the next visit.
- **Uploads.** Image fields accept a URL or an uploaded file (JPG, PNG, WEBP, GIF ≤ 5 MB); the resume field uploads a PDF (≤ 10 MB).
- Typed React Hook Form forms with shared validation, unique-slug checks, previews, gallery editor, confirmation dialogs, toasts, search, filters, empty and loading states.

---

## Content architecture

All content is typed (`types/content.ts`). It is stored in MongoDB by the backend and read through **`lib/data/index.ts`**: each function fetches one dataset from the public API inside `"use cache"` with `cacheLife("minutes")` and a cache tag (`projects`, `profile`, …). After every admin change the backend calls **`app/api/revalidate`** (protected by `REVALIDATE_SECRET`), which expires the affected tags so the next visit renders fresh content.

The original typed modules in `/data` are kept as the **seed source** (`npm run build-seed` / `npm run seed` in the backend) and as a **fallback**: they are rendered when `NEXT_PUBLIC_API_URL` is not set, and if the API is unreachable (the error is logged instead of breaking the page):

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

Pages never import `/data` directly; they call the async functions in `lib/data/index.ts`. The dashboard uses `lib/admin/store.ts` (loads everything from `GET /admin/content`, saves through the admin API) and `lib/api/client.ts` (cookies, CSRF token, automatic session refresh).

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

## Good to know

- **Navigation and inner-page hero copy** ("Selected Work", "The Toolkit", …) stay in code; they mirror the app's routes and the dashboard has no fields for them.
- **Pages for projects/articles created after a build** render on their first visit. A slug that doesn't exist shows the 404 page with a `noindex` tag; because those pages stream, Next.js keeps the HTTP status at 200 (documented behaviour).
- **Testimonials** are managed in the dashboard and served by the API, but the public site has no testimonials section yet.
- Security details, the authentication flow and deployment options are in the backend's `README.md` and `SECURITY.md`.

---

## Project structure

```text
app/
  layout.tsx              root layout, fonts, intro boot script
  (public)/               public site with navbar/footer layout
  (auth)/                 login, signup, forgot-password, reset-password
  admin/                  admin layout + all management routes (incl. messages)
  api/revalidate/         cache refresh webhook called by the backend
  sitemap.ts, robots.ts, not-found.tsx
components/
  animations/             intro, intro store, Lenis, reveal, count-up
  three/                  3D hero scene + fallback wrapper
  public/                 navbar, footer, cards, explorers, article parts, sections
  admin/                  shell, UI kit, fields, feedback, screens
  shared/                 SmartImage, Markdown, buttons, tags, brand icons
data/                     original typed content (seed source + offline fallback)
lib/                      API client, data access, auth, admin store, markdown, SEO, validation, utils
types/content.ts          shared content types
public/resume/            Arun_Negi_Resume.pdf (Download Resume)
```

> Note: `public/resume/Arun_Negi_Resume.pdf` contains your phone number and email. Remove or replace it before publishing if you prefer.

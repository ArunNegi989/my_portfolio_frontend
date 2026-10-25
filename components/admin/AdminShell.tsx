"use client";

import {
  Award,
  BookOpen,
  Briefcase,
  ChevronRight,
  Cpu,
  ExternalLink,
  FileText,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  Link2,
  Loader2,
  LogOut,
  Menu,
  MessageSquareQuote,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { invalidateSession, sessionStore } from "@/lib/api/client";
import { getSession, signOut } from "@/lib/auth";
import { clearAdminState, loadAdminContent, useAdminState, useAdminStatus } from "@/lib/admin/store";
import { cx } from "@/lib/utils";
import { FeedbackProvider } from "./Feedback";
import ui from "./admin.module.css";
import styles from "./AdminShell.module.css";

interface NavEntry {
  label: string;
  href: string;
  icon: ReactNode;
}

const NAV: Array<{ group: string; items: NavEntry[] }> = [
  { group: "", items: [{ label: "Overview", href: "/admin", icon: <LayoutDashboard size={18} /> }] },
  {
    group: "Content",
    items: [
      { label: "Profile", href: "/admin/profile", icon: <User size={18} /> },
      { label: "Pages & sections", href: "/admin/pages", icon: <LayoutTemplate size={18} /> },
      { label: "Projects", href: "/admin/projects", icon: <FolderKanban size={18} /> },
      { label: "Blog", href: "/admin/blog", icon: <FileText size={18} /> },
      { label: "Experience", href: "/admin/experience", icon: <Briefcase size={18} /> },
      { label: "Skills", href: "/admin/skills", icon: <Cpu size={18} /> },
      { label: "Services", href: "/admin/services", icon: <Sparkles size={18} /> },
      { label: "Education", href: "/admin/education", icon: <Award size={18} /> },
      { label: "Testimonials", href: "/admin/testimonials", icon: <MessageSquareQuote size={18} /> },
      { label: "Messages", href: "/admin/messages", icon: <Inbox size={18} /> },
    ],
  },
  {
    group: "Configuration",
    items: [
      { label: "Social links", href: "/admin/social-links", icon: <Link2 size={18} /> },
      { label: "SEO", href: "/admin/seo", icon: <BookOpen size={18} /> },
      { label: "Settings", href: "/admin/settings", icon: <Settings size={18} /> },
    ],
  },
];

const ALL_NAV = NAV.flatMap((g) => g.items);

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

function useBreadcrumbs(pathname: string) {
  const state = useAdminState();
  return useMemo(() => {
    const parts = pathname.split("/").filter(Boolean).slice(1);
    const crumbs: Array<{ label: string; href: string }> = [{ label: "Admin", href: "/admin" }];
    let href = "/admin";
    parts.forEach((part, i) => {
      href += `/${part}`;
      const nav = ALL_NAV.find((n) => n.href === href);
      let label = nav?.label ?? part.charAt(0).toUpperCase() + part.slice(1);
      if (part === "new") label = "New";
      else if (i === 1 && parts[0] === "projects") label = state.projects.find((p) => p.id === part)?.title ?? "Edit";
      else if (i === 1 && parts[0] === "blog") label = state.posts.find((p) => p.id === part)?.title ?? "Edit";
      crumbs.push({ label, href });
    });
    return crumbs;
  }, [pathname, state.projects, state.posts]);
}

function GlobalSearch() {
  const state = useAdminState();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const pages = ALL_NAV.filter((n) => n.label.toLowerCase().includes(q)).map((n) => ({ label: n.label, meta: "Screen", href: n.href }));
    const projects = state.projects
      .filter((p) => `${p.title} ${p.technologies.join(" ")}`.toLowerCase().includes(q))
      .map((p) => ({ label: p.title, meta: "Project", href: `/admin/projects/${p.id}` }));
    const posts = state.posts.filter((p) => p.title.toLowerCase().includes(q)).map((p) => ({ label: p.title, meta: "Article", href: `/admin/blog/${p.id}` }));
    return [...pages, ...projects, ...posts].slice(0, 8);
  }, [query, state.projects, state.posts]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <div className={styles.search} ref={boxRef}>
      <Search size={16} aria-hidden="true" />
      <input
        type="search"
        value={query}
        placeholder="Search projects, articles, screens…"
        aria-label="Search the admin"
        aria-expanded={open && results.length > 0}
        aria-controls="admin-search-results"
        role="combobox"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results[0]) go(results[0].href);
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && query && (
        <ul id="admin-search-results" role="listbox" className={styles.searchResults}>
          {results.length === 0 ? (
            <li className={styles.searchEmpty}>No matches for “{query}”</li>
          ) : (
            results.map((r) => (
              <li key={r.href} role="option" aria-selected="false">
                <button type="button" onClick={() => go(r.href)}>
                  <span>{r.label}</span>
                  <span className={styles.searchMeta}>{r.meta}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

function useSession() {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.getSnapshot, sessionStore.getServerSnapshot);
}

/** Ends the session on the server, wipes loaded content and goes to the login page. */
function useSignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    try {
      await signOut();
    } catch {
      // Even if the request failed (offline), forget everything locally; cookies expire on their own.
    } finally {
      clearAdminState();
      router.replace("/login");
    }
  }
  return { busy, run };
}

function ProfileMenu() {
  const { user } = useSession();
  const signOutAction = useSignOut();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Transient menu: close it if Activity hides this route.
  useLayoutEffect(() => () => setOpen(false), []);

  const name = user?.name || user?.email || "Admin";
  const initials = name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

  return (
    <div className={styles.profile} ref={ref}>
      <button type="button" className={styles.avatarBtn} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className={styles.avatar}>{initials || "AN"}</span>
        <span className={styles.avatarName}>{name}</span>
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.menuHeader}>
            <strong>{name}</strong>
            <span>{user?.email}</span>
          </div>
          <Link href="/admin/profile" role="menuitem" onClick={() => setOpen(false)}>
            <User size={15} aria-hidden="true" /> Edit profile
          </Link>
          <Link href="/admin/settings" role="menuitem" onClick={() => setOpen(false)}>
            <Settings size={15} aria-hidden="true" /> Settings
          </Link>
          <Link href="/" role="menuitem" target="_blank">
            <ExternalLink size={15} aria-hidden="true" /> View public site
          </Link>
          <button type="button" role="menuitem" onClick={signOutAction.run} disabled={signOutAction.busy}>
            <LogOut size={15} aria-hidden="true" /> {signOutAction.busy ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}

function GateScreen({ title, children, busy }: { title: string; children?: ReactNode; busy?: boolean }) {
  return (
    <div className={styles.gate}>
      <div className={styles.gateCard} role={busy ? "status" : "alert"} aria-busy={busy || undefined}>
        {busy && <Loader2 size={26} className={styles.gateSpinner} aria-hidden="true" />}
        <h1>{title}</h1>
        {children}
      </div>
    </div>
  );
}

/**
 * Renders the dashboard only for a confirmed admin session. Every admin API checks the session and
 * role on the server as well; this guard just avoids showing UI to people who can't use it.
 */
function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useSession();
  const content = useAdminStatus();
  const signOutAction = useSignOut();
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Ask the server who is signed in (refreshing the session if the access token expired).
  useEffect(() => {
    if (session.checked) return;
    let cancelled = false;
    getSession()
      .then(() => !cancelled && setSessionError(null))
      .catch((err) => !cancelled && setSessionError(err instanceof Error ? err.message : "Couldn't reach the server."));
    return () => {
      cancelled = true;
    };
  }, [session.checked]);

  const isAdmin = session.user?.role === "admin";

  useEffect(() => {
    if (session.checked && !session.user) {
      clearAdminState();
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [session.checked, session.user, router]);

  useEffect(() => {
    if (isAdmin && content.status === "idle") void loadAdminContent();
  }, [isAdmin, content.status]);

  // A page restored from the back/forward cache must not show stale protected content: re-check.
  useEffect(() => {
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        clearAdminState();
        invalidateSession();
      }
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  if (sessionError && !session.checked) {
    return (
      <GateScreen title="Can't reach the server">
        <p>{sessionError}</p>
        <div className={styles.gateActions}>
          <button type="button" className={cx(ui.btn, ui.btnPrimary)} onClick={() => window.location.reload()}>
            <RefreshCw size={15} aria-hidden="true" /> Try again
          </button>
        </div>
      </GateScreen>
    );
  }
  if (!session.checked) return <GateScreen title="Checking your session…" busy />;
  if (!session.user) return <GateScreen title="Redirecting to sign in…" busy />;
  if (!isAdmin) {
    return (
      <GateScreen title="No dashboard access">
        <p>
          You&apos;re signed in as <strong>{session.user.email}</strong>, but this account hasn&apos;t been given access to the dashboard. Ask the site
          administrator to grant it.
        </p>
        <div className={styles.gateActions}>
          <Link href="/" className={ui.btn}>
            Back to the site
          </Link>
          <button type="button" className={cx(ui.btn, ui.btnPrimary)} onClick={signOutAction.run} disabled={signOutAction.busy}>
            <LogOut size={15} aria-hidden="true" /> Sign out
          </button>
        </div>
      </GateScreen>
    );
  }
  if (content.status === "empty") {
    return (
      <GateScreen title="No content yet">
        <p>
          The database is empty. Import the site&apos;s existing content by running <code>npm run seed</code> in <code>my-portfolio-backend</code>, then reload.
        </p>
        <div className={styles.gateActions}>
          <button type="button" className={cx(ui.btn, ui.btnPrimary)} onClick={() => void loadAdminContent()}>
            <RefreshCw size={15} aria-hidden="true" /> Reload
          </button>
        </div>
      </GateScreen>
    );
  }
  if (content.status === "error") {
    return (
      <GateScreen title="Couldn't load the dashboard">
        <p>{content.error}</p>
        <div className={styles.gateActions}>
          <button type="button" className={cx(ui.btn, ui.btnPrimary)} onClick={() => void loadAdminContent()}>
            <RefreshCw size={15} aria-hidden="true" /> Try again
          </button>
        </div>
      </GateScreen>
    );
  }
  if (content.status !== "ready") return <GateScreen title="Loading your content…" busy />;
  return <>{children}</>;
}

function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const crumbs = useBreadcrumbs(pathname);
  const { user } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={cx(styles.shell, collapsed && styles.collapsed)}>
      <a href="#admin-main" className={styles.skip}>
        Skip to content
      </a>
      <aside className={cx(styles.sidebar, mobileOpen && styles.sidebarOpen)} aria-label="Admin navigation">
        <div className={styles.brand}>
          <Link href="/admin" className={styles.logo} onNavigate={() => setMobileOpen(false)}>
            <span className={styles.logoMark}>AN.</span>
            <span className={styles.logoText}>Portfolio Admin</span>
          </Link>
          <button type="button" className={styles.closeMobile} onClick={() => setMobileOpen(false)} aria-label="Close navigation">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <nav className={styles.nav}>
          {NAV.map((group) => (
            <div key={group.group || "main"} className={styles.navGroup}>
              {group.group && <p className={styles.navGroupLabel}>{group.group}</p>}
              <ul role="list">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cx(styles.navLink, active && styles.navActive)}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        onNavigate={() => setMobileOpen(false)}
                      >
                        <span aria-hidden="true">{item.icon}</span>
                        <span className={styles.navLabel}>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className={styles.sidebarFooter} title={user?.email}>
          <ShieldCheck size={16} aria-hidden="true" />
          <span className={styles.navLabel}>Signed in as {user?.email}</span>
        </div>
      </aside>
      {mobileOpen && <button type="button" className={styles.scrim} aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}

      <div className={styles.main}>
        <header className={styles.header}>
          <button type="button" className={styles.menuBtn} onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
          >
            {collapsed ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}
          </button>
          <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
            <ol role="list">
              {crumbs.map((c, i) => (
                <li key={c.href}>
                  {i > 0 && <ChevronRight size={14} aria-hidden="true" />}
                  {i === crumbs.length - 1 ? <span aria-current="page">{c.label}</span> : <Link href={c.href}>{c.label}</Link>}
                </li>
              ))}
            </ol>
          </nav>
          <GlobalSearch />
          <Link href="/" target="_blank" className={styles.viewSite}>
            <ExternalLink size={15} aria-hidden="true" /> <span>View site</span>
          </Link>
          <ProfileMenu />
        </header>

        <main id="admin-main" className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <FeedbackProvider>
      <AdminGate>
        {/* The layout reads the pathname, which is request-time data for ids created after the build. */}
        <Suspense fallback={<GateScreen title="Loading your content…" busy />}>
          <DashboardLayout>{children}</DashboardLayout>
        </Suspense>
      </AdminGate>
    </FeedbackProvider>
  );
}

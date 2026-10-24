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
  LayoutDashboard,
  LayoutTemplate,
  Link2,
  LogOut,
  Menu,
  MessageSquareQuote,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAdminState } from "@/lib/admin/store";
import { cx } from "@/lib/utils";
import { FeedbackProvider } from "./Feedback";
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

function ProfileMenu() {
  const state = useAdminState();
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

  return (
    <div className={styles.profile} ref={ref}>
      <button type="button" className={styles.avatarBtn} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className={styles.avatar}>AN</span>
        <span className={styles.avatarName}>{state.profile.name}</span>
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.menuHeader}>
            <strong>{state.profile.name}</strong>
            <span>Profile menu mockup</span>
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
          <button type="button" role="menuitem" disabled title="Authentication is planned for Phase 2">
            <LogOut size={15} aria-hidden="true" /> Sign out (Phase 2)
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const crumbs = useBreadcrumbs(pathname);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <FeedbackProvider>
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
          <div className={styles.sidebarFooter}>
            <ShieldAlert size={16} aria-hidden="true" />
            <span className={styles.navLabel}>Unprotected preview — no auth yet</span>
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

          <div className={styles.banner} role="note">
            <ShieldAlert size={16} aria-hidden="true" />
            <p>
              <strong>Frontend prototype.</strong> No authentication or backend. Edits are kept only in this browser&apos;s
              local storage (demo persistence, not a database) and do not change the public site.
            </p>
          </div>

          <main id="admin-main" className={styles.content}>
            {children}
          </main>
        </div>
      </div>
    </FeedbackProvider>
  );
}

"use client";

/* eslint-disable @next/next/no-img-element -- admin thumbnails can use any host */
import { ArrowUpRight, Briefcase, Cpu, FilePen, FileText, FolderKanban, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useAdminState, useHydrated } from "@/lib/admin/store";
import { cx, formatDate } from "@/lib/utils";
import ui from "../admin.module.css";
import { Card, PageHeader, StatusBadge } from "../ui";
import styles from "./Overview.module.css";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return formatDate(iso.slice(0, 10));
}

export default function Overview() {
  const state = useAdminState();
  const hydrated = useHydrated();

  const stats = useMemo(() => {
    const publishedProjects = state.projects.filter((p) => p.status === "published").length;
    const publishedPosts = state.posts.filter((p) => p.status === "published").length;
    const drafts = state.projects.filter((p) => p.status === "draft").length + state.posts.filter((p) => p.status === "draft").length;
    return [
      { label: "Projects", value: state.projects.length, sub: `${publishedProjects} published · ${state.projects.filter((p) => p.featured).length} featured`, icon: <FolderKanban size={18} />, href: "/admin/projects" },
      { label: "Published articles", value: publishedPosts, sub: `${state.posts.length} total`, icon: <FileText size={18} />, href: "/admin/blog" },
      { label: "Experience entries", value: state.experience.length, sub: "Roles on the timeline", icon: <Briefcase size={18} />, href: "/admin/experience" },
      { label: "Skills", value: state.skills.length, sub: `${state.skillCategories.length} categories`, icon: <Cpu size={18} />, href: "/admin/skills" },
      { label: "Drafts", value: drafts, sub: "Projects + articles", icon: <FilePen size={18} />, href: "/admin/projects" },
    ];
  }, [state]);

  const byCategory = useMemo(() => {
    const counts = new Map<string, number>();
    state.projects.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
    const max = Math.max(1, ...counts.values());
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count, pct: (count / max) * 100 }));
  }, [state.projects]);

  const recentProjects = [...state.projects].sort((a, b) => b.order - a.order).slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${state.profile.name.split(" ")[0]}`}
        description="Manage the content of your portfolio. Everything here is a frontend prototype backed by demo data."
        actions={
          <>
            <Link href="/admin/blog/new" className={ui.btn}>
              <Plus size={15} aria-hidden="true" /> New article
            </Link>
            <Link href="/admin/projects/new" className={cx(ui.btn, ui.btnPrimary)}>
              <Plus size={15} aria-hidden="true" /> New project
            </Link>
          </>
        }
      />

      <ul role="list" className={styles.stats}>
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className={styles.stat}>
              <span className={styles.statIcon} aria-hidden="true">
                {s.icon}
              </span>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statSub}>{s.sub}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.columns}>
        <Card
          title="Recent projects"
          actions={
            <Link href="/admin/projects" className={cx(ui.btn, ui.btnGhost)}>
              All projects <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          }
        >
          <ul role="list" className={styles.recent}>
            {recentProjects.map((p) => (
              <li key={p.id}>
                <img src={p.cover.src} alt="" className={ui.thumb} loading="lazy" />
                <div className={styles.recentMain}>
                  <Link href={`/admin/projects/${p.id}`} className={ui.cellTitle}>
                    {p.title}
                  </Link>
                  <p className={ui.cellSub}>{p.category}</p>
                </div>
                <StatusBadge status={p.status} />
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Recent activity" subtitle="Changes made in this browser">
          <ol role="list" className={styles.activity}>
            {state.activity.slice(0, 8).map((a) => (
              <li key={a.id}>
                <span className={styles.dot} aria-hidden="true" />
                <div>
                  <p>{a.message}</p>
                  <time dateTime={a.at} className={ui.muted} suppressHydrationWarning>
                    {hydrated ? timeAgo(a.at) : ""}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <div className={styles.columns}>
        <Card title="Projects by category">
          <ul role="list" className={styles.bars}>
            {byCategory.map((c) => (
              <li key={c.label}>
                <span className={styles.barLabel}>{c.label}</span>
                <span className={styles.barTrack}>
                  <span className={styles.barFill} style={{ width: `${c.pct}%` }} />
                </span>
                <span className={styles.barValue}>{c.count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Quick actions">
          <div className={styles.quick}>
            <Link href="/admin/projects/new">Add a project</Link>
            <Link href="/admin/blog/new">Write an article</Link>
            <Link href="/admin/pages">Edit homepage hero</Link>
            <Link href="/admin/profile">Update profile & availability</Link>
            <Link href="/admin/seo">Review SEO</Link>
            <Link href="/admin/settings">Export content JSON</Link>
          </div>
          <p className={ui.muted} style={{ marginTop: 14, fontSize: "0.85rem" }}>
            Latest article: {state.posts[0] ? `${state.posts[0].title} (${formatDate(state.posts[0].publishedAt)})` : "none"}
          </p>
        </Card>
      </div>
    </>
  );
}

"use client";

/* eslint-disable @next/next/no-img-element -- admin thumbnails can use any host */
import { ExternalLink, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { posts as publicPosts } from "@/data/blog";
import { adminActions, useAdminState } from "@/lib/admin/store";
import { cx, formatDate, readingTime } from "@/lib/utils";
import ui from "../admin.module.css";
import { useFeedback } from "../Feedback";
import { EmptyState, PageHeader, StatusBadge } from "../ui";

const livePublicSlugs = new Set(publicPosts.filter((p) => p.status === "published").map((p) => p.slug));

export default function PostsTable() {
  const { posts } = useAdminState();
  const { toast, confirm } = useFeedback();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const categories = useMemo(() => Array.from(new Set(posts.map((p) => p.category))).sort(), [posts]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...posts]
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .filter((p) => (category === "all" || p.category === category) && (status === "all" || p.status === status) && (!q || `${p.title} ${p.tags.join(" ")}`.toLowerCase().includes(q)));
  }, [posts, query, category, status]);

  async function remove(id: string, title: string) {
    const ok = await confirm({ title: "Delete article?", message: `“${title}” will be removed from the demo data in this browser.`, confirmLabel: "Delete", danger: true });
    if (!ok) return;
    adminActions.remove("posts", id, `Deleted article “${title}”`);
    toast(`Deleted “${title}”`);
  }

  const filtered = query || category !== "all" || status !== "all";

  return (
    <>
      <PageHeader
        title="Blog"
        description="Write and manage articles. The public blog reads /data/blog.ts; edits here stay in demo storage."
        actions={
          <Link href="/admin/blog/new" className={cx(ui.btn, ui.btnPrimary)}>
            <Plus size={15} aria-hidden="true" /> New article
          </Link>
        }
      />
      <div className={ui.toolbar}>
        <label className={ui.searchBox}>
          <Search size={15} aria-hidden="true" />
          <span className="sr-only">Search articles</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title or tag" />
        </label>
        <select className={ui.select} value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select className={ui.select} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="all">Any status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      <div className={ui.tableWrap}>
        {rows.length === 0 ? (
          <EmptyState
            title={filtered ? "No articles match these filters" : "No articles yet"}
            action={
              filtered ? (
                <button type="button" className={ui.btn} onClick={() => { setQuery(""); setCategory("all"); setStatus("all"); }}>
                  Clear filters
                </button>
              ) : (
                <Link href="/admin/blog/new" className={cx(ui.btn, ui.btnPrimary)}>New article</Link>
              )
            }
          />
        ) : (
          <table className={ui.table}>
            <thead>
              <tr>
                <th scope="col"><span className="sr-only">Cover</span></th>
                <th scope="col">Article</th>
                <th scope="col">Category</th>
                <th scope="col">Published</th>
                <th scope="col">Status</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const isLive = p.status === "published" && livePublicSlugs.has(p.slug);
                return (
                  <tr key={p.id}>
                    <td>
                      <img src={p.cover.src} alt="" className={ui.thumb} loading="lazy" />
                    </td>
                    <td>
                      <div className={ui.cellTitle}>
                        <Link href={`/admin/blog/${p.id}`}>{p.title}</Link>
                      </div>
                      <div className={ui.cellSub}>
                        /{p.slug} · {readingTime(p.content)} min
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td>{formatDate(p.publishedAt)}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      <div className={ui.rowActions}>
                        {isLive ? (
                          <Link href={`/blog/${p.slug}`} target="_blank" className={ui.iconBtn} aria-label={`View ${p.title} on the public site`} title="View on public site">
                            <ExternalLink size={15} aria-hidden="true" />
                          </Link>
                        ) : (
                          <span className={ui.iconBtn} aria-disabled="true" title="Not on the public site until it is added to /data/blog.ts" style={{ opacity: 0.3 }}>
                            <ExternalLink size={15} aria-hidden="true" />
                          </span>
                        )}
                        <Link href={`/admin/blog/${p.id}`} className={ui.iconBtn} aria-label={`Edit ${p.title}`} title="Edit">
                          <Pencil size={15} aria-hidden="true" />
                        </Link>
                        <button type="button" className={cx(ui.iconBtn, ui.iconBtnDanger)} onClick={() => remove(p.id, p.title)} aria-label={`Delete ${p.title}`} title="Delete">
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

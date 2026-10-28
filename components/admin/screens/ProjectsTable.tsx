"use client";

/* eslint-disable @next/next/no-img-element -- admin thumbnails can use any host */
import { ChevronLeft, ChevronRight, Copy, ExternalLink, Globe, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { reportSaveError } from "@/lib/admin/errors";
import { adminActions, newId, useAdminState } from "@/lib/admin/store";
import { cx, displayHost, isWebsiteUrl } from "@/lib/utils";
import ui from "../admin.module.css";
import { useFeedback } from "../Feedback";
import { EmptyState, PageHeader, StatusBadge } from "../ui";

const PAGE_SIZE = 10;

export default function ProjectsTable() {
  const { projects } = useAdminState();
  const { toast, confirm } = useFeedback();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [page, setPage] = useState(1);

  const categories = useMemo(() => Array.from(new Set(projects.map((p) => p.category))).sort(), [projects]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...projects]
      .sort((a, b) => a.order - b.order)
      .filter(
        (p) =>
          (category === "all" || p.category === category) &&
          (status === "all" || p.status === status) &&
          (!featuredOnly || p.featured) &&
          (!q || `${p.title} ${p.slug} ${p.technologies.join(" ")}`.toLowerCase().includes(q)),
      );
  }, [projects, query, category, status, featuredOnly]);

  // Pagination: delete ke baad last page khali ho jaye to pichle page pe aa jata hai
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedRows = rows.slice(startIndex, startIndex + PAGE_SIZE);

  async function remove(id: string, title: string) {
    const ok = await confirm({ title: "Delete project?", message: `“${title}” will be permanently deleted.`, confirmLabel: "Delete", danger: true });
    if (!ok) return;
    try {
      await adminActions.remove("projects", id, `Deleted project “${title}”`);
      toast(`Deleted “${title}”`);
    } catch (err) {
      reportSaveError(err, toast);
    }
  }

  async function duplicate(id: string) {
    const source = projects.find((p) => p.id === id);
    if (!source) return;
    let slug = `${source.slug}-copy`;
    let n = 2;
    while (projects.some((p) => p.slug === slug)) slug = `${source.slug}-copy-${n++}`;
    try {
      await adminActions.upsert("projects", { ...structuredClone(source), id: newId("p"), slug, title: `${source.title} (copy)`, status: "draft", featured: false, order: projects.length + 1 }, `Duplicated project “${source.title}”`);
      toast("Project duplicated as a draft");
    } catch (err) {
      reportSaveError(err, toast);
    }
  }

  async function toggleFeatured(id: string) {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    try {
      await adminActions.upsert("projects", { ...p, featured: !p.featured }, `${p.featured ? "Unfeatured" : "Featured"} “${p.title}”`);
    } catch (err) {
      reportSaveError(err, toast);
    }
  }

  const filtered = query || category !== "all" || status !== "all" || featuredOnly;

  return (
    <>
      <PageHeader
        title="Projects"
        description="Create, edit and organise case studies. Published projects appear on the public site; drafts stay here."
        actions={
          <Link href="/admin/projects/new" className={cx(ui.btn, ui.btnPrimary)}>
            <Plus size={15} aria-hidden="true" /> New project
          </Link>
        }
      />
      <div className={ui.toolbar}>
        <label className={ui.searchBox}>
          <Search size={15} aria-hidden="true" />
          <span className="sr-only">Search projects</span>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search title, slug or technology"
          />
        </label>
        <select
          className={ui.select}
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className={ui.select}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
        >
          <option value="all">Any status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <label className={ui.btn}>
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(e) => {
              setFeaturedOnly(e.target.checked);
              setPage(1);
            }}
          />{" "}
          Featured only
        </label>
      </div>

      <div className={ui.tableWrap}>
        {rows.length === 0 ? (
          <EmptyState
            title={filtered ? "No projects match these filters" : "No projects yet"}
            message={filtered ? "Try clearing the search or filters." : "Create your first project to get started."}
            action={
              filtered ? (
                <button
                  type="button"
                  className={ui.btn}
                  onClick={() => {
                    setQuery("");
                    setCategory("all");
                    setStatus("all");
                    setFeaturedOnly(false);
                    setPage(1);
                  }}
                >
                  Clear filters
                </button>
              ) : (
                <Link href="/admin/projects/new" className={cx(ui.btn, ui.btnPrimary)}>New project</Link>
              )
            }
          />
        ) : (
          <table className={ui.table}>
            <thead>
              <tr>
                <th scope="col"><span className="sr-only">Cover</span></th>
                <th scope="col">Project</th>
                <th scope="col">Category</th>
                <th scope="col">Status</th>
                <th scope="col">Live site</th>
                <th scope="col">Featured</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((p) => {
                const onPublicSite = p.status === "published";
                return (
                  <tr key={p.id}>
                    <td>
                      <img src={p.cover.src} alt="" className={ui.thumb} loading="lazy" />
                    </td>
                    <td>
                      <div className={ui.cellTitle}>
                        <Link href={`/admin/projects/${p.id}`}>{p.title}</Link>
                      </div>
                      <div className={ui.cellSub}>/{p.slug}</div>
                    </td>
                    <td>{p.category}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      {/* Only says a URL is configured; nothing here checks that the site is up. */}
                      {isWebsiteUrl(p.liveUrl) ? (
                        <div className={ui.rowActions}>
                          <span className={cx(ui.badge, ui.badgeInfo)} title={p.liveUrl}>
                            <Globe size={12} aria-hidden="true" /> Live
                          </span>
                          <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className={ui.iconBtn} aria-label={`Open ${p.title} live website: ${displayHost(p.liveUrl)} (opens in a new tab)`} title={`Open ${displayHost(p.liveUrl)}`}>
                            <ExternalLink size={15} aria-hidden="true" />
                          </a>
                        </div>
                      ) : (
                        <span className={ui.muted} style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                          Not configured
                        </span>
                      )}
                    </td>
                    <td>
                      <button type="button" className={ui.iconBtn} onClick={() => toggleFeatured(p.id)} aria-pressed={p.featured} aria-label={p.featured ? `Unfeature ${p.title}` : `Feature ${p.title}`}>
                        <Star size={16} aria-hidden="true" fill={p.featured ? "currentColor" : "none"} color={p.featured ? "var(--lime)" : undefined} />
                      </button>
                    </td>
                    <td>
                      <div className={ui.rowActions}>
                        {onPublicSite ? (
                          <Link href={`/projects/${p.slug}`} target="_blank" className={ui.iconBtn} aria-label={`View ${p.title} on the public site`} title="View on public site">
                            <ExternalLink size={15} aria-hidden="true" />
                          </Link>
                        ) : (
                          <span className={ui.iconBtn} aria-disabled="true" title="Drafts aren't shown on the public site" style={{ opacity: 0.3 }}>
                            <ExternalLink size={15} aria-hidden="true" />
                          </span>
                        )}
                        <Link href={`/admin/projects/${p.id}`} className={ui.iconBtn} aria-label={`Edit ${p.title}`} title="Edit">
                          <Pencil size={15} aria-hidden="true" />
                        </Link>
                        <button type="button" className={ui.iconBtn} onClick={() => duplicate(p.id)} aria-label={`Duplicate ${p.title}`} title="Duplicate">
                          <Copy size={15} aria-hidden="true" />
                        </button>
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

      <div className={ui.pagination}>
        <p className={ui.muted} style={{ fontSize: "0.82rem" }}>
          {rows.length === 0
            ? `0 of ${projects.length} projects`
            : `Showing ${startIndex + 1}–${Math.min(startIndex + PAGE_SIZE, rows.length)} of ${rows.length} projects`}
        </p>
        {totalPages > 1 && (
          <nav className={ui.pageControls} aria-label="Projects pagination">
            <button type="button" className={ui.btn} onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft size={15} aria-hidden="true" /> Previous
            </button>
            <span className={ui.pageInfo}>
              Page {currentPage} of {totalPages}
            </span>
            <button type="button" className={ui.btn} onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}>
              Next <ChevronRight size={15} aria-hidden="true" />
            </button>
          </nav>
        )}
      </div>
    </>
  );
}
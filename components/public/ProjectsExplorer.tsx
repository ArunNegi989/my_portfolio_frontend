"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { cx } from "@/lib/utils";
import type { Project } from "@/types/content";
import ProjectCard from "./ProjectCard";
import styles from "./Explorer.module.css";

type Sort = "featured" | "az" | "recent";

export default function ProjectsExplorer({ projects, categories }: { projects: Project[]; categories: string[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<Sort>("featured");
  const deferredQuery = useDeferredValue(query);
  const reduce = useReducedMotion();

  const results = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const filtered = projects.filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const haystack = [p.title, p.summary, p.context, p.category, ...p.technologies].join(" ").toLowerCase();
      return matchesCategory && (!q || haystack.includes(q));
    });
    return [...filtered].sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      if (sort === "recent") return a.order - b.order;
      return Number(b.featured) - Number(a.featured) || a.order - b.order;
    });
  }, [projects, deferredQuery, category, sort]);

  const filtersActive = query !== "" || category !== "All" || sort !== "featured";
  const clear = () => {
    setQuery("");
    setCategory("All");
    setSort("featured");
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <label className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Search projects</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or technology (e.g. Next.js, MongoDB)"
          />
        </label>
        <label className={styles.sort}>
          <span>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="featured">Featured first</option>
            <option value="recent">Most recent</option>
            <option value="az">A – Z</option>
          </select>
        </label>
      </div>

      <div className={styles.filters} role="group" aria-label="Filter by category">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            type="button"
            className={cx(styles.filter, category === c && styles.filterActive)}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
        {filtersActive && (
          <button type="button" className={styles.clear} onClick={clear}>
            <X size={14} aria-hidden="true" /> Clear filters
          </button>
        )}
      </div>

      <p className={styles.count} aria-live="polite">
        Showing {results.length} of {projects.length} projects
      </p>

      {results.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No projects match “{query || category}”.</p>
          <p>Try another technology or category.</p>
          <button type="button" className={styles.clear} onClick={clear}>
            <X size={14} aria-hidden="true" /> Clear filters
          </button>
        </div>
      ) : (
        <motion.ul layout role="list" className={styles.grid}>
          <AnimatePresence mode="popLayout">
            {results.map((project, i) => (
              <motion.li
                key={project.id}
                layout
                initial={reduce ? false : { opacity: 0, y: 28, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px 0px -6% 0px" }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.07, ease: [0.16, 1, 0.3, 1] }}
                className={cx(styles.item, project.featured && styles.featuredItem)}
              >
                {project.featured && <span className={styles.featuredBadge}>Featured</span>}
                <ProjectCard project={project} variant="compact" headingLevel="h2" />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}

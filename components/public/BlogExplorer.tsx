"use client";

import { motion, useReducedMotion } from "motion/react";
import { Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { cx } from "@/lib/utils";
import type { BlogPost } from "@/types/content";
import PostCard from "./PostCard";
import buttonStyles from "@/components/shared/Button.module.css";
import styles from "./Explorer.module.css";

const PAGE_SIZE = 4;

export default function BlogExplorer({ posts, categories }: { posts: BlogPost[]; categories: string[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const reduce = useReducedMotion();
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return posts.filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const haystack = [p.title, p.excerpt, p.category, ...p.tags].join(" ").toLowerCase();
      return matchesCategory && (!q || haystack.includes(q));
    });
  }, [posts, deferredQuery, category]);

  const clear = () => {
    setQuery("");
    setCategory("All");
    setVisible(PAGE_SIZE);
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <label className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Search articles</span>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder="Search articles, topics or tags"
          />
        </label>
      </div>
      <div className={styles.filters} role="group" aria-label="Filter by category">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            type="button"
            className={cx(styles.filter, category === c && styles.filterActive)}
            aria-pressed={category === c}
            onClick={() => {
              setCategory(c);
              setVisible(PAGE_SIZE);
            }}
          >
            {c}
          </button>
        ))}
        {(query || category !== "All") && (
          <button type="button" className={styles.clear} onClick={clear}>
            <X size={14} aria-hidden="true" /> Clear filters
          </button>
        )}
      </div>
      <p className={styles.count} aria-live="polite">
        {results.length} {results.length === 1 ? "article" : "articles"}
      </p>

      {results.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No articles found.</p>
          <p>Try a different keyword or category.</p>
          <button type="button" className={styles.clear} onClick={clear}>
            <X size={14} aria-hidden="true" /> Clear filters
          </button>
        </div>
      ) : (
        <>
          <ul role="list" className={styles.grid}>
            {results.slice(0, visible).map((post, i) => (
              <motion.li
                key={post.id}
                initial={reduce ? false : { opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <PostCard post={post} headingLevel="h3" />
              </motion.li>
            ))}
          </ul>
          {visible < results.length && (
            <div className={styles.loadMore}>
              <button type="button" className={`${buttonStyles.button} ${buttonStyles.outline}`} onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Load more articles
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

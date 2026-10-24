"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/utils";
import type { TocEntry } from "@/lib/markdown";
import styles from "./Article.module.css";

/** Sticky table of contents that highlights the heading currently in view. */
export default function TableOfContents({ items }: { items: TocEntry[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const headings = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => Boolean(el));
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;
  return (
    <nav aria-label="Table of contents" className={styles.toc}>
      <p className={styles.tocTitle}>On this page</p>
      <ol role="list">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? styles.tocSub : undefined}>
            <a href={`#${item.id}`} className={cx(styles.tocLink, active === item.id && styles.tocActive)} aria-current={active === item.id ? "location" : undefined}>
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

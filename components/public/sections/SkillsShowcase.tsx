"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import TechIcon, { techIconInfo } from "@/components/shared/TechIcon";
import { cx } from "@/lib/utils";
import type { Skill, SkillCategory, SkillCategoryKey } from "@/types/content";
import styles from "./SkillsShowcase.module.css";

interface SkillsShowcaseProps {
  categories: SkillCategory[];
  skills: Skill[];
  headingLevel?: "h2" | "h3";
}

const EASE = [0.16, 1, 0.3, 1] as const;

const grid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const panel: Variants = {
  hidden: { opacity: 0, y: 40, rotateX: 8 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.8, ease: EASE, staggerChildren: 0.035, delayChildren: 0.18 } },
};

const badge: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

/**
 * Packs category panels into rows of `columns`: categories with many skills take two columns and the
 * last panel in a row stretches to fill it, so the bento grid never leaves holes.
 */
function packSpans(counts: number[], columns: number): number[] {
  const spans: number[] = [];
  let fill = 0;
  counts.forEach((count) => {
    const want = Math.min(columns, count >= 7 ? 2 : 1);
    if (fill + want > columns) {
      spans[spans.length - 1] += columns - fill;
      fill = 0;
    }
    spans.push(want);
    fill = (fill + want) % columns;
  });
  if (fill > 0 && spans.length) spans[spans.length - 1] += columns - fill;
  return spans;
}

/** Interactive, categorised technology showcase. No proficiency ratings, by design. */
export default function SkillsShowcase({ categories, skills, headingLevel = "h3" }: SkillsShowcaseProps) {
  const reduce = useReducedMotion();
  const [focus, setFocus] = useState<SkillCategoryKey | "all">("all");

  const groups = categories
    .map((category) => ({ category, items: skills.filter((s) => s.category === category.key).sort((a, b) => a.order - b.order) }))
    .filter((g) => g.items.length > 0);
  const counts = groups.map((g) => g.items.length);
  const spans3 = packSpans(counts, 3);
  const spans2 = packSpans(counts, 2);
  const focused = groups.find((g) => g.category.key === focus);

  return (
    <div className={styles.showcase}>
      <div className={styles.toolbar} role="group" aria-label="Highlight a skill category">
        <button type="button" className={cx(styles.filter, focus === "all" && styles.filterActive)} aria-pressed={focus === "all"} onClick={() => setFocus("all")}>
          All <span className={styles.filterCount}>{skills.length}</span>
        </button>
        {groups.map(({ category, items }) => (
          <button
            key={category.key}
            type="button"
            className={cx(styles.filter, focus === category.key && styles.filterActive)}
            aria-pressed={focus === category.key}
            onClick={() => setFocus((f) => (f === category.key ? "all" : category.key))}
          >
            {category.title} <span className={styles.filterCount}>{items.length}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {focused ? `Highlighting ${focused.category.title}: ${focused.items.length} technologies.` : "Showing all categories."}
      </p>

      <motion.ol
        role="list"
        className={styles.grid}
        variants={grid}
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      >
        {groups.map(({ category, items }, index) => (
          <Panel
            key={category.key}
            index={index}
            category={category}
            items={items}
            headingLevel={headingLevel}
            dimmed={focus !== "all" && focus !== category.key}
            highlighted={focus === category.key}
            style={{ "--span3": spans3[index], "--span2": spans2[index] } as CSSProperties}
            interactive={!reduce}
          />
        ))}
      </motion.ol>
    </div>
  );
}

interface PanelProps {
  index: number;
  category: SkillCategory;
  items: Skill[];
  headingLevel: "h2" | "h3";
  dimmed: boolean;
  highlighted: boolean;
  style: CSSProperties;
  interactive: boolean;
}

function Panel({ index, category, items, headingLevel, dimmed, highlighted, style, interactive }: PanelProps) {
  const Heading = headingLevel;
  const ref = useRef<HTMLLIElement>(null);
  const headingId = `skills-${category.key}`;

  // Pointer-driven spotlight + gentle tilt, only for precise pointers (never on touch).
  function onPointerMove(event: PointerEvent<HTMLLIElement>) {
    const node = ref.current;
    if (!node || !interactive || event.pointerType !== "mouse") return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    node.style.setProperty("--mx", `${x * 100}%`);
    node.style.setProperty("--my", `${y * 100}%`);
    node.style.setProperty("--rx", `${(0.5 - y) * 5}deg`);
    node.style.setProperty("--ry", `${(x - 0.5) * 6}deg`);
  }

  function onPointerLeave() {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--ry", "0deg");
  }

  return (
    <motion.li
      ref={ref}
      variants={panel}
      className={cx(styles.panel, dimmed && styles.dimmed, highlighted && styles.highlighted)}
      style={style}
      aria-labelledby={headingId}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className={styles.panelInner}>
        <span className={styles.spotlight} aria-hidden="true" />
        <span className={styles.orbit} aria-hidden="true">
          <span className={styles.orbitDot} />
        </span>

        <header className={styles.head}>
          <span className={styles.index} aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className={styles.count}>
            {items.length} {items.length === 1 ? "technology" : "technologies"}
          </span>
        </header>
        <Heading id={headingId} className={styles.title}>
          {category.title}
        </Heading>
        {category.description && <p className={styles.description}>{category.description}</p>}

        <ul role="list" className={styles.badges} aria-label={`${category.title} technologies`}>
          {items.map((skill) => {
            const { accent, brand } = techIconInfo(skill.name);
            return (
              <motion.li key={skill.id} variants={badge} className={styles.badge} style={{ "--accent": accent } as CSSProperties}>
                <span className={cx(styles.badgeIcon, !brand && styles.badgeIconGeneric)}>
                  <TechIcon name={skill.name} size={20} />
                </span>
                <span className={styles.badgeName}>{skill.name}</span>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </motion.li>
  );
}

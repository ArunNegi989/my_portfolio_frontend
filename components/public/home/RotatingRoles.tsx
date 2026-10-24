"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { Pause, Play } from "lucide-react";
import { Fragment, useState, useSyncExternalStore } from "react";
import { introStore } from "@/components/animations/introStore";
import styles from "./Hero.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;

const word: Variants = {
  enter: { transition: { staggerChildren: 0.016 } },
  center: { transition: { staggerChildren: 0.016 } },
  exit: { transition: { staggerChildren: 0.006 } },
};

const letter: Variants = {
  enter: { y: "105%", opacity: 0 },
  center: { y: "0%", opacity: 1, transition: { duration: 0.45, ease: EASE } },
  exit: { y: "-105%", opacity: 0, transition: { duration: 0.22, ease: [0.7, 0, 0.84, 0] } },
};

interface RotatingRolesProps {
  roles: string[];
  /** Seconds each role stays on screen. */
  interval: number;
}

/**
 * Hero headline that cycles through professional roles with a letter-by-letter slot transition.
 * Every role is rendered (invisibly) in the same grid cell, so the line keeps the height and width
 * of the longest role and the layout never jumps. The progress bar's CSS animation drives the timing,
 * so pausing (button, hover, intro) and resuming stay in sync. Reduced-motion users get the first role, static.
 */
export default function RotatingRoles({ roles, interval }: RotatingRolesProps) {
  const list = roles.map((r) => r.trim()).filter(Boolean);
  const reduce = useReducedMotion();
  const intro = useSyncExternalStore(introStore.subscribe, introStore.getSnapshot, introStore.getServerSnapshot);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);

  const canRotate = !reduce && list.length > 1;
  const running = canRotate && !paused && !hovering && intro.status === "done";
  const seconds = Math.max(1.5, Number(interval) || 3);

  if (!list.length) return null;
  const current = list[index % list.length];

  return (
    <div className={styles.roles} onPointerEnter={() => setHovering(true)} onPointerLeave={() => setHovering(false)}>
      <p className="sr-only">{list.join(", ")}</p>
      <p className={styles.rolesLine} aria-hidden="true">
        <span className={styles.rolesStack}>
          {list.map((role, i) => (
            <span key={i} className={styles.roleSizer}>
              {role}
            </span>
          ))}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={current} className={styles.roleCurrent} variants={word} initial="enter" animate="center" exit="exit">
              {current.split(" ").map((part, w, parts) => (
                <Fragment key={`${part}-${w}`}>
                  <span className={styles.roleWord}>
                    {Array.from(part).map((char, c) => (
                      <motion.span key={c} className={styles.roleChar} variants={canRotate ? letter : undefined}>
                        {char}
                      </motion.span>
                    ))}
                  </span>
                  {w < parts.length - 1 && " "}
                </Fragment>
              ))}
            </motion.span>
          </AnimatePresence>
        </span>
      </p>

      {canRotate && (
        <div className={styles.rolesControls}>
          <button
            type="button"
            className={styles.rolesToggle}
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Resume role animation" : "Pause role animation"}
            aria-pressed={paused}
          >
            {paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
          </button>
          <span className={styles.rolesTrack} aria-hidden="true">
            <span
              key={index}
              className={styles.rolesProgress}
              style={{ animationDuration: `${seconds}s`, animationPlayState: running ? "running" : "paused" }}
              onAnimationEnd={() => setIndex((i) => (i + 1) % list.length)}
            />
          </span>
          <span className={styles.rolesCount} aria-hidden="true">
            {String(index + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}
          </span>
        </div>
      )}
    </div>
  );
}

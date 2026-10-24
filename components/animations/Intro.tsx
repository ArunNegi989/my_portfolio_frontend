"use client";

import { AnimatePresence, motion, useReducedMotion, type Transition } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { lockScroll, unlockScroll } from "@/lib/utils/scroll";
import { introStore } from "./introStore";
import IntroCharacter from "./IntroCharacter";
import styles from "./Intro.module.css";

type Phase = "text" | "zoom" | "shatter" | "void" | "descend" | "grab" | "pull" | "open";

// Milliseconds from start. One continuous sequence: type → zoom → shatter → void → character → rope → curtain.
const FULL_TIMELINE: Array<[Phase, number]> = [
  ["zoom", 1250],
  ["shatter", 2200],
  ["void", 3450],
  ["descend", 3800],
  ["grab", 5050],
  ["pull", 5500],
  ["open", 6150],
];
const FULL_DURATION = 7500;

const REDUCED_TIMELINE: Array<[Phase, number]> = [["open", 900]];
const REDUCED_DURATION = 1700;

const LINES = ["ARUN NEGI", "PORTFOLIO.EXE"];
const SHARDS = [
  "polygon(0 0, 55% 0, 45% 52%, 0 60%)",
  "polygon(55% 0, 100% 0, 100% 45%, 45% 52%)",
  "polygon(0 60%, 45% 52%, 60% 100%, 0 100%)",
  "polygon(45% 52%, 100% 45%, 100% 100%, 60% 100%)",
];

/** Deterministic pseudo-random in [0, 1) so server and client agree. */
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const ease = [0.16, 1, 0.3, 1] as const;

export default function Intro() {
  const { status, run } = useSyncExternalStore(introStore.subscribe, introStore.getSnapshot, introStore.getServerSnapshot);
  return (
    <AnimatePresence>
      {status === "playing" && <IntroOverlay key={run} />}
    </AnimatePresence>
  );
}

function IntroOverlay() {
  const reduced = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<Phase>("text");
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    lockScroll("intro");
    // Timers are scheduled relative to the first start, so effect re-runs (Strict Mode,
    // Activity show/hide) resume the sequence instead of restarting or stalling it.
    const now = performance.now();
    startRef.current ??= now;
    const elapsed = now - startRef.current;
    const timeline = reduced ? REDUCED_TIMELINE : FULL_TIMELINE;
    const duration = reduced ? REDUCED_DURATION : FULL_DURATION;
    const timers = timeline.map(([next, at]) => window.setTimeout(() => setPhase(next), Math.max(0, at - elapsed)));
    timers.push(window.setTimeout(() => introStore.finish(), Math.max(0, duration - elapsed)));

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") introStore.finish();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener("keydown", onKey);
      unlockScroll("intro");
    };
  }, [reduced]);

  const after = (p: Phase) => {
    const order: Phase[] = ["text", "zoom", "shatter", "void", "descend", "grab", "pull", "open"];
    return order.indexOf(phase) >= order.indexOf(p);
  };

  const curtainTransition: Transition = { duration: reduced ? 0.6 : 1.25, ease: [0.7, 0, 0.2, 1] };

  return (
    <motion.div
      className={styles.overlay}
      data-intro-overlay=""
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio intro animation"
      exit={{ opacity: 0, transition: { duration: 0.45 } }}
    >
      {/* Curtains: the dark screen itself, split in two and pulled open by the rope. */}
      <motion.div
        className={`${styles.curtain} ${styles.curtainLeft}`}
        animate={after("open") ? { x: "-102%", skewY: reduced ? 0 : -2 } : { x: 0, skewY: 0 }}
        transition={curtainTransition}
      />
      <motion.div
        className={`${styles.curtain} ${styles.curtainRight}`}
        animate={after("open") ? { x: "102%", skewY: reduced ? 0 : 2 } : { x: 0, skewY: 0 }}
        transition={curtainTransition}
      />

      <motion.div
        className={styles.grid}
        aria-hidden="true"
        animate={{ opacity: after("open") ? 0 : after("void") ? 0.55 : 0.25 }}
        transition={{ duration: 0.6 }}
      />

      {/* Typography stage */}
      <div className={styles.stage} aria-hidden="true">
        <motion.div
          className={styles.words}
          initial={false}
          animate={
            reduced
              ? { opacity: after("open") ? 0 : 1 }
              : after("zoom")
                ? { scale: 2.3, rotateX: 8, z: 120 }
                : { scale: 1, rotateX: 0, z: 0 }
          }
          transition={{ duration: 1.05, ease: [0.55, 0, 0.1, 1] }}
        >
          {LINES.map((line, lineIndex) => (
            <div key={line} className={lineIndex === 0 ? styles.lineName : styles.lineExe}>
              {Array.from(line).map((char, charIndex) => {
                const seed = lineIndex * 100 + charIndex;
                const center = (line.length - 1) / 2;
                const direction = charIndex === center ? (rand(seed) > 0.5 ? 1 : -1) : Math.sign(charIndex - center);
                if (char === " ") return <span key={charIndex} className={styles.space} />;
                return (
                  <motion.span
                    key={charIndex}
                    className={styles.char}
                    initial={{ opacity: 0, y: reduced ? 0 : "60%", filter: reduced ? "none" : "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.7, delay: 0.08 + lineIndex * 0.25 + charIndex * 0.04, ease }}
                  >
                    <span className={styles.sizer}>{char}</span>
                    {SHARDS.map((clip, shardIndex) => {
                      const s = seed * 7 + shardIndex;
                      const dx = direction * (60 + rand(s) * 320) + (rand(s + 1) - 0.5) * 120;
                      const rise = -(30 + rand(s + 2) * 110);
                      const fall = 520 + rand(s + 3) * 260;
                      const spin = (rand(s + 4) - 0.5) * 720;
                      return (
                        <motion.span
                          key={shardIndex}
                          className={styles.shard}
                          style={{ clipPath: clip }}
                          initial={false}
                          animate={
                            !reduced && after("shatter")
                              ? { x: [0, dx * 0.6, dx], y: [0, rise, fall], rotate: [0, spin * 0.4, spin], opacity: [1, 1, 0] }
                              : { x: 0, y: 0, rotate: 0, opacity: 1 }
                          }
                          transition={{
                            duration: 1.2 + rand(s + 5) * 0.25,
                            delay: rand(s + 6) * 0.12,
                            times: [0, 0.32, 1],
                            ease: ["easeOut", "easeIn"],
                          }}
                        >
                          {char}
                        </motion.span>
                      );
                    })}
                  </motion.span>
                );
              })}
            </div>
          ))}
        </motion.div>
      </div>

      {!reduced && <IntroCharacter phase={phase} visible={after("descend")} />}

      <div className={styles.hud} aria-hidden="true">
        <span>AN. {"//"} PORTFOLIO.EXE</span>
        <span className={styles.progress}>
          <motion.span
            className={styles.progressBar}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: (reduced ? REDUCED_DURATION : FULL_DURATION) / 1000, ease: "linear" }}
          />
        </span>
      </div>

      <button type="button" className={styles.skip} onClick={() => introStore.finish()}>
        Skip Intro <span aria-hidden="true">→</span>
      </button>
    </motion.div>
  );
}

"use client";

import { motion } from "motion/react";
import styles from "./Intro.module.css";

type Phase = "text" | "zoom" | "shatter" | "void" | "descend" | "grab" | "pull" | "open";

interface Props {
  phase: Phase;
  visible: boolean;
}

const PULL = 48;

/** Original illustrated robot ("Byte") that drops in on a cable and pulls the curtain cord. */
export default function IntroCharacter({ phase, visible }: Props) {
  const grabbing = phase === "grab" || phase === "pull" || phase === "open";
  const pulling = phase === "pull";
  const leaving = phase === "open";

  const bodyY = leaving ? -1600 : pulling ? PULL : visible ? 0 : -1400;
  const ropeY = leaving ? -1600 : pulling ? PULL : visible ? 0 : -1200;

  return (
    <div className={styles.characterLayer} aria-hidden="true">
      {/* Curtain cord with tassel */}
      <motion.div
        className={styles.rope}
        initial={{ y: -1200 }}
        animate={{ y: ropeY }}
        transition={
          leaving
            ? { duration: 1.1, ease: [0.6, 0, 0.9, 0.4], delay: 0.35 }
            : pulling
              ? { type: "spring", stiffness: 260, damping: 14 }
              : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
        }
      >
        <span className={styles.ropeLine} />
        <span className={styles.tassel} />
      </motion.div>

      <motion.div
        className={styles.character}
        initial={{ y: -1400, rotate: 0 }}
        animate={{ y: bodyY, rotate: visible && !grabbing ? [0, -7, 5, -2, 0] : 0 }}
        transition={
          leaving
            ? { duration: 1.1, ease: [0.6, 0, 0.9, 0.4], delay: 0.35 }
            : pulling
              ? { type: "spring", stiffness: 240, damping: 13 }
              : { y: { type: "spring", stiffness: 70, damping: 11, mass: 0.9 }, rotate: { duration: 1.6, delay: 0.5 } }
        }
      >
        <span className={styles.cable} />
        <svg viewBox="0 0 160 200" className={styles.characterSvg} role="presentation">
          {/* hook */}
          <circle cx="80" cy="6" r="5" fill="none" stroke="#22e4ff" strokeWidth="3" />
          {/* head */}
          <rect x="38" y="10" width="84" height="66" rx="28" fill="#e8edf4" stroke="#0a0d12" strokeWidth="3" />
          <rect x="48" y="25" width="64" height="34" rx="16" fill="#0a0f18" />
          <motion.g
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            animate={{ scaleY: pulling ? 0.25 : [1, 1, 0.1, 1, 1] }}
            transition={pulling ? { duration: 0.15 } : { duration: 3, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
          >
            <ellipse cx="67" cy="42" rx="6" ry="7.5" fill="#22e4ff" />
            <ellipse cx="93" cy="42" rx="6" ry="7.5" fill="#22e4ff" />
          </motion.g>
          <circle cx="44" cy="62" r="4" fill="#8b5cf6" opacity="0.55" />
          <circle cx="116" cy="62" r="4" fill="#8b5cf6" opacity="0.55" />
          {/* body */}
          <rect x="54" y="78" width="52" height="56" rx="18" fill="#e8edf4" stroke="#0a0d12" strokeWidth="3" />
          <circle cx="80" cy="104" r="12" fill="#0a0f18" />
          <text x="80" y="109" textAnchor="middle" fontSize="12" fontWeight="700" fill="#c6ff3d" fontFamily="var(--font-mono)">
            AN
          </text>
          {/* left arm (resting) */}
          <path d="M56 90 Q40 104 38 124" fill="none" stroke="#0a0d12" strokeWidth="14" strokeLinecap="round" />
          <path d="M56 90 Q40 104 38 124" fill="none" stroke="#e8edf4" strokeWidth="9" strokeLinecap="round" />
          <circle cx="38" cy="127" r="7" fill="#22e4ff" stroke="#0a0d12" strokeWidth="2.5" />
          {/* legs */}
          <rect x="62" y="130" width="13" height="34" rx="6.5" fill="#e8edf4" stroke="#0a0d12" strokeWidth="3" />
          <rect x="85" y="130" width="13" height="34" rx="6.5" fill="#e8edf4" stroke="#0a0d12" strokeWidth="3" />
          <ellipse cx="68" cy="168" rx="11" ry="6" fill="#1c212c" stroke="#0a0d12" strokeWidth="2.5" />
          <ellipse cx="92" cy="168" rx="11" ry="6" fill="#1c212c" stroke="#0a0d12" strokeWidth="2.5" />
          {/* right arm reaches for the cord */}
          <motion.g
            style={{ transformBox: "view-box", transformOrigin: "104px 90px" }}
            initial={{ rotate: 0 }}
            animate={{ rotate: grabbing ? -62 : 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 14 }}
          >
            <path d="M104 90 Q120 104 122 124" fill="none" stroke="#0a0d12" strokeWidth="14" strokeLinecap="round" />
            <path d="M104 90 Q120 104 122 124" fill="none" stroke="#e8edf4" strokeWidth="9" strokeLinecap="round" />
            <circle cx="122" cy="127" r="7" fill="#22e4ff" stroke="#0a0d12" strokeWidth="2.5" />
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}

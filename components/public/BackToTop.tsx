"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { ArrowUp } from "lucide-react";
import { scrollToTop } from "@/lib/utils/scroll";
import styles from "./Footer.module.css";

/** Back-to-top control whose ring fills with page scroll progress. */
export default function BackToTop() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <button type="button" className={styles.backToTop} onClick={scrollToTop}>
      <span className={styles.backToTopLabel}>Back to top</span>
      <span className={styles.backToTopRing} aria-hidden="true">
        <svg viewBox="0 0 48 48" width="48" height="48" className={styles.ringSvg}>
          <circle cx="24" cy="24" r="22" className={styles.ringTrack} />
          <motion.circle cx="24" cy="24" r="22" className={styles.ringFill} style={{ pathLength: progress }} />
        </svg>
        <ArrowUp size={18} className={styles.backToTopArrow} />
      </span>
    </button>
  );
}

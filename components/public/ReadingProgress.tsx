"use client";

import { motion, useScroll, useSpring } from "motion/react";
import styles from "./Article.module.css";

export default function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 });
  return <motion.div className={styles.progress} style={{ scaleX }} aria-hidden="true" />;
}
